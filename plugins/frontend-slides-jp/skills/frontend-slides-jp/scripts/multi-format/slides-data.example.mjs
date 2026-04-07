// =========================================
// slides-data.mjs — Single source of truth
//
// Copy this file as slides-data.mjs and edit freely.
// render-html.mjs / build-pdf.mjs / build-pptx.mjs all read from this file.
//
// SLIDE TYPES (one of these in each slide's `type` field):
//   'title'           — hero title slide with kicker, title, subtitle, meta row
//   'agenda'          — 2xN grid of numbered items
//   'two-col'         — lead + 2 cards with label/title/body
//   'two-col-bullets' — 2 cards + bullet list below
//   'kpi'             — 3 KPI cards (value/label/note), optional lead + footnote
//   'layers'          — vertical stack of labeled rows with one highlighted
//   'flow'            — horizontal step flow with arrows + bullets below
//   'lead-bullets'    — lead paragraph + bullet list
//   'bullets'         — pure bullet list
//   'phases'          — 3 phase roadmap cards with items
//   'closing'         — final thesis slide with quote + meta footer
//
// COLOR ACCENTS: each card accepts accent: 'cyan' | 'magenta' | 'violet'
// HEADING ACCENTS: headingAccent: "string that appears in heading" highlights that word
// =========================================

export const THEME = {
    name: 'JP-2 Dark Tech',
    colors: {
        bgPrimary:   '#05080f',
        bgSecondary: '#0d1b2a',
        bgTertiary:  '#162138',
        textPrimary:   '#ffffff',
        textSecondary: '#c5d1e0',
        textMuted:     '#7a8999',
        accentCyan:    '#00d4ff',
        accentMagenta: '#ff2d9a',
        accentViolet:  '#7c4dff',
    },
    fonts: {
        // Web fonts for HTML (loaded from Google Fonts)
        jpWeb:    "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
        latinWeb: "'Space Grotesk', sans-serif",
        monoWeb:  "'JetBrains Mono', monospace",
        // PPTX fonts (must exist on viewer's machine — Yu Gothic ships with Windows)
        jpPptx:    'Yu Gothic',
        latinPptx: 'Arial',
        monoPptx:  'Consolas',
    },
};

export const META = {
    title: 'Your Presentation Title',
    subtitle: 'Optional subtitle',
    date: '2026.04',
    // Output filenames (without extension)
    filename: 'presentation',
};

export const SLIDES = [
    // -------- Example: Title --------
    {
        type: 'title',
        kicker: 'RESEARCH REPORT · 2026',
        title: 'Your Main Title\n第2行も可',   // \n splits into two lines
        subtitle: 'サブタイトルをここに',
        meta: ['CONTEXT', 'DOMAIN', '2026.04'],
    },

    // -------- Example: Agenda --------
    {
        type: 'agenda',
        kicker: 'AGENDA',
        heading: '本日の構成',
        items: [
            '項目1',
            '項目2',
            '項目3',
            '項目4',
            '項目5',
            '項目6',
        ],
    },

    // -------- Example: Two-column comparison --------
    {
        type: 'two-col',
        kicker: 'SECTION 01',
        heading: '比較タイトル',
        headingAccent: '比較',  // highlights this word in cyan
        lead: 'オプショナルなリード文。概要を 1–2 行で。',
        columns: [
            {
                label: 'LEFT · LABEL',
                title: '左カードの見出し',
                body: '左カードの本文。説明を 2–3 行程度で。',
                accent: 'cyan',
            },
            {
                label: 'RIGHT · LABEL',
                title: '右カードの見出し',
                body: '右カードの本文。説明を 2–3 行程度で。',
                accent: 'magenta',
            },
        ],
    },

    // -------- Example: KPI cards --------
    {
        type: 'kpi',
        kicker: 'SECTION 02',
        heading: '主要指標',
        headingAccent: '指標',
        kpis: [
            { value: '50+', label: 'ラベル1', note: '短い注釈文をここに' },
            { value: '17×', label: 'ラベル2', note: '短い注釈文をここに' },
            { value: '#1', label: 'ラベル3', note: '短い注釈文をここに' },
        ],
        footnote: '任意の締めメッセージ。',
    },

    // -------- Example: Layer stack --------
    {
        type: 'layers',
        kicker: 'SECTION 03',
        heading: '技術スタック',
        layers: [
            { num: 'L5', name: '最上位層', tag: 'TOP', highlight: false },
            { num: 'L4', name: 'ハイライト層', tag: '◂ HERE', highlight: true },
            { num: 'L3', name: '中間層', tag: 'MID', highlight: false },
            { num: 'L2', name: 'データ層', tag: 'DATA', highlight: false },
            { num: 'L1', name: '基盤層', tag: 'BASE', highlight: false },
        ],
    },

    // -------- Example: Flow + bullets --------
    {
        type: 'flow',
        kicker: 'USE CASE 01',
        heading: 'プロセスフロー',
        steps: [
            { num: 'STEP 1', label: 'ステップ1\n詳細' },
            { num: 'STEP 2', label: 'ステップ2\n詳細' },
            { num: 'STEP 3', label: 'ステップ3\n詳細' },
            { num: 'STEP 4', label: 'ステップ4\n詳細' },
        ],
        bullets: [
            { strong: 'キーポイント：', text: '本文の説明' },
            { strong: '期待効果：', text: '本文の説明' },
        ],
    },

    // -------- Example: Lead + bullets --------
    {
        type: 'lead-bullets',
        kicker: 'SECTION 04',
        heading: 'タイトル',
        lead: 'リード文。主張を 1–2 行で。',
        bullets: [
            { strong: '強調1：', text: '説明' },
            { strong: '強調2：', text: '説明' },
            { strong: '強調3：', text: '説明' },
        ],
    },

    // -------- Example: Pure bullets --------
    {
        type: 'bullets',
        kicker: 'SECTION 05',
        heading: 'リスクと制約',
        headingAccent: '制約',
        bullets: [
            { strong: 'リスク1：', text: '説明' },
            { strong: 'リスク2：', text: '説明' },
            { strong: 'リスク3：', text: '説明' },
        ],
    },

    // -------- Example: Phases roadmap --------
    {
        type: 'phases',
        kicker: 'SECTION 06',
        heading: 'ロードマップ',
        headingAccent: 'ロードマップ',
        phases: [
            {
                label: 'PHASE 1 · NOW',
                title: '基盤整備',
                items: ['項目1', '項目2', '項目3'],
                accent: 'cyan',
            },
            {
                label: 'PHASE 2 · NEXT',
                title: '拡張',
                items: ['項目1', '項目2', '項目3'],
                accent: 'violet',
            },
            {
                label: 'PHASE 3 · LATER',
                title: '本格運用',
                items: ['項目1', '項目2'],
                accent: 'magenta',
            },
        ],
    },

    // -------- Example: Closing thesis --------
    {
        type: 'closing',
        kicker: 'FINAL RECOMMENDATION',
        heading: '最終提言',
        headingAccent: '提言',
        thesis: 'ここに締めの一文を。プレゼン全体の主張を凝縮した文を入れる。',
        meta: 'CALL · TO · ACTION',
    },
];
