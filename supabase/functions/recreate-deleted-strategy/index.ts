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

    console.log('🔄 Recreate deleted strategy request from user:', user.id);

    // Get request body
    const { backup_id } = await req.json();

    if (!backup_id) {
      throw new Error('backup_id is required');
    }

    console.log(`🔄 Recreating strategy from backup ${backup_id}`);

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

    // 2. Decompress backup data if needed
    let backupData = backup.backup_data as any;

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

    if (!backupData.config) {
      throw new Error('Backup does not contain valid config data');
    }

    // 3. Check if the original config still exists
    const { data: existingConfig } = await supabase
      .from('investment_configs')
      .select('id')
      .eq('id', backup.config_id)
      .single();

    if (existingConfig) {
      throw new Error('Strategy already exists. Use restore function instead.');
    }

    // 4. Create new config with original data
    console.log('📥 Creating new strategy from backup...');
    
    const { id: _id, created_at: _created, updated_at: _updated, ...configData } = backupData.config;
    
    // Use the original config_id to maintain relationships
    const { data: newConfig, error: insertError } = await supabase
      .from('investment_configs')
      .insert({
        id: backup.config_id, // Use original ID
        user_id: user.id,
        ...configData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating config:', insertError);
      throw new Error(`Failed to create config: ${insertError.message}`);
    }

    console.log(`✅ Config created with ID: ${newConfig.id}`);

    // 5. Insert related data
    const insertPromises = [];

    if (backupData.daily_returns?.length > 0) {
      const returns = backupData.daily_returns.map((r: any) => ({
        config_id: newConfig.id,
        day: r.day,
        return_rate: r.return_rate
      }));
      insertPromises.push(
        supabase.from('daily_returns').insert(returns)
          .then(res => ({ table: 'daily_returns', count: returns.length, error: res.error }))
      );
    }

    if (backupData.daily_pac_overrides?.length > 0) {
      const overrides = backupData.daily_pac_overrides.map((o: any) => ({
        config_id: newConfig.id,
        day: o.day,
        pac_amount: o.pac_amount
      }));
      insertPromises.push(
        supabase.from('daily_pac_overrides').insert(overrides)
          .then(res => ({ table: 'daily_pac_overrides', count: overrides.length, error: res.error }))
      );
    }

    if (backupData.actual_trades?.length > 0) {
      const trades = backupData.actual_trades.map((t: any) => {
        const { id, created_at, updated_at, ...tradeData } = t;
        return { ...tradeData, config_id: newConfig.id };
      });
      insertPromises.push(
        supabase.from('actual_trades').insert(trades)
          .then(res => ({ table: 'actual_trades', count: trades.length, error: res.error }))
      );
    }

    if (backupData.pac_payments?.length > 0) {
      const payments = backupData.pac_payments.map((p: any) => {
        const { id, created_at, updated_at, ...paymentData } = p;
        return { ...paymentData, config_id: newConfig.id };
      });
      insertPromises.push(
        supabase.from('pac_payments').insert(payments)
          .then(res => ({ table: 'pac_payments', count: payments.length, error: res.error }))
      );
    }

    const results = await Promise.all(insertPromises);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      console.warn('⚠️ Some related data failed to insert:', errors);
    }

    console.log('✅ Strategy recreated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Deleted strategy recreated successfully',
        config_id: newConfig.id,
        config_name: newConfig.name,
        backup_date: backup.backup_date,
        records_restored: backupData.metadata?.total_records || 0,
        related_data: results
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('❌ Error recreating strategy:', error);
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
