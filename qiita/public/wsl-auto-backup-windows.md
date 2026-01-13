---
title: WSL の特定ディレクトリを Windows 側に自動バックアップする方法
tags:
  - Windows
  - Ubuntu
  - backup
  - WSL
private: false
updated_at: '2026-01-13T15:53:08+09:00'
id: 8df9f65832635bb556e1
organization_url_name: null
slide: false
ignorePublish: false
---

## この記事で実現できること

- WSL が停止していても、Windows のタスクスケジューラから自動実行
- 最新のファイルは Windows のエクスプローラーからそのまま閲覧可能（ミラーリング）
- 過去の履歴は日付ごとの圧縮ファイルとして保存（権限情報も保持）
- 古いバックアップは自動削除で容量管理（保持日数を設定可能）

## システムの構成

- **ミラーリング**: 最新状態を Windows 側にコピー（閲覧用）
- **アーカイブ**: 日付ごとの圧縮ファイル（復元用、権限情報保持）

ミラーリングは NTFS の制約でパーミッション情報が保持されないため、完全な復元にはアーカイブを使用してください。

## 前提条件

- WSL2 がインストールされていること
- `rsync` がインストールされていること（Ubuntu には標準で含まれています）
  - インストールされていない場合: `sudo apt update && sudo apt install -y rsync`

## 手順

### 1. バックアップ先のパスを確認

Windows のユーザー名を確認（PowerShell で `$env:USERNAME` を実行）。

例：ユーザー名が `my_name` の場合

- Windows 側: `C:\Users\my_name\Documents\wsl_backup`
- WSL 側: `/mnt/c/Users/my_name/Documents/wsl_backup`

### 2. バックアップスクリプトの作成

WSL のターミナルで以下を実行：

```bash
nano ~/backup_script.sh
```

以下の内容をコピー＆ペーストし、**3 つの変数**（`SOURCE_DIR`、`DEST_ROOT`、`KEEP_DAYS`）を自分の環境に合わせて書き換えます：

```bash
#!/bin/bash

# 設定（自分の環境に合わせて書き換える）
SOURCE_DIR="/home/my_name/projects"
DEST_ROOT="/mnt/c/Users/my_name/Documents/wsl_backup"  # /mnt/c は環境により /c の場合もある
KEEP_DAYS=15  # 0 を指定すると削除しない

# 内部設定
TARGET_NAME=$(basename "$SOURCE_DIR")
PARENT_DIR=$(dirname "$SOURCE_DIR")
MIRROR_DEST="$DEST_ROOT/latest_mirror"
ARCHIVE_DEST="$DEST_ROOT/history_archive"

# パス確認
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory does not exist: $SOURCE_DIR"
    exit 1
fi

if [ ! -d "$(dirname "$DEST_ROOT")" ]; then
    echo "Error: Parent directory for backup does not exist: $(dirname "$DEST_ROOT")"
    exit 1
fi

mkdir -p "$MIRROR_DEST"
mkdir -p "$ARCHIVE_DEST"

set -e

# ミラーリング（閲覧用、NTFS ではパーミッション保持不可）
# -L: シンボリックリンクを実体としてコピー
# --modify-window=1: Windows ファイルシステムの時刻ズレを許容
rsync -rLtv --delete --modify-window=1 "${SOURCE_DIR}/" "$MIRROR_DEST"

# アーカイブ作成（復元用、パーミッション保持）
ARCHIVE_NAME="${TARGET_NAME}_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$ARCHIVE_DEST/$ARCHIVE_NAME" -C "$PARENT_DIR" "$TARGET_NAME"

# 古いアーカイブの削除
if [ "$KEEP_DAYS" -gt 0 ]; then
    # -mtime +N は「N+1日以上前」を意味するため KEEP_DAYS-1 を指定
    find "$ARCHIVE_DEST" -name "${TARGET_NAME}_*.tar.gz" -mtime +$((KEEP_DAYS-1)) -delete || true
fi

echo "Backup completed successfully!"
```

実行権限を付与：

```bash
chmod +x ~/backup_script.sh
```

テスト実行：

```bash
~/backup_script.sh
```

### 3. タスクスケジューラに登録

1. スタートメニューで「タスク スケジューラ」を検索して起動
2. 右側の「基本タスクの作成」をクリック
3. **基本タスクの作成ウィザード**:
   - **名前**: `WSL Backup` など任意の名前を入力
   - **説明**: （任意）「WSL のバックアップを自動実行」など
   - 「次へ」をクリック
4. **タスクのトリガー**:
   - 希望の頻度を選択（例: 「毎日」）
   - 「次へ」をクリック
5. **毎日**（例）:
   - **開始**: 希望の時刻を設定（例: 午前 3 時）
   - 「次へ」をクリック
6. **操作**:
   - 「プログラムの開始」を選択
   - 「次へ」をクリック
7. **プログラムの開始**:

   - **プログラム/スクリプト**: `wsl`
   - **引数の追加**:

     ```plaintext
     -d Ubuntu -u my_name -e /home/my_name/backup_script.sh
     ```

     - `-d Ubuntu`: ディストリビューション名（PowerShell で `wsl -l` を実行して確認）
     - `-u my_name`: WSL のユーザー名（`whoami` で確認可能）
     - `-e /home/my_name/backup_script.sh`: 実行するスクリプトのパス

   - 「次へ」をクリック

8. **完了**: 「完了」をクリック

## トラブルシューティング

### rsync error (code 23)

ファイル権限の問題です。所有者を統一してください：

```bash
sudo chown -R my_name:my_name /home/my_name/projects
```

### バックアップが実行されない

- タスクスケジューラの「履歴」タブでエラーを確認
- ディストリビューション名・ユーザー名・スクリプトパスを確認
- 「最上位の特権で実行する」にチェックを入れてみる

## バックアップの確認と復元

### 最新版の確認

```plaintext
C:\Users\my_name\Documents\wsl_backup\latest_mirror
```

### 過去の履歴

```plaintext
C:\Users\my_name\Documents\wsl_backup\history_archive
```

### 復元方法

WSL 内で実行：

```bash
# まずアーカイブファイルを確認
ls /mnt/c/Users/my_name/Documents/wsl_backup/history_archive/

# 確認後、適切なファイル名で復元
tar -xzf /mnt/c/Users/my_name/Documents/wsl_backup/history_archive/projects_YYYYMMDD_HHMMSS.tar.gz -C /home/my_name
```

**注意**: 既存ファイルは上書きされます。
