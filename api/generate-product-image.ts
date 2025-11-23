import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderNeonWithCSS } from '../renderer/render';

// Font mapping: fontId -> fontFamily
const FONT_MAP: Record<string, string> = {
  'audiowide': 'Audiowide',
  'bungee': 'Bungee',
  'russoone': 'Russo One',
  'fredokaone': 'Fredoka One',
  'knewave': 'Knewave',
  'monoton': 'Monoton',
  'orbitron': 'Orbitron',
  'blackopsone': 'Black Ops One',
  'geostar': 'Geostar',
  'kranky': 'Kranky',
  'righteous': 'Righteous',
  'chewy': 'Chewy',
  'staatliches': 'Staatliches',
  'tiltneon': 'Tilt Neon',
  'luckiestguy': 'Luckiest Guy',
  'creepster': 'Creepster',
  'bebasneue': 'Bebas Neue',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers FIRST - before any other operation
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS request - MUST return early
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, fontId, color, plexiglassStyle, alignment, width, height } = req.body;

  // Validate required fields
  if (!text || !fontId || !color) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['text', 'fontId', 'color']
    });
  }

  // Get font family from fontId
  const fontFamily = FONT_MAP[fontId.toLowerCase()] || 'Audiowide';
  
  // Normalize plexiglass style
  const plexStyle = plexiglassStyle || 'style1';
  const hasPlexiglass = plexStyle !== 'none';
  
  // Normalize alignment
  const align = alignment || 'center';
  
  // Build HTML structure identical to the site
  const htmlText = text.replace(/\n/g, '<br>');
  
  // Build CSS for neon effects
  const neonColor = color === 'multicolor' ? '#b3e1f1' : color;
  
  // Generate HTML with all layers
  const html = `
    <div class="neon-preview">
      <div class="neon-text-container">
        <div class="neon-text-stack">
          <div class="neon-font-stack active">
            ${hasPlexiglass && plexStyle === 'style1' ? `
              <div class="neon-text-plexiglass style1">
                ${htmlText}
              </div>
            ` : hasPlexiglass && plexStyle === 'style2' ? `
              <div class="neon-text-plexiglass style2">
                ${htmlText}
              </div>
            ` : ''}
            <div class="neon-text-glow" style="--neon-color: ${neonColor};">
              ${htmlText}
            </div>
            <div class="neon-text-foreground" style="font-family: '${fontFamily}', sans-serif; color: ${neonColor};">
              ${htmlText}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Build complete CSS (embedding the full CSS from neon-configurator.css)
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Bungee&family=Russo+One&family=Fredoka+One&family=Knewave&family=Monoton&family=Orbitron:wght@600&family=Black+Ops+One&family=Geostar&family=Kranky&family=Righteous&family=Chewy&family=Staatliches&family=Tilt+Neon&family=Luckiest+Guy&family=Creepster&family=Bebas+Neue&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: ${width || 2000}px;
      height: ${height || 1500}px;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .neon-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #1a1a1a;
      border-radius: 8px;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      background-image: url('https://cdn.shopify.com/s/files/1/0965/8187/8085/files/SFONDO.jpg?v=1763119217');
      background-size: cover;
      background-position: center;
      width: 100%;
      height: 100%;
    }

    .neon-text-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      position: relative;
      min-height: 200px;
      padding: 20px;
    }

    .neon-text-stack {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100%;
      text-align: center;
    }

    .neon-font-stack {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      text-align: ${align};
      width: 100%;
      height: 100%;
    }

    .neon-text-layer {
      position: absolute;
      top: 50%;
      left: ${align === 'left' ? '0' : align === 'right' ? '100%' : '50%'};
      transform: translate(${align === 'left' ? '0, -50%' : align === 'right' ? '-100%, -50%' : '-50%, -50%'});
      width: auto;
      text-align: ${align};
      white-space: nowrap;
      line-height: 1;
      margin: 0;
      padding: 0;
      display: block;
      letter-spacing: 0px;
    }

    .neon-text-glow {
      position: absolute;
      top: 50%;
      left: ${align === 'left' ? '0' : align === 'right' ? '100%' : '50%'};
      transform: translate(${align === 'left' ? '0, -50%' : align === 'right' ? '-100%, -50%' : '-50%, -50%'});
      width: auto;
      z-index: 1;
      opacity: 0.85;
      font-size: clamp(32px, 5vw, 80px);
      font-family: '${fontFamily}', sans-serif;
      font-weight: 700;
      filter: drop-shadow(0 0 8px var(--neon-color, ${neonColor}));
      text-shadow:
        0 0 2px var(--neon-color, ${neonColor}),
        0 0 4px var(--neon-color, ${neonColor}),
        0 0 8px var(--neon-color, ${neonColor}),
        0 0 12px var(--neon-color, ${neonColor}),
        0 0 24px var(--neon-color, ${neonColor}),
        0 0 48px var(--neon-color, ${neonColor});
      pointer-events: none;
      text-align: ${align};
      white-space: nowrap;
      line-height: 1;
      margin: 0;
      padding: 0;
      display: block;
    }

    .neon-text-plexiglass {
      position: absolute;
      top: 50%;
      left: ${align === 'left' ? '0' : align === 'right' ? '100%' : '50%'};
      transform: translate(${align === 'left' ? '0, -50%' : align === 'right' ? '-100%, -50%' : '-50%, -50%'});
      width: auto;
      height: auto;
      z-index: 0;
      font-size: clamp(32px, 5vw, 80px);
      font-family: '${fontFamily}', sans-serif;
      font-weight: 700;
      font-style: normal;
      pointer-events: none;
      text-align: ${align};
      white-space: nowrap;
      line-height: 1;
      margin: 0;
      padding: 0;
      display: block;
    }

    .neon-text-plexiglass.style2 {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.4);
      color: rgba(255, 255, 255, 0.1);
      padding: 10px;
      box-sizing: border-box;
    }

    .neon-text-foreground {
      position: absolute;
      top: 50%;
      left: ${align === 'left' ? '0' : align === 'right' ? '100%' : '50%'};
      transform: translate(${align === 'left' ? '0, -50%' : align === 'right' ? '-100%, -50%' : '-50%, -50%'});
      width: auto;
      z-index: 2;
      color: ${neonColor};
      font-size: clamp(32px, 5vw, 80px);
      font-weight: 700;
      font-style: normal;
      pointer-events: none;
      text-align: ${align};
      white-space: nowrap;
      line-height: 1;
      margin: 0;
      padding: 0;
      display: block;
    }
  `;

  try {
    // Use renderNeonWithCSS to inject custom CSS
    const result = await renderNeonWithCSS(html, css, {
      width: width || 2000,
      height: height || 1500,
      delay: 1000, // Extra delay for fonts and effects to render
      format: 'webp',
      quality: 90,
      backgroundColor: null, // Transparent
    });

    // Convert buffer to base64
    const base64 = result.buffer.toString('base64');
    const dataUrl = `data:${result.mimeType};base64,${base64}`;

    // Return as JSON with base64 image
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({ 
      success: true,
      image: dataUrl,
      mimeType: result.mimeType
    });
  } catch (error: any) {
    console.error('Rendering error:', error);
    res.status(500).json({ 
      error: 'Failed to render image', 
      message: error.message 
    });
  }
}

