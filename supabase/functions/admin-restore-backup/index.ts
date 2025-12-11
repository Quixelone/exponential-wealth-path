import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import pako from 'https://esm.sh/pako@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is authenticated admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, admin_role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { backup_id, config_id, create_snapshot, target_user_id } = await req.json();

    console.log(`🔧 Admin restore initiated by ${user.email} for backup ${backup_id}`);

    if (!backup_id) {
      return new Response(JSON.stringify({ error: 'backup_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch backup
    const { data: backup, error: backupError } = await supabaseAdmin
      .from('strategy_backups')
      .select('*')
      .eq('id', backup_id)
      .single();

    if (backupError || !backup) {
      return new Response(JSON.stringify({ error: 'Backup not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use config_id from request or from backup
    const targetConfigId = config_id || backup.config_id;

    // Check if config exists
    const { data: config, error: configError } = await supabaseAdmin
      .from('investment_configs')
      .select('user_id, name')
      .eq('id', targetConfigId)
      .single();

    // If config doesn't exist, we need to recreate it
    let configName = config?.name || 'Strategia ripristinata';
    let configUserId = config?.user_id || backup.user_id;
    let recreatedConfig = false;

    if (configError || !config) {
      console.log(`⚠️ Config ${targetConfigId} not found, will recreate from backup`);
      
      // Decompress backup to get config data
      let backupDataForRecreate;
      if (backup.backup_data.compressed) {
        const compressedData = Uint8Array.from(atob(backup.backup_data.data), c => c.charCodeAt(0));
        const decompressed = pako.inflate(compressedData, { to: 'string' });
        backupDataForRecreate = JSON.parse(decompressed);
      } else {
        backupDataForRecreate = backup.backup_data.data || backup.backup_data;
      }

      if (!backupDataForRecreate?.config) {
        return new Response(JSON.stringify({ error: 'Backup does not contain valid config data' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Recreate the config
      const { id: _id, created_at: _created, updated_at: _updated, ...configData } = backupDataForRecreate.config;
      
      const { data: newConfig, error: createError } = await supabaseAdmin
        .from('investment_configs')
        .insert({
          id: targetConfigId,
          user_id: backup.user_id,
          ...configData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error recreating config:', createError);
        return new Response(JSON.stringify({ error: `Failed to recreate config: ${createError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      configName = newConfig.name;
      configUserId = newConfig.user_id;
      recreatedConfig = true;
      console.log(`✅ Config recreated: ${configName}`);
    }

    if (target_user_id && configUserId !== target_user_id) {
      return new Response(JSON.stringify({ error: 'Config does not belong to target user' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create snapshot if requested and config already existed
    if (create_snapshot && !recreatedConfig) {
      console.log(`📸 Creating snapshot before restore...`);
      
      const { data: currentConfig } = await supabaseAdmin
        .from('investment_configs')
        .select('*')
        .eq('id', targetConfigId)
        .single();

      const { data: currentReturns } = await supabaseAdmin
        .from('daily_returns')
        .select('*')
        .eq('config_id', targetConfigId);

      const { data: currentOverrides } = await supabaseAdmin
        .from('daily_pac_overrides')
        .select('*')
        .eq('config_id', targetConfigId);

      const { data: currentTrades } = await supabaseAdmin
        .from('actual_trades')
        .select('*')
        .eq('config_id', targetConfigId);

      const { data: currentPayments } = await supabaseAdmin
        .from('pac_payments')
        .select('*')
        .eq('config_id', targetConfigId);

      const snapshotData = {
        config: currentConfig,
        daily_returns: currentReturns || [],
        daily_pac_overrides: currentOverrides || [],
        actual_trades: currentTrades || [],
        pac_payments: currentPayments || [],
      };

      await supabaseAdmin.from('strategy_backups').insert({
        user_id: configUserId,
        config_id: targetConfigId,
        backup_date: new Date().toISOString().split('T')[0],
        backup_data: {
          data: snapshotData,
          version: '1.0',
          compressed: false,
        },
      });

      console.log(`✅ Snapshot created`);
    }

    // Decompress backup data
    console.log(`📦 Decompressing backup data...`);
    let backupData;
    
    if (backup.backup_data.compressed) {
      const compressedData = Uint8Array.from(atob(backup.backup_data.data), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedData, { to: 'string' });
      backupData = JSON.parse(decompressed);
    } else {
      backupData = backup.backup_data.data || backup.backup_data;
    }

    // Delete existing data (only if not just recreated)
    if (!recreatedConfig) {
      console.log(`🗑️ Deleting existing data...`);
      await supabaseAdmin.from('daily_returns').delete().eq('config_id', targetConfigId);
      await supabaseAdmin.from('daily_pac_overrides').delete().eq('config_id', targetConfigId);
      await supabaseAdmin.from('actual_trades').delete().eq('config_id', targetConfigId);
      await supabaseAdmin.from('pac_payments').delete().eq('config_id', targetConfigId);

      // Update config
      console.log(`📥 Restoring config data...`);
      if (backupData.config) {
        const { id: _id, created_at, updated_at, user_id: _userId, ...configUpdateData } = backupData.config;
        await supabaseAdmin
          .from('investment_configs')
          .update({ ...configUpdateData, updated_at: new Date().toISOString() })
          .eq('id', targetConfigId);
      }
    }

    // Restore related data
    console.log(`📥 Restoring related data...`);

    // Restore daily returns
    if (backupData.daily_returns?.length > 0) {
      const returns = backupData.daily_returns.map((r: any) => ({
        config_id: targetConfigId,
        day: r.day,
        return_rate: r.return_rate,
      }));
      await supabaseAdmin.from('daily_returns').insert(returns);
      console.log(`✅ Restored ${returns.length} daily returns`);
    }

    // Restore PAC overrides
    if (backupData.daily_pac_overrides?.length > 0) {
      const overrides = backupData.daily_pac_overrides.map((o: any) => ({
        config_id: targetConfigId,
        day: o.day,
        pac_amount: o.pac_amount,
      }));
      await supabaseAdmin.from('daily_pac_overrides').insert(overrides);
      console.log(`✅ Restored ${overrides.length} PAC overrides`);
    }

    // Restore actual trades
    if (backupData.actual_trades?.length > 0) {
      const trades = backupData.actual_trades.map((t: any) => {
        const { id, created_at, updated_at, ...tradeData } = t;
        return {
          ...tradeData,
          config_id: targetConfigId,
        };
      });
      await supabaseAdmin.from('actual_trades').insert(trades);
      console.log(`✅ Restored ${trades.length} actual trades`);
    }

    // Restore PAC payments
    if (backupData.pac_payments?.length > 0) {
      const payments = backupData.pac_payments.map((p: any) => {
        const { id, created_at, updated_at, ...paymentData } = p;
        return {
          ...paymentData,
          config_id: targetConfigId,
        };
      });
      await supabaseAdmin.from('pac_payments').insert(payments);
      console.log(`✅ Restored ${payments.length} PAC payments`);
    }

    const summary = {
      success: true,
      recreated: recreatedConfig,
      restored: {
        daily_returns: backupData.daily_returns?.length || 0,
        daily_pac_overrides: backupData.daily_pac_overrides?.length || 0,
        actual_trades: backupData.actual_trades?.length || 0,
        pac_payments: backupData.pac_payments?.length || 0,
      },
      backup_date: backup.backup_date,
      config_id: targetConfigId,
      config_name: configName,
    };

    console.log(`🎉 Restore completed:`, summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Restore error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
