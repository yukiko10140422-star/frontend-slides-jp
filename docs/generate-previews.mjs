// =========================================
// generate-previews.mjs
// Generates a sample title slide for each of the 18 presets and
// screenshots them at 1280×720 for the README gallery.
//
// Run: node docs/generate-previews.mjs
// =========================================

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tmpDir = join(__dirname, '_tmp-previews');
const outDir = join(__dirname, 'previews');

if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

// =========================================
// Preset definitions (18 total)
// =========================================

const PRESETS = [
    // ---------- ORIGINAL DARK THEMES ----------
    {
        id: '01-bold-signal',
        name: 'Bold Signal',
        category: 'Dark',
        vibe: 'Confident · High-impact · Modern',
        fontUrl: 'Archivo+Black:wght@400&family=Space+Grotesk:wght@400;500;700',
        fontDisplay: "'Archivo Black', sans-serif",
        fontBody: "'Space Grotesk', sans-serif",
        bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        cardBg: '#FF5722',
        textPrimary: '#ffffff',
        textOnCard: '#1a1a1a',
        layout: 'card',
    },
    {
        id: '02-electric-studio',
        name: 'Electric Studio',
        category: 'Dark',
        vibe: 'Bold · Clean · High Contrast',
        fontUrl: 'Manrope:wght@400;500;800',
        fontDisplay: "'Manrope', sans-serif",
        fontBody: "'Manrope', sans-serif",
        bg: '#0a0a0a',
        accent: '#4361ee',
        textPrimary: '#ffffff',
        layout: 'split',
    },
    {
        id: '03-creative-voltage',
        name: 'Creative Voltage',
        category: 'Dark',
        vibe: 'Energetic · Retro-modern',
        fontUrl: 'Syne:wght@700;800&family=Space+Mono:wght@400;700',
        fontDisplay: "'Syne', sans-serif",
        fontBody: "'Space Mono', monospace",
        bg: '#0066ff',
        accent: '#d4ff00',
        textPrimary: '#ffffff',
        layout: 'voltage',
    },
    {
        id: '04-dark-botanical',
        name: 'Dark Botanical',
        category: 'Dark',
        vibe: 'Elegant · Sophisticated · Premium',
        fontUrl: 'Cormorant:wght@400;600&family=IBM+Plex+Sans:wght@300;400',
        fontDisplay: "'Cormorant', serif",
        fontBody: "'IBM Plex Sans', sans-serif",
        bg: 'radial-gradient(ellipse at 20% 30%, #1a0f15 0%, #0f0f0f 60%)',
        accent: '#d4a574',
        accent2: '#e8b4b8',
        textPrimary: '#e8e4df',
        layout: 'botanical',
    },

    // ---------- ORIGINAL LIGHT THEMES ----------
    {
        id: '05-notebook-tabs',
        name: 'Notebook Tabs',
        category: 'Light',
        vibe: 'Editorial · Organized · Tactile',
        fontUrl: 'Bodoni+Moda:wght@400;700&family=DM+Sans:wght@400;500',
        fontDisplay: "'Bodoni Moda', serif",
        fontBody: "'DM Sans', sans-serif",
        bg: '#2d2d2d',
        paper: '#f8f6f1',
        textPrimary: '#1a1a1a',
        tabs: ['#98d4bb', '#c7b8ea', '#f4b8c5', '#a8d8ea', '#ffe6a7'],
        layout: 'notebook',
    },
    {
        id: '06-pastel-geometry',
        name: 'Pastel Geometry',
        category: 'Light',
        vibe: 'Friendly · Approachable · Modern',
        fontUrl: 'Plus+Jakarta+Sans:wght@400;500;700;800',
        fontDisplay: "'Plus Jakarta Sans', sans-serif",
        fontBody: "'Plus Jakarta Sans', sans-serif",
        bg: '#c8d9e6',
        card: '#faf9f7',
        textPrimary: '#1a1a1a',
        pills: ['#f0b4d4', '#a8d4c4', '#5a7c6a', '#9b8dc4', '#7c6aad'],
        layout: 'pastel',
    },
    {
        id: '07-split-pastel',
        name: 'Split Pastel',
        category: 'Light',
        vibe: 'Playful · Modern · Friendly',
        fontUrl: 'Outfit:wght@400;500;700;800',
        fontDisplay: "'Outfit', sans-serif",
        fontBody: "'Outfit', sans-serif",
        bgLeft: '#f5e6dc',
        bgRight: '#e4dff0',
        textPrimary: '#1a1a1a',
        badge: '#c8f0d8',
        layout: 'split-pastel',
    },
    {
        id: '08-vintage-editorial',
        name: 'Vintage Editorial',
        category: 'Light',
        vibe: 'Witty · Personality-driven',
        fontUrl: 'Fraunces:wght@700;900&family=Work+Sans:wght@400;500',
        fontDisplay: "'Fraunces', serif",
        fontBody: "'Work Sans', sans-serif",
        bg: '#f5f3ee',
        accent: '#e8d4c0',
        textPrimary: '#1a1a1a',
        layout: 'vintage',
    },

    // ---------- ORIGINAL SPECIALTY ----------
    {
        id: '09-neon-cyber',
        name: 'Neon Cyber',
        category: 'Specialty',
        vibe: 'Futuristic · Techy',
        fontUrl: 'Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400',
        fontDisplay: "'Space Grotesk', sans-serif",
        fontBody: "'JetBrains Mono', monospace",
        bg: '#0a0f1c',
        accent: '#00ffcc',
        accent2: '#ff00aa',
        textPrimary: '#ffffff',
        layout: 'cyber',
    },
    {
        id: '10-terminal-green',
        name: 'Terminal Green',
        category: 'Specialty',
        vibe: 'Developer · Hacker aesthetic',
        fontUrl: 'JetBrains+Mono:wght@400;700',
        fontDisplay: "'JetBrains Mono', monospace",
        fontBody: "'JetBrains Mono', monospace",
        bg: '#0d1117',
        accent: '#39d353',
        textPrimary: '#39d353',
        layout: 'terminal',
    },
    {
        id: '11-swiss-modern',
        name: 'Swiss Modern',
        category: 'Specialty',
        vibe: 'Minimal · Bauhaus · Precise',
        fontUrl: 'Archivo:wght@400;800&family=Nunito:wght@400',
        fontDisplay: "'Archivo', sans-serif",
        fontBody: "'Nunito', sans-serif",
        bg: '#ffffff',
        accent: '#ff3300',
        textPrimary: '#000000',
        layout: 'swiss',
    },
    {
        id: '12-paper-ink',
        name: 'Paper & Ink',
        category: 'Specialty',
        vibe: 'Editorial · Literary · Thoughtful',
        fontUrl: 'Cormorant+Garamond:wght@400;700&family=Source+Serif+4:wght@400',
        fontDisplay: "'Cormorant Garamond', serif",
        fontBody: "'Source Serif 4', serif",
        bg: '#faf9f7',
        accent: '#c41e3a',
        textPrimary: '#1a1a1a',
        layout: 'paper',
    },

    // ---------- JAPANESE PRESETS (NEW) ----------
    {
        id: '13-jp-dark-luxury',
        name: 'JP-1 Dark Luxury',
        category: 'Japanese',
        vibe: '高級・重厚・IR資料',
        fontUrl: 'Shippori+Mincho:wght@700;900&family=Noto+Sans+JP:wght@400;500',
        fontDisplay: "'Shippori Mincho', serif",
        fontBody: "'Noto Sans JP', sans-serif",
        bg: 'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(30, 15, 60, 0.8) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 85% 75%, rgba(15, 25, 60, 0.6) 0%, transparent 65%), #070710',
        accent: '#c9a961',
        accent2: '#2a9d8f',
        textPrimary: '#ffffff',
        jpSample: '高級感ある\n和モダン明朝',
        layout: 'jp-luxury',
    },
    {
        id: '14-jp-dark-tech',
        name: 'JP-2 Dark Tech',
        category: 'Japanese',
        vibe: 'SaaS・DX・リサーチレポート',
        fontUrl: 'Zen+Kaku+Gothic+New:wght@500;900&family=Space+Grotesk:wght@500;700',
        fontDisplay: "'Zen Kaku Gothic New', sans-serif",
        fontBody: "'Space Grotesk', sans-serif",
        bg: 'radial-gradient(ellipse 70% 55% at 20% 30%, rgba(10, 40, 100, 0.6) 0%, transparent 70%), radial-gradient(ellipse 50% 45% at 80% 70%, rgba(0, 80, 120, 0.35) 0%, transparent 65%), #05080f',
        accent: '#00d4ff',
        accent2: '#ff2d9a',
        textPrimary: '#ffffff',
        jpSample: 'テクノロジー\nリサーチ',
        layout: 'jp-tech',
    },
    {
        id: '15-jp-light-clean',
        name: 'JP-3 Light Clean',
        category: 'Japanese',
        vibe: 'コンサル・提案書・官公庁',
        fontUrl: 'Noto+Sans+JP:wght@400;700;900&family=Inter:wght@400;700',
        fontDisplay: "'Noto Sans JP', sans-serif",
        fontBody: "'Inter', sans-serif",
        bg: '#fafaf7',
        accent: '#1e3a8a',
        accent2: '#dc2626',
        textPrimary: '#0a1628',
        jpSample: 'クリーンな\n提案書',
        layout: 'jp-clean',
    },
    {
        id: '16-jp-light-warm',
        name: 'JP-4 Light Warm',
        category: 'Japanese',
        vibe: 'ヘルスケア・教育・NPO',
        fontUrl: 'Zen+Maru+Gothic:wght@500;700;900&family=Noto+Sans+JP:wght@400',
        fontDisplay: "'Zen Maru Gothic', sans-serif",
        fontBody: "'Noto Sans JP', sans-serif",
        bg: 'linear-gradient(135deg, #faf7f0 0%, #f5f1e8 100%)',
        accent: '#c65d3a',
        accent2: '#7a8b3f',
        textPrimary: '#2d2420',
        jpSample: '温かい\n丸ゴシック',
        layout: 'jp-warm',
    },
    {
        id: '17-jp-corporate',
        name: 'JP-5 Corporate Royal',
        category: 'Japanese',
        vibe: '企業年次報告・IR・財務',
        fontUrl: 'Noto+Sans+JP:wght@400;700&family=Inter:wght@400;500;700',
        fontDisplay: "'Noto Sans JP', sans-serif",
        fontBody: "'Inter', sans-serif",
        bg: 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)',
        accent: '#1e40af',
        accent2: '#64748b',
        textPrimary: '#1a1a2e',
        jpSample: '企業年次\n報告書',
        layout: 'jp-corp',
    },
    {
        id: '18-jp-dark-creative',
        name: 'JP-6 Dark Creative',
        category: 'Japanese',
        vibe: 'メディア・エンタメ・クリエイティブ',
        fontUrl: 'Murecho:wght@700;900&family=Noto+Sans+JP:wght@500&family=Syne:wght@700;800',
        fontDisplay: "'Murecho', sans-serif",
        fontBody: "'Noto Sans JP', sans-serif",
        bg: 'radial-gradient(ellipse at 25% 25%, rgba(255, 61, 138, 0.25) 0%, transparent 60%), radial-gradient(ellipse at 75% 75%, rgba(255, 144, 64, 0.2) 0%, transparent 60%), #0f0a1a',
        accent: '#ff3d8a',
        accent2: '#ff9040',
        textPrimary: '#ffffff',
        jpSample: 'クリエイティブ\nメディア',
        layout: 'jp-creative',
    },
];

