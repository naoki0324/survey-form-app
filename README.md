# アンケートフォーム Web アプリ

Next.js と Resend を使用したアンケートフォームアプリケーションです。フォームの回答内容を指定したメールアドレスに送信します。管理者メニューからフォーム項目を自由にカスタマイズできます。

## 機能

- レスポンシブ対応のアンケートフォーム
- 管理者メニューによるフォーム項目の動的管理（追加・編集・削除・並び替え）
- 日本語バリデーションメッセージ
- HTML形式のメール送信
- 送信完了画面の表示
- モダンでシンプルな白・クリーム色基調のUI

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **スタイリング**: CSS (カスタム)
- **メール送信**: Resend API
- **データ管理**: JSON設定ファイル

## 画面構成

| URL | 説明 |
|-----|------|
| `/` | アンケートフォーム |
| `/admin` | 管理者メニュー |

## 対応フィールドタイプ

| タイプ | 説明 |
|--------|------|
| text | テキスト入力 |
| email | メールアドレス入力 |
| select | ドロップダウン選択 |
| radio | ラジオボタン（単一選択） |
| checkbox | チェックボックス（複数選択） |
| textarea | テキストエリア（複数行） |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Resend APIキーの取得

1. [Resend](https://resend.com) でアカウントを作成
2. ダッシュボードの「API Keys」からAPIキーを発行

### 3. 1Password secret reference の設定

```bash
cp .env.op.example .env.op
```

`.env.op` を編集して、1Password の secret reference を設定:

```env
RESEND_API_KEY=op://Personal/Survey Form App/RESEND_API_KEY
TO_EMAIL=op://Personal/Survey Form App/TO_EMAIL
```

| 変数名 | 説明 |
|--------|------|
| `RESEND_API_KEY` | Resend APIキー |
| `TO_EMAIL` | アンケート結果の送信先メールアドレス |

`op://...` の取得には 1Password CLI (`op`) を利用します。ローカル開発では、平文の `.env.local` を作らずに `op run --env-file=.env.op -- ...` で起動してください。

### 4. 開発サーバーの起動

```bash
npm run dev:op
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 管理者メニューの使い方

1. http://localhost:3000/admin にアクセス
2. 「基本設定」でフォームのタイトル・サブタイトルを変更
3. 「フォーム項目」で項目の追加・編集・削除・並び替えが可能
4. 「設定を保存」ボタンをクリックして変更を反映
5. 保存成功時はポップアップで「設定を更新しました」と表示

### 項目の追加

1. 「+ 項目を追加」ボタンをクリック
2. ラベル、項目タイプ、必須/任意を設定
3. ドロップダウン・ラジオ・チェックボックスの場合は選択肢を追加
4. 「追加」ボタンをクリック

## 本番デプロイ

### ビルド

```bash
npm run build:op
npm run start:op
```

### Vercel へのデプロイ

1. [Vercel](https://vercel.com) にプロジェクトをインポート
2. 環境変数 (`RESEND_API_KEY`, `TO_EMAIL`) を設定
3. デプロイ

## ディレクトリ構成

```
survey-form-app/
├── app/
│   ├── admin/
│   │   └── page.tsx            # 管理者メニュー
│   ├── api/
│   │   ├── config/
│   │   │   └── route.ts        # 設定API (GET/PUT)
│   │   └── send/
│   │       └── route.ts        # メール送信API
│   ├── globals.css             # グローバルスタイル
│   ├── layout.tsx              # ルートレイアウト
│   └── page.tsx                # メインフォームコンポーネント
├── data/
│   └── survey-config.json      # フォーム設定ファイル
├── types/
│   └── survey.ts               # 型定義
├── .env.op.example             # 1Password secret reference のサンプル
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## カスタマイズ

### フォーム項目の変更

管理者メニュー (`/admin`) から GUI で変更できます。

または `data/survey-config.json` を直接編集することも可能です:

```json
{
  "title": "フォームタイトル",
  "subtitle": "サブタイトル",
  "fields": [
    {
      "id": "field_id",
      "type": "text",
      "label": "ラベル名",
      "required": true,
      "placeholder": "プレースホルダー"
    }
  ]
}
```

### メールテンプレートの変更

`app/api/send/route.ts` 内の以下を編集:

- `emailBody`: プレーンテキスト形式
- `emailHtml`: HTML形式

### スタイルの変更

`app/globals.css` でデザインをカスタマイズできます。

## 注意事項

- Resend の無料プランは月100通まで送信可能です
- 本番環境では独自ドメインを設定することを推奨します
- `from` アドレスを変更する場合は、Resend でドメイン認証が必要です
- Vercel等のサーバーレス環境では、JSONファイルへの書き込みが永続化されない場合があります。本番環境ではデータベースの使用を検討してください。
- Vercel などのホスティング環境では `.env.op` は使わず、各プラットフォームの環境変数設定に `RESEND_API_KEY` と `TO_EMAIL` を直接登録してください。

## ライセンス

MIT
