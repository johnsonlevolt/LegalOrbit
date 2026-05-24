# ベータ公開チェックリスト
最終更新: 2026-05-24

## 結論

知り合い数人に触ってもらうベータ公開は可能。ただし、Supabaseに全マイグレーションを適用し、公開サインアップを止め、APIキーをサーバー側だけに置いてから公開する。

## 必須

- [ ] `supabase/migrations/001_initial_schema.sql` から `017_billing_estimates_reminders_coupon_sheet.sql` まで適用
- [ ] Supabase Auth の公開サインアップを無効化
- [ ] `ALLOW_PUBLIC_SIGNUP=false`
- [ ] ユーザー作成は Supabase Dashboard の Authentication > Users から管理者だけが行う
- [ ] Site URL / Redirect URL を本番URLに設定
- [ ] Storage bucket `case-documents` をprivateにする
- [ ] 主要テーブルのRLSが有効
- [ ] 別ユーザーでログインし、顧客・案件・添付・ドラフト・請求・クーポンログが見えないことを確認
- [ ] Stripe webhook endpoint を `/api/stripe/webhook` に設定
- [ ] OpenAI APIキーをVercelのserver-side環境変数だけに登録
- [ ] Googleシートは一般公開せず、サービスアカウントだけに共有
- [ ] `npm run lint` を通す
- [ ] `npm run build` を通す

## API投入前チェック

- [ ] `OPENAI_API_KEY` は `NEXT_PUBLIC_` を付けない
- [ ] AI処理前に「書類をAI解析に送る」同意を画面または利用規約で明記
- [ ] AI出力は最終成果物ではなく、必ず人が確認する運用にする
- [ ] 1ユーザーあたりのAI利用回数制限をプラン別に決める

## ベータで許容する残リスク

- AI抽出は誤る可能性があるため、正式書類として提出する前に専門家確認が必要
- OCR専用エンジンではないため、低画質スキャンの精度は落ちる
- メール送信は未実装。領収書・見積書・請求書はアプリ内PDFダウンロード運用
- 本番監視は未導入。ベータ中は不具合報告を手動で受ける

## ベータユーザーへの説明

- ベータ期間中は機能や画面が変わる
- AIが作成した内容は必ず人が確認する
- 重要書類や個人情報をアップロードする前に利用規約・プライバシーポリシーを確認する
- 不具合報告では、画面URL、操作内容、発生時刻、スクリーンショットを送ってもらう

## 公開OK条件

- `npm run lint`: 成功
- `npm run build`: 成功
- Supabaseマイグレーション完了
- RLS確認完了
- 第三者アカウントから他人のデータが見えない
- Stripeテスト決済または本番少額決済が成功
- AIドラフト作成と添付ファイル解析が成功

## 公開NG条件

- service role keyがブラウザに出ている
- OpenAI APIキーがブラウザに出ている
- Public signupが有効
- Storage bucketがpublic
- RLS未設定テーブルが主要データを保持している
- Stripe webhookが失敗して課金状態や領収書が同期されない
