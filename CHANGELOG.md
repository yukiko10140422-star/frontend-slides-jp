# Changelog

## 2.0.1 — 2026-04-08

### Fixed

- **PDF gradient-text leak** — Chromium's `page.pdf()` cannot properly alpha-mask
  `background-clip: text` + `-webkit-text-fill-color: transparent`, causing the
  gradient's background rectangle to leak as a visible navy/blue outline around
  affected text in exported PDFs. Title slide mega titles and KPI card values
  were impacted across all JP-2 Dark Tech presentations.
  - Fixed by adding `@media print` overrides that fall back to solid colors
    (`#ffffff` for titles, `var(--accent-cyan)` for KPI values).
  - Screen/HTML view is unaffected — gradients remain intact.
  - File: `scripts/multi-format/render-html.mjs`

### Changed

- **`META.filename` now drives output filenames** — `build-pdf.mjs` and
  `build-pptx.mjs` previously hardcoded `A2A-deep-research.pdf/pptx` as output
  names. Now they read `META.filename` from `slides-data.mjs`, so each project
  gets properly-named output files without editing the build scripts.

---

## 2.0.0 — 2026-04-07

Japanese-enhanced fork of [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides).

### Added

- **`JAPANESE.md`** — Comprehensive Japanese typography guide covering font selection, line-break rules, letter-spacing, density limits, and common pitfalls
- **6 Japanese-optimized style presets** in `STYLE_PRESETS.md`:
    - JP-1 Dark Luxury (Shippori Mincho + Noto Sans JP)
    - JP-2 Dark Tech (Zen Kaku Gothic New + Space Grotesk)
    - JP-3 Light Clean (Noto Sans JP + Inter)
    - JP-4 Light Warm (Zen Maru Gothic + Noto Sans JP)
    - JP-5 Corporate Royal (Noto Sans JP + Inter)
    - JP-6 Dark Creative (Murecho + Syne)
- **CJK overrides in `viewport-base.css`**: `font-feature-settings: "palt"`, `word-break: auto-phrase`, `line-break: strict`, wider line-height for Japanese body, stricter font-size floors
- **Multi-format scaffold** at `scripts/multi-format/`:
    - `slides-data.mjs` as single source of truth
    - `render-html.mjs` — generates `index.html`
    - `build-pdf.mjs` — Playwright `page.pdf()` → vector text PDF (fully selectable, searchable)
    - `build-pptx.mjs` — PptxGenJS → native text + shapes PPTX (fully editable in PowerPoint)
    - `slides-data.example.mjs` — example with all 11 slide types
    - `package.json` with `npm run build` orchestration
    - `README.md` documenting the pipeline
- **Phase 0.5: Language Detection** — auto-detect Japanese from user messages or content
- **Phase 0.7: Output Format Selection** — MANDATORY first question asking HTML / PDF / PPTX / All
- **Phase 0.8: Multi-Format Scaffold Setup** — automatic scaffold deployment when multi-format output is requested
- **Mode D: Markdown/Doc Source** — generate slides directly from a Markdown file
- **Auto Mode** — "質問ゼロで" / "prompt-free" shorthand that skips all questions and infers every decision
- **Obsidian Vault deployment rule** — deliverables go to `03-Research/<topic>/` or `02-Projects/<name>/` with auto-generated index notes

### Changed

- SKILL.md frontmatter: `name: frontend-slides-jp`
- Slide content density limits tightened for Japanese (3-5 bullets, 20 chars per heading)
- Font loading stack: Latin font first, then Japanese fallback (for proper mixed-script rendering)
- Auto Mode default output: **All three formats** (HTML + PDF + PPTX)

### Credits

- **Original**: [@zarazhangrui](https://github.com/zarazhangrui) — v1.x design, 12 presets, PPT conversion, overall philosophy
- **Japanese enhancement + Multi-format pipeline**: [@yukiko10140422-star](https://github.com/yukiko10140422-star)

---

## 1.x — Upstream

See [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) for the original changelog.
