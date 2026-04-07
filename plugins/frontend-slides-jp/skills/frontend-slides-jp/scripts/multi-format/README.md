# Multi-Format Scaffold — HTML / PDF / PPTX

単一データソース (`slides-data.mjs`) から 3 つの形式を同時生成する再利用可能なパイプライン。

## このフォルダの使い方

プレゼンを作るとき、このフォルダ一式を作業ディレクトリにコピーし、`slides-data.example.mjs` を参考に `slides-data.mjs` を書いて `npm install && npm run build` を走らせるだけ。

```bash
# 1. 作業フォルダへコピー（例: Obsidian Vault の 03-Research/<topic>/）
VAULT="/c/Users/k3n70/iCloudDrive/iCloud~md~obsidian/Obsidian Vault/03-Research/my-topic"
mkdir -p "$VAULT"
cp ~/.claude/skills/frontend-slides/scripts/multi-format/* "$VAULT/"

# 2. slides-data.example.mjs → slides-data.mjs にリネームして中身を編集
cd "$VAULT"
mv slides-data.example.mjs slides-data.mjs

# 3. 依存インストール（初回のみ）
npm install

# 4. ビルド
npm run build          # HTML + PDF + PPTX を一括生成
# または個別:
npm run build:html     # HTML のみ
npm run build:pdf      # PDF のみ（text-selectable）
npm run build:pptx     # PPTX のみ（editable）
```

## 生成される成果物

| コマンド | 出力 | 特性 |
|---|---|---|
| `build:html` | `index.html` | 単一 HTML、ブラウザで即プレゼン、キーボード/スワイプ対応 |
| `build:pdf` | `<filename>.pdf` | Playwright `page.pdf()`、**ベクターテキスト**（選択・検索・コピー可） |
| `build:pptx` | `<filename>.pptx` | PptxGenJS ネイティブ、**全テキスト・全図形 PowerPoint で個別編集可** |

出力ファイル名は `slides-data.mjs` の `META.filename` で指定（現在 `build-pdf.mjs` / `build-pptx.mjs` は固定名のため、必要に応じて変更）。

## アーキテクチャ

```
slides-data.mjs
  │  exports: THEME (colors, fonts)
  │           META (title, subtitle, date)
  │           SLIDES (array of slide objects with type + data)
  │
  ├─→ render-html.mjs → index.html
  │   生成プロセス:
  │     1. SLIDES 配列を map して type ごとに renderer 関数で HTML 断片化
  │     2. CSS テンプレートに THEME 変数を注入
  │     3. SlidePresentation クラス (キーボード/タッチ/プログレスバー) を埋め込み
  │
  ├─→ build-pdf.mjs → <filename>.pdf
  │   生成プロセス:
  │     1. Playwright Chromium をヘッドレス起動
  │     2. index.html を file:// で読み込み、フォントロード完了を待つ
  │     3. @media print ルールで各 .slide を 1920×1080 固定化
  │     4. page.pdf({ width, height, printBackground: true }) でベクター出力
  │
  └─→ build-pptx.mjs → <filename>.pptx
      生成プロセス:
      1. PptxGenJS で LAYOUT_WIDE (13.333 × 7.5 inches)
      2. DARK_TECH マスタースライドに背景 + ブランドバー定義
      3. SLIDES を map し、type ごとに renderer 関数で:
         - addShape() で角丸矩形・楕円を配置（ネイティブ図形）
         - addText() で全テキストを配置（ネイティブテキスト・編集可）
      4. writeFile() で .pptx 出力
```

## 対応スライドタイプ

`slides-data.example.mjs` に各タイプのサンプルあり:

| type | レイアウト | 主な用途 |
|---|---|---|
| `title` | ヒーロータイトル + サブタイトル + メタ行 | 表紙 |
| `agenda` | 2×N 番号付きグリッド | 目次・アジェンダ |
| `two-col` | リード + 左右カード（ラベル/タイトル/本文） | 対比・比較 |
| `two-col-bullets` | 左右カード + 箇条書き | 対比 + 補足 |
| `kpi` | 3 KPI カード（値/ラベル/注釈） | 数値インパクト |
| `layers` | 垂直レイヤースタック、1 つハイライト | アーキテクチャ図 |
| `flow` | 水平ステップ + 箇条書き | プロセス・ユースケース |
| `lead-bullets` | リード文 + 箇条書き | 要約 + 詳細 |
| `bullets` | 純粋な箇条書き | リスト |
| `phases` | 3 フェーズカード | ロードマップ |
| `closing` | 大型引用 + メタ | 締め・提言 |

## カスタマイズ

### 色・フォント

`slides-data.mjs` の `THEME.colors` と `THEME.fonts` を書き換えるだけ。HTML と PPTX の両方に反映される。

### 新しい slide type を追加する

1. `slides-data.mjs` の該当スライドに新しい `type` を設定
2. `render-html.mjs` に renderer 関数を追加し `RENDERERS` マップに登録
3. `build-pptx.mjs` にも同名の renderer を追加し `RENDERERS` マップに登録
4. （PDF は HTML から自動生成されるので追加作業なし）

### 言語切替

デフォルトは `lang="ja"` で日本語向け clamp() 値を使用。英語プレゼンにする場合は `render-html.mjs` の `<html lang="ja">` を `"en"` に変更。

### プリセット切替

`THEME.colors` を `STYLE_PRESETS.md` の他のプリセット（Bold Signal, Neon Cyber, JP-1 Dark Luxury など）の値に差し替えれば見た目が一新される。

## 既知の制約

- **PPTX のグラデーションテキスト**: HTML 版のグラデーションタイトルは PPTX では単色になる（PowerPoint の制約）
- **backdrop-filter**: HTML の blur 効果は PPTX に移行できず、透過図形で近似
- **フォント埋め込み**: PPTX は Yu Gothic をリンクするだけ。開く環境に無いと置換される
- **アニメーション**: PDF / PPTX では静止状態。HTML 版のみ動く

## デプロイ先のルール

成果物（HTML / PDF / PPTX）は **Obsidian Vault のサブフォルダに保存** する。Downloads や system32 放置は NG。

- リサーチ系 → `03-Research/<トピック>/`
- プロジェクト系 → `02-Projects/<プロジェクト名>/`

インデックスノート `<トピック>.md` を同時に作成し、`![[...]]` で PDF を埋め込む。`node_modules` は iCloud 同期を汚すので Vault にコピーしない。
