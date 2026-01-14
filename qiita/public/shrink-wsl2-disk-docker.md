---
title: WSL 2 のディスク容量を圧縮する方法（Docker 使用時の肥大化対策）
tags:
  - Windows
  - Docker
  - WSL
  - ディスク管理
private: false
updated_at: "2026-01-14T19:11:05+09:00"
id: 181d797a1912c750566f
organization_url_name: null
slide: false
ignorePublish: false
---

## はじめに

WSL 2 はディスク容量を自動で拡張しますが、データを削除しても自動では縮小しません。そのため、Docker で大きなイメージやコンテナを作ったり消したりを繰り返すと、中身は空でもディスクファイル（`.vhdx`）だけが肥大化してしまいます。

WSL 2 のディスク容量を圧縮する方法を 2 つ紹介します。

## 手順 1：不要データの削除（WSL 2 内）

まず、WSL 2 内で不要なデータを削除して空き領域を作ります。Docker を使用している場合は、WSL 2 のターミナルで以下を実行します。

```bash
# 未使用のコンテナ、ネットワーク、イメージ（タグなし）を一括削除
docker system prune
```

より徹底的に削除したい場合：

```bash
# 未使用のボリュームも含めて徹底的に削除
# 開発用DBなどのデータが消える可能性があるので注意
docker system prune -a --volumes
```

Docker を使用していない場合は、WSL 2 内で不要なファイルやパッケージを削除してください。

> ⚠️ **注意**: これだけでは Windows 上のファイルサイズは変わりません。次の手順が必須です。

## 手順 2：ディスク容量を圧縮する

圧縮方法は 2 つあります。

### 方法 A：自動縮小設定（Sparse VHD）を使う

コマンドで Sparse VHD を有効化し、今後も自動で容量が返還されるように設定します。既存のファイルも同時に圧縮されます。

#### 1. WSL 2 を完全に停止する

PowerShell で以下を実行します。

```powershell
wsl --shutdown
```

#### 2. ディストリビューション名を確認する

WSL 2 ディストリビューションの正確な名前を確認します。

```powershell
wsl -l -v
```

実行結果の例：

```plaintext
  NAME      STATE           VERSION
* Ubuntu    Stopped         2
```

この例では、ディストリビューション名は`Ubuntu`です。環境によっては`Ubuntu-20.04`や`Ubuntu-22.04`など、バージョン番号が付く場合もあります。

#### 3. Sparse VHD を有効化する

確認したディストリビューション名で、以下のコマンドを実行します（管理者権限が必要です）。

```powershell
wsl --manage Ubuntu --set-sparse true --allow-unsafe
```

> ⚠️ **注意**: `--allow-unsafe`オプションが必要な理由
>
> 最近の WSL 2 では、Sparse VHD がデータ破損のリスクがあるため標準でロックされています。`--allow-unsafe`オプションを付けることで強制的に有効化できます。
>
> 開発環境であれば通常は問題ありませんが、重要なデータが入っている場合は方法 B（手動圧縮）を推奨します。

「変換中です。これには数分かかる場合があります。」と表示され、完了すれば作業終了です。

### 方法 B：diskpart コマンドで手動圧縮する

Windows 標準の`diskpart`ツールを使って、空いた領域を詰め直し、ファイルサイズを小さくします。安全ですが、都度手動で実行する必要があります。

まず、WSL 2 を完全に停止します。PowerShell で以下を実行します。

```powershell
wsl --shutdown
```

#### 1. 対象のファイル（ext4.vhdx）の場所を特定する

エクスプローラーのアドレスバーに以下を入力して、巨大な`.vhdx`ファイルを探します。

**WSL 2 内に Docker を直接インストールしている場合:**

```plaintext
%LOCALAPPDATA%\Packages\CanonicalGroupLimited.Ubuntu...\LocalState\
```

**Docker Desktop を使用している場合:**

```plaintext
%LOCALAPPDATA%\Docker\wsl\data\
```

ここに`ext4.vhdx`があります（Ubuntu のバージョンによってパスは多少異なります）。

> 💡 この`ext4.vhdx`ファイルのフルパスをクリップボードなどにコピーしておいてください。

#### 2. diskpart を実行する

`diskpart`は PowerShell とは別の、Windows のディスク管理専用ツールです。

1. PowerShell（管理者権限推奨）で`diskpart`とだけ入力して Enter を押します。

   ```powershell
   diskpart
   ```

2. 「このアプリがデバイスに変更を加えることを許可しますか？」と聞かれたら「はい」を押します。

3. プロンプトが`DISKPART>`に変わったら、以下のコマンドを順に入力します。

```plaintext
REM 1. 仮想ディスクファイルを選択（パスは自分の環境に合わせて書き換えてください）
select vdisk file="C:\Users\ユーザー名\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu_79rhkp1fndgsc\LocalState\ext4.vhdx"

REM 2. 仮想ディスクをアタッチ
attach vdisk readonly

REM 3. 圧縮を実行（これに少し時間がかかります）
compact vdisk

REM 4. デタッチ
detach vdisk

REM 5. 終了
exit
```

> 💡 `select vdisk`コマンドを実行すると、`DiskPart により、仮想ディスク ファイルが選択されました。`と表示されれば成功です。

エクスプローラーで確認すると、ファイルサイズが小さくなっているはずです。

## まとめ

WSL 2 のディスク容量を圧縮する手順：

1. **事前準備（必須）**: WSL 2 内で不要データを削除（Docker 使用時は`docker system prune`）
2. **圧縮実行**: 以下のいずれかの方法で物理ファイルを圧縮
   - **方法 A**: Sparse VHD を有効化（`wsl --manage <名前> --set-sparse true --allow-unsafe`）
   - **方法 B**: `diskpart`で手動圧縮

### どちらの方法を選ぶべきか

- **方法 A（Sparse VHD）**: 開発環境で、今後も自動で縮小したい場合。一度設定すれば、Docker でデータを削除した際に自動的にディスクファイルも縮小されます。
- **方法 B（diskpart）**: 重要なデータが入っている場合や、安全に確実に圧縮したい場合。都度手動で実行する必要があります。

Docker を頻繁に使う場合は、方法 A（Sparse VHD）の設定を有効にしておくと、手動での圧縮作業を大幅に減らせます。
