import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

interface RenderOptions {
  width?: number;
  height?: number;
  delay?: number;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  backgroundColor?: string | null;
  deviceScaleFactor?: number;
  fullPage?: boolean;
}

interface RenderResult {
  buffer: Buffer;
  mimeType: string;
}

let browserInstance: Browser | null = null;

/**
 * Get or create a browser instance (singleton pattern)
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    // Configure Chromium for Vercel serverless environment
    // Use chromium's default configuration which handles all the necessary setup
    const executablePath = await chromium.executablePath();
    
    browserInstance = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
    });
  }
  return browserInstance;
}

/**
 * Close browser instance (cleanup)
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Main render function using Puppeteer
 */
export async function renderNeon(
  html: string,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const {
    width = 2000,
    height = 1500,
    delay = 500,
    format = 'png',
    quality = 100,
    backgroundColor = null,
    deviceScaleFactor = 2,
    fullPage = false
  } = options;

  const browser = await getBrowser();
  const page = await browser.newPage();
  
  // Close browser after each render to avoid shared library issues on Vercel
  const shouldCloseBrowser = true;

  try {
    // Set viewport with high DPI for crisp neon rendering
    await page.setViewport({
      width,
      height,
      deviceScaleFactor,
    });

    // Enable all necessary features for neon effects
    await page.evaluateOnNewDocument(() => {
      // Enable CSS filters and effects
      Object.defineProperty((globalThis as any).navigator, 'webdriver', {
        get: () => false,
      });
    });

    // Create a complete HTML document with the provided HTML
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neon Render</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: ${backgroundColor || 'transparent'};
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* Ensure all CSS filters work */
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  </style>
  <!-- Load Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Bungee&family=Russo+One&family=Fredoka+One&family=Knewave&family=Monoton&family=Orbitron:wght@400;600;700&family=Black+Ops+One&family=Geostar&family=Kranky&family=Righteous&family=Chewy&family=Staatliches&family=Tilt+Neon&family=Luckiest+Guy&display=swap" rel="stylesheet">
</head>
<body>
  ${html}
  <script>
    // Wait for fonts to load
    document.fonts.ready.then(() => {
      window.fontsLoaded = true;
    });
    
    // Wait for images to load
    window.imagesLoaded = false;
    const images = document.querySelectorAll('img');
    if (images.length === 0) {
      window.imagesLoaded = true;
    } else {
      let loadedCount = 0;
      images.forEach(img => {
        if (img.complete) {
          loadedCount++;
        } else {
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === images.length) {
              window.imagesLoaded = true;
            }
          };
        }
      });
      if (loadedCount === images.length) {
        window.imagesLoaded = true;
      }
    }
    
    // Mark as ready
    window.renderReady = false;
    Promise.all([
      new Promise(resolve => {
        if (window.fontsLoaded) resolve();
        else {
          const checkFonts = setInterval(() => {
            if (window.fontsLoaded) {
              clearInterval(checkFonts);
              resolve();
            }
          }, 50);
        }
      }),
      new Promise(resolve => {
        if (window.imagesLoaded) resolve();
        else {
          const checkImages = setInterval(() => {
            if (window.imagesLoaded) {
              clearInterval(checkImages);
              resolve();
            }
          }, 50);
        }
      })
    ]).then(() => {
      window.renderReady = true;
    });
  </script>
</body>
</html>`;

    // Load the HTML
    await page.setContent(fullHTML, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for fonts and images to load
    await page.waitForFunction(
      () => (globalThis as any).renderReady === true,
      { timeout: 10000 }
    ).catch(() => {
      // Continue even if timeout - fonts might already be loaded
    });

    // Wait for fonts to be ready (additional check)
    await page.evaluate(() => {
      return (globalThis as any).document.fonts.ready;
    });

    // Additional delay for neon glow effects to stabilize
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Take screenshot
    const screenshotOptions: any = {
      type: format,
      quality: format !== 'png' ? quality : undefined,
      omitBackground: backgroundColor === null,
      fullPage: fullPage,
    };

    const screenshot = await page.screenshot(screenshotOptions);
    const buffer = Buffer.from(screenshot as string | Buffer);

    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };

    return {
      buffer,
      mimeType: mimeTypes[format] || 'image/png',
    };
  } finally {
    await page.close();
    // Close browser after each render to avoid shared library issues on Vercel serverless
    if (shouldCloseBrowser && browserInstance) {
      try {
        await browserInstance.close();
        browserInstance = null;
      } catch (e) {
        // Ignore errors when closing
      }
    }
  }
}

/**
 * Render with custom CSS injection
 */
export async function renderNeonWithCSS(
  html: string,
  css: string | string[],
  options: RenderOptions = {}
): Promise<RenderResult> {
  const cssArray = Array.isArray(css) ? css : [css];
  const cssString = cssArray.map(c => `<style>${c}</style>`).join('\n');
  
  // Inject CSS into HTML
  const htmlWithCSS = html.replace('</head>', `${cssString}</head>`);
  
  return renderNeon(htmlWithCSS, options);
}

