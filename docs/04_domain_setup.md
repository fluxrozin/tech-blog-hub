# fluxrozin.com ドメイン設定ガイド

> 対象：バリュードメイン + Cloudflare + Xserver + Astro の構成で、独自ドメインサイト・メール・Bluesky ハンドルを設定する

---

## 全体構成

```
fluxrozin.com（バリュードメインで取得）
        │
        ▼ ネームサーバー変更
   Cloudflare（DNS管理・CDN・セキュリティ）
        │
        ├─→ Webサイト    : Cloudflare Pages（Astro）
        ├─→ メール       : Xserver（MXレコード経由）
        └─→ Bluesky     : @fluxrozin.com（TXTレコード）
```

### 使用サービス一覧

| 役割         | サービス         | 料金                     |
| ------------ | ---------------- | ------------------------ |
| ドメイン取得 | バリュードメイン | 年額 1,000〜3,000 円程度 |
| DNS・CDN     | Cloudflare       | 無料                     |
| Web サイト   | Cloudflare Pages | 無料                     |
| メール       | Xserver          | 既存契約                 |
| SNS 認証     | Bluesky ハンドル | 無料                     |

---

## Step 1: Cloudflare にアカウント作成・サイト追加

### 1-1. アカウント作成

1. [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) にアクセス
2. メールアドレスとパスワードで登録
3. メール認証を完了

### 1-2. サイトを追加

1. ダッシュボードで「**Add a site**」をクリック
2. `fluxrozin.com` を入力
3. 「**Free**」プランを選択（無料で十分）
4. 「**Continue**」をクリック

### 1-3. 既存 DNS レコードのスキャン

- Cloudflare が自動で DNS レコードをスキャンする
- この段階では何も設定されていなくて OK
- 「**Continue**」をクリック

### 1-4. ネームサーバーを確認

fluxrozin.com に割り当てられた Cloudflare ネームサーバー：

```
lana.ns.cloudflare.com
owen.ns.cloudflare.com
```

**この 2 つを次のステップでバリュードメインに設定する**

---

## Step 2: バリュードメインでネームサーバーを変更

### 2-1. バリュードメインにログイン

1. [https://www.value-domain.com/](https://www.value-domain.com/) にアクセス
2. コントロールパネルにログイン

### 2-2. ネームサーバー変更

1. 「**ドメイン**」→「**ドメインの設定操作**」
2. `fluxrozin.com` の「**ネームサーバー**」をクリック
3. 既存のネームサーバーを**削除**：

```
× ns11.value-domain.com（削除）
× ns12.value-domain.com（削除）
× ns13.value-domain.com（削除）
```

1. Cloudflare のネームサーバーに**置き換え**：

```
ネームサーバー1: lana.ns.cloudflare.com
ネームサーバー2: owen.ns.cloudflare.com
```

1. 「**保存**」をクリック

### 2-3. 反映を待つ

- 通常: 数分〜数時間
- 最大: 24〜48 時間
- Cloudflare ダッシュボードで「**Check nameservers**」をクリックして確認
- 成功すると「**Active**」になる

---

## Step 3: Cloudflare Pages で認証用ファイルを公開

> **重要**: Xserver にドメインは Cloudflare 経由で追加するため、所有権確認（Web 認証）が必要です。先に Cloudflare Pages で認証用ファイルを公開します。

### 3-1. Cloudflare Pages プロジェクト作成

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com) → **Workers & Pages**
2. 「**アプリケーションを作成する**」（右上の青いボタン）
3. 「**Upload your static files**」を選択（一番下）
4. プロジェクト名: `fluxrozin-site`
5. 「**Create project**」

### 3-2. 認証用ファイルをアップロード

ローカルに `webauth.html` ファイルを作成:

```html
web-auth-2026-01
```

※ 内容は Xserver の認証画面で表示される値を使用

1. 作成した `webauth.html` をドラッグ&ドロップでアップロード
2. 「**Deploy site**」

### 3-3. カスタムドメイン設定

