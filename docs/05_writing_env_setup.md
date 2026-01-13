# 執筆環境構築（Zenn / Qiita / はてなブログ / note）

> 対象：Windows + VS Code（PowerShell）。Zenn CLI / Qiita CLI / blogsync を同一リポジトリで併用する。note は手動管理。

---

## ゴール

- Zenn、Qiita、はてなブログ、note の 4 つの原稿を扱う
- **内容を相互参照しながら執筆**できるように、4 つの原稿を **同一 Git リポジトリ** で管理する
- Zenn / Qiita は **CLI でローカルプレビュー** して執筆できる
- 秘密情報（トークン / API キー等）は **リポジトリに保存しない**
- `npm link` でグローバルコマンドを提供し、実行パスを気にせずコマンド実行が可能

---

## 前提（Windows）

- Git（`git` が使える）
- Node.js（Qiita CLI 要件：`20.0.0` 以上 / Zenn CLI 要件：`14` 以上）
- VS Code（統合ターミナルは PowerShell 推奨）
- blogsync 用（どちらか）
  - Go（`go install` を使う場合）
  - もしくは blogsync の配布バイナリ（`blogsync.exe`）を入手して `hatena/` ディレクトリに配置

---

## ディレクトリ構成（このリポジトリ）

このリポジトリ（`tech-blog-hub`）の構成は以下の通りです。

```text
tech-blog-hub/
├── zenn/                    # Zenn（zenn-cli）
│   ├── articles/            # Zenn 記事
│   └── books/               # Zenn 本
├── qiita/                   # Qiita CLI の作業ディレクトリ
│   └── public/              # Qiita の記事ファイル
├── hatena/                  # blogsync の local_root（記事の保存先）
│   ├── blogsync.exe         # blogsync バイナリ
│   ├── blogsync.yaml        # ローカル設定（.gitignore 対象推奨）
│   └── post.js              # 新規投稿用ラッパースクリプト
├── note/                    # note 原稿（手動投稿用）
├── scripts/                  # カスタムラッパースクリプト
└── package.json             # グローバルコマンド定義
```

---

## Step 1: Zenn（zenn-cli）

公式ドキュメント：

