# アンケートフォーム Web アプリ

Next.js と Resend を使用したアンケートフォームアプリケーションです。フォームの回答内容を指定したメールアドレスに送信します。

## 機能

- レスポンシブ対応のアンケートフォーム
- リアルタイムバリデーション
- HTML形式のメール送信
- 送信完了画面の表示

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **スタイリング**: CSS (カスタム)
- **メール送信**: Resend API

## フォーム項目

| 項目 | 種類 | 必須 |
|------|------|------|
| お名前 | テキスト入力 | ○ |
| メールアドレス | メール入力 | ○ |
| 年齢層 | ドロップダウン | - |
| 総合満足度 | ラジオボタン (5段階) | ○ |
| 良かった点 | チェックボックス (複数選択) | - |
| 改善してほしい点 | テキストエリア | - |
| 友人・知人への推薦 | ラジオボタン (4段階) | ○ |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Resend APIキーの取得

1. [Resend](https://resend.com) でアカウントを作成
2. ダッシュボードの「API Keys」からAPIキーを発行

### 3. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して以下を設定:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TO_EMAIL=your-email@example.com
```

| 変数名 | 説明 |
|--------|------|
| `RESEND_API_KEY` | Resend APIキー |
| `TO_EMAIL` | アンケート結果の送信先メールアドレス |

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 本番デプロイ

### ビルド

```bash
npm run build
npm start
```

### Vercel へのデプロイ

1. [Vercel](https://vercel.com) にプロジェクトをインポート
2. 環境変数 (`RESEND_API_KEY`, `TO_EMAIL`) を設定
3. デプロイ

## ディレクトリ構成

```
survey-form-app/
├── app/
│   ├── api/
│   │   └── send/
│   │       └── route.ts    # メール送信APIエンドポイント
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # メインフォームコンポーネント
├── .env.local.example      # 環境変数サンプル
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## カスタマイズ

### フォーム項目の変更

`app/page.tsx` 内の以下を編集:

- `FormData` インターフェース: フォームデータの型定義
- `initialFormData`: 初期値
- フォームのJSX: 入力フィールド

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

## ライセンス

MIT
