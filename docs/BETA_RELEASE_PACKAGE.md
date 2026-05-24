# ベータ公開用ファイルまとめ
最終更新: 2026-05-24

## 先に読むファイル

- `docs/BETA_CHECKLIST.md`: ベータ公開前の確認リスト
- `docs/RELEASE.md`: Vercel / Supabase / Stripe / Google Sheets の公開手順
- `docs/SECURITY.md`: 情報流出防止と本番前セキュリティ確認
- `docs/API_ENV_SETUP.md`: OpenAI APIキー投入前の注意
- `docs/BETA_COST_ESTIMATE.md`: 月額コストとAPI費用の目安

## Supabaseに適用するマイグレーション

`supabase/migrations` を番号順にすべて適用する。

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

## 今回追加した主要ファイル

- `supabase/migrations/017_billing_estimates_reminders_coupon_sheet.sql`
- `lib/actions/coupon-sheet.ts`
- `components/settings/coupon-sheet-manager.tsx`
- `components/settings/coupon-manager.tsx`
- `app/(app)/settings/coupons/page.tsx`
- `components/settings/billing-settings-form.tsx`
- `components/cases/practical-panels.tsx`
- `app/(app)/cases/[id]/estimates/[estimateId]/print/page.tsx`
- `components/cases/deadlines-panel.tsx`
- `components/agencies/agency-manager.tsx`

## 公開前コマンド

```bash
npm run lint
npm run build
npm audit --audit-level=high
```

今回の確認結果:

- `npm run lint`: 成功
- `npm run build`: 成功

## ベータ公開OK条件

- Supabaseに001から017まで適用済み
- Public signupを無効化済み
- `ALLOW_PUBLIC_SIGNUP=false`
- Storage bucketがprivate
- OpenAI / Stripe / Supabase service role keyをブラウザ公開変数に入れていない
- Googleシートのクーポン管理は一般公開せず、サービスアカウントだけに共有
- クーポンコード全文はDBに保存せず、ハッシュと表示用ヒントだけ保存
- 見積PDF、請求書PDF、領収書PDF、AIドラフト作成の基本動作を確認済み