- [Zenn CLI をインストールする](https://zenn.dev/zenn/articles/install-zenn-cli)
- [Zenn CLI で記事・本を管理する方法](https://zenn.dev/zenn/articles/zenn-cli-guide)
- [Zenn と GitHub リポジトリを連携](https://zenn.dev/zenn/articles/connect-to-github)

### 1-1. GitHub 連携（先にやる）

Zenn は GitHub リポジトリ連携が前提です。以下の手順で連携します。

1. **Zenn ダッシュボードで連携設定**

   - Zenn にログインし、ダッシュボードの「GitHub からのデプロイ」ページを開く
   - 「リポジトリを連携する」を選択し、このリポジトリ（`tech-blog-hub`）を選択

2. **同期するブランチの指定（重要）**
   - 連携後、Zenn のダッシュボードで「同期するブランチ」を設定
   - このリポジトリでは **`zenn-content` ブランチを指定**してください

詳細なワークフローの説明は「1-6. 公開/更新」を参照してください。

### 1-2. CLI インストール

このリポジトリでは `zenn/` ディレクトリに Zenn CLI をインストールします。

```console
cd zenn
npm install -D zenn-cli
npx zenn init
```

補足：

- `npx zenn init` は `zenn/` ディレクトリに `articles/` と `books/` を作成します（`README.md` や `.gitignore` も生成されるため、既存ファイルがある場合は事前に確認）。

### 1-3. グローバルコマンドの設定

プロジェクトルートで `npm link` を実行すると、どこからでも以下のコマンドが使えるようになります。

```console
# プロジェクトルートで実行
npm link
```

これにより、以下のグローバルコマンドが利用可能になります：

- `zenn-new` - 新しい記事を作成
- `zenn-preview` - プレビューを起動
- `zenn-list` - 記事の一覧を表示

### 1-4. 動作確認（記事作成/プレビュー）

グローバルコマンドを使用する場合：

```console
# どこからでも実行可能
zenn-new --slug my-first-article
zenn-preview
zenn-list
```

### 1-5. CLI アップデート

```console
cd zenn
npm install -D zenn-cli@latest
```

### 1-6. 公開/更新

Zenn は GitHub 連携リポジトリの内容から公開されます。`zenn/articles/` / `zenn/books/` を更新したらコミットして `main` ブランチに push します。

**公開の仕組み：**

このリポジトリでは `.github/workflows/zenn-sync.yml` が以下のように動作します：

1. `main` ブランチに push されると、GitHub Actions が自動的に起動
2. `zenn/` ディレクトリの内容を `zenn-content` ブランチに自動デプロイ
3. Zenn が `zenn-content` ブランチから記事を取得して公開

**ワークフローの流れ：**

```text
main ブランチに push
  ↓
GitHub Actions が zenn-content ブランチに自動デプロイ
  ↓
Zenn が zenn-content ブランチから記事を取得して公開
```

そのため、1-1 の連携設定では `zenn-content` ブランチを指定する必要があります。

---

## Step 2: Qiita（@qiita/qiita-cli）

公式ドキュメント：

- [Qiita CLI GitHub](https://github.com/increments/qiita-cli)

### 2-1. インストール

このリポジトリでは `qiita/` ディレクトリに Qiita CLI をインストールします。

> 注意：Qiita 公式の npm package 名は `@qiita/qiita-cli` です。

```console
cd qiita
npm install -D @qiita/qiita-cli
npx qiita version
```

### 2-2. init（設定ファイル生成）

```console
cd qiita
npx qiita init
```

`npx qiita init` により、少なくとも以下が生成されます。

- `qiita.config.json`
- `.gitignore`
- `.github/workflows/publish.yml`（GitHub Actions 用）

※ `qiita/.github/` 配下に作られた workflow は、そのままだと GitHub Actions に認識されません（Actions はリポジトリ直下の `.github/workflows/` を見るため）。なお、このドキュメントでは自動投稿の設定方法には触れません。

### 2-3. グローバルコマンドの設定

プロジェクトルートで `npm link` を実行すると、どこからでも以下のコマンドが使えるようになります（Step 1-3 で既に実行済みの場合は不要）。

```console
# プロジェクトルートで実行
npm link
```

これにより、以下のグローバルコマンドが利用可能になります：

- `qiita-init` - 初期設定
- `qiita-login` - 認証
- `qiita-new <記事名>` - 新しい記事を作成
- `qiita-preview` - プレビューを起動
- `qiita-publish <記事名>` - 記事を公開
- `qiita-publish-all` - すべての記事を公開
- `qiita-pull` - リモート更新を同期

### 2-4. トークン発行（必須）

1. [Qiita トークン発行ページ](https://qiita.com/settings/tokens/new?read_qiita=1&write_qiita=1&description=qiita-cli) にアクセス
2. 権限は `read_qiita` と `write_qiita` を付与して発行

### 2-5. login（必須）

グローバルコマンドを使用する場合：

```console
# どこからでも実行可能
qiita-login
```

プロンプトに従ってトークンを貼り付けます。

補足：

- `login` 後、認証情報（`credentials.json`）は既定で `$HOME/.config/qiita-cli/`（または `$XDG_CONFIG_HOME/qiita-cli`）に保存されます。
- リポジトリに置きたい場合は `--credential <dir>` を使い、保存先ディレクトリを `.gitignore` 対象にします。

### 2-6. preview（記事のダウンロード + プレビュー起動）

グローバルコマンドを使用する場合：

```console
# どこからでも実行可能
qiita-preview
```

デフォルト URL は `http://localhost:8888` です。

### 2-7. 記事の作成/投稿

グローバルコマンドを使用する場合：

```console
# どこからでも実行可能
qiita-new newArticle001
qiita-publish newArticle001
```

すべて反映する場合：

```console
qiita-publish-all
```

記事ファイルは `qiita/public/` 配下に置く必要があります。

### 2-8. 記事ファイル形式（Front Matter）

Qiita の記事ファイルは YAML front matter を先頭に持つ Markdown です（例：`qiita/public/newArticle001.md`）。

```yaml
---
title: newArticle001
tags:
  - ""
private: false
id: null
---
```

---

## Step 3: はてなブログ（blogsync）

公式ドキュメント：

- [blogsync README](https://github.com/x-motemen/blogsync)

### 3-1. インストール

次のどちらかで用意します。

- [配布バイナリを取得](https://github.com/x-motemen/blogsync/releases)
  - ダウンロードした `blogsync.exe` を `hatena/` ディレクトリに配置
- Go を使う: `go install github.com/x-motemen/blogsync@latest`

このリポジトリでは `hatena/blogsync.exe` として配置されています。

### 3-2. グローバルコマンドの設定

プロジェクトルートで `npm link` を実行すると、どこからでも以下のコマンドが使えるようになります（Step 1-3 で既に実行済みの場合は不要）。

```console
# プロジェクトルートで実行
npm link
```

これにより、以下のグローバルコマンドが利用可能になります：

- `hatena-pull [blog-id]` - はてなブログから記事を取得
- `hatena-push <file-path>` - はてなブログに記事をアップロード
- `hatena-post` - 記事を新規投稿（標準入力から）
- `hatena-fetch <file-path>` - リモート更新を取り込み

### 3-3. 設定（秘密情報をコミットしない）

blogsync の設定ファイルは 2 種類あります（README より）。

- ローカル設定: `hatena/blogsync.yaml`
- グローバル設定: `%USERPROFILE%\.config\blogsync\config.yaml`（Windows）

**重要**：API キーをリポジトリに置かないため、グローバル設定を使うことを強く推奨します。ローカル設定（`hatena/blogsync.yaml`）を使う場合は、必ず `.gitignore` に追加してください。

グローバル設定の例（YAML）：

```yaml
<blogID>:
  username: <hatena-id>
  password: <API KEY>
default:
  local_root: C:/path/to/tech-blog-hub/hatena
```

ポイント：

- `<blogID>` はブログ ID です（例: `yourname.hatenablog.com`）。ダッシュボードのブログ設定画面 URL 等に含まれます。
- `password` は **はてなユーザのパスワードではなく API キー** です（ブログの詳細設定画面の「API キー」）。
- グローバル設定で `local_root` を相対パスにすると、blogsync 実行時のカレントディレクトリ基準になります。プロジェクトごとに相対パスで運用したい場合は、ローカル設定（`hatena/blogsync.yaml`）を使い、ファイル自体は `.gitignore` します。

### 3-4. pull（記事をローカルにダウンロード）

グローバルコマンドを使用する場合：

```console
# どこからでも実行可能（デフォルトの blog ID は fluxrozin.hateblo.jp）
hatena-pull

# blog ID を指定する場合
hatena-pull fluxrozin.hateblo.jp
```

または、`hatena/` ディレクトリで直接実行する場合：

```console
cd hatena
blogsync.exe pull <blogID>
```

### 3-5. post / push（新規投稿 / 更新）

グローバルコマンドを使用する場合：

**新規投稿（標準入力から）**：

```console
# どこからでも実行可能
cat draft.md | hatena-post --title "記事タイトル" --draft

# blog ID を指定する場合
cat draft.md | hatena-post --title "記事タイトル" --draft fluxrozin.hateblo.jp
```

**更新（pull してできたファイルを編集して push）**：

```console
# どこからでも実行可能
hatena-push hatena/fluxrozin.hateblo.jp/entry/20260113/article.md
```

### 3-6. 記事ファイル形式（Front Matter）

blogsync が扱うファイルは YAML front matter + 本文の Markdown です（pull 後のファイル先頭に含まれます）。

```yaml
---
Title: "記事タイトル"
Category:
  - "カテゴリ"
Date: "2024-01-01T00:00:00+09:00"
Draft: "yes"
---
```

---

## Step 4: note（手動管理）

note は CLI 運用しない前提で、ローカルでは下書き Markdown を管理します。

このリポジトリでは `note/` ディレクトリに原稿を配置します。

例：

- `note/yyyymmdd_slug.md` のように原稿を置く
- 冒頭にメタ情報（タイトル、公開日、note URL、同期状況）を持たせておく

投稿は note のエディタに貼り付け（画像は手動で調整）で運用します。

### 4-1. 下書きテンプレ（例）

```md
---
title: ""
status: "draft" # draft/published
note_url: ""
published_at: ""
---
```
