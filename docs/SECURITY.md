# セキュリティ最終チェック

最終更新: 2026-05-24

## 結論

現状はベータ公開前提のセキュリティ構成になっている。ただし、本番Supabaseに全マイグレーションを適用し、Supabase側の公開サインアップ無効化とStorage private化を完了しない限り、公開してはいけない。

## 確認済み

- アプリ側は `ALLOW_PUBLIC_SIGNUP=false` で登録処理を止める設計
- 主要データは `user_id` で分離する設計
- 案件配下データは `case_id` の所有者確認をRLSで強化
- Storage uploadは private bucket 前提
- `SUPABASE_SERVICE_ROLE_KEY` はアップロード公開URL処理とStripe webhookのサーバールートだけで使用
- クーポンコードは平文保存せず、ソルト付きハッシュで保存
- Stripe webhookは署名検証あり
- AIキーはサーバー側だけで使用
- コード内に実キーらしき値は検出なし

## 本番Supabaseで実行する確認SQL

RLS有効確認:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

RLSポリシー確認:

```sql
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

`user_id`列確認:

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and column_name = 'user_id'
order by table_name;
```

危険なpublic bucket確認:

```sql
select id, name, public
from storage.buckets
order by name;
```

## 情報流出を防ぐ必須設定

- `SUPABASE_SERVICE_ROLE_KEY` はVercelのProduction/Preview環境変数だけに置く
- `OPENAI_API_KEY` はVercelのProduction/Preview環境変数だけに置く
- `STRIPE_SECRET_KEY` はVercelのProduction/Preview環境変数だけに置く
- `NEXT_PUBLIC_` が付く変数には公開されてもよい値だけを入れる
- `.env.local` を共有しない
- Supabase Auth の公開サインアップを無効化する
- Storage bucket `case-documents` を public にしない
- AIへ送る前に利用者同意を取る
- AI出力を提出前に必ず人が確認する

## 運用ルール

- ベータユーザーは管理者が手動作成する
- 不要になったユーザーはSupabase Authで停止または削除する
- 管理者以外にSupabase Dashboard権限を渡さない
- Stripe Dashboard権限は必要最小限にする
- OpenAI APIキーはプロジェクト単位で作り、漏洩時に即ローテーションできる状態にする
- クーポンCSVは外部共有しない。共有する場合はコード列を削除する

## 漏洩時対応

1. Vercelから該当APIキーを削除
2. OpenAI / Stripe / Supabaseで該当キーを失効
3. 新しいキーを発行し、Vercelへ再設定
4. Supabase Auth logs / Storage logs / Stripe logs / アプリ監査ログを確認
5. 不審ユーザーを停止
6. 影響範囲を記録し、必要ならベータユーザーへ通知

## 追加推奨

- Sentry等のエラー監視
- Vercel Firewall rule
- レート制限
- 管理者操作ログの拡充
- データ削除依頼フロー
- 利用規約、プライバシーポリシー、AI利用同意の公開
