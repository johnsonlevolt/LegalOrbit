# ベータリリース手順
最終更新: 2026-05-24

## 1. 推奨構成

知り合い数人だけのベータなら、最初は無料枠でも公開可能。顧客情報を本格的に預かる、外部ユーザーが増える、障害時の復旧性を上げる段階で Vercel Pro / Supabase Pro を検討する。

- Frontend/API: Vercel
- DB/Auth/Storage: Supabase
- 決済: Stripe
- AI: OpenAI API
- クーポン原本: Google Sheets

## 2. Supabase

SQL Editorで `supabase/migrations` を番号順に実行する。

```text
001_initial_schema.sql
002_templates.sql
003_harden_user_isolation.sql
004_document_drafts.sql
005_practical_operations.sql
006_automation_extensions.sql
007_release_security_hardening.sql
008_customer_address_columns.sql
009_assignee_settings.sql
010_billing_subscription.sql
011_document_template_input_fields.sql
012_stripe_coupons.sql
013_practical_case_workflow.sql
014_client_portal_review_and_reuse.sql
015_file_auto_classification.sql
016_coupon_referrals.sql
017_billing_estimates_reminders_coupon_sheet.sql
```

設定:

- Auth > Providers > Email の公開サインアップを無効化
- Auth > URL Configuration の Site URL を本番URLに設定
- Redirect URLs に本番URLと必要なプレビューURLだけを登録
- Storage に `case-documents` bucket を作成し、privateにする

## 3. Vercel環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.example
NEXT_PUBLIC_RELEASE_STAGE=beta
ALLOW_PUBLIC_SIGNUP=false

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5-mini

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_OFFICE_MONTHLY=price_xxx
STRIPE_PRICE_OFFICE_YEARLY=price_xxx

COUPON_CODE_SALT=random-long-secret
```

禁止:

- `SUPABASE_SERVICE_ROLE_KEY` を `NEXT_PUBLIC_` にしない
- `OPENAI_API_KEY` を `NEXT_PUBLIC_` にしない
- `STRIPE_SECRET_KEY` を `NEXT_PUBLIC_` にしない
- `.env.local` をGitHub等に上げない

## 4. Stripe

Stripeで月額・年額のPriceを作成する。年額は11か月分にして、1か月分お得にする。

- Starter 月額
- Starter 年額
- Pro 月額
- Pro 年額
- Office 月額
- Office 年額

運用ルール:

- 年額契約は更新日まで利用可能
- 途中アップグレードは可能
- 途中ダウングレードは不可。次回更新時から変更
- 領収書はアプリ内で自動作成し、PDFダウンロード

Webhook:

- Endpoint: `https://your-domain.example/api/stripe/webhook`
- Events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

## 5. Googleシートクーポン管理

認証方式はサービスアカウント方式。Googleシートを一般公開せず、サービスアカウントのメールだけに閲覧権限を付ける。

シート列:

```text
code, label, campaign_type, referrer_name, referrer_email, plan_name, discount_type, discount_value, free_until, expires_at, max_redemptions, stripe_coupon_id, status, note
```

推奨初期コード:

- `EARLY100`: 初期ユーザー限定、Starter 1か月無料
- `FRIEND50`: 知人紹介、Starter 1か月無料

紹介者を追跡するため、`referrer_name` と `referrer_email` を必ず入力する。

## 6. 公開前コマンド

```bash
npm run lint
npm run build
npm audit --audit-level=high
```

今回の確認結果:

- `npm run lint`: 成功
- `npm run build`: 成功

## 7. 手動テスト

- 管理者が作成したユーザーだけログインできる
- `/register` から自由登録できない
- 顧客登録、編集、削除
- 案件登録、編集、削除
- 案件詳細のタブ切替でページ先頭に戻らない
- 添付書類チェック、AIドラフト作成
- Word / Excel / PDFテンプレートダウンロード
- 見積PDF、請求書PDF、領収書PDF
- Googleシートからクーポン同期
- 別ユーザーから他人のデータが見えない

## 8. 公開NG条件

- service role keyがブラウザに出ている
- OpenAI APIキーがブラウザに出ている
- Public signupが有効
- Storage bucketがpublic
- RLS未設定テーブルが主要データを保持している
- Stripe webhookが失敗して課金状態や領収書が同期されない
