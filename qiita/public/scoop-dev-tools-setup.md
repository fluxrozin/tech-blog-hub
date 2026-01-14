---
title: WindowsでScoopを使って開発環境（GitとNode.jsなど）をまとめて管理する方法
tags:
  - Windows
  - Git
  - Node.js
  - 環境構築
  - Scoop
private: false
updated_at: '2026-01-14T12:30:56+09:00'
id: 19b41bbf32e7cc727c48
organization_url_name: null
slide: false
ignorePublish: false
---

## はじめに

Windows で開発ツールを入れるとき、公式サイトからインストーラーをダウンロードして個別に入れるのは面倒ですよね。パッケージマネージャーを使えば、コマンド一つでインストールや管理が楽になります。

この記事では、Windows 向けのパッケージマネージャー「Scoop」の使い方と、他の選択肢との違いについて書いています。

## Scoop とは

Scoop は Windows 向けのコマンドライン型パッケージマネージャーで、開発者の間で人気があります。軽量でクリーンなのが特徴です。

## Scoop の特徴

Scoop の良いところは、管理者権限が不要なことです。ユーザーフォルダ内（`C:\Users\ユーザー名\scoop`）にインストールされるので、システム全体を汚しません。セキュリティ的にも安心です。

パス設定も自動でやってくれるので、インストールしたツールはすぐに使えます。nvm のようにバージョン切り替えもできるので、複数のバージョンを入れてプロジェクトごとに使い分けられます。詳しくは後で説明します。

## インストール方法

インストールは PowerShell で実行します。管理者権限は不要です。

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

完了したら`scoop --version`で確認できます。

## 基本的な使い方

```powershell
scoop install git
scoop install nodejs
```

Go や Python などのプログラミング言語もインストールできます。

```powershell
scoop install go
scoop install python
```

初期状態では基本的なツールしか入れられないので、もっと色々入れたい場合はバケット（拡張リポジトリ）を追加します。

```powershell
# 古いバージョンを入れるために必要
scoop bucket add versions

# ChromeやVS Code、FirefoxなどのGUIアプリを入れるために必要
scoop bucket add extras
```

### よく使うコマンド

```powershell
scoop list              # インストール済み一覧
scoop update git        # パッケージを更新
scoop update *          # 全部更新
scoop uninstall git     # アンインストール
scoop search nodejs     # 検索
scoop reset nodejs14    # バージョン切り替え（複数バージョンインストール済みの場合）
```

## バージョン切り替え

バージョン切り替えは実際の開発現場でよく使います。例えば、古いプロジェクトが Node.js v14 で動いていて、新しいプロジェクトでは v20 を使いたい、みたいな状況です。

Scoop なら複数のバージョンを共存させて、コマンド一つで切り替えられます。

```powershell
# 古いバージョン用のバケットを追加
scoop bucket add versions

# 必要なバージョンを全部入れる
scoop install nodejs14    # プロジェクトA用
scoop install nodejs-lts  # プロジェクトB用（LTS版、時期によってバージョンが変わる）

# プロジェクトAの作業をする時
scoop reset nodejs14
# node -v すると v14 になる

# プロジェクトBの作業に戻る時
scoop reset nodejs-lts
# node -v すると v20 に戻る
```

`versions`バケットは古いバージョンのパッケージを提供する拡張バケットです。これを追加すると、`nodejs18`や`nodejs16`などの特定バージョンも入れられるようになります。

## おすすめのツール

便利だと思うツールをいくつか紹介します。

**sudo (gsudo)** - Windows には sudo がないので、これで補完できます。管理者権限が必要なコマンドを、PowerShell を開き直さずに実行できるので便利です。

**curl & wget** - ファイルダウンロードや API を叩くときに使います。Linux ユーザーには馴染みがあると思いますが、Windows でも同じ感覚で使えます。

**jq** - JSON を見やすく整形したり、値を抽出したりするツールです。API のレスポンスがぐちゃぐちゃな JSON でも、これで綺麗に表示できます。

**ripgrep (rg)** - grep の超高速版です。大量のソースコードから特定の文字列を一瞬で検索できます。VS Code の検索機能の裏側でも使われているほど優秀です。

**touch** - 空のファイルを作る Linux コマンドです。`New-Item ...`と打つのが面倒なときに、`touch memo.txt`で一発で作れます。

これらをまとめてインストールする場合は、以下のコマンドで一括インストールできます。

```powershell
scoop install sudo curl wget jq ripgrep touch
```

## 他のパッケージマネージャーとの比較

Windows で使えるパッケージマネージャーは主に 3 つあります。それぞれ特徴が違うので、用途に応じて選ぶのが良いと思います。

### Winget

Winget は Windows 10/11 に標準搭載されているので、追加インストール不要で手軽です。ただ機能が限定的で、インストーラー任せのためマイナーなツールはパスが通らないことがあります（Git/Node.js は問題なし）。

### Chocolatey

Chocolatey は Windows の老舗パッケージマネージャーで、最も歴史が長くパッケージ数も豊富です。Chrome や Office など幅広いソフトを管理でき、GUI アプリも普通に入ります。

システム全体管理が得意ですが、管理者権限がほぼ必須です。システム全体（C:\ProgramData など）に書き込むため、セキュリティが厳格な環境では使いにくいかもしれません。

また、通常のインストーラーをサイレント実行しているだけなので、アンインストールしてもゴミファイル（レジストリや設定ファイル）が残りやすいです。インストール先もソフトによってバラバラで管理しづらいです。

### Scoop

Scoop は軽量・クリーンで開発者向けです。管理者権限不要で、アンインストールもフォルダを消すだけなので簡単です。バージョン切り替えも容易です。

一方で、GUI アプリとの連携が弱く、デスクトップショートカットやファイル関連付けが自動では行われません。初期状態ではインストールできるソフトが少ないので、`scoop bucket add extras`が必要です。全ユーザーでの共有は苦手です。

## どれを使うべきか

どれを使うべきかは、用途次第です。

Git や Node.js の開発環境を整えるなら、Scoop 一択だと思います。開発ツールはバージョンアップ・ダウンが頻繁なので、バージョン切り替えが簡単なのが重要です。開発環境が壊れたときも、フォルダ削除だけで初期化できるのが楽です。

### Scoop が向いている人

Node.js、Python、Git などの開発ツールをメインに入れたい人や、PC 環境を汚したくない人、プロジェクトごとにバージョンを変える必要がある人には Scoop が向いています。

### Chocolatey が向いている人

Office や Chrome、Adobe 製品など、システム全体に入れる重めのソフトもコマンドで管理したい人や、複数の PC を一括管理したいシステム管理者には Chocolatey が向いています。

### Winget が向いている人

手っ取り早く済ませたい人や、Microsoft Store アプリも管理したい人には Winget が良いでしょう。

### 実際の使い分け

実際の使い分けとしては、Node.js、Python、Go、Git、ffmpeg、テキストエディタなど、開発者が使うツールでバージョン切り替えを頻繁に行うものは Scoop で入れます。Google Chrome、Docker Desktop、Office など、OS と深く連携する重めのソフトは Winget か普通のインストーラーで入れます。

まずは PowerShell で`winget`と入力して、使えるかどうか確認するのが早いです。使える場合はまず Winget で試してみて、より細かい管理が必要になったら Scoop や Chocolatey を検討するのが良いと思います。

## まとめ

Scoop は Windows で開発ツールを管理するのに便利です。管理者権限不要でクリーンな環境を保てるので、Git や Node.js などの開発ツールを簡単にインストール・管理できます。興味があれば試してみてください。
