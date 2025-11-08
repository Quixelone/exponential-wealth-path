# 🖥️ Installazione Locale su Windows

## Prerequisiti

1. **Node.js 18+** - Scarica da https://nodejs.org/
2. **Git** - Scarica da https://git-scm.com/

## Passi per Installazione

### 1. Clona il Repository

Apri PowerShell o CMD e esegui:

```bash
cd C:\Users\Quixel\Documents  # O la cartella che preferisci
git clone https://github.com/Quixelone/exponential-wealth-path.git
cd exponential-wealth-path
```

### 2. Fai Checkout del Branch con i Miglioramenti

```bash
git fetch origin
git checkout claude/come-migil-011CUvbCyp1eUmdWW6f17euy
```

### 3. Installa le Dipendenze

```bash
npm install
```

### 4. Configura le Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto con:

```env
VITE_SUPABASE_URL=tua_supabase_url
VITE_SUPABASE_ANON_KEY=tua_supabase_key
```

### 5. Avvia il Server di Sviluppo

```bash
npm run dev
```

### 6. Apri il Browser

Il server partirà su `http://localhost:5173/`

Apri il browser e vai a quell'indirizzo!

## 🎨 Cosa Vedrai

- **Card Strategia** con effetto glassmorphism
- **Button "Modifica Configurazione"** con gradiente colorato
- **Button "Ricarica dal Database"** blu info con loading
- **Badge "Modifiche non salvate"** arancione pulsante
- **StatisticsCards** con 5 livelli di animazioni hover
- **Tabs** con underline animato

## 🐛 Problemi Comuni

### Errore: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta già in uso
Cambia la porta nel file `vite.config.ts` o usa:
```bash
npm run dev -- --port 3000
```
