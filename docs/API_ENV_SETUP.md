# APIキー投入前チェック

最終更新: 2026-05-24

## 入れる順番

1. Supabase本番プロジェクトを作る
2. マイグレーション001〜016を適用
3. VercelへSupabase公開キーとservice role keyを設定
4. Stripe本番商品・価格を作る
5. VercelへStripe secret keyとprice idを設定
6. Stripe webhookを作り、`STRIPE_WEBHOOK_SECRET` をVercelへ設定
7. OpenAI APIキーを作る
8. Vercelへ `OPENAI_API_KEY` と `OPENAI_MODEL` を設定
9. `npm run release:check`
10. 本番URLで手動テスト

## OpenAI

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini
```

注意:

- `OPENAI_API_KEY` は絶対に `NEXT_PUBLIC_` を付けない
- OpenAI側で月額利用上限を設定する
- ベータ初期は `gpt-5-mini` を推奨。コストをさらに抑える場合は `gpt-4.1-mini`

## Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

注意:

- anon keyは公開前提。ただしRLSが必須
- service role keyはサーバー専用
- service role key漏洩時は即ローテーション

## Stripe

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_OFFICE_MONTHLY=price_...
STRIPE_PRICE_OFFICE_YEARLY=price_...
```

注意:

- テストキーと本番キーを混ぜない
- price idはプラン名・月額/年額と一致させる
- 年額は11か月分で作る

## クーポン

```env
COUPON_CODE_SALT=random-long-secret
```

注意:

- 一度本番で使い始めたら変更しない
- 変更すると既存クーポンコード照合ができなくなる
- 漏洩時は全クーポンを再発行する

## Vercel設定

- Production / Preview / Development でキーを分ける
- ProductionキーをPreviewへ入れない
- Deployment Protectionを有効化
- Spending Limitを設定
- Logsに個人情報やAPIレスポンス全文を出さない

## 最後の確認

```bash
npm run release:check
```

さらに本番URLで以下を確認:

- ログイン
- 顧客作成
- 案件作成
- 添付アップロード
- AIドラフト
- Stripe checkout
- 領収書PDF
- クーポン適用
- 別ユーザーのデータ非表示