// =========================================
// HTML template (universal slide renderer)
// =========================================

function renderHtml(p) {
    const isDark = ['Dark', 'Specialty', 'Japanese'].includes(p.category) &&
                   !['05-notebook-tabs', '11-swiss-modern', '12-paper-ink',
                     '15-jp-light-clean', '16-jp-light-warm', '17-jp-corporate'].includes(p.id);
    const textMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';

    // Layout-specific decorations
    let decorations = '';
    switch (p.layout) {
        case 'card':
            decorations = `<div class="card-decor"></div>`;
            break;
        case 'split':
            decorations = `<div class="split-panel"></div>`;
            break;
        case 'voltage':
            decorations = `<div class="voltage-dot"></div>`;
            break;
        case 'botanical':
            decorations = `<div class="orb orb-1"></div><div class="orb orb-2"></div>`;
            break;
        case 'notebook':
            decorations = `<div class="paper"></div>${(p.tabs || []).map((c, i) => `<div class="tab" style="background:${c};top:${12 + i * 14}%"></div>`).join('')}`;
            break;
        case 'pastel':
            decorations = `<div class="pastel-card"></div>${(p.pills || []).map((c, i) => {
                const heights = [40, 55, 70, 55, 40];
                return `<div class="pill" style="background:${c};height:${heights[i]}%;top:${(100 - heights[i]) / 2}%;right:${4 + i * 6}%"></div>`;
            }).join('')}`;
            break;
        case 'split-pastel':
            decorations = `<div class="badge-pill"></div>`;
            break;
        case 'vintage':
            decorations = `<div class="circle-outline"></div><div class="line-accent"></div>`;
            break;
        case 'cyber':
            decorations = `<div class="grid-bg"></div><div class="cyber-glow"></div>`;
            break;
        case 'terminal':
            decorations = `<div class="scanlines"></div><div class="cursor">▊</div>`;
            break;
        case 'swiss':
            decorations = `<div class="swiss-block"></div><div class="swiss-line"></div>`;
            break;
        case 'paper':
            decorations = `<div class="drop-cap">A</div>`;
            break;
        case 'jp-luxury':
            decorations = `<div class="orb orb-luxury"></div><div class="gold-line"></div>`;
            break;
        case 'jp-tech':
            decorations = `<div class="grid-bg grid-tech"></div><div class="tech-orb"></div>`;
            break;
        case 'jp-clean':
            decorations = `<div class="clean-line"></div><div class="clean-accent"></div>`;
            break;
        case 'jp-warm':
            decorations = `<div class="warm-circle"></div>`;
            break;
        case 'jp-corp':
            decorations = `<div class="corp-grid"></div><div class="corp-line"></div>`;
            break;
        case 'jp-creative':
            decorations = `<div class="creative-blob blob-1"></div><div class="creative-blob blob-2"></div>`;
            break;
    }

    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${p.fontUrl}&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width: 1920px; height: 1080px; overflow: hidden; }
