// =========================================
// build-pptx.mjs — Generate editable PPTX
// Every text element is a native PptxGenJS text box (editable in PowerPoint).
// Every shape is a native rectangle/ellipse (not a rasterized image).
// Run: node build-pptx.mjs
// =========================================

import PptxGenJS from 'pptxgenjs';
import { SLIDES, THEME, META } from './slides-data.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, 'A2A-deep-research.pptx');

// Strip # from hex colors — PptxGenJS wants them without the prefix
const h = (hex) => hex.replace('#', '').toUpperCase();
const C = {
    bgPrimary:     h(THEME.colors.bgPrimary),
    bgSecondary:   h(THEME.colors.bgSecondary),
    bgTertiary:    h(THEME.colors.bgTertiary),
    textPrimary:   h(THEME.colors.textPrimary),
    textSecondary: h(THEME.colors.textSecondary),
    textMuted:     h(THEME.colors.textMuted),
    accentCyan:    h(THEME.colors.accentCyan),
    accentMagenta: h(THEME.colors.accentMagenta),
    accentViolet:  h(THEME.colors.accentViolet),
};

const FONT = THEME.fonts.jpPptx;         // Yu Gothic
const FONT_LATIN = THEME.fonts.latinPptx; // Arial
const FONT_MONO = THEME.fonts.monoPptx;   // Consolas

// =========================================
// Layout constants (16:9 WIDE, inches)
// Slide dimensions: 13.333 × 7.5 inches
// =========================================
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const PAD_L = 0.7;
const PAD_R = 0.7;
const PAD_T = 0.55;
const PAD_B = 0.55;

const CONTENT_W = SLIDE_W - PAD_L - PAD_R; // 11.933

// =========================================
// Initialize presentation
// =========================================
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 inches (16:9)
pptx.title = META.title;
pptx.subject = META.subtitle;
pptx.author = 'Auto-generated';
pptx.company = 'Research';

// Define a master slide with background + brand bar + grid pattern
pptx.defineSlideMaster({
    title: 'DARK_TECH',
    background: { color: C.bgPrimary },
    objects: [
        // Subtle blue gradient using a large overlapping rectangle with transparency
        // (PptxGenJS doesn't do radial gradients, but a dark rectangle fill + accent bars gets 80% of the way)
        {
            rect: {
                x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
                fill: { color: C.bgSecondary, transparency: 50 },
                line: { type: 'none' },
            },
        },
        // Brand bar: 3 rectangles at the bottom
        {
            rect: {
                x: 0, y: SLIDE_H - 0.05, w: SLIDE_W / 3, h: 0.05,
                fill: { color: C.accentCyan },
                line: { type: 'none' },
            },
        },
        {
            rect: {
                x: SLIDE_W / 3, y: SLIDE_H - 0.05, w: SLIDE_W / 3, h: 0.05,
                fill: { color: C.accentViolet },
                line: { type: 'none' },
            },
        },
        {
            rect: {
                x: (SLIDE_W / 3) * 2, y: SLIDE_H - 0.05, w: SLIDE_W / 3, h: 0.05,
                fill: { color: C.accentMagenta },
                line: { type: 'none' },
            },
        },
    ],
});

