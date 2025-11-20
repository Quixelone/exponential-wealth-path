-- Inserimento corsi educativi completi per trading opzioni BTC con UUID corretti

-- Corso 1: Fondamenti del Trading di Opzioni BTC
INSERT INTO educational_courses (id, title, description, level, duration_minutes, is_published, prerequisites) VALUES
(gen_random_uuid(), 'Fondamenti del Trading di Opzioni BTC', 'Impara le basi del trading di opzioni su Bitcoin: cosa sono le opzioni, come funzionano put e call, e i concetti fondamentali per iniziare.', 'beginner', 180, true, NULL);

-- Salviamo l'ID del corso 1 per riferimenti successivi
DO $$
DECLARE
  course1_id UUID;
  course2_id UUID;
  course3_id UUID;
  course4_id UUID;
  course5_id UUID;
  
  mod_intro UUID;
  mod_terminology UUID;
  mod_mechanics UUID;
  mod_first_trade UUID;
  
  mod_risk_intro UUID;
  mod_position_sizing UUID;
  mod_hedging UUID;
  mod_psychology UUID;
  
  mod_spreads UUID;
  mod_iron_condor UUID;
  mod_volatility UUID;
  mod_greeks UUID;
  
  mod_ta_basics UUID;
  mod_indicators UUID;
  mod_patterns UUID;
  mod_timing UUID;
  
  mod_python_setup UUID;
  mod_api_basics UUID;
  mod_backtesting UUID;
  mod_live_bot UUID;