body {
    font-family: ${p.fontBody};
    color: ${p.textPrimary};
    background: ${p.bg};
    position: relative;
    padding: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-feature-settings: "palt" 1;
    -webkit-font-smoothing: antialiased;
}
.category {
    font-family: ${p.fontBody};
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: ${p.accent || p.cardBg || '#888'};
    margin-bottom: 20px;
    z-index: 10;
    position: relative;
}
.title {
    font-family: ${p.fontDisplay};
    font-size: 140px;
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: 0.01em;
    margin-bottom: 40px;
    max-width: 75%;
    z-index: 10;
    position: relative;
}
.vibe {
    font-family: ${p.fontBody};
    font-size: 32px;
    font-weight: 400;
    color: ${textMuted};
    max-width: 60%;
    z-index: 10;
    position: relative;
}
.footer {
    position: absolute;
    bottom: 60px;
    left: 100px;
    right: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: ${p.fontBody};
    font-size: 20px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: ${textMuted};
    z-index: 10;
}
.brand-bar {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 8px;
    background: ${p.accent2 ? `linear-gradient(90deg, ${p.accent || '#888'}, ${p.accent2})` : p.accent || p.cardBg || '#888'};
    z-index: 20;
}

/* ---------- layout decorations ---------- */

.card-decor {
    position: absolute;
    top: 15%; right: 8%;
    width: 500px; height: 650px;
    background: ${p.cardBg};
    border-radius: 8px;
    box-shadow: 0 20px 80px rgba(0,0,0,0.5);
}

