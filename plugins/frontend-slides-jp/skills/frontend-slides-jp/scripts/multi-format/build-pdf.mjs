// =========================================
// build-pdf.mjs — Generate text-selectable PDF
// Uses Playwright's page.pdf() — keeps all text as REAL text (not screenshots).
// PDF is fully searchable and copy-pasteable.
// Run: node build-pdf.mjs
// =========================================

import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { META } from './slides-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, 'index.html');
const htmlUrl = pathToFileURL(htmlPath).href;
const outPath = resolve(__dirname, `${META.filename || 'presentation'}.pdf`);

if (!existsSync(htmlPath)) {
    console.error('✗ index.html not found. Run: node render-html.mjs first.');
    process.exit(1);
}

console.log('→ Launching Chromium...');
const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
});
const page = await context.newPage();

console.log(`→ Loading ${htmlUrl}`);
await page.goto(htmlUrl, { waitUntil: 'networkidle', timeout: 30000 });

// Wait for fonts
await page.evaluate(() => document.fonts.ready);
// Extra wait for gradient/CSS to settle
await page.waitForTimeout(500);

// Force print media emulation (triggers @media print rules)
await page.emulateMedia({ media: 'print' });

console.log('→ Generating PDF (text-selectable, 1920×1080 landscape)...');
await page.pdf({
    path: outPath,
    // 1920×1080 at 96 DPI = 20 × 11.25 inches
    width: '1920px',
    height: '1080px',
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    pageRanges: '',  // all pages
});

await browser.close();

const fs = await import('node:fs/promises');
const stats = await fs.stat(outPath);
console.log(`✓ PDF: ${outPath} (${(stats.size / 1024).toFixed(1)} KB)`);
console.log('  → Text is fully selectable, searchable, and copy-pasteable.');
