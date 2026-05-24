# Legal Orbit 行政書士

行政書士向けの顧客管理、案件管理、書類チェック、AI書類作成、PDF/Word/Excel出力を扱うWebアプリです。

## ブランド

- 親ブランド: Legal Orbit
- 現在の公開名: Legal Orbit 行政書士
- 将来展開: Legal Orbit 社労士、Legal Orbit 司法書士

## 主な機能

- Supabase Authによる認証
- 管理者が作成したアカウントのみログイン可能
- 顧客管理
- 案件管理
- 車両、営業所、車庫、人員管理
- 添付書類チェック
- 書類テンプレート
- AI書類ドラフト作成
- AI抽出情報の案件反映
- Word / Excel / PDF出力
- PDF帳票転記
- タスク管理
- 期限通知
- 監査ログ
- Stripe課金、領収書、クーポン管理

## 技術構成

- Next.js 15 App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth / PostgreSQL / Storage
- OpenAI API
- Stripe
- pdf-lib / docx / exceljs

## 開発

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.example
NEXT_PUBLIC_RELEASE_STAGE=beta
ALLOW_PUBLIC_SIGNUP=false

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5-mini

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_OFFICE_MONTHLY=price_xxx
STRIPE_PRICE_OFFICE_YEARLY=price_xxx

COUPON_CODE_SALT=random-long-secret
```

## Supabase

`supabase/migrations` のSQLを番号順にすべて適用してください。

Storage bucket は `case-documents` を使います。必ず private bucket として運用してください。

## 検証

```bash
npm run release:check
```

## ベータ公開

まず [docs/BETA_RELEASE_PACKAGE.md](docs/BETA_RELEASE_PACKAGE.md) を確認してください。

- 公開手順: [docs/RELEASE.md](docs/RELEASE.md)
- セキュリティ: [docs/SECURITY.md](docs/SECURITY.md)
- APIキー投入: [docs/API_ENV_SETUP.md](docs/API_ENV_SETUP.md)
- 料金目安: [docs/BETA_COST_ESTIMATE.md](docs/BETA_COST_ESTIMATE.md)
- チェックリスト: [docs/BETA_CHECKLIST.md](docs/BETA_CHECKLIST.md)

## AI利用上の注意

AI出力は最終成果物ではありません。必ず人間が確認し、必要に応じて手動編集してから「確認済み」としてください。

添付資料には個人情報・法人情報が含まれる可能性があります。AI解析前に利用者が確認する導線を入れています。