.split-panel {
    position: absolute;
    top: 0; right: 0; bottom: 0; width: 40%;
    background: ${p.accent};
}

.voltage-dot {
    position: absolute;
    top: 15%; right: 10%;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: ${p.accent};
    box-shadow: 0 0 100px ${p.accent};
}

.orb { position: absolute; border-radius: 50%; pointer-events: none; }
.orb-1 { top: -10%; right: -5%; width: 700px; height: 700px; background: radial-gradient(circle, ${p.accent}40, transparent 60%); filter: blur(60px); }
.orb-2 { bottom: -10%; left: 20%; width: 500px; height: 500px; background: radial-gradient(circle, ${p.accent2 || p.accent}30, transparent 60%); filter: blur(80px); }
.orb-luxury { top: -15%; right: -10%; width: 800px; height: 800px; background: radial-gradient(circle, ${p.accent}25, transparent 60%); filter: blur(100px); }
.gold-line { position: absolute; top: 50%; right: 100px; width: 3px; height: 300px; background: ${p.accent}; box-shadow: 0 0 20px ${p.accent}; }
.tech-orb { position: absolute; top: 10%; right: 10%; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, ${p.accent}30, transparent 60%); filter: blur(80px); }

.paper { position: absolute; top: 8%; left: 8%; right: 20%; bottom: 8%; background: ${p.paper || '#f8f6f1'}; box-shadow: 0 30px 100px rgba(0,0,0,0.6); border-radius: 4px; }
.tab { position: absolute; right: 10%; width: 40px; height: 80px; border-radius: 4px 0 0 4px; z-index: 5; }

