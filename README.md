# Neon Images Server

Server-side rendering API per generare immagini prodotto del Neon Configurator usando Puppeteer su Vercel.

## 🚀 Deploy su Vercel

Questo progetto è configurato per essere deployato su Vercel come serverless functions.

### API Endpoints

#### `GET /api/health`
Health check endpoint.

#### `POST /api/render-config`
Genera un'immagine PNG da una configurazione neon.

**Body:**
```json
{
  "text": "Il tuo testo",
  "fontId": "audiowide",
  "color": "#b3e1f1",
  "plexiglassStyle": "style1",
  "width": 2000,
  "height": 1500
}
```

#### `POST /api/generate-product-image`
Genera un'immagine prodotto completa da configurazione neon (per aggiunta al carrello).

**Body:**
```json
{
  "text": "Il tuo testo",
  "fontId": "audiowide",
  "color": "#b3e1f1",
  "plexiglassStyle": "style1",
  "alignment": "center",
  "width": 2000,
  "height": 1500
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/webp;base64,...",
  "mimeType": "image/webp"
}
```

## 📦 Tecnologie

- **TypeScript** - Type safety
- **Puppeteer** - Server-side rendering con headless Chrome
- **@sparticuz/chromium** - Chromium ottimizzato per serverless
- **Vercel** - Platform per serverless functions

## 🔧 Setup Locale

```bash
# Installa dipendenze
npm install

# Sviluppo locale (richiede Vercel CLI)
vercel dev

# Build
npm run build
```

## 📝 Note

- Le funzioni hanno un `maxDuration` di 30 secondi (configurato in `vercel.json`)
- Il progetto usa serverless functions di Vercel, non un server Express standalone
- Chromium viene fornito automaticamente da `@sparticuz/chromium` su Vercel