1. デプロイ完了後、「**Custom domains**」タブ
2. 「**Set up a custom domain**」
3. `fluxrozin.com` を入力
4. 「**Activate domain**」

### 3-4. SSL 設定を一時的に調整（必要な場合）

Web 認証が HTTPS リダイレクトで失敗する場合:

1. Cloudflare ダッシュボード → `fluxrozin.com` → **SSL/TLS** → **Edge Certificates**
2. 「**Always Use HTTPS**」を一時的に**オフ**
3. 認証完了後、**オン**に戻す

---

## Step 4: Xserver でメール設定

### 4-1. Xserver にドメイン追加

1. [Xserver サーバーパネル](https://www.xserver.ne.jp/login_server.php) にログイン
2. 「**ドメイン設定**」→「**ドメイン設定追加**」
3. `fluxrozin.com` を入力
4. 以下のチェックを**外す**：
   - 「無料独自 SSL を利用する」（Cloudflare で SSL 管理するため）
   - 「X アクセラレータを有効にする」
5. 「**確認画面へ進む**」

### 4-2. ドメイン所有権の確認（Web 認証）

「ドメインの所有者が確認できません」と表示される場合:

1. 「**Web 認証**」を選択
2. 表示される情報を確認:
   - 設置 URL: `http://fluxrozin.com/webauth.html`
   - 認証コード: `web-auth-XXXX-XX`（実際の値を使用）
3. Step 3 で作成した Cloudflare Pages に認証ファイルがあることを確認
4. [http://fluxrozin.com/webauth.html](http://fluxrozin.com/webauth.html) にアクセスして認証コードが表示されるか確認
5. Xserver で「**認証する**」をクリック

### 4-3. メールアカウント作成

1. 「**メールアカウント設定**」
2. `fluxrozin.com` を選択
3. 「**メールアカウント追加**」タブ

| 項目             | 値                     |
| ---------------- | ---------------------- |
| メールアカウント | contact                |
| パスワード       | 強力なパスワードを設定 |
| 容量             | 2000MB（2GB）          |

1. 「**確認画面へ進む**」→「**追加する**」

### 4-4. サーバー情報を確認

1. サーバーパネルトップ →「**サーバー情報**」
2. 「**ホスト名**」をメモ: `sv2309.xserver.jp`

---

## Step 5: Cloudflare で DNS レコード設定

Cloudflare ダッシュボード → `fluxrozin.com` → 「**DNS**」→「**Records**」

### 5-1. メール用レコード（Xserver）

#### MX レコード（メール受信用）

「**Add record**」で追加：

| 項目        | 値                |
| ----------- | ----------------- |
| Type        | MX                |
| Name        | @                 |
| Mail server | sv2309.xserver.jp |
| Priority    | 10                |
| TTL         | Auto              |

#### SPF レコード（送信認証用）

| 項目    | 値                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| Type    | TXT                                                                                                           |
| Name    | @                                                                                                             |
| Content | `v=spf1 +a:sv2309.xserver.jp +a:fluxrozin.com +mx include:spf.sender.xserver.jp include:_spf.google.com ~all` |
| TTL     | Auto                                                                                                          |

※ Gmail 許可を ON にした場合の設定（Gmail からの送信も許可）

#### DKIM レコード（メール署名用）

Xserver サーバーパネル →「**メール**」→「**DKIM 設定**」で表示される値を設定:

| 項目    | 値                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type    | TXT                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Name    | default.\_domainkey                                                                                                                                                                                                                                                                                                                                                                                                          |
| Content | `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqsRYdBOXbk1NTy+F4O8mJyJ6YuUQeo5vczMWdCaL7M8X7PEHfkVaQ+qJxsrPxjNdw/umNDo6N0/L+6mAzMQVCtb/ypuWovsbUoY60awAsv8qV50AmdnJC6pkk4lV3pYohVhUAOtML1jyv8OLTaWyVhd4aMaHoUHzKpFSUwzHbEhaLfSvTlHkcLQVzlk51AvTS+XvoF6p7FzOhxIjAlzjD1Z2yG1TGwYrWQlAhPW8ltMkwjdK5wdD0u+cMJqS9/is9RJmYTTJUdzo07TDwJWr+59ko0TmWiuUxEVdxqSGJwMQsR0J/Qjg6iKxW++v4x/MO5eQefb0Yu1iUZY8fk9aaQIDAQAB` |
| TTL     | Auto                                                                                                                                                                                                                                                                                                                                                                                                                         |

#### DMARC レコード（メール認証ポリシー）

| 項目    | 値                                                   |
| ------- | ---------------------------------------------------- |
| Type    | TXT                                                  |
| Name    | \_dmarc                                              |
| Content | `v=DMARC1; p=none; rua=mailto:contact@fluxrozin.com` |
| TTL     | Auto                                                 |

### 5-2. Bluesky 用レコード（後述の Step 7 で設定）

この時点では一旦スキップ。

### 5-3. Web サイト用レコード

Step 3 で Cloudflare Pages にカスタムドメインを設定した際に自動追加されている。

---

## Step 6: Cloudflare Pages で Astro サイト公開（後で実施）

> **注意**: Step 3 で作成した Pages プロジェクトを本番サイト用に更新するか、GitHub リポジトリと連携して再構築します。

### 6-1. 方法 A: 既存プロジェクトにファイルをアップロード

認証用に作成した Pages プロジェクトをそのまま使う場合:

1. Workers & Pages → `fluxrozin-site` を選択
2. 「**Upload assets**」または新しいデプロイメントを作成
3. 認証ファイル（webauth.html）を削除し、サイトファイルをアップロード

### 6-2. 方法 B: GitHub リポジトリと連携（推奨）

Astro でサイトを構築して GitHub 連携する場合:

#### GitHub にリポジトリ作成

1. [https://github.com/new](https://github.com/new) にアクセス
2. Repository name: `fluxrozin-site`
3. 「**Create repository**」

#### VSCode で Astro プロジェクト作成

##### フォルダ作成

1. VSCode →「**ファイル**」→「**新しいウィンドウ**」
2. 「**フォルダーを開く**」
3. `C:\Users\aoki\Dropbox\Projects` を開く
4. 「**新しいフォルダー**」で `fluxrozin-site` を作成
5. そのフォルダを選択

#### Astro プロジェクト作成

VSCode のターミナル（`Ctrl + @`）で：

```bash
npm create astro@latest .
```

対話式の質問に回答：

```
dir is not empty, continue? → Yes
How would you like to start? → Use minimal (empty)
Install dependencies? → Yes
TypeScript? → Yes
How strict? → Strict
Initialize git? → Yes
```

#### Cloudflare アダプター追加

```bash
npx astro add cloudflare
```

質問には `Y` で回答。

##### astro.config.mjs を編集

```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  site: 'https://fluxrozin.com',
});
```

##### トップページ作成

`src/pages/index.astro` を以下に置き換え：

```astro
---
const links = [
  { name: 'GitHub', url: 'https://github.com/fluxrozin' },
  { name: 'Zenn', url: 'https://zenn.dev/fluxrozin' },
  { name: 'X', url: 'https://x.com/fluxrozin' },
  { name: 'Bluesky', url: 'https://bsky.app/profile/fluxrozin.com' },
];
---

<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>fluxrozin</title>
    <meta name="description" content="fluxrozin's personal website" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: system-ui, sans-serif;
        background: #0a0a0a;
        color: #fafafa;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      main { text-align: center; padding: 2rem; }
      h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
      .subtitle { color: #888; margin-bottom: 2rem; }
      .links {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
      }
      a {
        color: #fafafa;
        background: #1a1a1a;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        transition: background 0.2s;
      }
      a:hover { background: #2a2a2a; }
      .contact { margin-top: 2rem; font-size: 0.875rem; color: #888; }
    </style>
  </head>
  <body>
    <main>
      <h1>fluxrozin</h1>
      <p class="subtitle">Developer / Creator</p>
      <div class="links">
        {links.map((link) => (
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {link.name}
          </a>
        ))}
      </div>
      <p class="contact">Contact: contact@fluxrozin.com</p>
    </main>
  </body>
</html>
```

##### ローカルで確認

```bash
npm run dev
```

ブラウザで <http://localhost:4321> を開いて確認。`Ctrl + C` で停止。

##### GitHub にプッシュ

#### 方法 A: VSCode の GUI

1. 左サイドバーの「**ソース管理**」アイコン（分岐マーク）
2. 「**変更をステージ**」（+ボタン）
3. メッセージ欄に `Initial commit` と入力
4. 「**コミット**」ボタン
5. 「**ブランチの発行**」→ GitHub を選択

#### 方法 B: ターミナル

```bash
git remote add origin https://github.com/あなたのユーザー名/fluxrozin-site.git
git branch -M main
git push -u origin main
```

##### Cloudflare Pages で GitHub 連携（既存プロジェクトがある場合は設定変更）

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com) → **Workers & Pages**
2. 既存の `fluxrozin-site` を選択 → **Settings** → **Builds & deployments**
3. または新規作成: **Create** → **Pages** → **Connect to Git**
4. GitHub を連携 → `fluxrozin-site` を選択
5. ビルド設定：

| 項目                   | 値            |
| ---------------------- | ------------- |
| Framework preset       | Astro         |
| Build command          | npm run build |
| Build output directory | dist          |

1. **Save and Deploy**

##### カスタムドメイン確認

Step 3 で設定済みの場合は確認のみ:

1. プロジェクトの「**Custom domains**」タブ
2. `fluxrozin.com` が「Active」になっていることを確認

##### SSL/TLS 設定

1. Cloudflare ダッシュボード → 「**SSL/TLS**」→「**Overview**」
2. 暗号化モードを「**Full (strict)**」に設定
3. 「**Edge Certificates**」→「**Always Use HTTPS**」をオン

---

## Step 7: Bluesky ハンドル設定（@fluxrozin.com）

### 7-1. Bluesky で設定画面を開く

1. [https://bsky.app](https://bsky.app) にログイン
2. 左メニュー「**Settings**」（設定）
3. 「**Account**」→「**Handle**」
4. 「**I have my own domain**」をクリック

### 7-2. ドメインを入力

1. 入力欄に `fluxrozin.com` を入力
2. 表示される情報をメモ：

```
Domain: fluxrozin.com
Type: TXT
Name: _atproto
Value: did=did:plc:xxxxxxxxxxxxxxx
```

**`did=did:plc:...` の値をコピー**

### 7-3. Cloudflare で TXT レコード追加

1. Cloudflare ダッシュボード → `fluxrozin.com` → **DNS** → **Records**
2. 「**Add record**」

| 項目    | 値                                   |
| ------- | ------------------------------------ |
| Type    | TXT                                  |
| Name    | \_atproto                            |
| Content | did=did:plc:lbxqchnnfv7uynawyhx6zbkx |
| TTL     | Auto                                 |

1. 「**Save**」

### 7-4. Bluesky で認証

1. Bluesky の設定画面に戻る
2. 「**Verify DNS Record**」をクリック
3. 成功すると「**Domain verified!**」と表示
4. 「**Update to fluxrozin.com**」をクリック

### 7-5. 確認

- プロフィールが `@fluxrozin.com` に変更される
- 他のユーザーからも `@fluxrozin.com` で検索可能

---

## Step 8: メール動作確認

### 8-1. Web メールでログイン

1. [Xserver Web メール](https://www.xserver.ne.jp/login_mail.php) にアクセス
2. ログイン：
   - メールアドレス: `contact@fluxrozin.com`
   - パスワード: 設定したパスワード

### 8-2. 送受信テスト

1. 自分の別メール（Gmail 等）から `contact@fluxrozin.com` にテスト送信
2. Web メールで受信を確認
3. Web メールから返信して送信テスト
4. Gmail 等で受信を確認

### 8-3. （任意）Gmail で送受信する設定

Gmail で `contact@fluxrozin.com` を送受信したい場合：

#### 受信設定（POP3）

Gmail → 設定 → 「アカウントとインポート」→「他のアカウントからメールを読み込む」

| 項目           | 値                      |
| -------------- | ----------------------- |
| メールアドレス | contact@fluxrozin.com   |
| ユーザー名     | contact@fluxrozin.com   |
| パスワード     | 設定したパスワード      |
| POP サーバー   | sv2309.xserver.jp       |
| ポート         | 995                     |
| SSL            | 有効                    |

#### 送信設定（SMTP）

Gmail → 設定 → 「アカウントとインポート」→「他のメールアドレスを追加」

| 項目           | 値                      |
| -------------- | ----------------------- |
| 名前           | fluxrozin               |
| メールアドレス | contact@fluxrozin.com   |
| SMTP サーバー  | sv2309.xserver.jp       |
| ポート         | 465                     |
| ユーザー名     | contact@fluxrozin.com   |
| パスワード     | 設定したパスワード      |
| SSL            | 有効                    |

---

## Step 9: 最終確認チェックリスト

### ドメイン・DNS

```
□ Cloudflareで「Active」になっている
□ DNSレコードが正しく設定されている（下記参照）
```

### Web サイト

```
□ https://fluxrozin.com にアクセスできる
□ http → https にリダイレクトされる
□ www.fluxrozin.com もアクセス可能（設定した場合）
□ サイトの内容が正しく表示される
□ 各リンクが正しく動作する
```

### Bluesky

```
□ @fluxrozin.com としてプロフィール表示される
□ 検索で @fluxrozin.com が見つかる
```

### メール

```
□ contact@fluxrozin.com でメール受信できる
□ contact@fluxrozin.com からメール送信できる
□ 送信メールが迷惑メールに振り分けられない
□ SPF/DKIM/DMARC が正しく設定されている
```

---

## DNS レコード一覧（最終状態）

Cloudflare DNS に設定されているレコード：

| Type | Name              | Content                                                                                                          | Proxy   | 用途                    |
| ---- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | ------- | ----------------------- |
| CNAME | @                | portfolio-site-xxx.pages.dev                                                                                     | Proxied | Web サイト              |
| CNAME | www              | portfolio-site-xxx.pages.dev                                                                                     | Proxied | www 対応                |
| MX   | @                 | sv2309.xserver.jp                                                                                                | -       | メール受信              |
| TXT  | @                 | v=spf1 +a:sv2309.xserver.jp +a:fluxrozin.com +mx include:spf.sender.xserver.jp include:_spf.google.com ~all      | -       | メール認証（SPF）       |
| TXT  | default._domainkey | v=DKIM1; k=rsa; p=MIIBIjAN...（公開鍵）                                                                         | -       | メール署名（DKIM）      |
| TXT  | _dmarc            | v=DMARC1; p=none; rua=mailto:contact@fluxrozin.com                                                               | -       | メール認証（DMARC）     |
| TXT  | _atproto          | did=did:plc:lbxqchnnfv7uynawyhx6zbkx                                                                             | -       | Bluesky ハンドル        |

※ CNAME の `portfolio-site-xxx.pages.dev` は Cloudflare Pages が自動生成した実際の値に置き換え

---

## トラブルシューティング

### DNS 反映が遅い

- 最大 48 時間かかる場合あり
- 確認ツール: [https://dnschecker.org/](https://dnschecker.org/)

### Bluesky で認証失敗

- TXT レコードの `_atproto` のスペルミス確認
- `did=` を含めて正確にコピーしているか確認
- 数分〜数時間待ってから再試行

### メールが届かない・迷惑メールに入る

SPF/DKIM/DMARC を設定しても迷惑メールに入る場合がある。これらの認証は「なりすましではない」という身分証明であり、「内容や送信行動が安全」という保証ではないため。

#### 原因 1: IP アドレス・ドメインのレピュテーション（評判）が低い

**共用サーバーの問題**: Xserver は共用レンタルサーバーのため、同じサーバーを使う他ユーザーがスパムを送ると、巻き添えで IP がブラックリスト入りする可能性がある。

**確認方法**:

1. [MxToolbox Blacklist Check](https://mxtoolbox.com/blacklists.aspx) にアクセス
2. `sv2309.xserver.jp` を入力して診断
3. 結果を確認:
   - すべて緑（OK）: IP はきれい
   - 赤色（Listed）: これが原因。特に SPAMHAUS、SORBS、BARRACUDA に入っていると Gmail にはほぼ届かない

**対処法**:

- Xserver サポートに連絡し「sv2309 が○○（ブラックリスト名）に入っており届かない」と相談
- 即効性が必要な場合: メール送信だけ Gmail SMTP を経由させる

#### 原因 2: Cloudflare のプロキシ設定（重要）

メール関連の DNS レコードは **必ず「DNS Only（灰色の雲）」** にする。

```
✓ MX レコード → DNS Only（灰色）
✓ SPF/DKIM/DMARC（TXT）→ DNS Only（灰色）
✗ Web サイト（CNAME）→ Proxied（オレンジ）でOK
```

オレンジ色の雲になっていると、メールサーバーの正しい IP が見えず認証エラーになる。

#### 原因 3: SPF レコードの記述

**推奨する SPF レコード（Xserver + Gmail 許可）**:

```
v=spf1 +a:sv2309.xserver.jp +mx include:spf.sender.xserver.jp include:_spf.google.com ~all
```

**各項目の意味**:

| 項目                           | 意味                                   |
| ------------------------------ | -------------------------------------- |
| `+a:sv2309.xserver.jp`         | Xserver の収容サーバーを許可           |
| `+mx`                          | MX レコードで指定したサーバーを許可    |
| `include:spf.sender.xserver.jp`| Xserver のメール配信ネットワーク全体を許可 |
| `include:_spf.google.com`      | Gmail からの送信を許可（Gmail 許可 ON の場合） |
| `~all`                         | 上記以外はソフトフェイル（疑わしいが拒否はしない） |

**注意**: `include:_spf.google.com` は Gmail の SMTP を使って送信する場合のみ必要。Xserver のメールだけ使う場合は不要。

#### 原因 4: DKIM の設定不備

「レコードがある」ことと「サーバーが署名している」ことは別。

**確認方法**:

1. Gmail 等に自分のドメインからメールを送信
2. 受信したメールで「メッセージのソースを表示」
3. `Authentication-Results` 欄に `dkim=pass` があるか確認
4. `dkim=neutral` や `fail` の場合、Xserver 側で DKIM が無効か、キーが間違っている

#### 原因 5: DMARC の設定

**レコード名**: 必ず `_dmarc` で登録する（受信サーバーは `_dmarc.fluxrozin.com` だけを見に行く）

**ポリシー（p=）の意味**:

| 値         | 動作                                       | 推奨時期       |
| ---------- | ------------------------------------------ | -------------- |
| `p=none`   | 何もしない（監視モード）                   | 設定直後       |
| `p=quarantine` | 迷惑メールフォルダへ隔離               | 運用安定後     |
| `p=reject` | 完全に拒否                                 | 完全に問題なし確認後 |

**推奨手順**:

1. まず `p=none` で運用開始
2. `rua=mailto:contact@fluxrozin.com` で届くレポートを確認
3. 正規メールが Pass していることを確認
4. 問題なければ `p=quarantine` → `p=reject` へ段階的に強化

#### 診断ツール

| ツール | URL | 用途 |
| ------ | --- | ---- |
| Mail-Tester | https://mail-tester.com/ | 総合スコア診断（10 点満点） |
| MxToolbox | https://mxtoolbox.com/ | ブラックリスト・DNS 確認 |
| Google Postmaster Tools | https://postmaster.google.com/ | Gmail からの評価確認 |
| dmarcian | https://dmarcian.com/dmarc-inspector/ | DMARC レコード確認 |

#### 診断手順

1. [mail-tester.com](https://mail-tester.com/) にアクセス
2. 表示されたアドレスにテストメールを送信
3. スコアと減点項目を確認:
   - SPF/DKIM が Pass なのにスコアが低い → Blacklist 項目を確認
   - 本文で減点 → スパム判定されやすいキーワードや画像比率を見直す

#### 10 点満点でも迷惑メールに入る場合

技術的な設定が完璧（SPF/DKIM/DMARC すべて Pass、ブラックリストなし）でも迷惑メールに入る場合、原因は **「ドメインの信用（レピュテーション）不足」** に絞られる。

**新規ドメインの宿命**:

- 取得して日が浅いドメインは、Gmail 等から「まだ信用できない」と警戒される
- これは設定では解決できない。時間をかけて信用を積み上げる必要がある

**対策 1: Google Postmaster Tools に登録（必須）**

Gmail があなたのドメインをどう評価しているかを可視化できる唯一の方法。

1. [Google Postmaster Tools](https://postmaster.google.com/) にアクセス
2. `fluxrozin.com` を登録
3. Cloudflare で TXT レコードを追加して認証
4. メールを送り続けると「迷惑メール率」「ドメイン信用度」がグラフ化される

**対策 2: テストメールの内容を改善**

スパムフィルターは中身のないメール（"test" "hello" だけ等）を嫌う。

```
✗ 件名: TEST / 本文: test
✓ 件名: 打ち合わせの件 / 本文: こんにちは、○○です。先日の件について...
```

普通の人間が書くような文章を送ると、受信トレイに入りやすい。

**対策 3: ドメインのウォームアップ**

Gmail の迷惑メールフォルダに入ったメールを開き、**「迷惑メールではない（Not Spam）」ボタン**を押す。

- これを数回繰り返すと、Google の AI が「fluxrozin.com はちゃんとした送信者」と学習する
- 徐々に受信トレイに入るようになる

**結論**: 設定が 10 点満点なら、あとは「まともな内容のメール」を少しずつ送り、信用を積み上げるフェーズ。

### サイトにアクセスできない

- Cloudflare Pages のデプロイ状況を確認
- カスタムドメインが「Active」になっているか確認
- SSL 証明書の発行に数分かかる場合あり

---

## 今後の拡張

### サイトの拡張

| やりたいこと         | 方法                                          |
| -------------------- | --------------------------------------------- |
| ページ追加           | `src/pages/works.astro` 等を作成              |
| ブログ追加           | `src/content/blog/` に Markdown               |
| スタイル変更         | `npx astro add tailwind` で Tailwind CSS 追加 |
| お問い合わせフォーム | Cloudflare Functions + メール送信 API         |

### 追加で独自ドメイン連携可能なサービス

| サービス            | 設定内容           | 料金        |
| ------------------- | ------------------ | ----------- |
| Hugging Face Spaces | demo.fluxrozin.com | PRO $9/月〜 |
| Notion Sites        | docs.fluxrozin.com | $10/月〜    |

---

## 付録: Web ホスティング選定（Xserver vs Cloudflare Pages）

Web サイトのホスティング先として、既存契約の Xserver と Cloudflare Pages を比較検討した結果、**Cloudflare Pages** を採用した。

### 比較表

#### 基本情報

| 項目     | Xserver                   | Cloudflare Pages            |
| -------- | ------------------------- | --------------------------- |
| 種類     | 従来型レンタルサーバー    | JAMstack/エッジホスティング |
| 料金     | 月額 990 円〜（契約済み） | 無料                        |
| サーバー | 日本                      | 世界 300+拠点（CDN）        |

#### 技術面

| 項目                  | Xserver          | Cloudflare Pages |
| --------------------- | ---------------- | ---------------- |
| 静的サイト            | 対応             | 対応             |
| PHP                   | 対応             | 非対応           |
| Python/Ruby           | 非対応           | 非対応           |
| JavaScript (サーバー) | 非対応           | Workers で対応   |
| データベース          | MySQL            | D1 (SQLite)      |
| WordPress             | 簡単インストール | 非対応           |

#### 運用面

| 項目          | Xserver              | Cloudflare Pages           |
| ------------- | -------------------- | -------------------------- |
| デプロイ方法  | FTP 手動アップロード | git push で自動            |
| Git 連携      | なし                 | GitHub/GitLab 自動デプロイ |
| PR プレビュー | なし                 | 自動生成                   |
| ロールバック  | 手動バックアップから | ワンクリック               |
| 管理画面      | 日本語               | 英語（一部日本語）         |

#### パフォーマンス

| 項目               | Xserver      | Cloudflare Pages |
| ------------------ | ------------ | ---------------- |
| 日本からのアクセス | 高速         | 高速             |
| 海外からのアクセス | やや遅い     | 高速             |
| 高トラフィック耐性 | サーバー依存 | 非常に高い       |

#### デザイン

| 項目             | Xserver              | Cloudflare Pages       |
| ---------------- | -------------------- | ---------------------- |
| デザインの自由度 | 完全自由             | 完全自由               |
| ノーコード編集   | WordPress で可能     | 基本コード編集         |
| テーマの豊富さ   | WordPress テーマ多数 | Astro 等のテンプレート |

### 向いている用途

| 用途             | Xserver     | Cloudflare Pages     |
| ---------------- | ----------- | -------------------- |
| WordPress ブログ | 最適        | 不可                 |
| PHP アプリ       | 最適        | 不可                 |
| 静的サイト       | 可能        | 最適                 |
| ポートフォリオ   | 可能        | 最適                 |
| API 開発         | PHP         | JavaScript (Workers) |
| 会員サイト       | PHP + MySQL | Workers + D1         |

### 採用理由

今回のユースケース（リンク集サイト）において **Cloudflare Pages** を選択した理由：

1. **静的サイトに最適**: PHP/DB は不要、Astro での静的生成に適している
2. **自動デプロイ**: `git push` で自動的にデプロイされ、更新が楽
3. **グローバル CDN**: 世界中から高速アクセス可能
4. **無料**: 追加コストなし
5. **DNS/CDN との統合**: 既に Cloudflare で DNS 管理しているため相性が良い
6. **将来の拡張性**: Workers/D1 で API 追加も可能

### Xserver を選ぶべきケース

以下の場合は Xserver の方が適している：

- WordPress でブログやコーポレートサイトを運営したい
- PHP/MySQL を使った動的サイトを構築したい
- コードを書かずに管理画面からサイトを更新したい
- 日本語サポートを重視する

---

## 関連ドキュメント

- [tech-notes-quickstart.md](tech-notes-quickstart.md)：技術メモ・学習ログ向けクイックスタート
- [security.md](security.md)：セキュリティの基本設定
- [profile-baseline.md](profile-baseline.md)：プロフィール統一ガイド

---

## 更新履歴

| 日付       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| 2026-01-12 | Mail-Tester 10点満点確認、ドメインウォームアップ手順追加                        |
| 2026-01-12 | トラブルシューティング: メール迷惑メール対策の詳細ガイド追加                    |
| 2026-01-12 | メール認証設定追加（DKIM, DMARC, SPF with Gmail許可）、メールアドレスを contact@ に変更 |
| 2026-01-12 | portfolio-site リポジトリで Cloudflare Pages デプロイ完了                       |
| 2026-01-12 | Xserver Web 認証の手順追加、Cloudflare Pages 設定手順を実際の UI に合わせて修正 |
| 2026-01-12 | 付録: Web ホスティング選定比較（Xserver vs Cloudflare Pages）を追加             |
| 2026-01-11 | 初版作成                                                                        |
