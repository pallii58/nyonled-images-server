# 🆕 Setup Nuovo Progetto Vercel - Guida Semplificata

## Step 1: Elimina il Progetto Vecchio

1. Vai su https://vercel.com/dashboard
2. Trova il progetto `server-nyonled`
3. Vai su **Settings** → **General** → scrolla in basso
4. Clicca **"Delete Project"**
5. Conferma l'eliminazione

## Step 2: Crea Nuovo Progetto

1. Vai su https://vercel.com/dashboard
2. Clicca **"Add New..."** → **"Project"**
3. Seleziona **"Import Git Repository"**
4. Scegli: `pallii58/nyonled-shopify-theme`
5. Clicca **"Import"**

## Step 3: Configurazione Semplificata

⚠️ **IMPORTANTE: Configura questi valori ESATTI:**

### Framework Preset
- Seleziona: **"Other"**

### Root Directory
- Clicca **"Edit"** accanto a Root Directory
- Inserisci: **`server`**
- Clicca **"Continue"**

### Build and Output Settings
- **Build Command:** `npm run build`
- **Output Directory:** `public` (o lascia vuoto se non funziona)
- **Install Command:** `npm install`

### Environment Variables
- Non serve aggiungere nulla

## Step 4: Deploy

1. Clicca **"Deploy"**
2. Attendi il completamento (2-3 minuti)

## Step 5: Verifica

Dopo il deploy, testa:
```bash
curl https://your-new-project.vercel.app/api/health
```

Dovresti ricevere: `{"status":"OK","timestamp":"..."}`

## Step 6: Aggiorna Frontend

1. Copia l'URL del nuovo progetto (es: `https://server-nyonled-new.vercel.app`)
2. Apri `assets/neon-configurator.js`
3. Cerca `RENDERER_API_URL` (circa riga 2465)
4. Aggiorna con il nuovo URL:
```javascript
const RENDERER_API_URL = 'https://server-nyonled-new.vercel.app';
```

5. Push su Shopify:
```bash
git add assets/neon-configurator.js
git commit -m "Update renderer API URL to new Vercel project"
git push origin main
shopify theme push --theme=184424071493 --allow-live
```

## ✅ Fatto!

Il nuovo progetto dovrebbe funzionare correttamente senza problemi CORS.

