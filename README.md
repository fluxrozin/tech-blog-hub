# Tech Blog Hub

複数の技術ブログプラットフォーム（[Zenn](https://zenn.dev/fluxrozin)、[Qiita](https://qiita.com/fluxrozin)、[はてなブログ](https://fluxrozin.hateblo.jp/)、[Note](https://note.com/fluxrozin)）を一元管理するプロジェクトです。

## プロジェクト構成

```text
tech-blog-hub/
├── zenn/          # Zenn 記事
├── qiita/         # Qiita 記事
├── hatena/        # はてなブログ記事
├── note/          # Note 記事
└── package.json   # 管理スクリプト
```

## セットアップ

```bash
npm link
```

**なぜ `npm link` が必要か：**

`npm link` を実行することで、プロジェクトルートから離れた場所でも `zenn-new`、`qiita-new`、`hatena-post` などのコマンドを直接実行できるようになります。これにより、どのディレクトリからでも記事の作成や投稿が可能になり、ワークフローが大幅に簡素化されます。

例えば、`~/Documents` から直接 `zenn-new --slug my-article` を実行でき、プロジェクトディレクトリに移動する必要がなくなります。

## コマンド一覧

### Zenn

#### Zenn のグローバルコマンド

`npm link` 実行後、どこからでも以下のコマンドが使えます：

| コマンド        | 説明                           | オプション                               |
| --------------- | ------------------------------ | ---------------------------------------- |
| `zenn-new`      | 新しい記事を作成（デフォルト） | `--slug`, `--title`, `--type`, `--emoji` |
| `zenn-new book` | 新しい本を作成                 | `--slug`                                 |
| `zenn-preview`  | プレビューを起動               | `--port`, `--no-watch`, `--open`         |
| `zenn-list`     | 記事の一覧を表示（デフォルト） | `articles`, `books`                      |

#### Zenn の使用例

```bash
# 記事を作成（ランダムなスラッグ）
zenn-new

# 記事を作成（カスタムオプション）
zenn-new --slug my-article --title "記事タイトル" --type tech --emoji 📝

# 本を作成
zenn-new book --slug my-book

# プレビュー（カスタムポート、ブラウザ自動起動）
zenn-preview --port 3000 --open

# 記事一覧を表示
zenn-list

# 本一覧を表示
zenn-list books
```

### Qiita

#### Qiita のグローバルコマンド

`npm link` 実行後、どこからでも以下のコマンドが使えます：

| コマンド                 | 説明                                           |
| ------------------------ | ---------------------------------------------- |
| `qiita-init`             | 記事を GitHub で管理するための初期設定         |
| `qiita-login`            | Qiita API の認証認可                           |
| `qiita-new <記事名>`     | 新しい記事を作成                               |
| `qiita-preview`          | プレビューを起動（デフォルト: localhost:8888） |
| `qiita-publish <記事名>` | 個別記事を公開                                 |
| `qiita-publish-all`      | すべての記事を公開                             |
| `qiita-pull`             | Qiita 上の更新を同期                           |
| `qiita-version`          | バージョンを表示                               |
| `qiita-help`             | ヘルプを表示                                   |

#### Qiita のオプション

| オプション           | 説明                                                   |
| -------------------- | ------------------------------------------------------ |
| `--credential <dir>` | Qiita CLI の認証情報を配置するディレクトリを指定       |
| `--root <dir>`       | 記事ファイルをダウンロードするディレクトリを指定       |
| `--config <dir>`     | 設定ファイルを配置するディレクトリを指定               |
| `--verbose`          | 詳細表示オプションを有効                               |
| `--port <port>`      | プレビューサーバーのポートを指定（`preview` コマンド） |
| `--host <host>`      | プレビューサーバーのホストを指定（`preview` コマンド） |

#### Qiita の使用例

```bash
# 新しい記事を作成
qiita-new my-first-article

# プレビューを起動（カスタムポート）
qiita-preview --port 3000

# 記事を公開
qiita-publish my-first-article

# すべての記事を公開
qiita-publish-all

# カスタムディレクトリで記事を管理
qiita-pull --root ./my-articles

# 詳細ログを表示しながら公開
qiita-publish my-article --verbose

# 特定の認証情報ディレクトリを使用
qiita-login --credential ~/.qiita-credentials
```

### はてなブログ (blogsync)

#### はてなブログのグローバルコマンド

`npm link` 実行後、どこからでも以下のコマンドが使えます：

| コマンド       | 説明                             | オプション                        |
| -------------- | -------------------------------- | --------------------------------- |
| `hatena-pull`  | はてなブログから記事を取得       | `[blog-id]`                       |
| `hatena-push`  | はてなブログに記事をアップロード | `<file-path>`                     |
| `hatena-post`  | 記事を新規投稿（標準入力から）   | `--title`, `--draft`, `[blog-id]` |
| `hatena-fetch` | リモート更新を取り込み           | `<file-path>`                     |

#### はてなブログのオプション

| オプション           | 説明                                                 |
| -------------------- | ---------------------------------------------------- |
| `--title "タイトル"` | 記事タイトルを指定（`post` コマンド）                |
| `--draft`            | 下書きとして投稿（`post` コマンド）                  |
| `[blog-id]`          | blog ID を指定（デフォルト: `fluxrozin.hateblo.jp`） |
| `<file-path>`        | ローカルファイルのパス（`push`, `fetch` コマンド）   |

#### はてなブログの使用例

```bash
# 記事を新規投稿（標準入力から）
cat draft.md | hatena-post --title "記事タイトル" --draft

# blog ID を指定して投稿
cat draft.md | hatena-post --title "記事タイトル" --draft fluxrozin.hateblo.jp

# はてなブログから記事を取得
hatena-pull

# 特定の blog ID から記事を取得
hatena-pull fluxrozin.hateblo.jp

# 記事をアップロード（ファイルパスを指定）
hatena-push hatena/fluxrozin.hateblo.jp/entry/20260113/article.md
```

#### 新規記事の作成（blogsync post）

はてなブログでまだ存在しない記事を新規投稿する場合は、`hatena-post`コマンドを使用します。

このコマンドは標準入力からエントリの内容を受け取って投稿し、投稿されたエントリに対応するファイルを自動的にダウンロードします。その後は新しく作成されたファイルを編集し、`push`することでエントリの編集を続けられます。

**基本的な使い方：**

```bash
# グローバルコマンドを使用（シンプルで推奨）
cat draft.md | hatena-post --title "blogsyncを使う" --draft

# blog IDを指定する場合（デフォルトは fluxrozin.hateblo.jp）
cat draft.md | hatena-post --title "blogsyncを使う" --draft fluxrozin.hateblo.jp

# タイトルにスペースが含まれる場合はクォートで囲む
cat draft.md | hatena-post --title "My First Post" --draft
```

**ワークフロー：**

1. 記事ファイル（例：`draft.md`）を作成して内容を書く
2. `hatena-post` コマンドで標準入力から記事を投稿
3. ファイルが自動ダウンロード: 投稿後、対応するファイルがローカルに保存される（例：`hatena/fluxrozin.hateblo.jp/entry/20260113/xxxxx.md`）
4. 編集を続ける: ダウンロードされたファイルを編集し、`hatena-push` で更新

**オプション：**

- `--title "タイトル"`: 記事タイトルを指定（必須）
- `--draft`: 下書きとして投稿（省略すると公開記事になります）
- `[blog-id]`: blog ID を指定（デフォルト: `fluxrozin.hateblo.jp`）

**サポートされる引数形式：**

- `--title "値"`, `--title=値`, `--draft`

## プラットフォーム別の使い分け戦略

このプロジェクトでは、**プラットフォーム特性を活かした使い分け**と**ハイブリッド配信**を組み合わせた折衷戦略を採用しています。

### プラットフォーム特性

各プラットフォームの特性に合わせて最適な記事を配置：

- **Zenn**: 公開・Markdown・コードブロック重視・体系的な技術記事・チュートリアル
- **Qiita**: 公開・Markdown・タグで分類・検索重視・実装手順・Tips・エラー解決
- **はてなブログ**: 公開/非公開可・HTML 可・カスタマイズ可・日記・雑記・思考の整理
- **Note**: 有料記事可・マルチメディア・収益化・一般向け・ビジネス視点

### 戦略：記事タイプ別の判断フロー

#### 1. 開発段階での使い分け

- **下書き・メモ**: はてなブログ（非公開可、カジュアル）
- **完成記事**: プラットフォーム特性に合わせて配信

#### 2. 記事タイプ別の配信先

| 記事タイプ           | 主な配信先   | 理由                             |
| -------------------- | ------------ | -------------------------------- |
| 実装手順・コード例   | Qiita        | 検索性が高く、タグで分類しやすい |
| 体系的チュートリアル | Zenn         | コードブロック重視、書籍化可能   |
| エラー解決・Tips     | Qiita        | 検索されやすく、実践的           |
| 日記・雑記・思考     | はてなブログ | カジュアル、非公開可             |
| 一般向け解説         | Note         | 収益化可能、マルチメディア対応   |
| ビジネス視点         | Note         | 有料記事可、幅広い読者層         |

#### 3. 同一コンテンツの配信ルール

同じ内容を複数プラットフォームに配信する場合：

1. **基本方針**: プラットフォーム特性に合わせて調整

   - タイトル・タグを各プラットフォーム向けに最適化
   - コードブロックの形式を統一
   - 読者層に合わせて説明を調整

2. **推奨パターン**:

   - **Qiita → Zenn**: 実装記事を体系的に再構成
   - **はてなブログ → Qiita/Zenn**: メモを完成記事に発展
   - **Zenn → Note**: 技術記事を一般向けに再編集

3. **避けるべきこと**:
   - 完全同一のコピペ投稿（SEO 的に不利）
   - プラットフォーム特性を無視した配信

### 実践的なワークフロー例

```text
1. はてなブログで下書き・メモ作成
   ↓
2. 記事タイプを判断
   ↓
3. プラットフォーム特性に合わせて最適化
   ↓
4. 主配信先に投稿（Qiita/Zenn/Note）
   ↓
5. 必要に応じて他プラットフォームに調整して配信
```

### 判断のポイント

- **検索されやすさ重視** → Qiita
- **体系的な解説** → Zenn
- **カジュアル・非公開可** → はてなブログ
- **収益化・一般向け** → Note
