# Contributing to frontend-slides-jp

貢献歓迎です。特に以下の領域で助けが欲しいです:

- **新しい日本語プリセット** (JP-7, JP-8 ...)
- **他言語対応** (韓国語・中国語簡体字/繁体字 — CJK 共通ルールの抽出)
- **PPTX 出力の品質改善** (グラデーション表現・フォント埋め込み)
- **新しい slide type の追加** (例: timeline, matrix 2x2, comparison table)
- **Light テーマ scaffold 対応** (現在 Dark テーマ前提)
- **バグ修正** — [KNOWN_ISSUES.md](KNOWN_ISSUES.md) 参照

---

## 開発環境セットアップ

```bash
# 1. Fork & clone
gh repo fork yukiko10140422-star/frontend-slides-jp --clone=true
cd frontend-slides-jp

# 2. Scaffold の動作確認
cd scripts/multi-format
npm install
cp slides-data.example.mjs slides-data.mjs
npm run build
# → index.html / presentation.pdf / presentation.pptx が生成されるか確認

# 3. プレビューギャラリーの再生成
cd ../..
node docs/generate-previews.mjs
# → docs/previews/*.png が更新される
```

**必要なツール**:
- Node.js 18 以上
- `gh` CLI (fork / PR 作成用)
- Python 3.10+ (pypdf を使う開発タスクのみ)

---

## コーディング規約

### Markdown

- 見出しは `#` / `##` / `###` を一貫して使う
- 日本語と英語の間には半角スペースを入れる (例: `日本語 text`)
- コードブロックには言語指定を付ける (` ```javascript `)

### JavaScript / CSS

- ES Modules (`.mjs`) を使う
- ブラウザで動く CSS は `@media (prefers-reduced-motion: reduce)` を考慮
- `@media print` オーバーライドを書くときは **必ず PDF 出力で目視確認**
- インデントは 4 スペース

### SKILL.md

- フロントマター (`name`, `description`) の変更は慎重に
- Phase 0.5 / 0.7 / 0.8 の順序は変更しない（言語検出 → 形式選択 → scaffold）
- 新しい slide type を追加したら、`scripts/multi-format/slides-data.example.mjs` にもサンプルを追加

---

## 新しいプリセットを追加する手順

### 1. `STYLE_PRESETS.md` に定義を追加

トップレベルとプラグイン側の両方に同じ定義を:

```
STYLE_PRESETS.md
plugins/frontend-slides-jp/skills/frontend-slides-jp/STYLE_PRESETS.md
```

フォーマット:

```markdown
### JP-7. Your Preset Name

**Vibe:** 用途・雰囲気

**Typography:**
- Display: `Font Name`
- Body: `Font Name`
- Latin: `Font Name`

**Colors:**
\`\`\`css
:root {
    --bg-primary: #...;
    ...
}
\`\`\`

**Signature:** 特徴的なビジュアル要素
```

### 2. `docs/generate-previews.mjs` に追加

`PRESETS` 配列に新しいエントリを追加し、`layout` に対応する CSS を `renderHtml()` 関数に追加します。

```javascript
{
    id: '19-jp-your-preset',
    name: 'JP-7 Your Preset',
    category: 'Japanese',
    vibe: '用途・ムード',
    fontUrl: 'Font+Name:wght@400;700',
    ...
    layout: 'jp-your-preset',
},
```

### 3. プレビューを再生成

```bash
node docs/generate-previews.mjs
```

### 4. README のギャラリーセクションに追加

`README.md` の `### 🇯🇵 Japanese Presets (6)` を `(7)` に更新し、新しいカードを追加。

### 5. テスト

`slides-data.mjs` でこの新プリセットの `THEME` を使って 1 スライド作り、HTML / PDF / PPTX の 3 形式で動作確認。

### 6. PR 提出

- タイトル: `feat(preset): add JP-7 Your Preset Name`
- 本文: プレビュー画像 (`docs/previews/19-jp-your-preset.png`) と使用想定用途を書く

---

## バグ報告

[GitHub Issues](https://github.com/yukiko10140422-star/frontend-slides-jp/issues) に以下を含めて報告:

1. **環境**: OS、Node.js バージョン、ブラウザ、PowerPoint バージョン
2. **再現手順**: 最小限の `slides-data.mjs` と、実行したコマンド
3. **期待される挙動** と **実際の挙動**
4. **スクリーンショット** (特に PDF/PPTX の見た目問題)
5. 該当すれば [KNOWN_ISSUES.md](KNOWN_ISSUES.md) のどの項目に近いか

---

## PR ガイドライン

### タイトル形式

[Conventional Commits](https://www.conventionalcommits.org/) を使います:

- `feat:` 新機能（プリセット追加など）
- `fix:` バグ修正
- `docs:` ドキュメントのみ
- `refactor:` コードの意味を変えないリファクタ
- `perf:` パフォーマンス改善
- `chore:` ビルド・依存関係・CI など

例:
- `feat(preset): add JP-7 Vaporwave`
- `fix(pdf): handle text overflow in long Japanese headings`
- `docs: clarify multi-format scaffold README`

### Commit のまとまり

- 1 つの PR で 1 つの論理的な変更
- コミット履歴が読みやすいなら squash 不要、細かすぎるなら squash 歓迎
- **ビルドが壊れるコミットを push しない** (各コミットで `npm run build` が通る状態に)

### レビューと merge

- CI が通るまで待つ (将来的に GitHub Actions で scaffold build の CI を追加予定)
- スクリーンショットが必要な変更 (preset, 新しい layout など) は PR 本文に画像を貼る
- 大きな変更は先に Issue で方向性を議論してから実装するのが早い

---

## ライセンス

このプロジェクトは MIT ライセンスです。PR を出すことで、あなたのコードも同じ MIT ライセンスで取り込まれることに同意したものとみなします。

原作の [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) への謝辞は [README.md](README.md) の「ライセンス・クレジット」セクションを参照。

---

## 質問・相談

- GitHub Discussions (将来有効化予定)
- Issue に `question` ラベルを付けて投稿
- 原作の方針に関する質問は upstream repository へ
