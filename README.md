# 配信アナライザー

YouTubeライブ配信をAIで自動分析し、**要約・ハイライト抽出・サムネイル生成**を行うWebアプリケーション。

## 🎯 主な機能

- **AI分析**: OpenAI GPT-4oで動画の要約とハイライトシーンを自動抽出
- **サムネイル生成**: Google Geminiで魅力的なサムネイル案を複数生成
- **キャラクター対応**: VTuberやキャラクター画像をアップロードしてサムネイルに反映
- **履歴管理**: 過去の分析結果を保存・閲覧
- **リアルタイム進捗**: SSE（Server-Sent Events）で分析進捗をリアルタイム表示

## 🏗️ 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- TanStack Query（React Query）
- wouter（ルーティング）

### バックエンド
- Vercel Serverless Functions
- Supabase PostgreSQL
- Drizzle ORM
- OpenAI GPT-4o
- Google Gemini

## 📦 セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd v3_Youtubeサマライザー
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、必要な値を設定してください。

```bash
cp .env.example .env
```

```.env
# Supabase PostgreSQL（Transaction Pooler接続）
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# サイトパスワード
SITE_PASSWORD=your-secret-password

# OpenAI APIキー
OPENAI_API_KEY=sk-...

# Google Gemini APIキー
GEMINI_API_KEY=AIza...

# YouTube Data API v3キー
YOUTUBE_API_KEY=AIza...
```

### 4. データベースのセットアップ

Supabaseでプロジェクトを作成し、以下のコマンドでスキーマをプッシュします。

```bash
npm run db:push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

## 🚀 Vercelへのデプロイ

### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

### 2. Vercelにログイン

```bash
vercel login
```

### 3. プロジェクトのデプロイ

```bash
vercel
```

### 4. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定してください：

- `DATABASE_URL`: Supabase PostgreSQL接続URL（Transaction Pooler）
- `SITE_PASSWORD`: サイトアクセス用パスワード
- `OPENAI_API_KEY`: OpenAI APIキー
- `GEMINI_API_KEY`: Google Gemini APIキー
- `YOUTUBE_API_KEY`: YouTube Data API v3キー

### 5. 本番デプロイ

```bash
vercel --prod
```

## 📝 使い方

1. **ログイン**: 設定したパスワードでログイン
2. **YouTube URLを入力**: 分析したい動画のURLを入力
3. **キャラクター画像をアップロード**（任意）: サムネイルに使用する画像を追加
4. **画像生成モデルを選択**: Nano Banana（高速）またはNano Banana Pro（高品質）
5. **分析開始**: ボタンをクリックして分析を開始
6. **結果確認**: 要約、ハイライト、サムネイル案を確認
7. **履歴管理**: 過去の分析結果を履歴ページで閲覧・削除

## 🗂️ プロジェクト構造

```
├── api/                         # Vercel Serverless Functions
│   ├── verify-password.ts       # 認証API
│   ├── analyze.ts               # 分析API（SSE対応）
│   ├── history/
│   │   ├── index.ts             # 履歴一覧API
│   │   └── [id].ts              # 履歴詳細・削除API
│   └── _lib/                    # 共有ユーティリティ
│       ├── db.ts                # Supabase接続
│       ├── storage.ts           # DB操作
│       └── youtube-analyzer.ts  # 分析ロジック
├── client/                      # フロントエンド
│   ├── src/
│   │   ├── components/ui/       # shadcn/uiコンポーネント
│   │   ├── pages/               # ページコンポーネント
│   │   ├── lib/                 # ユーティリティ
│   │   ├── App.tsx              # ルーティング
│   │   └── main.tsx             # エントリーポイント
│   └── index.html
├── db/                          # データベーススキーマ
│   └── schema.ts
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── vercel.json                  # Vercel設定
```

## ⚙️ 利用可能なコマンド

- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run build:vercel`: Vercelデプロイ用ビルド
- `npm run preview`: ビルド結果のプレビュー
- `npm run db:push`: データベーススキーマのプッシュ
- `npm run db:studio`: Drizzle Studioの起動

## 🔒 セキュリティ

- パスワード認証でアクセス制限
- セッションストレージで認証状態を管理
- Supabase PostgreSQLでデータを安全に保存
- 環境変数で機密情報を管理

## 📄 ライセンス

MIT

## 🤝 貢献

プルリクエストを歓迎します！

## 📧 お問い合わせ

質問や問題がある場合は、Issueを作成してください。
# youtubesama3
# youtubesama3
# youtubesama3
# youtubesama3
