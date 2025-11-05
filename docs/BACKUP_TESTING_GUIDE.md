# Guida Test Manuale Sistema Backup

## 📋 Panoramica
Questa guida fornisce istruzioni dettagliate per testare manualmente il sistema di backup delle strategie prima della pubblicazione in produzione.

## ⚙️ Configurazione Iniziale

### 1. Verifica Database
Controlla che le tabelle siano state create correttamente:

```sql
-- Verifica tabella strategy_backups
SELECT * FROM strategy_backups LIMIT 1;

-- Verifica tabella backup_logs
SELECT * FROM backup_logs LIMIT 1;

-- Verifica funzione get_backup_stats
SELECT * FROM get_backup_stats('USER_UUID_QUI');
```

### 2. Verifica Edge Function
Controlla che l'edge function sia deployata:
- Vai su: https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/functions
- Verifica che `backup-strategies` e `restore-strategy-backup` siano presenti

## 🧪 Test Manuali

### Test 1: Esecuzione Backup Singolo

**Comando cURL:**
```bash
curl -X POST \
  https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/backup-strategies \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo" \
  -H "Content-Type: application/json"
```

**Risultato Atteso:**
```json
{
  "success": true,
  "status": "success",
  "backed_up": 12,
  "failed": 0,
  "old_deleted": 0,
  "execution_time_ms": 5000,
  "timestamp": "2025-01-05T03:00:00.000Z"
}
```

**Verifica:**
```sql
-- Controlla che i backup siano stati creati
SELECT 
  config_id,
  backup_date,
  user_id,
  jsonb_pretty(backup_data->'metadata') as metadata
FROM strategy_backups
ORDER BY created_at DESC
LIMIT 10;

-- Controlla i log
SELECT * FROM backup_logs ORDER BY created_at DESC LIMIT 5;
```

### Test 2: Verifica Limite Dimensione

**SQL per trovare strategie grandi:**
```sql
-- Trova le strategie con più dati
SELECT 
  ic.id,
  ic.user_id,
  ic.strategy_name,
  COUNT(DISTINCT dr.id) as daily_returns_count,
  COUNT(DISTINCT at.id) as trades_count,
  COUNT(DISTINCT pp.id) as payments_count
FROM investment_configs ic
LEFT JOIN daily_returns dr ON dr.config_id = ic.id
LEFT JOIN actual_trades at ON at.config_id = ic.id
LEFT JOIN pac_payments pp ON pp.config_id = ic.id
GROUP BY ic.id, ic.user_id, ic.strategy_name
ORDER BY daily_returns_count DESC;
```

**Controlla i log della funzione:**
- Vai su: https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/functions/backup-strategies/logs
- Cerca messaggi come:
  - `⚠️ Backup for config XXX exceeds size limit: X.XXmb`
  - `✅ Reduced backup size from X.XXmb to Y.YYmb`
  - `📦 Backup size: X.XXmb (within 50mb limit)`

### Test 3: Test Restore

**Tramite UI:**
1. Accedi all'app come utente con backup
2. Vai in Settings
3. Scorri fino a "Backup Manager"
4. Clicca "Restore" su un backup
5. Conferma il ripristino

**Verifica:**
```sql
-- Controlla che i dati siano stati ripristinati
SELECT 
  'daily_returns' as table_name,
  COUNT(*) as count
FROM daily_returns 
WHERE config_id = 'CONFIG_ID_RIPRISTINATO'
UNION ALL
SELECT 
  'actual_trades',
  COUNT(*)
FROM actual_trades 
WHERE config_id = 'CONFIG_ID_RIPRISTINATO'
UNION ALL
SELECT 
  'pac_payments',
  COUNT(*)
FROM pac_payments 
WHERE config_id = 'CONFIG_ID_RIPRISTINATO';
```

### Test 4: Test Pulizia Backup Vecchi

**Modifica temporanea per test:**
```sql
-- Crea backup vecchi per testare la pulizia
INSERT INTO strategy_backups (user_id, config_id, backup_date, backup_data)
SELECT 
  user_id,
  id as config_id,
  (CURRENT_DATE - INTERVAL '10 days')::date as backup_date,
  jsonb_build_object('test', true) as backup_data
FROM investment_configs
LIMIT 3;

-- Verifica che siano stati creati
SELECT backup_date, COUNT(*) 
FROM strategy_backups 
GROUP BY backup_date 
ORDER BY backup_date;
```

