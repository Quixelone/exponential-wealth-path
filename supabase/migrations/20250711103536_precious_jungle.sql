/*
  # Aggiornamento configurazione autenticazione

  1. Configurazione Auth
    - Disabilita la conferma email
    - Abilita l'autoconferma email
    - Assicura che la registrazione sia abilitata
  
  2. Sicurezza
    - Mantiene le policy di sicurezza esistenti
*/

-- Disabilita la conferma email per la registrazione
UPDATE auth.config
SET email_confirm_required = false
WHERE id = 1;

-- Abilita l'autoconferma email
UPDATE auth.config
SET email_autoconfirm = true
WHERE id = 1;

-- Assicurati che la registrazione sia abilitata
UPDATE auth.config
SET enable_signup = true
WHERE id = 1;

-- Aggiorna le impostazioni di autenticazione per assicurarsi che funzionino correttamente
DO $$
BEGIN
  -- Verifica se la tabella auth.flow_state esiste
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'flow_state') THEN
    -- Pulisci eventuali stati di flusso di autenticazione bloccati
    DELETE FROM auth.flow_state WHERE created_at < NOW() - INTERVAL '1 day';
  END IF;
END $$;