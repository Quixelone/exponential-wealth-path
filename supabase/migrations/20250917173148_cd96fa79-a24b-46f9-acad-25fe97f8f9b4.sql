-- Pulizia dei dati orfani e configurazioni fantasma (versione corretta)
-- Step 1: Rimuovi dati correlati per le configurazioni orfane (senza user_id)
DELETE FROM daily_returns 
WHERE config_id IN (
  SELECT id FROM investment_configs WHERE user_id IS NULL
);

DELETE FROM daily_pac_overrides 
WHERE config_id IN (
  SELECT id FROM investment_configs WHERE user_id IS NULL
);

DELETE FROM actual_trades 
WHERE config_id IN (
  SELECT id FROM investment_configs WHERE user_id IS NULL
);

DELETE FROM pac_payments 
WHERE config_id IN (
  SELECT id FROM investment_configs WHERE user_id IS NULL
);

-- Step 2: Rimuovi configurazioni orfane (senza user_id)
DELETE FROM investment_configs WHERE user_id IS NULL;

-- Step 3: Rimuovi configurazioni con user_id che non corrisponde a utenti esistenti
DELETE FROM daily_returns 
WHERE config_id IN (
  SELECT ic.id FROM investment_configs ic
  LEFT JOIN user_profiles up ON ic.user_id = up.id
  WHERE up.id IS NULL
);

DELETE FROM daily_pac_overrides 
WHERE config_id IN (
  SELECT ic.id FROM investment_configs ic
  LEFT JOIN user_profiles up ON ic.user_id = up.id
  WHERE up.id IS NULL
);

DELETE FROM actual_trades 
WHERE config_id IN (
  SELECT ic.id FROM investment_configs ic
  LEFT JOIN user_profiles up ON ic.user_id = up.id
  WHERE up.id IS NULL
);

DELETE FROM pac_payments 
WHERE config_id IN (
  SELECT ic.id FROM investment_configs ic
  LEFT JOIN user_profiles up ON ic.user_id = up.id
  WHERE up.id IS NULL
);

DELETE FROM investment_configs 
WHERE id IN (
  SELECT ic.id FROM investment_configs ic
  LEFT JOIN user_profiles up ON ic.user_id = up.id
  WHERE up.id IS NULL
);

-- Step 4: Rendi user_id NOT NULL per prevenire problemi futuri
ALTER TABLE investment_configs ALTER COLUMN user_id SET NOT NULL;