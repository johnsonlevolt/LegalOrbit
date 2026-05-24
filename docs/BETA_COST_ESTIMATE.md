# ベータ運用コスト試算

最終更新: 2026-05-24

## 前提

ベータ初期は次の構成で始める。

- Vercel Pro
- Supabase Pro
- Stripe
- OpenAI API
- 独自ドメイン

為替は概算で 1 USD = 155円 として計算。実請求は為替・税・利用量で変動する。

## 固定費の目安

| 項目 | 推奨 | 月額目安 |
| --- | --- | ---: |
| Vercel | Pro | $20、約3,100円 |
| Supabase | Pro | $25、約3,875円 |
| 独自ドメイン | 年額1,500〜5,000円程度 | 月割 約125〜417円 |
| 監視ツール | ベータ初期は無料枠可 | 0円〜 |
| 合計 | API・決済手数料除く | 約7,100〜7,400円/月 |

## 変動費

### Stripe

日本のカード決済手数料はStripe公式価格に従う。月額課金では、売上に対して決済手数料が発生する。正確な料率はStripe Dashboardと公式価格で確認する。

例として月額10,000円のユーザーが10人なら売上100,000円。手数料が3.6%相当なら約3,600円前後。

### OpenAI API

公式価格では、GPT-5 mini は入力 $0.25 / 100万 tokens、出力 $2.00 / 100万 tokens。GPT-4.1 mini は入力 $0.40 / 100万 tokens、出力 $1.60 / 100万 tokens。

このアプリの書類ドラフト1回あたりの目安:

| 処理 | 入力tokens | 出力tokens | GPT-5 mini概算 |
| --- | ---: | ---: | ---: |
| 軽い入力補完 | 3,000 | 1,000 | 約0.5円 |
| 通常の書類ドラフト | 10,000 | 3,000 | 約1.3円 |
| 添付多め・長文 | 30,000 | 8,000 | 約3.7円 |
| 大量資料 | 100,000 | 20,000 | 約10.9円 |

画像・PDFを大量に送る場合はtokensが増える。ベータでは1ユーザーあたり月100〜300回までのAI利用上限を置く。

### Supabase Storage

Proは通常のベータ利用なら十分。PDF・画像添付が増えるとストレージと転送量が増える。最初は添付ファイル上限を1ファイル10MB、1案件合計100MB程度に制限する。

## ベータ人数別の月額概算

| ベータ規模 | 固定費 | AI費用 | Stripe手数料 | 合計目安 |
| --- | ---: | ---: | ---: | ---: |
| 5人・無料テスト | 約7,400円 | 500〜2,000円 | 0円 | 約8,000〜9,500円 |
| 20人・一部有料 | 約7,400円 | 2,000〜8,000円 | 売上の数% | 約10,000〜20,000円 |
| 50人・有料化開始 | 約7,400円 | 5,000〜25,000円 | 売上の数% | 約20,000〜60,000円 |

## 推奨料金設計

| プラン | 月額 | 年額 | 対象 |
| --- | ---: | ---: | --- |
| Free / Trial | 0円 | - | 初期検証。案件数・AI回数を制限 |
| Starter | 4,980円 | 54,780円 | 個人行政書士、少量案件 |
| Pro | 9,800円 | 107,800円 | 書類作成を多く使う事務所 |
| Office | 19,800円 | 217,800円 | 複数担当者・事務員利用 |
| Enterprise | 個別見積 | 個別見積 | 大規模・個別セキュリティ要件 |

年額は11か月分。途中アップグレードは可能、ダウングレードは更新時まで不可。

## 初期クーポン

- `EARLY_START`: 初期ユーザー限定、Starter 1か月無料
- `FRIEND_START`: 知人紹介、Starter 1か月無料。紹介者名を必ず記録
- `OFFICE_TRIAL`: Office 1か月無料

## 料金設計の判断

Starterを安くしすぎると、AI利用が多いユーザーで赤字になる。ベータでは無料枠を配りすぎず、AI回数・添付容量・ユーザー数で制限する。

推奨のAI上限:

- Free / Trial: 月10回
- Starter: 月100回
- Pro: 月500回
- Office: 月2,000回
- Enterprise: 個別

上限超過は従量課金か、上位プラン誘導にする。

## 参照元

- OpenAI API Pricing: https://developers.openai.com/api/docs/pricing
- GPT-5 mini pricing: https://developers.openai.com/api/docs/models/gpt-5-mini
- GPT-4.1 mini pricing: https://developers.openai.com/api/docs/models/gpt-4.1-mini
- Vercel Pricing: https://vercel.com/pricing
- Supabase Pricing: https://supabase.com/pricing
- Stripe Japan Pricing: https://stripe.com/jp/pricing
