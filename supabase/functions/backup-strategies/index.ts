import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum backup size in MB (50MB limit to prevent memory issues)
const MAX_BACKUP_SIZE_MB = 50;
const MAX_BACKUP_SIZE_BYTES = MAX_BACKUP_SIZE_MB * 1024 * 1024;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const today = new Date().toISOString().split('T')[0];
  
  console.log('🔄 Starting daily backup process for date:', today);

  try {
    let backedUpCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    // 1. Fetch all investment configs
    const { data: configs, error: configsError } = await supabase
      .from('investment_configs')
      .select('*');

    if (configsError) {
      throw new Error(`Failed to fetch configs: ${configsError.message}`);
    }

    console.log(`📊 Found ${configs?.length || 0} configurations to backup`);

    // 2. Backup each configuration
    for (const config of configs || []) {
      try {
        console.log(`🔄 Backing up config ${config.id} for user ${config.user_id}`);

        // Fetch all related data in parallel
        const [dailyReturnsRes, pacOverridesRes, tradesRes, paymentsRes] = await Promise.all([
          supabase.from('daily_returns').select('*').eq('config_id', config.id),
          supabase.from('daily_pac_overrides').select('*').eq('config_id', config.id),
          supabase.from('actual_trades').select('*').eq('config_id', config.id),
          supabase.from('pac_payments').select('*').eq('config_id', config.id)
        ]);

        // Build backup data
        const backupData = {
          config: config,
          daily_returns: dailyReturnsRes.data || [],
          daily_pac_overrides: pacOverridesRes.data || [],
          actual_trades: tradesRes.data || [],
          pac_payments: paymentsRes.data || [],
          metadata: {
            backup_version: '1.0',
            total_records: (dailyReturnsRes.data?.length || 0) + 
                          (pacOverridesRes.data?.length || 0) + 
                          (tradesRes.data?.length || 0) + 
                          (paymentsRes.data?.length || 0),
            backup_timestamp: new Date().toISOString()
          }
        };

        // Check backup size before saving
        const backupJson = JSON.stringify(backupData);
        const backupSizeBytes = new TextEncoder().encode(backupJson).length;
        const backupSizeMB = (backupSizeBytes / (1024 * 1024)).toFixed(2);

        if (backupSizeBytes > MAX_BACKUP_SIZE_BYTES) {
          console.warn(`⚠️ Backup for config ${config.id} exceeds size limit: ${backupSizeMB}MB`);
          
          // Try to reduce size by limiting historical data to last 90 days
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0];

          backupData.daily_returns = backupData.daily_returns.filter((r: any) => r.date >= cutoffDate);
          backupData.metadata.size_limit_applied = true;
          backupData.metadata.data_retention_days = 90;

          const reducedBackupJson = JSON.stringify(backupData);
          const reducedSizeBytes = new TextEncoder().encode(reducedBackupJson).length;
          const reducedSizeMB = (reducedSizeBytes / (1024 * 1024)).toFixed(2);

          if (reducedSizeBytes > MAX_BACKUP_SIZE_BYTES) {
            throw new Error(`Backup still too large after reduction: ${reducedSizeMB}MB (limit: ${MAX_BACKUP_SIZE_MB}MB)`);
          }

          console.log(`✅ Reduced backup size from ${backupSizeMB}MB to ${reducedSizeMB}MB`);
        } else {
          console.log(`📦 Backup size: ${backupSizeMB}MB (within ${MAX_BACKUP_SIZE_MB}MB limit)`);
        }

        // Insert or update backup (UPSERT)
        const { error: upsertError } = await supabase
          .from('strategy_backups')
          .upsert({
            user_id: config.user_id,
            config_id: config.id,
            backup_date: today,
            backup_data: backupData
          }, {
            onConflict: 'user_id,config_id,backup_date'
          });

        if (upsertError) {
          throw upsertError;
        }

        backedUpCount++;
        console.log(`✅ Successfully backed up config ${config.id}`);

      } catch (error: any) {
        failedCount++;
        const errorMsg = `Failed to backup config ${config.id}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push({
          config_id: config.id,
          user_id: config.user_id,
          error: error.message
        });
      }
    }

    // 3. Delete backups older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];

    console.log(`🗑️ Deleting backups older than ${cutoffDate}`);

    const { data: deletedBackups, error: deleteError } = await supabase
      .from('strategy_backups')
      .delete()
      .lt('backup_date', cutoffDate)
      .select();

    const deletedCount = deletedBackups?.length || 0;
    
    if (deleteError) {
      console.error('⚠️ Error deleting old backups:', deleteError);
    } else {
      console.log(`✅ Deleted ${deletedCount} old backups`);
    }

    // 4. Log the backup operation
    const executionTime = Date.now() - startTime;
    const status = failedCount === 0 ? 'success' : (backedUpCount > 0 ? 'partial' : 'failed');

    await supabase.from('backup_logs').insert({
      backup_date: today,
      status: status,
      configs_backed_up: backedUpCount,
      configs_failed: failedCount,
      old_backups_deleted: deletedCount,
      execution_time_ms: executionTime,
      error_details: errors.length > 0 ? errors : null
    });

    console.log(`✅ Backup complete: ${backedUpCount} succeeded, ${failedCount} failed, ${deletedCount} old backups deleted`);

    return new Response(
      JSON.stringify({
        success: true,
        status: status,
        backed_up: backedUpCount,
        failed: failedCount,
        old_deleted: deletedCount,
        execution_time_ms: executionTime,
        timestamp: new Date().toISOString(),
        errors: errors.length > 0 ? errors : null
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('❌ Fatal error in backup process:', error);
    
    // Log the failure
    await supabase.from('backup_logs').insert({
      backup_date: today,
      status: 'failed',
      configs_backed_up: 0,
      configs_failed: 0,
      old_backups_deleted: 0,
      execution_time_ms: Date.now() - startTime,
      error_details: { error: error.message, stack: error.stack }
    });

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
