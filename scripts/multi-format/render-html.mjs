// =========================================
// render-html.mjs — Generate index.html from slides-data.mjs
// Run: node render-html.mjs
// =========================================

import { SLIDES, THEME, META } from './slides-data.mjs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const C = THEME.colors;

// Escape HTML
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

// Wrap accent word in heading
const headingHtml = (heading, accent) => {
    if (!accent) return esc(heading);
    return esc(heading).replace(esc(accent), `<span class="accent">${esc(accent)}</span>`);
};

// =========================================
// SLIDE RENDERERS (one per type)
// =========================================

function renderTitle(s, i, total) {
    return `
<section class="slide title-slide" data-slide-type="title">
    <div class="decor-orb"></div>
    <div class="decor-orb-2"></div>
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h1 class="mega-title reveal">${nl2br(s.title)}</h1>
        <p class="subtitle reveal">${nl2br(s.subtitle)}</p>
        <div class="meta reveal">
            ${s.meta.map((m) => `<span>${esc(m)}</span>`).join('\n            ')}
        </div>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderAgenda(s, i, total) {
    const items = s.items.map((item, idx) => `
            <div class="agenda-item">
                <div class="agenda-num">${String(idx + 1).padStart(2, '0')}</div>
                <div class="agenda-text">${esc(item)}</div>
            </div>`).join('');
    return `
<section class="slide" data-slide-type="agenda">
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${esc(s.heading)}</h2>
        <div class="agenda-list reveal">${items}
        </div>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderTwoCol(s, i, total) {
    const cols = s.columns.map((c) => `
            <div class="col-card ${c.accent === 'magenta' ? 'magenta' : ''}">
                <div class="label">${esc(c.label)}</div>
                <h3>${esc(c.title)}</h3>
                <p>${esc(c.body)}</p>
            </div>`).join('');
    return `
<section class="slide" data-slide-type="two-col">
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${headingHtml(s.heading, s.headingAccent)}</h2>
        ${s.lead ? `<p class="lead reveal">${esc(s.lead)}</p>` : ''}
        <div class="two-col reveal">${cols}
        </div>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderKpi(s, i, total) {
    const cards = s.kpis.map((k) => `
            <div class="kpi-card">
                <div class="kpi-value">${esc(k.value)}</div>
                <div class="kpi-label">${esc(k.label)}</div>
                <div class="kpi-note">${esc(k.note)}</div>
            </div>`).join('');
    return `
<section class="slide" data-slide-type="kpi">
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${headingHtml(s.heading, s.headingAccent)}</h2>
        ${s.lead ? `<p class="lead reveal">${esc(s.lead)}</p>` : ''}
        <div class="kpi-grid reveal">${cards}
        </div>
        ${s.footnote ? `<p class="lead reveal">${esc(s.footnote)}</p>` : ''}
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderLayers(s, i, total) {
    const layers = s.layers.map((l) => `
            <div class="layer ${l.highlight ? 'highlight' : ''}">
                <div class="layer-num">${esc(l.num)}</div>
                <div class="layer-name">${esc(l.name)}</div>
                <div class="layer-tag">${esc(l.tag)}</div>
            </div>`).join('');
    return `
<section class="slide" data-slide-type="layers">
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${headingHtml(s.heading, s.headingAccent)}</h2>
        <div class="layer-stack reveal">${layers}
        </div>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderFlow(s, i, total) {
    const stepHtml = s.steps.map((st, idx) => {
        const arrow = idx < s.steps.length - 1 ? '\n            <div class="flow-arrow">▶</div>' : '';
        return `
            <div class="flow-step">
                <div class="step-num">${esc(st.num)}</div>
                <div class="step-label">${nl2br(st.label)}</div>
            </div>${arrow}`;
    }).join('');
    const bullets = s.bullets.map((b) => `
            <li><strong>${esc(b.strong)}</strong>${esc(b.text)}</li>`).join('');
    return `
<section class="slide" data-slide-type="flow">
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${esc(s.heading)}</h2>
        <div class="flow reveal">${stepHtml}
        </div>
        <ul class="bullet-list reveal">${bullets}
        </ul>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderTwoColBullets(s, i, total) {
    const cols = s.columns.map((c) => `
            <div class="col-card ${c.accent === 'magenta' ? 'magenta' : ''}">
                <div class="label">${esc(c.label)}</div>
                <h3>${esc(c.title)}</h3>
                <p>${esc(c.body)}</p>
            </div>`).join('');
    const bullets = s.bullets.map((b) => `
            <li><strong>${esc(b.strong)}</strong>${esc(b.text)}</li>`).join('');
    return `
<section class="slide" data-slide-type="two-col-bullets">
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${esc(s.heading)}</h2>
        <div class="two-col reveal">${cols}
        </div>
        <ul class="bullet-list reveal">${bullets}
        </ul>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderLeadBullets(s, i, total) {
    const bullets = s.bullets.map((b) => `
            <li><strong>${esc(b.strong)}</strong>${esc(b.text)}</li>`).join('');
    return `
<section class="slide" data-slide-type="lead-bullets">
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${esc(s.heading)}</h2>
        <p class="lead reveal">${esc(s.lead)}</p>
        <ul class="bullet-list reveal">${bullets}
        </ul>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderBullets(s, i, total) {
    const bullets = s.bullets.map((b) => `
            <li><strong>${esc(b.strong)}</strong>${esc(b.text)}</li>`).join('');
    return `
<section class="slide" data-slide-type="bullets">
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${headingHtml(s.heading, s.headingAccent)}</h2>
        <ul class="bullet-list reveal">${bullets}
        </ul>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderPhases(s, i, total) {
    const phases = s.phases.map((p) => {
        const items = p.items.map((it) => `<li>${esc(it)}</li>`).join('');
        return `
            <div class="phase phase-${p.accent}">
                <div class="phase-label">${esc(p.label)}</div>
                <h3>${esc(p.title)}</h3>
                <ul>${items}</ul>
            </div>`;
    }).join('');
    return `
<section class="slide" data-slide-type="phases">
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${headingHtml(s.heading, s.headingAccent)}</h2>
        <div class="phases reveal">${phases}
        </div>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

function renderClosing(s, i, total) {
    return `
<section class="slide" data-slide-type="closing">
    <div class="decor-orb"></div>
    <div class="slide-content">
        <div class="kicker reveal">${esc(s.kicker)}</div>
        <h2 class="slide-heading reveal">${headingHtml(s.heading, s.headingAccent)}</h2>
        <blockquote class="closing-thesis reveal">${esc(s.thesis)}</blockquote>
        <div class="closing-meta reveal">${esc(s.meta)}</div>
    </div>
    <div class="slide-number">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <div class="brand-bar"></div>
</section>`;
}

const RENDERERS = {
    'title': renderTitle,
    'agenda': renderAgenda,
    'two-col': renderTwoCol,
    'two-col-bullets': renderTwoColBullets,
    'kpi': renderKpi,
    'layers': renderLayers,
    'flow': renderFlow,
    'lead-bullets': renderLeadBullets,
    'bullets': renderBullets,
    'phases': renderPhases,
    'closing': renderClosing,
};

// =========================================
// CSS (extracted from earlier, kept verbatim)
// =========================================

const CSS = `
:root {
    --bg-primary: ${C.bgPrimary};
    --bg-secondary: ${C.bgSecondary};
    --bg-tertiary: ${C.bgTertiary};
    --text-primary: ${C.textPrimary};
    --text-secondary: ${C.textSecondary};
    --text-muted: ${C.textMuted};
    --accent-cyan: ${C.accentCyan};
    --accent-magenta: ${C.accentMagenta};
    --accent-violet: ${C.accentViolet};
    --accent-cyan-glow: rgba(0, 212, 255, 0.35);
    --accent-magenta-glow: rgba(255, 45, 154, 0.3);
    --border-subtle: rgba(255, 255, 255, 0.08);
    --card-bg: rgba(255, 255, 255, 0.03);
    --card-border: rgba(255, 255, 255, 0.08);
    --font-jp: ${THEME.fonts.jpWeb};
    --font-latin: ${THEME.fonts.latinWeb};
    --font-mono: ${THEME.fonts.monoWeb};
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --duration-normal: 0.7s;
    --title-size: clamp(1.5rem, 5vw, 4rem);
    --h2-size: clamp(1.25rem, 3.5vw, 2.5rem);
    --h3-size: clamp(1rem, 2.5vw, 1.75rem);
    --body-size: clamp(0.75rem, 1.5vw, 1.125rem);
    --small-size: clamp(0.65rem, 1vw, 0.875rem);
    --slide-padding: clamp(1.5rem, 5vw, 5rem);
    --content-gap: clamp(0.75rem, 2vw, 2rem);
}

:root:lang(ja), html[lang="ja"], [lang="ja"] {
    --title-size: clamp(1.75rem, 4.5vw, 3.5rem);
    --h2-size: clamp(1.4rem, 3.2vw, 2.5rem);
    --h3-size: clamp(1.1rem, 2vw, 1.5rem);
    --body-size: clamp(1rem, 1.5vw, 1.25rem);
    --small-size: clamp(0.875rem, 1vw, 1rem);
}

[lang="ja"] h1, [lang="ja"] h2, [lang="ja"] h3, [lang="ja"] p, [lang="ja"] li, [lang="ja"] blockquote {
    word-break: auto-phrase;
    line-break: strict;
    overflow-wrap: anywhere;
    hanging-punctuation: allow-end;
}
[lang="ja"] h1, [lang="ja"] h2 { line-height: 1.25; letter-spacing: 0.04em; }
[lang="ja"] h3, [lang="ja"] h4 { line-height: 1.4; letter-spacing: 0.03em; }
[lang="ja"] p, [lang="ja"] li { line-height: 1.8; letter-spacing: 0.02em; }

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
    height: 100%;
    overflow-x: hidden;
    background: var(--bg-primary);
    color: var(--text-primary);
}
html { scroll-snap-type: y mandatory; scroll-behavior: smooth; }
body {
    font-family: var(--font-latin), var(--font-jp);
    font-feature-settings: "palt" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    line-height: 1.6;
}

.slide {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    position: relative;
}

.slide-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 100%;
    overflow: hidden;
    padding: var(--slide-padding);
    position: relative;
    z-index: 2;
}

.slide::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
        radial-gradient(ellipse 70% 55% at 18% 28%, rgba(10, 40, 100, 0.55) 0%, transparent 70%),
        radial-gradient(ellipse 55% 45% at 82% 72%, rgba(0, 80, 120, 0.35) 0%, transparent 65%),
        radial-gradient(ellipse 40% 35% at 60% 20%, rgba(124, 77, 255, 0.18) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
}
.slide::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 64px 64px;
    pointer-events: none;
    z-index: 1;
    opacity: 0.6;
}

.brand-bar {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-violet), var(--accent-magenta));
    box-shadow: 0 -4px 20px var(--accent-cyan-glow);
    z-index: 20;
}

.slide-number {
    position: absolute;
    top: clamp(1rem, 2.5vh, 2rem);
    right: clamp(1.5rem, 3vw, 3rem);
    font-family: var(--font-mono);
    font-size: clamp(0.75rem, 1.1vw, 0.95rem);
    color: var(--text-muted);
    letter-spacing: 0.2em;
    z-index: 15;
}

.kicker {
    font-family: var(--font-latin);
    font-size: clamp(0.7rem, 1vw, 0.85rem);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: var(--accent-cyan);
    margin-bottom: clamp(0.5rem, 1vh, 1rem);
    text-shadow: 0 0 15px var(--accent-cyan-glow);
}

.title-slide .slide-content { justify-content: center; align-items: flex-start; }
.title-slide .mega-title {
    font-family: var(--font-jp);
    font-size: clamp(2.25rem, 5.5vw, 5rem);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: 0.01em;
    max-width: 95%;
    background: linear-gradient(135deg, #ffffff 0%, #c5d1e0 60%, var(--accent-cyan) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: clamp(1rem, 2vh, 2rem);
}
.title-slide .subtitle {
    font-family: var(--font-jp);
    font-size: clamp(1rem, 1.8vw, 1.4rem);
    font-weight: 500;
    color: var(--text-secondary);
    max-width: 80%;
    margin-bottom: clamp(2rem, 5vh, 4rem);
}
.title-slide .meta {
    display: flex;
    gap: clamp(1.5rem, 3vw, 3rem);
    font-family: var(--font-mono);
    font-size: clamp(0.8rem, 1.1vw, 1rem);
    color: var(--text-muted);
    letter-spacing: 0.15em;
}
.title-slide .meta span::before {
    content: '▸ ';
    color: var(--accent-cyan);
}

.decor-orb {
    position: absolute;
    top: -10%; right: -5%;
    width: 60vh; height: 60vh;
    border-radius: 50%;
    background: radial-gradient(circle, var(--accent-cyan-glow) 0%, transparent 60%);
    filter: blur(80px);
    pointer-events: none;
    z-index: 1;
}
.decor-orb-2 {
    position: absolute;
    bottom: -15%; left: 30%;
    width: 50vh; height: 50vh;
    border-radius: 50%;
    background: radial-gradient(circle, var(--accent-magenta-glow) 0%, transparent 60%);
    filter: blur(100px);
    pointer-events: none;
    z-index: 1;
}

.slide-heading {
    font-family: var(--font-jp);
    font-size: var(--h2-size);
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: clamp(1rem, 2.5vh, 2rem);
    max-width: 90%;
}
.slide-heading .accent {
    color: var(--accent-cyan);
    text-shadow: 0 0 20px var(--accent-cyan-glow);
}

.lead {
    font-family: var(--font-jp);
    font-size: clamp(1.05rem, 1.6vw, 1.35rem);
    color: var(--text-secondary);
    max-width: 80%;
    margin-bottom: clamp(1rem, 2vh, 1.5rem);
    font-weight: 500;
}

.bullet-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 1.5vh, 1.25rem);
    max-width: 90%;
}
.bullet-list li {
    font-family: var(--font-jp);
    font-size: var(--body-size);
    color: var(--text-secondary);
    padding-left: clamp(1.5rem, 2.5vw, 2rem);
    position: relative;
    line-height: 1.75;
}
.bullet-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.85em;
    width: clamp(0.5rem, 1vw, 0.75rem);
    height: 2px;
    background: var(--accent-cyan);
    box-shadow: 0 0 8px var(--accent-cyan-glow);
}
.bullet-list li strong { color: var(--text-primary); font-weight: 700; }

.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(1.5rem, 3vw, 3rem);
    max-width: 100%;
}
.col-card {
    background: var(--card-bg);
    backdrop-filter: blur(16px);
    border: 1px solid var(--card-border);
    border-top-color: rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: clamp(1.25rem, 2.5vw, 2rem);
    position: relative;
    overflow: hidden;
}
.col-card .label {
    font-family: var(--font-mono);
    font-size: clamp(0.7rem, 0.9vw, 0.85rem);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--accent-cyan);
    margin-bottom: 0.75rem;
}
.col-card.magenta .label { color: var(--accent-magenta); }
.col-card h3 {
    font-family: var(--font-jp);
    font-size: clamp(1.1rem, 1.8vw, 1.5rem);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
}
.col-card p {
    font-family: var(--font-jp);
    font-size: clamp(0.95rem, 1.3vw, 1.1rem);
    color: var(--text-secondary);
    line-height: 1.75;
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(1rem, 2vw, 2rem);
    max-width: 100%;
    margin-bottom: clamp(1rem, 2vh, 1.5rem);
}
.kpi-card {
    background: var(--card-bg);
    backdrop-filter: blur(16px);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: clamp(1.25rem, 2.5vw, 2rem);
    position: relative;
    overflow: hidden;
}
.kpi-card::before {
    content: '';
    position: absolute;
    top: 0; left: 15%; right: 15%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
}
.kpi-card .kpi-value {
    font-family: var(--font-latin);
    font-size: clamp(1.75rem, 3.5vw, 3rem);
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-violet));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    margin-bottom: 0.5rem;
    font-variant-numeric: tabular-nums;
}
.kpi-card .kpi-label {
    font-family: var(--font-jp);
    font-size: clamp(0.85rem, 1.1vw, 1rem);
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    font-weight: 500;
}
.kpi-card .kpi-note {
    font-family: var(--font-jp);
    font-size: clamp(0.75rem, 0.9vw, 0.875rem);
    color: var(--text-muted);
    line-height: 1.5;
}

.layer-stack {
    display: flex;
    flex-direction: column;
    gap: clamp(0.35rem, 0.8vh, 0.6rem);
    max-width: 85%;
}
.layer {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 2vw, 2rem);
    padding: clamp(0.7rem, 1.2vh, 1rem) clamp(1.25rem, 2vw, 1.75rem);
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--card-border);
    border-radius: 10px;
}
.layer.highlight {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(124, 77, 255, 0.08) 100%);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 40px rgba(0, 212, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
.layer-num {
    font-family: var(--font-mono);
    font-size: clamp(0.75rem, 1vw, 0.9rem);
    color: var(--text-muted);
    min-width: 2.5em;
    letter-spacing: 0.1em;
}
.layer.highlight .layer-num { color: var(--accent-cyan); }
.layer-name {
    flex: 1;
    font-family: var(--font-jp);
    font-size: clamp(0.95rem, 1.3vw, 1.15rem);
    font-weight: 500;
    color: var(--text-secondary);
}
.layer.highlight .layer-name { color: var(--text-primary); font-weight: 700; }
.layer-tag {
    font-family: var(--font-mono);
    font-size: clamp(0.7rem, 0.85vw, 0.8rem);
    color: var(--text-muted);
    letter-spacing: 0.08em;
}
.layer.highlight .layer-tag { color: var(--accent-cyan); font-weight: 700; }

.flow {
    display: flex;
    align-items: center;
    gap: clamp(0.5rem, 1vw, 1rem);
    flex-wrap: wrap;
    margin-bottom: clamp(1rem, 2vh, 1.5rem);
    max-width: 100%;
}
.flow-step {
    flex: 1;
    min-width: 0;
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--card-border);
    border-top-color: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: clamp(0.85rem, 1.5vw, 1.25rem);
    text-align: center;
    position: relative;
}
.flow-step .step-num {
    font-family: var(--font-mono);
    font-size: clamp(0.65rem, 0.85vw, 0.75rem);
    color: var(--accent-cyan);
    letter-spacing: 0.2em;
    margin-bottom: 0.35rem;
}
.flow-step .step-label {
    font-family: var(--font-jp);
    font-size: clamp(0.9rem, 1.2vw, 1.05rem);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
}
.flow-arrow {
    color: var(--accent-cyan);
    font-size: clamp(1rem, 1.5vw, 1.25rem);
    flex-shrink: 0;
    text-shadow: 0 0 10px var(--accent-cyan-glow);
}

.phases {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(1rem, 2vw, 1.75rem);
    max-width: 100%;
}
.phase {
    background: var(--card-bg);
    backdrop-filter: blur(14px);
    border: 1px solid var(--card-border);
    border-top: 2px solid var(--accent-cyan);
    border-radius: 14px;
    padding: clamp(1.25rem, 2vw, 1.75rem);
    position: relative;
}
.phase.phase-violet { border-top-color: var(--accent-violet); }
.phase.phase-magenta { border-top-color: var(--accent-magenta); opacity: 0.85; }
.phase .phase-label {
    font-family: var(--font-mono);
    font-size: clamp(0.7rem, 0.9vw, 0.85rem);
    letter-spacing: 0.25em;
    color: var(--accent-cyan);
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}
.phase.phase-violet .phase-label { color: var(--accent-violet); }
.phase.phase-magenta .phase-label { color: var(--accent-magenta); }
.phase h3 {
    font-family: var(--font-jp);
    font-size: clamp(1.1rem, 1.6vw, 1.35rem);
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
    line-height: 1.3;
}
.phase ul { list-style: none; }
.phase ul li {
    font-family: var(--font-jp);
    font-size: clamp(0.85rem, 1.1vw, 1rem);
    color: var(--text-secondary);
    line-height: 1.7;
    padding-left: 1em;
    position: relative;
    margin-bottom: 0.4rem;
}
.phase ul li::before { content: '·'; position: absolute; left: 0; color: var(--accent-cyan); font-weight: 900; }

.closing-thesis {
    font-family: var(--font-jp);
    font-size: clamp(1.35rem, 2.8vw, 2.25rem);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.6;
    max-width: 90%;
    padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 3vw, 2.5rem) clamp(2rem, 4vw, 3.5rem);
    border-left: 3px solid var(--accent-cyan);
    position: relative;
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.06) 0%, transparent 60%);
    margin-bottom: clamp(1rem, 2vh, 1.5rem);
}
.closing-thesis::before {
    content: '"';
    position: absolute;
    top: -0.2em;
    left: clamp(0.5rem, 1vw, 1rem);
    font-family: var(--font-latin);
    font-size: clamp(3rem, 6vw, 5rem);
    color: var(--accent-cyan);
    opacity: 0.3;
    line-height: 1;
    font-weight: 700;
}
.closing-meta {
    font-family: var(--font-mono);
    font-size: clamp(0.75rem, 1vw, 0.9rem);
    color: var(--text-muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
}

.agenda-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(0.75rem, 1.5vw, 1.25rem);
    max-width: 95%;
}
.agenda-item {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 2vw, 1.5rem);
    padding: clamp(1rem, 1.75vh, 1.4rem) clamp(1rem, 2vw, 1.5rem);
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--card-border);
    border-radius: 12px;
}
.agenda-num {
    font-family: var(--font-latin);
    font-size: clamp(1.5rem, 2.5vw, 2rem);
    font-weight: 700;
    color: var(--accent-cyan);
    min-width: 1.5em;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 15px var(--accent-cyan-glow);
}
.agenda-text {
    font-family: var(--font-jp);
    font-size: clamp(1rem, 1.3vw, 1.2rem);
    font-weight: 500;
    color: var(--text-secondary);
}

.progress-bar {
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-violet), var(--accent-magenta));
    box-shadow: 0 0 12px var(--accent-cyan-glow);
    width: 0%;
    z-index: 100;
    transition: width 0.3s ease;
}
.nav-dots {
    position: fixed;
    right: clamp(1rem, 2vw, 2rem);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 100;
}
.nav-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    cursor: pointer;
    padding: 0;
}
.nav-dot.active {
    background: var(--accent-cyan);
    box-shadow: 0 0 12px var(--accent-cyan-glow);
    transform: scale(1.4);
}

/* Print / PDF-specific overrides (Playwright uses this in headless) */
@media print {
    html, body {
        scroll-snap-type: none !important;
        overflow: visible !important;
        height: auto !important;
    }
    .slide {
        width: 1920px !important;
        height: 1080px !important;
        min-height: 1080px !important;
        max-height: 1080px !important;
        page-break-after: always;
        break-after: page;
        scroll-snap-align: none !important;
    }
    .progress-bar, .nav-dots { display: none !important; }
    .reveal { opacity: 1 !important; transform: none !important; }
    .slide { visibility: visible !important; }
    .slide .decor-orb, .slide .decor-orb-2 { opacity: 0.6; }

    /* ----------------------------------------------------------------
       FIX: Chromium's page.pdf() renders "background-clip: text" +
       "-webkit-text-fill-color: transparent" as a visible BLUE/NAVY
       RECTANGLE around the text in the exported PDF (the background
       box leaks instead of being alpha-masked by glyph shapes).
       In print mode we fall back to solid colors that approximate the
       gradient's dominant hue. Screen view is unaffected.
       ---------------------------------------------------------------- */
    .title-slide .mega-title {
        background: none !important;
        -webkit-background-clip: initial !important;
        background-clip: initial !important;
        -webkit-text-fill-color: #ffffff !important;
        color: #ffffff !important;
    }
    .kpi-card .kpi-value {
        background: none !important;
        -webkit-background-clip: initial !important;
        background-clip: initial !important;
        -webkit-text-fill-color: var(--accent-cyan) !important;
        color: var(--accent-cyan) !important;
    }
}

.reveal { opacity: 1; transform: none; }  /* Always visible in static export */
`;

// =========================================
// Assemble the full HTML
// =========================================

const total = SLIDES.length;
const slidesHtml = SLIDES.map((s, i) => {
    const renderer = RENDERERS[s.type];
    if (!renderer) throw new Error(`Unknown slide type: ${s.type}`);
    return renderer(s, i, total);
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(META.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Noto+Sans+JP:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>

<div class="progress-bar" id="progressBar"></div>
<nav class="nav-dots" id="navDots"></nav>

${slidesHtml}

<script>
class SlidePresentation {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.navDotsContainer = document.getElementById('navDots');
        this.progressBar = document.getElementById('progressBar');
        this.setupNavDots();
        this.setupKeyboardNav();
        this.setupTouchNav();
        this.setupProgressBar();
        this.setupObserver();
    }
    setupNavDots() {
        this.slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'nav-dot';
            dot.addEventListener('click', () => this.goToSlide(i));
            this.navDotsContainer.appendChild(dot);
        });
        this.navDotsContainer.querySelector('.nav-dot')?.classList.add('active');
    }
    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const index = Array.from(this.slides).indexOf(entry.target);
                    this.currentSlide = index;
                    this.updateNavDots();
                }
            });
        }, { threshold: [0.5] });
        this.slides.forEach(s => observer.observe(s));
    }
    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)) { e.preventDefault(); this.nextSlide(); }
            if (['ArrowUp','ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); this.prevSlide(); }
            if (e.key === 'Home') { e.preventDefault(); this.goToSlide(0); }
            if (e.key === 'End') { e.preventDefault(); this.goToSlide(this.slides.length - 1); }
        });
    }
    setupTouchNav() {
        let startY = 0;
        document.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
        document.addEventListener('touchend', (e) => {
            const diff = startY - e.changedTouches[0].clientY;
            if (Math.abs(diff) > 50) diff > 0 ? this.nextSlide() : this.prevSlide();
        }, { passive: true });
    }
    setupProgressBar() {
        window.addEventListener('scroll', () => {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            this.progressBar.style.width = docH > 0 ? (window.scrollY / docH * 100) + '%' : '0%';
        }, { passive: true });
    }
    nextSlide() { if (this.currentSlide < this.slides.length - 1) this.goToSlide(this.currentSlide + 1); }
    prevSlide() { if (this.currentSlide > 0) this.goToSlide(this.currentSlide - 1); }
    goToSlide(i) {
        this.currentSlide = i;
        this.slides[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.updateNavDots();
    }
    updateNavDots() {
        this.navDotsContainer.querySelectorAll('.nav-dot').forEach((d, i) => {
            d.classList.toggle('active', i === this.currentSlide);
        });
    }
}
document.addEventListener('DOMContentLoaded', () => new SlidePresentation());
</script>
</body>
</html>
`;

const outPath = join(__dirname, 'index.html');
writeFileSync(outPath, html, 'utf-8');
console.log(`✓ HTML: ${outPath} (${(html.length / 1024).toFixed(1)} KB, ${total} slides)`);
