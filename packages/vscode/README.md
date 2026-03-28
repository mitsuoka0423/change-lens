# Change Lens

オープン中のPull Requestによる変更行をエディタ上でハイライト表示するVSCode拡張。

## インストール

### .vsixからインストール

```bash
code --install-extension change-lens-0.0.1.vsix
```

または、VSCodeのコマンドパレットから `Extensions: Install from VSIX...` を選択。

### ビルドしてインストール

```bash
cd packages/vscode
npm run package
code --install-extension change-lens-0.0.1.vsix
```

## 認証設定

以下のいずれかの方法でGitHub認証を設定してください:

1. **GitHub CLI（推奨）**: `gh auth login` でログイン
2. **環境変数**: `GITHUB_TOKEN` を設定

## 使い方

1. GitHubリポジトリのワークスペースを開く
2. ファイルを開くと、オープンPRで変更されている行が黄色くハイライトされる
3. ハイライト行にカーソルを合わせると、PR番号・タイトル・著者が表示される
4. ホバーポップアップの「Open PR」リンクからブラウザでPRを開ける

## コマンド

| コマンド | 説明 |
|---|---|
| `Change Lens: Refresh Highlights` | ハイライトを再取得・再描画 |
| `Change Lens: Open PR in Browser` | PRをブラウザで開く |

## 設定

| 設定 | 型 | デフォルト | 説明 |
|---|---|---|---|
| `changeLens.enabled` | boolean | `true` | ハイライト表示の有効/無効 |
| `changeLens.currentUser` | string | `""` | 自分のGitHubユーザー名（設定すると自分のPRを除外） |
