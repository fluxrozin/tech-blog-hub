---
title: Windows 側から WSL のディレクトリをバックアップする方法（PowerShell版）
tags:
  - Windows
  - PowerShell
  - backup
  - WSL
private: false
updated_at: '2026-01-21T11:13:11+09:00'
id: cfe2f027263d7fa10cd0
organization_url_name: null
slide: false
ignorePublish: false
---

## この記事で実現できること

[以前の記事](https://qiita.com/fluxrozin/items/8df9f65832635bb556e1)でWSLのディレクトリをWindows側へWSLのrsyncを使ってバックアップする方法を書いたけれど、とても遅い方法でした。なので改良版としてホスト側(Windows側)からバックアップをする方法を記載します。

- **WSL 内で実行するよりも高速データ転送可能**（最大の特徴）
  - Windows 側から PowerShell スクリプトで実行（WSL 内のスクリプト不要）
- WSL が停止していても、Windows のタスクスケジューラから自動定期実行可能

## システムの構成

- **ミラーリング**: 最新状態を Windows 側にコピー（閲覧用）
  - `robocopy` を使用して高速にミラーリング
  - 最新のファイルは Windows のエクスプローラーからそのまま閲覧可能
  - `.mirrorignore` で除外パターンを指定可能（アーカイブには影響しない）
- **アーカイブ**: 日付ごとの圧縮ファイル（復元用、権限情報保持）
  - WSL 内で `tar` コマンドを実行して作成
  - 過去の履歴は日付ごとの圧縮ファイルとして保存（権限情報も保持）
  - 古いバックアップは自動削除で容量管理（保持日数を設定可能）

ミラーリングは NTFS の制約でパーミッション情報が保持されないため、完全な復元にはアーカイブを使用してください。

## 前提条件

- WSL2 がインストールされていること
- PowerShell 5.1 以上（Windows 10/11 には標準で含まれています）
- WSL ディストリビューションが起動可能な状態であること

## 手順

### 1. バックアップスクリプトの作成

PowerShell でバックアップスクリプトを作成します。任意の場所に任意のファイル名（例: `backup-wsl.ps1`）でファイルを作成してください。

```powershell:backup-wsl.ps1
# ============================================================================
# 設定
# ============================================================================

$Config = @{
    WslDistro  = "Ubuntu"
    SourceDir  = "/home/my_name/projects"
    DestRoot   = "C:\Users\my_name\Documents\wsl_backup"
    KeepDays   = 15  # 0で無制限
}

# ============================================================================
# 初期化
# ============================================================================

$Timestamp   = Get-Date -Format "yyyyMMdd_HHmmss"
$TargetName  = $Config.SourceDir -replace '.*/', ''
$ParentDir   = $Config.SourceDir -replace '/[^/]+$', ''
if (-not $ParentDir) { $ParentDir = '/' }

$MirrorDest  = Join-Path $Config.DestRoot "mirror"
$ArchiveDest = Join-Path $Config.DestRoot "archive"
$WslSource   = "\\wsl.localhost\$($Config.WslDistro)" + ($Config.SourceDir -replace '/', '\')

# ============================================================================
# メイン処理
# ============================================================================

Write-Host "WSL Backup: $($Config.SourceDir) -> $($Config.DestRoot)"

# 前提条件チェック
if (-not (Test-Path $WslSource)) {
    Write-Host "ERROR: Source not found: $WslSource" -ForegroundColor Red
    Write-Host "  WSL is running? -> wsl -d $($Config.WslDistro)" -ForegroundColor Yellow
    exit 1
}

# ディレクトリ作成
New-Item -ItemType Directory -Force -Path $MirrorDest | Out-Null
New-Item -ItemType Directory -Force -Path $ArchiveDest | Out-Null

# [1] ミラーリング
Write-Host "[1/3] Mirroring..." -ForegroundColor Cyan

# .mirrorignoreから除外パターン読み込み
$ignoreFile = Join-Path $PSScriptRoot ".mirrorignore"
$excludeDirs = @()
$excludeFiles = @()
if (Test-Path $ignoreFile) {
    Get-Content $ignoreFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            if ($line.EndsWith("/")) {
                $excludeDirs += $line.TrimEnd("/")
            } else {
                $excludeFiles += $line
            }
        }
    }
}

$robocopyArgs = @($WslSource, $MirrorDest, "/MIR", "/R:1", "/W:0", "/MT", "/NP", "/NFL", "/NDL", "/NJH", "/NJS")
if ($excludeDirs.Count -gt 0) {
    $robocopyArgs += "/XD"
    $robocopyArgs += $excludeDirs
}
if ($excludeFiles.Count -gt 0) {
    $robocopyArgs += "/XF"
    $robocopyArgs += $excludeFiles
}

$result = Start-Process -FilePath "robocopy" -ArgumentList $robocopyArgs -NoNewWindow -PassThru -Wait

if ($result.ExitCode -lt 8) {
    Write-Host "  OK (exit=$($result.ExitCode))" -ForegroundColor Green
} else {
    Write-Host "  WARNING: exit=$($result.ExitCode)" -ForegroundColor Yellow
}

# [2] アーカイブ作成
Write-Host "[2/3] Creating archive..." -ForegroundColor Cyan
$archiveName = "${TargetName}_$Timestamp.tar.gz"
$archivePath = Join-Path $ArchiveDest $archiveName
$archivePathWsl = "/mnt/" + $archivePath.Substring(0,1).ToLower() + ($archivePath.Substring(2) -replace '\\', '/')

$tarCmd = "tar -czf '$archivePathWsl' --ignore-failed-read -C '$ParentDir' '$TargetName' 2>/dev/null"
wsl -d $Config.WslDistro -e bash -c $tarCmd

if (Test-Path $archivePath) {
    $size = (Get-Item $archivePath).Length / 1MB
    Write-Host "  OK: $archiveName ($("{0:N1}" -f $size) MB)" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Archive not created" -ForegroundColor Red
}

# [3] 古いアーカイブ削除
Write-Host "[3/3] Cleanup..." -ForegroundColor Cyan
if ($Config.KeepDays -gt 0) {
    $cutoff = (Get-Date).AddDays(-$Config.KeepDays)
    $old = Get-ChildItem $ArchiveDest -Filter "*.tar.gz" | Where-Object { $_.LastWriteTime -lt $cutoff }
    $count = ($old | Measure-Object).Count
    $old | Remove-Item -Force
    Write-Host "  Deleted $count old archive(s)" -ForegroundColor Green
} else {
    Write-Host "  Skipped (KeepDays=0)" -ForegroundColor Gray
}

Write-Host "Done." -ForegroundColor Green
```

### 2. 設定のカスタマイズ

スクリプト内の `$Config` ハッシュテーブルを自分の環境に合わせて書き換えます：

- **`WslDistro`**: WSL ディストリビューション名（PowerShell で `wsl -l` を実行して確認）
- **`SourceDir`**: バックアップしたい WSL 内のディレクトリパス
- **`DestRoot`**: バックアップ先の Windows 側のディレクトリパス
- **`KeepDays`**: アーカイブを保持する日数（0 を指定すると削除しない）

### 3. 除外パターンの設定（オプション）

スクリプトと同じディレクトリに `.mirrorignore` ファイルを作成することで、ミラーリング時に除外するファイルやディレクトリを指定できます。

例：

```txt:.mirrorignore
# ミラーリング除外パターン
# ディレクトリは末尾に / をつける
# ファイルはワイルドカード使用可能 (*.tmp など)

# Python
.venv/
__pycache__/
*.pyc

# Node.js
node_modules/

# Git
.git/

# その他
*.tmp

# ロックされる可能性のあるファイル
*.db
*.db-journal
*.db-wal
*.db-shm
```

### 4. テスト実行

PowerShell でスクリプトを実行して動作を確認します：

```powershell
.\backup-wsl.ps1  # 実際のファイル名に置き換えてください
```

初回実行時、スクリプトの実行ポリシーでエラーが出る場合は、以下のコマンドで実行ポリシーを変更してください。

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 5. タスクスケジューラに登録

1. スタートメニューで「タスク スケジューラ」を検索して起動
2. 右側の「基本タスクの作成」をクリック
3. **基本タスクの作成ウィザード**:
   - **名前**: `WSL Backup` など任意の名前を入力
   - **説明**: （任意）「WSL のバックアップを自動実行」など
   - 「次へ」をクリック
4. **タスクのトリガー**:
   - 希望の頻度を選択（例: 「毎日」「毎週」「毎月」など）
   - 「次へ」をクリック
5. **毎日**（例）:
   - **開始**: 希望の時刻を設定（例: 午前 3 時）
   - **間隔**: 実行間隔を設定（例: 1 日ごと）
   - 「次へ」をクリック
6. **操作**:
   - 「プログラムの開始」を選択
   - 「次へ」をクリック
7. **プログラムの開始**:
   - **プログラム/スクリプト**: `powershell.exe`
   - **引数の追加**:

     ```txt
     -ExecutionPolicy Bypass -File "C:\path\to\backup-wsl.ps1"
     ```

     - パスとファイル名は実際のスクリプトの場所とファイル名に置き換えてください
   - 「次へ」をクリック
8. **完了**: 「完了」をクリック

## トラブルシューティング

### ERROR: Source not found

WSL が起動していない可能性があります。以下のコマンドで WSL を起動してください：

```powershell
wsl -d Ubuntu
```

または、タスクスケジューラの「条件」タブで「コンピューターが AC 電源に接続されている場合のみタスクを実行する」のチェックを外し、「タスクを実行するためにコンピューターを起動する」にチェックを入れてみてください。

### robocopy の終了コードについて

robocopy の終了コードは以下の通りです：

- **0-7**: 正常終了（コピーが成功）
- **8 以上**: エラー

スクリプトでは終了コード 8 未満を正常とみなしています。エラーが発生した場合は、タスクスケジューラの「履歴」タブで詳細を確認してください。

### アーカイブが作成されない

- WSL ディストリビューション名が正しいか確認（`wsl -l` で確認）
- バックアップ先ディレクトリへの書き込み権限があるか確認
- WSL 内で `tar` コマンドが利用可能か確認

## バックアップの確認と復元

### 最新版の確認

```plaintext
C:\Users\my_name\Documents\wsl_backup\mirror
```

### 過去の履歴

```plaintext
C:\Users\my_name\Documents\wsl_backup\archive
```

### 復元方法

WSL 内で実行：

```bash
# まずアーカイブファイルを確認
ls /mnt/c/Users/my_name/Documents/wsl_backup/archive/

# 確認後、適切なファイル名で復元
tar -xzf /mnt/c/Users/my_name/Documents/wsl_backup/archive/projects_YYYYMMDD_HHMMSS.tar.gz -C /home/my_name
```

**注意**: 既存ファイルは上書きされます。