BEGIN
  -- Crea corso 1
  INSERT INTO educational_courses (title, description, level, duration_minutes, is_published)
  VALUES ('Fondamenti del Trading di Opzioni BTC', 
          'Impara le basi del trading di opzioni su Bitcoin: cosa sono le opzioni, come funzionano put e call, e i concetti fondamentali per iniziare.', 
          'beginner', 180, true)
  RETURNING id INTO course1_id;

  -- Moduli Corso 1
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (course1_id, 'Introduzione alle Opzioni', 'Scopri cosa sono le opzioni e perché sono strumenti potenti per il trading', 1)
  RETURNING id INTO mod_intro;
  
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (course1_id, 'Terminologia Essenziale', 'Impara i termini chiave: strike price, premium, expiration, ITM, OTM, ATM', 2)
  RETURNING id INTO mod_terminology;
  
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (course1_id, 'Meccaniche di Base', 'Come funzionano le opzioni put e call nella pratica', 3)
  RETURNING id INTO mod_mechanics;
  
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (course1_id, 'Il Tuo Primo Trade', 'Guida pratica per eseguire la tua prima operazione', 4)
  RETURNING id INTO mod_first_trade;

  -- Lezioni Modulo Introduzione
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_intro, 'Cosa Sono le Opzioni?', E'# Cosa Sono le Opzioni?\n\nLe opzioni sono contratti finanziari che ti danno il **diritto, ma non l\'obbligo**, di comprare o vendere un asset a un prezzo prestabilito entro una data specifica.\n\n## Perché Sono Importanti?\n\n- **Flessibilità**: Puoi guadagnare sia quando il prezzo sale che quando scende\n- **Leva Finanziaria**: Controlli grandi quantità di BTC con capitale limitato\n- **Gestione del Rischio**: Proteggi i tuoi investimenti da movimenti avversi\n\n## Esempio Pratico\n\nImmagina che BTC vale $50,000. Compri un\'opzione call con strike $52,000. Se BTC sale a $55,000, puoi comprare a $52,000 e rivendere a $55,000, guadagnando $3,000 (meno il premio pagato).', 'text', 1, 15);
  
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_intro, 'Storia delle Opzioni su BTC', E'# Storia delle Opzioni su Bitcoin\n\nLe opzioni su Bitcoin sono relativamente recenti ma in rapida crescita.\n\n## Timeline\n\n- **2017**: Prime piattaforme di trading opzioni BTC\n- **2019**: Lancio Deribit e crescita mercato istituzionale\n- **2020-2021**: Esplosione volumi durante bull market\n- **2023-2024**: Maturazione del mercato con maggiore liquidità\n\n## Oggi\n\nIl mercato delle opzioni BTC vale miliardi di dollari e offre opportunità sia a trader retail che istituzionali.', 'text', 2, 10);
  
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_intro, 'Perché Tradare Opzioni su BTC?', E'# Perché Scegliere le Opzioni BTC?\n\n## Vantaggi Chiave\n\n1. **Volatilità**: BTC è molto volatile, ideale per strategie con opzioni\n2. **24/7**: Mercato aperto sempre, massima flessibilità\n3. **Decentralizzazione**: Nessun intermediario centrale\n4. **Crescita**: Settore in forte espansione\n\n## Strategie Popolari\n\n- **Covered Call**: Genera reddito passivo dal tuo BTC\n- **Protective Put**: Assicura il tuo portafoglio\n- **Wheel Strategy**: Combina vendita put e call per reddito costante', 'text', 3, 12);

  -- Lezioni Modulo Terminologia
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_terminology, 'Strike Price e Premium', E'# Strike Price e Premium\n\n## Strike Price (Prezzo di Esercizio)\n\nIl prezzo a cui puoi comprare (call) o vendere (put) l\'asset sottostante.\n\n**Esempio**: Opzione call BTC strike $50,000 → puoi comprare BTC a $50,000\n\n## Premium (Premio)\n\nIl costo dell\'opzione. È quanto paghi per avere il diritto di esercitare l\'opzione.\n\n**Esempio**: Premium $500 per opzione call → spendi $500 per il diritto di comprare BTC a $50,000\n\n## Relazione Strike-Premium\n\n- Strike **più lontano** dal prezzo attuale → Premium **più basso**\n- Strike **più vicino** al prezzo attuale → Premium **più alto**', 'text', 1, 15);
  
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_terminology, 'Scadenza delle Opzioni', E'# Scadenza (Expiration Date)\n\nLa data entro cui devi decidere se esercitare l\'opzione.\n\n## Tipi di Scadenza\n\n- **Giornaliere**: Scadono ogni giorno\n- **Settimanali**: Scadono ogni venerdì\n- **Mensili**: Scadono l\'ultimo venerdì del mese\n- **Trimestrali**: Scadono ogni 3 mesi\n\n## Decay Temporale\n\nLe opzioni **perdono valore** man mano che si avvicinano alla scadenza. Questo è chiamato **theta decay**.\n\n💡 **Consiglio**: Come venditore di opzioni, il theta decay lavora a tuo favore!', 'text', 2, 12);
  
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_terminology, 'ITM, OTM, ATM: Moneyness', E'# In-The-Money, Out-The-Money, At-The-Money\n\n## ITM (In-The-Money)\n\nL\'opzione ha valore intrinseco.\n\n- **Call ITM**: Prezzo BTC > Strike Price\n- **Put ITM**: Prezzo BTC < Strike Price\n\n## OTM (Out-The-Money)\n\nL\'opzione NON ha valore intrinseco.\n\n- **Call OTM**: Prezzo BTC < Strike Price\n- **Put OTM**: Prezzo BTC > Strike Price\n\n## ATM (At-The-Money)\n\nStrike Price = Prezzo attuale BTC\n\n## Esempio Pratico\n\nBTC = $50,000\n\n- Call strike $48,000 → **ITM** ($2,000 valore intrinseco)\n- Call strike $50,000 → **ATM**\n- Call strike $52,000 → **OTM** (solo valore temporale)', 'text', 3, 15);

  -- Lezioni Modulo Meccaniche
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_mechanics, 'Opzioni Call: Come Funzionano', E'# Opzioni Call\n\nUn\'opzione call ti dà il **diritto di COMPRARE** BTC a un prezzo prestabilito.\n\n## Quando Comprare una Call?\n\nQuando pensi che il prezzo di BTC **salirà**.\n\n## Esempio Completo\n\n**Scenario**: BTC = $50,000\n\n1. Compri call strike $52,000, scadenza 30 giorni\n2. Paghi premium: $800\n3. BTC sale a $56,000\n4. Eserciti opzione: compri a $52,000\n5. **Profitto**: $56,000 - $52,000 - $800 = **$3,200**\n\n## Rischio Massimo\n\nIl premium pagato ($800 nell\'esempio). Non puoi perdere più di quello.', 'text', 1, 18);

  -- Corso 2: Gestione del Rischio
  INSERT INTO educational_courses (title, description, level, duration_minutes, is_published, prerequisites)
  VALUES ('Gestione del Rischio Avanzata', 
          'Impara a proteggere il tuo capitale con strategie di risk management professionale: position sizing, stop loss, hedging e diversificazione.', 
          'intermediate', 240, true, ARRAY[course1_id::text])
  RETURNING id INTO course2_id;

  -- Moduli Corso 2
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (course2_id, 'Fondamenti di Risk Management', 'Perché il risk management è più importante della strategia stessa', 1)
  RETURNING id INTO mod_risk_intro;
  
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_risk_intro, 'La Regola del 2%', E'# La Regola d\'Oro del Risk Management\n\n## Mai Rischiare Più del 2% Per Trade\n\nQuesta è la regola più importante nel trading.\n\n**Perché?**\n\nCon la regola del 2%, puoi sopravvivere a **50 trade perdenti consecutivi** e avere ancora metà del capitale.\n\n## Calcolo Pratico\n\n**Capitale**: $10,000\n\n- **Max rischio per trade**: $200 (2%)\n- **Position size**: Dipende da stop loss\n\n### Esempio\n- Stop loss: 10% sotto entry\n- Max rischio: $200\n- **Position size**: $2,000 (10% di $2,000 = $200)\n\nProteggi sempre il tuo capitale! 🛡️', 'text', 1, 20);

  -- Corso 3: Strategie Avanzate
  INSERT INTO educational_courses (title, description, level, duration_minutes, is_published, prerequisites)
  VALUES ('Strategie Avanzate Multi-Leg', 
          'Padroneggia strategie complesse: iron condor, butterfly, calendar spread per massimizzare profitti in ogni condizione di mercato.', 
          'advanced', 360, true, ARRAY[course1_id::text, course2_id::text])
  RETURNING id INTO course3_id;
  
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (course3_id, 'Vertical e Horizontal Spreads', 'Strategie multi-leg con rischio limitato', 1)
  RETURNING id INTO mod_spreads;
  
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_spreads, 'Bull Call Spread', E'# Bull Call Spread: Profitto con Rischio Limitato\n\n## Struttura\n\n**Compri** call strike basso + **Vendi** call strike alto\n\n## Quando Usarla\n\nPensi che BTC salirà **moderatamente** (non esplosione).\n\n## Esempio\n\nBTC = $50,000\n\n- **Buy** 1x Call $50,000 → Pay $1,500\n- **Sell** 1x Call $53,000 → Receive $600\n- **Net cost**: $900\n\n## Risultati\n\n- BTC < $50,000 → Perdi $900 (max loss)\n- BTC $51,500 → Break even\n- BTC > $53,000 → Guadagni $2,100 (max profit: $3,000 - $900)\n\n**Risk/Reward**: $900 rischio / $2,100 reward = 1:2.33 💪', 'text', 1, 30);

  -- Corso 4: Analisi Tecnica
  INSERT INTO educational_courses (title, description, level, duration_minutes, is_published, prerequisites)
  VALUES ('Analisi Tecnica Applicata alle Opzioni', 
          'Utilizza indicatori tecnici, pattern e livelli chiave per timing perfetto delle tue operazioni con opzioni BTC.', 
          'intermediate', 300, true, ARRAY[course1_id::text])
  RETURNING id INTO course4_id;
  
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (course4_id, 'Fondamenti di Analisi Tecnica', 'Supporti, resistenze, trend lines', 1)
  RETURNING id INTO mod_ta_basics;
  
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_ta_basics, 'Supporti e Resistenze', E'# Identificare Supporti e Resistenze\n\n## Cosa Sono\n\n- **Supporto**: Livello dove il prezzo tende a rimbalzare verso l\'alto\n- **Resistenza**: Livello dove il prezzo tende a fermarsi/scendere\n\n## Come Identificarli\n\n1. Trova i **massimi/minimi storici**\n2. Cerca zone con **alto volume** di scambi\n3. Identifica **livelli psicologici** ($50k, $60k, ecc.)\n\n## Applicazione alle Opzioni\n\n### Vendita Put\nVendi put appena **sotto** un forte supporto → Alta probabilità OTM\n\n### Vendita Call\nVendi call appena **sopra** una forte resistenza → Alta probabilità OTM\n\nSupporti e resistenze sono i tuoi migliori alleati! 📊', 'text', 1, 25);

  -- Corso 5: Python Automation
  INSERT INTO educational_courses (title, description, level, duration_minutes, is_published, prerequisites)
  VALUES ('Automazione con Python e API', 
          'Impara a automatizzare le tue strategie con Python: connessione API, backtesting, alert automatici e bot di trading.', 
          'expert', 480, true, ARRAY[course1_id::text, course3_id::text])
  RETURNING id INTO course5_id;
  
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (course5_id, 'Setup Ambiente Python', 'Installa librerie e configura API', 1)
  RETURNING id INTO mod_python_setup;
  
  INSERT INTO lessons (module_id, title, content, lesson_type, order_index, estimated_duration_minutes) VALUES
  (mod_python_setup, 'Installazione Librerie', E'# Setup Ambiente Python per Trading\n\n## Librerie Necessarie\n\n```bash\npip install ccxt pandas numpy ta-lib matplotlib\n```\n\n## Cosa Fanno\n\n- **ccxt**: Connessione a 100+ exchange\n- **pandas**: Manipolazione dati\n- **numpy**: Calcoli matematici\n- **ta-lib**: Indicatori tecnici\n- **matplotlib**: Grafici\n\n## Primo Script\n\n```python\nimport ccxt\n\n# Connetti a Binance\nexchange = ccxt.binance()\n\n# Fetch BTC price\nticker = exchange.fetch_ticker(\'BTC/USDT\')\nprint(f"BTC Price: ${ticker[\'last\']}")\n```\n\nOra sei pronto per automatizzare! 🤖', 'practical', 1, 30);

END $$;