**Esegui backup:**
```bash
curl -X POST \
  https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/backup-strategies \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo" \
  -H "Content-Type: application/json"
```

**Verifica che i backup vecchi siano stati cancellati:**
```sql
SELECT backup_date, COUNT(*) 
FROM strategy_backups 
GROUP BY backup_date 
ORDER BY backup_date;

-- Dovrebbero rimanere solo backup degli ultimi 7 giorni
```

## 📊 Metriche da Monitorare

### Dimensioni Backup
```sql
SELECT 
  AVG(pg_column_size(backup_data)) / (1024*1024) as avg_size_mb,
  MAX(pg_column_size(backup_data)) / (1024*1024) as max_size_mb,
  MIN(pg_column_size(backup_data)) / (1024*1024) as min_size_mb,
  COUNT(*) as total_backups
FROM strategy_backups;
```

### Performance
```sql
SELECT 
  status,
  AVG(execution_time_ms) as avg_execution_time,
  MAX(execution_time_ms) as max_execution_time,
  COUNT(*) as total_runs
FROM backup_logs
GROUP BY status;
```

### Tasso di Successo
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM backup_logs
GROUP BY status;
```

## ⚠️ Problemi Comuni e Soluzioni

### Problema 1: Backup Troppo Grande
**Sintomo:** Errore "Backup still too large after reduction"
**Soluzione:** 
- Aumenta `MAX_BACKUP_SIZE_MB` a 100MB
- Riduci `data_retention_days` da 90 a 60 giorni

### Problema 2: Timeout Edge Function
**Sintomo:** Errore dopo 60 secondi
**Soluzione:**
- Implementa batching: backup 5 strategie alla volta invece di tutte insieme
- Aggiungi logging più dettagliato per identificare la strategia lenta

### Problema 3: Backup Duplicati
**Sintomo:** Errore "duplicate key value violates unique constraint"
**Soluzione:**
- Verificato: La logica UPSERT previene già questo problema
- Se persiste, controlla che il cron job non sia eseguito più volte

### Problema 4: RLS Policy Non Funziona
**Sintomo:** "permission denied for table strategy_backups"
**Soluzione:**
```sql
-- Verifica policy esistente
SELECT * FROM pg_policies WHERE tablename = 'strategy_backups';

-- Ri-crea policy se necessario (già presente nella migration)
```

## ✅ Checklist Pre-Pubblicazione

- [ ] Test 1: Backup singolo eseguito con successo
- [ ] Test 2: Limite dimensione funziona correttamente
- [ ] Test 3: Restore funziona dalla UI
- [ ] Test 4: Pulizia backup vecchi funziona
- [ ] Verificate dimensioni medie backup (< 50MB)
- [ ] Verificato tempo esecuzione (< 30 secondi per 12 strategie)
- [ ] Controllati log edge function (no errori critici)
- [ ] Testato con utenti reali (almeno 3 backup/restore)
- [ ] Verificata UI BackupManager (no errori console)

## 🚀 Attivazione Cron Job

**SOLO DOPO AVER COMPLETATO TUTTI I TEST:**

```sql
-- Attiva il cron job per backup notturni alle 03:00 CET
-- NOTA: Regola l'orario se necessario (UTC vs CET)
SELECT cron.schedule(
  'daily-strategy-backup',
  '0 3 * * *', -- 03:00 ogni giorno
  $$
  SELECT net.http_post(
    url := 'https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/backup-strategies',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo"}'::jsonb
  ) as request_id;
  $$
);

-- Verifica che sia stato creato
SELECT * FROM cron.job WHERE jobname = 'daily-strategy-backup';
```

## 📞 Supporto

Se riscontri problemi durante i test:
1. Controlla i log delle edge functions
2. Verifica le query SQL sopra
3. Controlla la tabella `backup_logs` per errori dettagliati
4. Esamina i log della console browser per errori UI
