-- Disabilita la conferma email per la registrazione
UPDATE auth.config
SET email_confirm_required = false
WHERE id = 1;

-- Assicurati che le impostazioni di autenticazione siano correttamente configurate
UPDATE auth.config
SET email_autoconfirm = true
WHERE id = 1;