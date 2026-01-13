# ドキュメント概要

このフォルダは、fluxrozin のオンライン活動における「戦略」と「運用」のドキュメント置き場です。

---

## ドキュメント構成

### [01_services.md](01_services.md)
**アカウントを取得したサービスの一覧とサービスの詳細**

- 全サービスの一覧表（カテゴリ別）
- 各サービスの詳細設定テンプレート
- プロフィール共通設定
- セキュリティ基準

### [02_strategy.md](02_strategy.md)
**各サービスをどう活用していくか、類似サービスをどう使い分けていくか、その戦略や運用方法**

- 全体戦略：中心 → 横展開の考え方
- Google サービスの活用範囲
- 小規模・断続運用の最小セット
- サービス別の使い方（勝ち筋/やらないこと/頻度）
- 再利用ルール（"1→5"の具体例）
- 段階的ロードマップ（Phase 0〜3）
- 週次・月次の運用ルーティン

### [03_ai_output_strategy.md](03_ai_output_strategy.md)
**生成AIをフル活用した各サービスにおける具体的で詳細なアウトプット戦略**

- NotebookLM の使い方（調査 → 要約）
- Gemini の使い方（叩き台 → 仕上げ）
- アウトプットの型（小さく作って、大きく使う）
- 1 回の制作を"完了"させる手順（90 分版）
- 活動別の具体的フロー
- YouTube の最小構成で始める
- 記事の型（コピペで使える）
- よくある質問（FAQ）
- 継続のコツ

### [04_domain_setup.md](04_domain_setup.md)
**ドメイン利用方法と設定方法の設計指針および詳細設定手順とトラブルシューティング**

- 全体構成（バリュードメイン + Cloudflare + Xserver + Astro）
- Cloudflare にアカウント作成・サイト追加
- バリュードメインでネームサーバーを変更
- Cloudflare Pages で Astro サイト公開
- Xserver でメール設定
- Cloudflare で DNS レコード設定
- Bluesky ハンドル設定（@fluxrozin.com）
- メール動作確認
- トラブルシューティング
- 付録：Web ホスティング選定比較

### [05_writing_env_setup.md](05_writing_env_setup.md)
**執筆（記事/メモ）に必要な環境構築手順**

---

## まずやること

1. **[01_services.md](01_services.md) のセキュリティ基準を確認**
   - 主要アカウントの防衛（MFA/復旧/権限）を固める
   - 特に優先：ドメイン/DNS、メール、GitHub、PayPal

2. **[01_services.md](01_services.md) のプロフィール共通設定を決める**
   - 表示名/アイコン/リンクの"共通セット"を決める
   - Gravatar の設定を更新

3. **[02_strategy.md](02_strategy.md) のロードマップを確認**
   - Phase 0（防衛）→ Phase 1（統一）→ Phase 2（配信）→ Phase 3（蓄積）
   - 各フェーズのチェックリストに従って進める

---

## リポジトリ構成

```
portfolio-site/
├── docs/                      # このフォルダ
│   ├── README.md              # このファイル（ドキュメント概要）
│   ├── 01_services.md         # サービス一覧と詳細
│   ├── 02_strategy.md         # サービス戦略と運用方法
│   ├── 03_ai_output_strategy.md # 生成AIフル活用のアウトプット戦略
│   ├── 04_domain_setup.md     # ドメイン利用方法と設定方法
│   └── 05_writing_env_setup.md # 執筆環境構築のドキュメント
├── src/                       # Astro サイトのソースコード
└── templates/                 # 各種テンプレート（週次レビューなど）
```

---

## 運用ルール（重要）

### セキュリティ

- **秘密情報（パスワード、API トークン、復旧コード等）はこのリポジトリに保存しません**
- **公開してよいのは「公開 URL、公開 ID、公開プロフィール文」まで**

### 優先順位

- **迷ったら「すべて `fluxrozin.com` に集約し、各サービスは配信/導線として最適化」を優先します**


---

## クイックスタート

### 初めての方へ

1. [02_strategy.md](02_strategy.md) の「0. 基本方針（迷ったらここだけ）」を読む
2. [03_ai_output_strategy.md](03_ai_output_strategy.md) の「よくある質問（FAQ）」を読む
3. [02_strategy.md](02_strategy.md) の「Phase 0: 防衛」のチェックリストを実行

### 技術メモ・学習ログを始めたい方へ

[03_ai_output_strategy.md](03_ai_output_strategy.md) の以下のセクションを参照：

- 「5. 活動別の具体的フロー」
- 「7. 記事の型（コピペで使える）」
- 「9. 継続のコツ」

### ドメインを設定したい方へ

[04_domain_setup.md](04_domain_setup.md) を参照してください。

---

## 関連リソース

- [fluxrozin.com](https://fluxrozin.com)：公式サイト
- [GitHub: fluxrozin](https://github.com/fluxrozin)：成果物の正本
- [Zenn: fluxrozin](https://zenn.dev/fluxrozin)：技術記事
- [X: @fluxrozin](https://x.com/fluxrozin)：速報・告知
