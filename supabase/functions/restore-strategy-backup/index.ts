import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import pako from 'https://esm.sh/pako@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('🔄 Restore request from user:', user.id);

    // Get request body
    const { backup_id, config_id, create_snapshot = true } = await req.json();

    if (!backup_id || !config_id) {
      throw new Error('backup_id and config_id are required');
    }

    console.log(`🔄 Restoring backup ${backup_id} to config ${config_id}`);

    // Use service role for all operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Fetch the backup and verify ownership
    const { data: backup, error: backupError } = await supabase
      .from('strategy_backups')
      .select('*')
      .eq('id', backup_id)
      .eq('user_id', user.id)
      .single();

    if (backupError || !backup) {
      throw new Error('Backup not found or access denied');
    }

    console.log(`✅ Found backup from ${backup.backup_date}`);

    // 2. Verify user owns the target config
    const { data: targetConfig, error: configError } = await supabase
      .from('investment_configs')
      .select('id, user_id')
      .eq('id', config_id)
      .eq('user_id', user.id)
      .single();

    if (configError || !targetConfig) {
      throw new Error('Target config not found or access denied');
    }

    // 3. Optional: Create snapshot before restore
    if (create_snapshot) {
      console.log('📸 Creating pre-restore snapshot...');
      
      const [dailyReturns, pacOverrides, trades, payments, currentConfig] = await Promise.all([
        supabase.from('daily_returns').select('*').eq('config_id', config_id),
        supabase.from('daily_pac_overrides').select('*').eq('config_id', config_id),
        supabase.from('actual_trades').select('*').eq('config_id', config_id),
        supabase.from('pac_payments').select('*').eq('config_id', config_id),
        supabase.from('investment_configs').select('*').eq('id', config_id).single()
      ]);

      const snapshotData = {
        config: currentConfig.data,
        daily_returns: dailyReturns.data || [],
        daily_pac_overrides: pacOverrides.data || [],
        actual_trades: trades.data || [],
        pac_payments: payments.data || [],
        metadata: {
          backup_version: '1.0',
          backup_type: 'pre_restore_snapshot',
          total_records: (dailyReturns.data?.length || 0) + 
                        (pacOverrides.data?.length || 0) + 
                        (trades.data?.length || 0) + 
                        (payments.data?.length || 0),
          backup_timestamp: new Date().toISOString()
        }
      };

      await supabase.from('strategy_backups').insert({
        user_id: user.id,
        config_id: config_id,
        backup_date: new Date().toISOString().split('T')[0],
        backup_data: snapshotData
      });

      console.log('✅ Pre-restore snapshot created');
    }

    // 4. Restore: Delete current data
    console.log('🗑️ Deleting current strategy data...');
    
    await Promise.all([
      supabase.from('daily_returns').delete().eq('config_id', config_id),
      supabase.from('daily_pac_overrides').delete().eq('config_id', config_id),
      supabase.from('actual_trades').delete().eq('config_id', config_id),
      supabase.from('pac_payments').delete().eq('config_id', config_id)
    ]);

    // 5. Restore: Insert backup data
    console.log('📥 Restoring backup data...');
    
    let backupData = backup.backup_data as any;

    // Decompress if needed
    if (backupData.compressed) {
      console.log('🔓 Decompressing backup data...');
      try {
        const binary = atob(backupData.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const decompressed = pako.ungzip(bytes, { to: 'string' });
        backupData = JSON.parse(decompressed);
        console.log('✅ Backup decompressed successfully');
      } catch (error) {
        console.error('❌ Decompression failed:', error);
        throw new Error('Failed to decompress backup data');
      }
    }

    // Update config (preserve id and user_id)
    const { id, user_id, created_at, ...configData } = backupData.config;
    await supabase
      .from('investment_configs')
      .update({
        ...configData,
        updated_at: new Date().toISOString()
      })
      .eq('id', config_id);

    // Insert related data
    const insertPromises = [];

    if (backupData.daily_returns?.length > 0) {
      const returns = backupData.daily_returns.map((r: any) => ({
        config_id: config_id,
        day: r.day,
        return_rate: r.return_rate
      }));
      insertPromises.push(supabase.from('daily_returns').insert(returns));
    }

    if (backupData.daily_pac_overrides?.length > 0) {
      const overrides = backupData.daily_pac_overrides.map((o: any) => ({
        config_id: config_id,
        day: o.day,
        pac_amount: o.pac_amount
      }));
      insertPromises.push(supabase.from('daily_pac_overrides').insert(overrides));
    }

    if (backupData.actual_trades?.length > 0) {
      const trades = backupData.actual_trades.map((t: any) => {
        const { id, created_at, updated_at, ...tradeData } = t;
        return { ...tradeData, config_id: config_id };
      });
      insertPromises.push(supabase.from('actual_trades').insert(trades));
    }

    if (backupData.pac_payments?.length > 0) {
      const payments = backupData.pac_payments.map((p: any) => {
        const { id, created_at, updated_at, ...paymentData } = p;
        return { ...paymentData, config_id: config_id };
      });
      insertPromises.push(supabase.from('pac_payments').insert(payments));
    }

    await Promise.all(insertPromises);

    console.log('✅ Restore completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Strategy restored successfully',
        backup_date: backup.backup_date,
        config_id: config_id,
        records_restored: backupData.metadata?.total_records || 0
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('❌ Error restoring backup:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