// =========================================
// Helper: add slide number (top right)
// =========================================
function addSlideNumber(slide, i, total) {
    slide.addText(
        `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
        {
            x: SLIDE_W - PAD_R - 1.5,
            y: 0.3,
            w: 1.5,
            h: 0.3,
            fontSize: 10,
            fontFace: FONT_MONO,
            color: C.textMuted,
            align: 'right',
            charSpacing: 2,
        }
    );
}

// =========================================
// Helper: add kicker (eyebrow text)
// =========================================
function addKicker(slide, text, y = PAD_T + 0.15) {
    slide.addText(text, {
        x: PAD_L,
        y,
        w: 8,
        h: 0.35,
        fontSize: 11,
        fontFace: FONT_LATIN,
        color: C.accentCyan,
        bold: true,
        charSpacing: 4,
    });
}

// =========================================
// Helper: add heading with optional accent word
// =========================================
function addHeading(slide, text, accent, y = PAD_T + 0.7, fontSize = 36) {
    let textRuns;
    if (accent && text.includes(accent)) {
        const parts = text.split(accent);
        textRuns = [];
        parts.forEach((part, idx) => {
            if (part) textRuns.push({ text: part, options: { color: C.textPrimary } });
            if (idx < parts.length - 1) {
                textRuns.push({ text: accent, options: { color: C.accentCyan } });
            }
        });
    } else {
        textRuns = [{ text, options: { color: C.textPrimary } }];
    }
    slide.addText(textRuns, {
        x: PAD_L,
        y,
        w: CONTENT_W,
        h: 1.0,
        fontSize,
        fontFace: FONT,
        bold: true,
        valign: 'top',
    });
}

// =========================================
// Helper: add lead paragraph
// =========================================
function addLead(slide, text, y, h = 0.8) {
    slide.addText(text, {
        x: PAD_L,
        y,
        w: CONTENT_W - 1,
        h,
        fontSize: 16,
        fontFace: FONT,
        color: C.textSecondary,
        valign: 'top',
        paraSpaceAfter: 6,
    });
}

// =========================================
// SLIDE RENDERERS
// =========================================

function renderTitle(s, slide, i, total) {
    // Large gradient orbs (cheap approximation using blurred-ish rectangles)
    slide.addShape(pptx.shapes.OVAL, {
        x: 8.5, y: -2, w: 7, h: 7,
        fill: { color: C.accentCyan, transparency: 88 },
        line: { type: 'none' },
    });
    slide.addShape(pptx.shapes.OVAL, {
        x: 3, y: 4.5, w: 6, h: 6,
        fill: { color: C.accentMagenta, transparency: 92 },
        line: { type: 'none' },
    });

    // Kicker
    slide.addText(s.kicker, {
        x: PAD_L, y: 2.3, w: 8, h: 0.35,
        fontSize: 11, fontFace: FONT_LATIN,
        color: C.accentCyan, bold: true, charSpacing: 4,
    });

    // Mega title — split by \n into two lines
    slide.addText(s.title.replace(/\n/g, '\n'), {
        x: PAD_L, y: 2.8, w: CONTENT_W, h: 2.0,
        fontSize: 54, fontFace: FONT,
        color: C.textPrimary, bold: true,
        valign: 'top',
        paraSpaceAfter: 0,
    });

    // Subtitle
    slide.addText(s.subtitle.replace(/\n/g, '\n'), {
        x: PAD_L, y: 5.0, w: CONTENT_W - 1, h: 1.0,
        fontSize: 16, fontFace: FONT,
        color: C.textSecondary,
        valign: 'top',
    });

    // Meta row
    const metaText = s.meta.map((m) => `▸ ${m}`).join('    ');
    slide.addText(metaText, {
        x: PAD_L, y: 6.4, w: CONTENT_W, h: 0.35,
        fontSize: 11, fontFace: FONT_MONO,
        color: C.textMuted, charSpacing: 3,
    });

    addSlideNumber(slide, i, total);
}

function renderAgenda(s, slide, i, total) {
    addKicker(slide, s.kicker);
    addHeading(slide, s.heading);

    // 2x3 grid of items
    const gridY = 2.3;
    const cellW = 5.8;
    const cellH = 0.85;
    const gapX = 0.35;
    const gapY = 0.25;
    const startX = PAD_L;

    s.items.forEach((item, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = startX + col * (cellW + gapX);
        const y = gridY + row * (cellH + gapY);

        // Background rectangle
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
            x, y, w: cellW, h: cellH,
            fill: { color: C.bgTertiary, transparency: 50 },
            line: { color: C.textMuted, width: 0.5, transparency: 60 },
            rectRadius: 0.08,
        });

        // Number
        slide.addText(String(idx + 1).padStart(2, '0'), {
            x: x + 0.25, y: y + 0.15, w: 0.9, h: cellH - 0.3,
            fontSize: 24, fontFace: FONT_LATIN,
            color: C.accentCyan, bold: true,
            valign: 'middle',
        });

        // Label
        slide.addText(item, {
            x: x + 1.1, y: y + 0.15, w: cellW - 1.3, h: cellH - 0.3,
            fontSize: 16, fontFace: FONT,
            color: C.textPrimary, bold: false,
            valign: 'middle',
        });
    });

    addSlideNumber(slide, i, total);
}

function renderTwoCol(s, slide, i, total) {
    addKicker(slide, s.kicker);
    addHeading(slide, s.heading, s.headingAccent);

    let contentY = 2.3;
    if (s.lead) {
        addLead(slide, s.lead, contentY, 0.9);
        contentY += 1.1;
    }

    // Two cards side by side
    const cardW = (CONTENT_W - 0.5) / 2;
    const cardH = SLIDE_H - contentY - PAD_B - 0.3;

    s.columns.forEach((col, idx) => {
        const x = PAD_L + idx * (cardW + 0.5);
        const accentColor = col.accent === 'magenta' ? C.accentMagenta : C.accentCyan;

        // Card background
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
            x, y: contentY, w: cardW, h: cardH,
            fill: { color: C.bgTertiary, transparency: 40 },
            line: { color: C.textMuted, width: 0.5, transparency: 60 },
            rectRadius: 0.12,
        });

        // Label (colored mono)
        slide.addText(col.label, {
            x: x + 0.35, y: contentY + 0.3, w: cardW - 0.7, h: 0.35,
            fontSize: 11, fontFace: FONT_MONO,
            color: accentColor, bold: true, charSpacing: 4,
        });

        // Title
        slide.addText(col.title, {
            x: x + 0.35, y: contentY + 0.75, w: cardW - 0.7, h: 0.7,
            fontSize: 22, fontFace: FONT,
            color: C.textPrimary, bold: true,
        });

        // Body
        slide.addText(col.body, {
            x: x + 0.35, y: contentY + 1.55, w: cardW - 0.7, h: cardH - 1.85,
            fontSize: 14, fontFace: FONT,
            color: C.textSecondary, valign: 'top',
            paraSpaceAfter: 6,
        });
    });

    addSlideNumber(slide, i, total);
}

function renderKpi(s, slide, i, total) {
    addKicker(slide, s.kicker);
    addHeading(slide, s.heading, s.headingAccent);

    let contentY = 2.3;
    if (s.lead) {
        addLead(slide, s.lead, contentY, 0.9);
        contentY += 1.1;
    }

    // 3 KPI cards in a row
    const gap = 0.35;
    const cardW = (CONTENT_W - gap * 2) / 3;
    const cardH = 3.2;

    s.kpis.forEach((k, idx) => {
        const x = PAD_L + idx * (cardW + gap);

        // Card
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
            x, y: contentY, w: cardW, h: cardH,
            fill: { color: C.bgTertiary, transparency: 40 },
            line: { color: C.textMuted, width: 0.5, transparency: 60 },
            rectRadius: 0.12,
        });

        // Value (large number)
        slide.addText(k.value, {
            x: x + 0.35, y: contentY + 0.4, w: cardW - 0.7, h: 1.2,
            fontSize: 56, fontFace: FONT_LATIN,
            color: C.accentCyan, bold: true,
            valign: 'top',
        });

        // Label
        slide.addText(k.label, {
            x: x + 0.35, y: contentY + 1.7, w: cardW - 0.7, h: 0.45,
            fontSize: 16, fontFace: FONT,
            color: C.textPrimary, bold: true,
        });

        // Note
        slide.addText(k.note, {
            x: x + 0.35, y: contentY + 2.2, w: cardW - 0.7, h: cardH - 2.4,
            fontSize: 12, fontFace: FONT,
            color: C.textSecondary, valign: 'top',
            paraSpaceAfter: 4,
        });
    });

    // Optional footnote below cards
    if (s.footnote) {
        const footY = contentY + cardH + 0.2;
        slide.addText(s.footnote, {
            x: PAD_L, y: footY, w: CONTENT_W - 1, h: 0.6,
            fontSize: 15, fontFace: FONT,
            color: C.textSecondary, italic: false, valign: 'top',
        });
    }

    addSlideNumber(slide, i, total);
}

function renderLayers(s, slide, i, total) {
    addKicker(slide, s.kicker);
    addHeading(slide, s.heading, s.headingAccent);

    const startY = 2.3;
    const rowH = 0.55;
    const rowGap = 0.1;
    const rowW = CONTENT_W - 1.5;

    s.layers.forEach((layer, idx) => {
        const y = startY + idx * (rowH + rowGap);
        const isHighlight = layer.highlight;
        const fillColor = isHighlight ? C.accentCyan : C.bgTertiary;
        const fillTrans = isHighlight ? 75 : 50;
        const textColor = isHighlight ? C.textPrimary : C.textSecondary;
        const tagColor = isHighlight ? C.accentCyan : C.textMuted;

        // Row background
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
            x: PAD_L, y, w: rowW, h: rowH,
            fill: { color: fillColor, transparency: fillTrans },
            line: isHighlight
                ? { color: C.accentCyan, width: 1 }
                : { color: C.textMuted, width: 0.5, transparency: 60 },
            rectRadius: 0.05,
        });

        // Layer num (left)
        slide.addText(layer.num, {
            x: PAD_L + 0.3, y, w: 0.9, h: rowH,
            fontSize: 12, fontFace: FONT_MONO,
            color: isHighlight ? C.accentCyan : C.textMuted,
            bold: isHighlight,
            valign: 'middle', charSpacing: 2,
        });

        // Layer name (center)
        slide.addText(layer.name, {
            x: PAD_L + 1.3, y, w: rowW - 3.3, h: rowH,
            fontSize: 14, fontFace: FONT,
            color: textColor, bold: isHighlight,
            valign: 'middle',
        });

        // Tag (right)
        slide.addText(layer.tag, {
            x: PAD_L + rowW - 2, y, w: 1.9, h: rowH,
            fontSize: 11, fontFace: FONT_MONO,
            color: tagColor, bold: isHighlight,
            valign: 'middle', align: 'right', charSpacing: 2,
        });
    });

    addSlideNumber(slide, i, total);
}

function renderFlow(s, slide, i, total) {
    addKicker(slide, s.kicker);
    addHeading(slide, s.heading);

    // Flow steps: horizontal row of 4 cards connected by arrows
    const flowY = 2.3;
    const arrowW = 0.35;
    const stepCount = s.steps.length;
    const totalArrowW = arrowW * (stepCount - 1);
    const stepW = (CONTENT_W - totalArrowW - 0.4) / stepCount;
    const stepH = 1.4;

    s.steps.forEach((step, idx) => {
        const x = PAD_L + idx * (stepW + arrowW);

        // Step card
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
            x, y: flowY, w: stepW, h: stepH,
            fill: { color: C.bgTertiary, transparency: 40 },
            line: { color: C.accentCyan, width: 0.75, transparency: 50 },
            rectRadius: 0.1,
        });

        // Step num
        slide.addText(step.num, {
            x: x + 0.15, y: flowY + 0.2, w: stepW - 0.3, h: 0.3,
            fontSize: 10, fontFace: FONT_MONO,
            color: C.accentCyan, bold: true, align: 'center', charSpacing: 3,
        });

        // Step label
        slide.addText(step.label, {
            x: x + 0.15, y: flowY + 0.55, w: stepW - 0.3, h: 0.75,
            fontSize: 14, fontFace: FONT,
            color: C.textPrimary, bold: true, align: 'center', valign: 'middle',
        });

        // Arrow
        if (idx < stepCount - 1) {
            slide.addText('▶', {
                x: x + stepW, y: flowY, w: arrowW, h: stepH,
                fontSize: 16, fontFace: FONT_LATIN,
                color: C.accentCyan, bold: true,
                align: 'center', valign: 'middle',
            });
        }
    });

    // Bullets below flow
    const bulletsY = flowY + stepH + 0.4;
    const bulletTexts = s.bullets.map((b) => ({
        text: b.strong + b.text,
        options: { bullet: { code: '25A0' }, color: C.textSecondary },
    }));
    // Use addText with structured runs
    s.bullets.forEach((b, idx) => {
        const y = bulletsY + idx * 0.55;
        slide.addText([
            { text: '■ ', options: { color: C.accentCyan, bold: true } },
            { text: b.strong, options: { color: C.textPrimary, bold: true } },
            { text: b.text, options: { color: C.textSecondary } },
        ], {
            x: PAD_L, y, w: CONTENT_W - 0.5, h: 0.5,
            fontSize: 14, fontFace: FONT,
            valign: 'top',
        });
    });

    addSlideNumber(slide, i, total);
}

function renderTwoColBullets(s, slide, i, total) {
    addKicker(slide, s.kicker);
    addHeading(slide, s.heading);

    const contentY = 2.3;
    const cardW = (CONTENT_W - 0.5) / 2;
    const cardH = 2.6;

    s.columns.forEach((col, idx) => {
        const x = PAD_L + idx * (cardW + 0.5);
        const accentColor = col.accent === 'magenta' ? C.accentMagenta : C.accentCyan;

        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
            x, y: contentY, w: cardW, h: cardH,
            fill: { color: C.bgTertiary, transparency: 40 },
            line: { color: C.textMuted, width: 0.5, transparency: 60 },
            rectRadius: 0.12,
        });

        slide.addText(col.label, {
            x: x + 0.35, y: contentY + 0.25, w: cardW - 0.7, h: 0.3,
            fontSize: 10, fontFace: FONT_MONO,
            color: accentColor, bold: true, charSpacing: 4,
        });

        slide.addText(col.title, {
            x: x + 0.35, y: contentY + 0.6, w: cardW - 0.7, h: 0.55,
            fontSize: 20, fontFace: FONT,
            color: C.textPrimary, bold: true,
        });

        slide.addText(col.body, {
            x: x + 0.35, y: contentY + 1.25, w: cardW - 0.7, h: cardH - 1.5,
            fontSize: 13, fontFace: FONT,
            color: C.textSecondary, valign: 'top', paraSpaceAfter: 4,
        });
    });

    // Bullets below
    const bulletsY = contentY + cardH + 0.3;
    s.bullets.forEach((b, idx) => {
        const y = bulletsY + idx * 0.5;
        slide.addText([
            { text: '■ ', options: { color: C.accentCyan, bold: true } },
            { text: b.strong, options: { color: C.textPrimary, bold: true } },
            { text: b.text, options: { color: C.textSecondary } },
        ], {
            x: PAD_L, y, w: CONTENT_W - 0.5, h: 0.45,
            fontSize: 14, fontFace: FONT,
            valign: 'top',
        });
    });

    addSlideNumber(slide, i, total);
}

function renderLeadBullets(s, slide, i, total) {
    addKicker(slide, s.kicker);
    addHeading(slide, s.heading);

    if (s.lead) {
        slide.addText(s.lead, {
            x: PAD_L, y: 2.3, w: CONTENT_W - 1, h: 0.9,
            fontSize: 16, fontFace: FONT,
            color: C.textSecondary, valign: 'top',
        });
    }

    const startY = 3.4;
    s.bullets.forEach((b, idx) => {
        const y = startY + idx * 0.7;
        slide.addText([
            { text: '■ ', options: { color: C.accentCyan, bold: true } },
            { text: b.strong, options: { color: C.textPrimary, bold: true } },
            { text: b.text, options: { color: C.textSecondary } },
        ], {
            x: PAD_L, y, w: CONTENT_W - 0.5, h: 0.65,
            fontSize: 15, fontFace: FONT,
            valign: 'top',
        });
    });

    addSlideNumber(slide, i, total);
}

function renderBullets(s, slide, i, total) {
    addKicker(slide, s.kicker);
    addHeading(slide, s.heading, s.headingAccent);

    const startY = 2.5;
    const rowH = 0.7;
    s.bullets.forEach((b, idx) => {
        const y = startY + idx * rowH;
        slide.addText([
            { text: '■ ', options: { color: C.accentCyan, bold: true } },
            { text: b.strong, options: { color: C.textPrimary, bold: true } },
            { text: b.text, options: { color: C.textSecondary } },
        ], {
            x: PAD_L, y, w: CONTENT_W - 0.5, h: rowH - 0.05,
            fontSize: 15, fontFace: FONT,
            valign: 'top',
        });
    });

    addSlideNumber(slide, i, total);
}

function renderPhases(s, slide, i, total) {
    addKicker(slide, s.kicker);
    addHeading(slide, s.heading, s.headingAccent);

    const phaseY = 2.5;
    const gap = 0.3;
    const phaseW = (CONTENT_W - gap * 2) / 3;
    const phaseH = 4.1;

    s.phases.forEach((p, idx) => {
        const x = PAD_L + idx * (phaseW + gap);
        const accentColor =
            p.accent === 'magenta' ? C.accentMagenta :
            p.accent === 'violet' ? C.accentViolet : C.accentCyan;

        // Card
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
            x, y: phaseY, w: phaseW, h: phaseH,
            fill: { color: C.bgTertiary, transparency: 40 },
            line: { color: C.textMuted, width: 0.5, transparency: 60 },
            rectRadius: 0.1,
        });

        // Top accent bar
        slide.addShape(pptx.shapes.RECTANGLE, {
            x, y: phaseY, w: phaseW, h: 0.06,
            fill: { color: accentColor },
            line: { type: 'none' },
        });

        // Label
        slide.addText(p.label, {
            x: x + 0.3, y: phaseY + 0.25, w: phaseW - 0.6, h: 0.35,
            fontSize: 10, fontFace: FONT_MONO,
            color: accentColor, bold: true, charSpacing: 4,
        });

        // Title
        slide.addText(p.title, {
            x: x + 0.3, y: phaseY + 0.65, w: phaseW - 0.6, h: 0.6,
            fontSize: 20, fontFace: FONT,
            color: C.textPrimary, bold: true,
        });

        // Items list
        const itemsY = phaseY + 1.35;
        p.items.forEach((item, itemIdx) => {
            slide.addText([
                { text: '· ', options: { color: accentColor, bold: true } },
                { text: item, options: { color: C.textSecondary } },
            ], {
                x: x + 0.3, y: itemsY + itemIdx * 0.55, w: phaseW - 0.6, h: 0.5,
                fontSize: 12, fontFace: FONT,
                valign: 'top',
            });
        });
    });

    addSlideNumber(slide, i, total);
}

function renderClosing(s, slide, i, total) {
    // Decor orb
    slide.addShape(pptx.shapes.OVAL, {
        x: 8.5, y: -2, w: 7, h: 7,
        fill: { color: C.accentCyan, transparency: 90 },
        line: { type: 'none' },
    });

    addKicker(slide, s.kicker);
    addHeading(slide, s.heading, s.headingAccent);

    // Thesis card with left border
    const thesisY = 2.6;
    const thesisH = 3.0;

    // Left accent border
    slide.addShape(pptx.shapes.RECTANGLE, {
        x: PAD_L, y: thesisY, w: 0.06, h: thesisH,
        fill: { color: C.accentCyan },
        line: { type: 'none' },
    });

    // Thesis background (subtle)
    slide.addShape(pptx.shapes.RECTANGLE, {
        x: PAD_L + 0.06, y: thesisY, w: CONTENT_W - 0.06, h: thesisH,
        fill: { color: C.accentCyan, transparency: 94 },
        line: { type: 'none' },
    });

    // Large quote mark
    slide.addText('"', {
        x: PAD_L + 0.3, y: thesisY - 0.3, w: 1.5, h: 1.5,
        fontSize: 72, fontFace: FONT_LATIN,
        color: C.accentCyan, bold: true,
        transparency: 70,
    });

    // Thesis text
    slide.addText(s.thesis, {
        x: PAD_L + 1.2, y: thesisY + 0.5, w: CONTENT_W - 1.6, h: thesisH - 1,
        fontSize: 24, fontFace: FONT,
        color: C.textPrimary, bold: true,
        valign: 'middle',
    });

    // Meta footer
    slide.addText(s.meta, {
        x: PAD_L, y: thesisY + thesisH + 0.3, w: CONTENT_W, h: 0.35,
        fontSize: 11, fontFace: FONT_MONO,
        color: C.textMuted, charSpacing: 4,
    });

    addSlideNumber(slide, i, total);
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
// Build all slides
// =========================================
console.log(`→ Building ${SLIDES.length} slides...`);
const total = SLIDES.length;
SLIDES.forEach((s, i) => {
    const slide = pptx.addSlide({ masterName: 'DARK_TECH' });
    const renderer = RENDERERS[s.type];
    if (!renderer) throw new Error(`Unknown slide type: ${s.type}`);
    renderer(s, slide, i, total);
    console.log(`  ✓ ${String(i + 1).padStart(2, '0')}: ${s.type} — ${s.heading || s.title?.replace(/\n/g, ' ') || '(title)'}`);
});

await pptx.writeFile({ fileName: outPath });
console.log(`✓ PPTX: ${outPath}`);
console.log('  → All text is native & editable in PowerPoint.');
console.log('  → All shapes are native (not images).');
