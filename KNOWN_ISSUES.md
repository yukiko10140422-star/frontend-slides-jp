# Known Issues & Workarounds

このドキュメントは frontend-slides-jp で遭遇する既知の問題と回避策をまとめています。

---

## 🐛 Fixed in v2.0.1

### PDF gradient-text leak (Chromium `page.pdf()` のバグ)

**症状**: エクスポートした PDF で、グラデーション指定のテキスト（タイトルや KPI 数値など）の周りに **青/紺色の矩形** が表示される。画面表示 (HTML) では正常。

**影響範囲**: `JP-2 Dark Tech` プリセット（およびグラデーションテキストを使う他プリセット）の:
- タイトルスライドのメガタイトル
- KPI カードの数値

**根本原因**: Chromium の `page.pdf()` は `background-clip: text` + `-webkit-text-fill-color: transparent` の組合せを正しくアルファマスクできず、背景矩形が輪郭として描画されます。これは Chromium の [長年の既知バグ](https://bugs.chromium.org/p/chromium/issues/detail?id=1172291) です。

**修正 (v2.0.1)**: `scripts/multi-format/render-html.mjs` の `@media print` ブロックで、該当要素を単色にフォールバックさせます。

```css
@media print {
    .title-slide .mega-title {
        background: none !important;
        -webkit-background-clip: initial !important;
        -webkit-text-fill-color: #ffffff !important;
        color: #ffffff !important;
    }
    .kpi-card .kpi-value {
        background: none !important;
        -webkit-background-clip: initial !important;
        -webkit-text-fill-color: var(--accent-cyan) !important;
        color: var(--accent-cyan) !important;
    }
}
```

**新しいグラデーション要素を追加するときの注意**: 必ず `@media print` に対応する solid-color フォールバックを書いてください。テスト手順:

```bash
npm run build:pdf
# → 生成された PDF を開いて青い矩形がないか目視確認
```

---

## ⚠️ Active Issues (未修正)

### 1. PPTX のグラデーションテキストは単色に置換される

**症状**: PowerPoint で編集する PPTX 出力では、HTML 版にあったグラデーションタイトルが単色（白 or シアン）になる。

**原因**: PptxGenJS（および PowerPoint 自体）は vector text に対するグラデーション fill をネイティブサポートしていません。Office 2016+ ではグラデーション効果が限定的に使えますが、`addText` API からは制御できません。

**回避策**:
- HTML / PDF でグラデーション表現を保ちたい場合はそちらを使う
- PPTX 側で見栄えが欲しい場合は、PowerPoint で手動でグラデーション効果を適用する
- または、グラデーションを画像化して `addImage` で配置する（編集性は失う）

**将来対応案**: PptxGenJS の今後の更新でネイティブグラデーションテキストがサポートされれば対応予定。

---

### 2. `backdrop-filter: blur()` は PPTX に移行できない

**症状**: HTML 版の Glassmorphism カード（`backdrop-filter: blur(16px)`）は PPTX では通常の半透明矩形になる。

**原因**: PPTX の shape fill は単色 + 透明度のみサポート。ブラー効果は PowerPoint に存在しない。

**回避策**: PPTX では透明度 40-50% の矩形で近似。十分に "モダン" な見た目になります。

---

### 3. Light テーマプリセット (JP-3/4/5) は scaffold で未検証

**症状**: `scripts/multi-format/` の render-html.mjs および build-pptx.mjs は現在 Dark テーマ（特に JP-2 Dark Tech）を前提にハードコードされた背景グラデーション・グリッドパターンを持っています。Light テーマ (JP-3 Light Clean / JP-4 Light Warm / JP-5 Corporate Royal) で生成すると、背景が黒に見えたり、カード色が合わなかったりします。

**回避策**:
1. Light テーマを使うには `render-html.mjs` の CSS を手動で light 向けに書き換える
2. Dark テーマ (JP-1 / JP-2 / JP-6) を使う
3. または、HTML を直接書いて Playwright で PDF 化する（scaffold を使わない）

**将来対応案**: `THEME.isDark: boolean` フラグを追加し、renderers が light/dark で分岐するようにする。v3.0 ロードマップ参照。

---

### 4. 日本語フォント `Yu Gothic` は PowerPoint for Mac で置換される可能性

**症状**: macOS で PPTX を開くと、`Yu Gothic` がインストールされていないため別フォントに置換される。

**回避策**:
- macOS ユーザーは `Hiragino Sans` または `Noto Sans JP` に `THEME.fonts.jpPptx` を変更して再ビルド
- または、フォントを埋め込む形式で出力（PptxGenJS では未対応）

---

### 5. Playwright の初回 Chromium ダウンロードが遅い

**症状**: `npm install` 時に Playwright が Chromium バイナリ (~170 MB) をダウンロードする。ネットワーク環境によっては 1-2 分かかる。

**回避策**:
- 既に別プロジェクトで Playwright をインストール済みの場合、`node_modules` を symlink またはコピーして使い回す
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install` で初回ダウンロードをスキップし、`npx playwright install chromium` を明示的に実行

---

### 6. `word-break: auto-phrase` は Safari 17+ / Chrome 119+ 以外でフォールバック

**症状**: 古いブラウザで日本語の文節改行が効かず、単語境界で改行される。

**影響**: 主に Firefox (未対応) および古い Chromium ベース環境。

**回避策**:
- 手動改行 (`<br>`) を JP 固有の場所に追加
- または、更新ブラウザを使用

PDF 出力は常に最新の Chromium でビルドされるため、この問題は影響しません。

---

## 問題を見つけたら

1. **Issue を立てる**: [GitHub Issues](https://github.com/yukiko10140422-star/frontend-slides-jp/issues) に再現手順とスクリーンショットを添付
2. **バグ修正 PR を歓迎**: [CONTRIBUTING.md](CONTRIBUTING.md) を参照
3. **新しい回避策が見つかったら**: この `KNOWN_ISSUES.md` にも追記してください