.pastel-card { position: absolute; top: 10%; left: 10%; right: 20%; bottom: 10%; background: ${p.card || '#faf9f7'}; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.pill { position: absolute; width: 60px; border-radius: 30px; z-index: 5; }

.badge-pill { position: absolute; top: 20%; right: 8%; width: 200px; height: 80px; border-radius: 40px; background: ${p.badge || '#c8f0d8'}; border: 3px solid ${p.textPrimary}; }

.circle-outline { position: absolute; top: 15%; right: 10%; width: 300px; height: 300px; border-radius: 50%; border: 4px solid ${p.textPrimary}; }
.line-accent { position: absolute; top: 50%; right: 30%; width: 200px; height: 4px; background: ${p.textPrimary}; }

.grid-bg {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 64px 64px;
    z-index: 1;
}
.grid-tech { background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); }
.cyber-glow { position: absolute; top: 30%; right: 15%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, ${p.accent}40, transparent 60%); filter: blur(70px); }

.scanlines { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(57, 211, 83, 0.04) 3px, rgba(57, 211, 83, 0.04) 4px); pointer-events: none; z-index: 2; }
.cursor { position: absolute; bottom: 30%; left: 100px; font-size: 60px; color: ${p.accent}; z-index: 10; font-family: ${p.fontDisplay}; }

.swiss-block { position: absolute; top: 15%; right: 10%; width: 400px; height: 600px; background: ${p.accent}; }
.swiss-line { position: absolute; top: 0; left: 45%; width: 4px; bottom: 0; background: ${p.textPrimary}; z-index: 1; }

.drop-cap { position: absolute; top: 25%; left: 60%; font-family: ${p.fontDisplay}; font-size: 500px; line-height: 0.8; color: ${p.accent}; opacity: 0.35; font-weight: 400; }

.clean-line { position: absolute; top: 50%; right: 100px; width: 400px; height: 2px; background: ${p.accent}; }
.clean-accent { position: absolute; top: 20%; right: 100px; width: 80px; height: 4px; background: ${p.accent2}; }

.warm-circle { position: absolute; top: 10%; right: 5%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, ${p.accent}20, transparent 65%); }

.corp-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(30, 64, 175, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 64, 175, 0.04) 1px, transparent 1px); background-size: 80px 80px; }
.corp-line { position: absolute; left: 100px; right: 100px; top: 15%; height: 1px; background: ${p.accent}; }

.creative-blob { position: absolute; border-radius: 50%; filter: blur(80px); }
.blob-1 { top: -15%; right: -10%; width: 700px; height: 700px; background: ${p.accent}; opacity: 0.5; }
.blob-2 { bottom: -20%; left: -10%; width: 600px; height: 600px; background: ${p.accent2}; opacity: 0.35; }
</style>
</head>
<body>
${decorations}
<div class="category">${p.category.toUpperCase()} · PRESET</div>
<h1 class="title">${p.jpSample ? p.jpSample.replace('\n', '<br>') : p.name}</h1>
<p class="vibe">${p.vibe}</p>
<div class="footer">
    <span>${p.name.toUpperCase()}</span>
    <span>FRONTEND SLIDES JP</span>
</div>
<div class="brand-bar"></div>
</body>
</html>`;
}

// =========================================
// Generate HTML files and screenshot with Playwright
// =========================================

console.log(`→ Generating ${PRESETS.length} preset preview HTMLs...`);
for (const p of PRESETS) {
    const html = renderHtml(p);
    writeFileSync(join(tmpDir, `${p.id}.html`), html, 'utf-8');
}
console.log(`  ✓ HTML files written to ${tmpDir}`);

console.log('→ Launching Playwright Chromium...');
const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
});
const page = await context.newPage();

for (const p of PRESETS) {
    const htmlPath = join(tmpDir, `${p.id}.html`);
    const url = pathToFileURL(htmlPath).href;
    console.log(`  → ${p.id} (${p.name})`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const outPath = join(outDir, `${p.id}.png`);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1920, height: 1080 }, type: 'png' });
}

await browser.close();

// Resize to 1280×720 thumbnails to keep repo size reasonable
console.log('→ Thumbnails saved at full 1920×1080. Cleaning up tmp...');
rmSync(tmpDir, { recursive: true });
console.log(`✓ Done. ${PRESETS.length} previews saved to: ${outDir}`);
