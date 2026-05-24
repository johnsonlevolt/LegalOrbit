/**
 * 入管・外国人 カテゴリー テンプレートデータ
 *
 * 出典：出入国在留管理庁（入管庁）公式サイト https://www.moj.go.jp/isa/
 * 法務省 帰化許可申請 https://houmukyoku.moj.go.jp/
 * 参照時点：令和6〜8年（2024〜2026年）公示情報に基づく
 *
 * ※ 申請カテゴリー（カテゴリー1〜4）・申請人の状況により提出書類が異なります。
 *   実際の申請時は出入国在留管理庁の最新情報を必ず確認してください。
 */

import type { TemplateData } from '@/lib/data/template-types'

export const TEMPLATES_IMMIGRATION: TemplateData[] = [

  // ══════════════════════════════════════════════════
  // 1. 在留資格認定証明書交付申請（技術・人文知識・国際業務）
  // ══════════════════════════════════════════════════
  {
    name: '在留資格認定証明書交付申請（技術・人文知識・国際業務）',
    business_type: '入管・外国人',
    description: '就労目的（技術職・事務職・国際業務等）で外国人を日本に呼び寄せる際の在留資格認定申請。カテゴリー3・4の場合は令和8年4月改正対応。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '在留資格認定証明書交付申請書（別記第六号の三様式）申請人等作成用1〜4・所属機関等作成用1〜2', required: true },
      { document_name: '写真（縦4cm×横3cm、申請前3ヶ月以内撮影、白・明るい色の背景）', required: true },
      { document_name: '返信用封筒（404円切手貼付・簡易書留用）', required: true },
      // ─ 申請人（外国人本人）関係 ─
      { document_name: '申請人のパスポートの写し（全ページ）', required: true },
      { document_name: '申請人の履歴書（学歴・職歴の詳細）', required: true },
      { document_name: '最終学歴の卒業証明書（原本）', required: true },
      { document_name: '最終学歴の成績証明書', required: false },
      { document_name: '職務経歴書・在職証明書（実務経験を証明する場合）', required: false },
      { document_name: '資格証明書・技能証明書（該当する場合）', required: false },
      // ─ 所属機関（雇用予定企業）関係 ─
      { document_name: '雇用契約書または内定通知書の写し（業務内容・報酬額の記載が必要）', required: true },
      { document_name: '登記事項証明書（法務局発行・3ヶ月以内）', required: true },
      { document_name: '直近の決算書一式（貸借対照表・損益計算書）', required: true },
      { document_name: '会社パンフレット・事業概要説明資料', required: true },
      { document_name: '給与規程・就業規則（労基署受理印のあるもの）', required: true },
      { document_name: '社員名簿または在籍従業員の一覧（外国人社員の在留資格が確認できるもの）', required: false },
      // ─ カテゴリー3・4追加書類（令和8年4月改正対応） ─
      { document_name: '【カテゴリー3・4】所属機関の代表者に関する申告書（令和8年4月15日以降の申請に必要）', required: false },
      { document_name: '【主に言語能力を用いた業務の場合】CEFR B2相当以上の言語能力証明書（令和8年4月15日以降）', required: false },
      // ─ 代理人・申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
      { document_name: '委任状（代理人が申請する場合）', required: false },
      // ─ 電子証明書交付に関する書類 ─
      { document_name: 'メールアドレス記載書面（在留資格認定証明書電子化対応）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 2. 在留資格認定証明書交付申請（経営・管理）
  // ══════════════════════════════════════════════════
  {
    name: '在留資格認定証明書交付申請（経営・管理）',
    business_type: '入管・外国人',
    description: '外国人が日本で会社を経営・管理するための在留資格認定申請。資本金500万円以上または2名以上の常勤職員要件あり（令和7年10月改正対応）。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '在留資格認定証明書交付申請書（別記第六号の三様式）申請人等作成用1〜4・所属機関等作成用1〜2', required: true },
      { document_name: '写真（縦4cm×横3cm）', required: true },
      { document_name: '返信用封筒（404円切手貼付）', required: true },
      // ─ 申請人（外国人本人）関係 ─
      { document_name: '申請人のパスポートの写し（全ページ）', required: true },
      { document_name: '申請人の履歴書（経営・管理の実務経験3年以上を明記）', required: true },
      { document_name: '経営・管理に関する職歴証明書・在職証明書', required: true },
      // ─ 事業（会社）関係 ─
      { document_name: '登記事項証明書（法務局発行・3ヶ月以内）', required: true },
      { document_name: '定款の写し（目的欄に事業内容の記載）', required: true },
      { document_name: '事業計画書（向こう2〜3年の事業計画・売上見込みを含む）', required: true },
      { document_name: '資本金の払込を証する書面（資本金500万円以上または2名以上の常勤職員がいること）', required: true },
      { document_name: '直近の確定申告書または決算書一式（既存法人の場合）', required: true },
      { document_name: '事業所の使用権原を証する書面（賃貸借契約書または登記事項証明書）', required: true },
      { document_name: '事業所の写真（外観・内部）', required: true },
      { document_name: '許認可証の写し（許認可が必要な業種の場合）', required: false },
      // ─ 常勤職員関係（資本金500万円未満の場合） ─
      { document_name: '常勤職員の雇用契約書・給与明細の写し（2名以上の日本人または永住者等）', required: false },
      { document_name: '常勤職員の健康保険・厚生年金被保険者記録照会回答票', required: false },
      // ─ 代理人・申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
      { document_name: '委任状（代理人が申請する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 3. 在留資格認定証明書交付申請（技能実習1号ロ）
  // ══════════════════════════════════════════════════
  {
    name: '在留資格認定証明書交付申請（技能実習1号ロ・団体監理型）',
    business_type: '入管・外国人',
    description: '団体監理型技能実習（監理団体を通じた実習）の第1号入国時申請。技能実習計画認定書（OTIT発行）が必須。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '在留資格認定証明書交付申請書（別記第六号の三様式）申請人等作成用1〜4・所属機関等作成用1〜2', required: true },
      { document_name: '写真（縦4cm×横3cm）', required: true },
      { document_name: '返信用封筒（404円切手貼付）', required: true },
      // ─ 技能実習計画関係（最重要） ─
      { document_name: '技能実習計画認定通知書（外国人技能実習機構（OTIT）発行）の写し', required: true },
      { document_name: '技能実習計画認定申請書の写し（認定を受けた計画書）', required: true },
      // ─ 申請人（実習生）関係 ─
      { document_name: '申請人のパスポートの写し（全ページ）', required: true },
      { document_name: '申請人の履歴書', required: true },
      // ─ 監理団体関係 ─
      { document_name: '監理団体の許可証の写し（外国人技能実習機構発行）', required: true },
      { document_name: '監理団体と実習実施者間の監理事業実施契約書の写し', required: true },
      { document_name: '監理団体の登記事項証明書', required: true },
      { document_name: '監理責任者の選任書の写し', required: true },
      // ─ 実習実施者（受入企業）関係 ─
      { document_name: '実習実施者の登記事項証明書', required: true },
      { document_name: '実習実施者の直近の決算書（または確定申告書）', required: true },
      { document_name: '雇用契約書の写し（実習実施者と実習生間）', required: true },
      { document_name: '実習実施者の在籍者名簿（外国人の状況が確認できるもの）', required: false },
      // ─ 送出機関関係 ─
      { document_name: '送出機関との取決め文書の写し（二国間取決めがある国の場合）', required: false },
      { document_name: '送出機関の認定証明書類の写し（送出国の認定機関の証明）', required: false },
      // ─ 申請取次者関係 ─
      { document_name: '申請人名簿（申請取次者が一括申請する場合）', required: false },
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 4. 在留資格変更許可申請（就労系・技術・人文知識・国際業務）
  // ══════════════════════════════════════════════════
  {
    name: '在留資格変更許可申請（就労系・技術・人文知識・国際業務）',
    business_type: '入管・外国人',
    description: '留学・家族滞在等から技術・人文知識・国際業務への在留資格変更申請。日本在住の外国人本人が最寄りの入管局へ申請。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '在留資格変更許可申請書（別記第二十二号様式）申請人等作成用1〜4・所属機関等作成用1〜2', required: true },
      { document_name: '写真（縦4cm×横3cm）', required: true },
      { document_name: '在留カード（原本提示）', required: true },
      { document_name: 'パスポート（原本提示）', required: true },
      // ─ 申請人（外国人本人）関係 ─
      { document_name: '申請人の履歴書（学歴・職歴の詳細）', required: true },
      { document_name: '最終学歴の卒業証明書（原本）', required: true },
      { document_name: '最終学歴の成績証明書（卒業見込みの場合は見込証明書）', required: false },
      { document_name: '職務経歴書・在職証明書（実務経験で基準を満たす場合）', required: false },
      // ─ 所属機関（雇用企業）関係 ─
      { document_name: '雇用契約書または内定通知書（業務内容・報酬額・雇用期間の記載が必要）', required: true },
      { document_name: '登記事項証明書（法務局発行・3ヶ月以内）', required: true },
      { document_name: '直近の決算書一式（貸借対照表・損益計算書）', required: true },
      { document_name: '会社概要パンフレット・事業内容説明書', required: true },
      { document_name: '給与規程・就業規則', required: true },
      // ─ カテゴリー3・4追加書類 ─
      { document_name: '【カテゴリー3・4】所属機関の代表者に関する申告書', required: false },
      { document_name: '【主に言語能力を用いた業務の場合】CEFR B2相当以上の言語能力証明書', required: false },
      // ─ 留学から変更の場合 ─
      { document_name: '在学証明書または卒業証明書（留学から変更の場合）', required: false },
      // ─ 申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
      { document_name: '委任状（申請取次者への委任）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 5. 在留期間更新許可申請（就労系）
  // ══════════════════════════════════════════════════
  {
    name: '在留期間更新許可申請（就労系・技術・人文知識・国際業務等）',
    business_type: '入管・外国人',
    description: '就労系在留資格（技人国・技能・特定技能等）の在留期間更新申請。在留期限の3ヶ月前から申請可能。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '在留期間更新許可申請書（別記第三十号の二様式）申請人等作成用1〜4・所属機関等作成用1〜2', required: true },
      { document_name: '写真（縦4cm×横3cm）', required: true },
      { document_name: '在留カード（原本提示）', required: true },
      { document_name: 'パスポート（原本提示）', required: true },
      // ─ カテゴリー1（上場企業等） ─
      { document_name: '【カテゴリー1・2】カテゴリー該当証明書（上場企業等の場合）', required: false },
      // ─ カテゴリー3・4（中小企業等）追加書類 ─
      { document_name: '【カテゴリー3・4】在職証明書または雇用契約書', required: true },
      { document_name: '【カテゴリー3・4】申請人の前年分の給与所得の源泉徴収票の写し', required: true },
      { document_name: '【カテゴリー3・4】登記事項証明書（法務局発行・3ヶ月以内）', required: true },
      { document_name: '【カテゴリー3・4】直近の決算書一式（貸借対照表・損益計算書）', required: true },
      { document_name: '【カテゴリー3・4】前年分の所属機関の源泉徴収票等の法定調書合計表の写し', required: true },
      { document_name: '【カテゴリー3・4】所属機関の代表者に関する申告書（令和8年4月以降）', required: false },
      // ─ 住民税・納税関係 ─
      { document_name: '申請人の直近1年分の住民税の課税（または非課税）証明書および納税証明書', required: true },
      // ─ 社会保険関係 ─
      { document_name: '健康保険被保険者証の写し（社会保険加入の確認）', required: false },
      // ─ 申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
      { document_name: '委任状（申請取次者への委任）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 6. 永住許可申請
  // ══════════════════════════════════════════════════
  {
    name: '永住許可申請（就労資格保持者）',
    business_type: '入管・外国人',
    description: '就労関係の在留資格（技人国・技能・特定技能等）で永住を申請する場合。原則10年以上在留（うち就労資格5年以上）。令和8年2月改訂ガイドライン対応。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '永住許可申請書（別記第三十四号様式）その1・その2', required: true },
      { document_name: '写真（縦4cm×横3cm）', required: true },
      { document_name: '在留カード（原本提示）', required: true },
      { document_name: 'パスポート（原本提示）', required: true },
      // ─ 身元保証人関係 ─
      { document_name: '身元保証書（日本人または永住者・特別永住者が保証人となる）', required: true },
      { document_name: '身元保証人の住民票', required: true },
      { document_name: '身元保証人の職業を証する資料（在職証明書・確定申告書等）', required: true },
      { document_name: '身元保証人の直近1年分の住民税の納税証明書（その1・その2）', required: true },
      // ─ 申請人本人関係 ─
      { document_name: '申請人の住民票（世帯全員・マイナンバー省略）', required: true },
      { document_name: '申請人の直近5年分の住民税の課税（または非課税）証明書・納税証明書', required: true },
      { document_name: '申請人の在職証明書または雇用契約書（現在の就労状況の確認）', required: true },
      { document_name: '申請人の直近5年分の源泉徴収票（給与所得者の場合）または確定申告書', required: true },
      // ─ 社会保険・年金関係 ─
      { document_name: 'ねんきん定期便または被保険者記録照会回答票（直近2年の保険料納付状況）', required: true },
      { document_name: '国民健康保険・社会保険の保険料納付証明書（直近2年分）', required: true },
      // ─ 法令遵守・素行善良 ─
      { document_name: '申請人の履歴書（在留歴・職歴）', required: true },
      { document_name: '出入国記録・在留歴を確認できる資料（パスポートの写し：入国スタンプ等）', required: true },
      // ─ 生計維持関係 ─
      { document_name: '生計を共にする者の収入を証する資料（配偶者等の源泉徴収票・確定申告書等）', required: false },
      // ─ 申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
      { document_name: '委任状（申請取次者への委任）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 7. 帰化許可申請（一般帰化）
  // ══════════════════════════════════════════════════
  {
    name: '帰化許可申請（一般帰化）',
    business_type: '入管・外国人',
    description: '一般の外国人（国籍法第5条）が日本国籍を取得するための帰化申請。住所地を管轄する法務局・地方法務局へ申請。令和6年6月改訂のてびきに対応。',
    items: [
      // ─ 申請人が作成・記入する書類 ─
      { document_name: '帰化許可申請書', required: true },
      { document_name: '親族の概要（8親等内の親族全員）', required: true },
      { document_name: '履歴書（その1：生年月日〜現在の経歴）', required: true },
      { document_name: '履歴書（その2：帰化後の氏名・住所等の予定記載）', required: true },
      { document_name: '出入国歴表（過去5年以上の出入国記録）', required: true },
      { document_name: '帰化の動機書（自筆・A4用紙）', required: true },
      { document_name: '生計の概要（その1：就労者用）', required: true },
      { document_name: '生計の概要（その2：生計を立てる方法の説明）', required: false },
      { document_name: '事業の概要（自営業者・会社経営者の場合）', required: false },
      // ─ 国籍・身分関係書類 ─
      { document_name: '本国の国籍証明書（パスポート・国籍確認書類）', required: true },
      { document_name: '本国の戸籍謄本・出生証明書等（本国政府機関発行・日本語訳添付）', required: true },
      { document_name: '在留カードの写し（表裏）', required: true },
      { document_name: 'パスポートの写し（全ページ・過去に使用したものも含む）', required: true },
      // ─ 住所・身元関係書類 ─
      { document_name: '住民票（世帯全員・過去5年分の住所が確認できる書類）', required: true },
      { document_name: '住民税の課税証明書・納税証明書（直近3年分）', required: true },
      { document_name: '源泉徴収票（直近3年分・給与所得者の場合）', required: true },
      { document_name: '確定申告書の写し（自営業者・副収入がある場合）', required: false },
      // ─ 職業関係書類 ─
      { document_name: '在職証明書または雇用契約書（給与所得者の場合）', required: true },
      { document_name: '会社の登記事項証明書・決算書（会社経営者の場合）', required: false },
      // ─ 社会保険・年金関係 ─
      { document_name: 'ねんきん定期便または年金加入記録の証明書（国民年金・厚生年金）', required: true },
      { document_name: '健康保険証の写しまたは国民健康保険の保険料納付書（領収書）', required: true },
      // ─ その他 ─
      { document_name: '運転免許証の写し（保有する場合）', required: false },
      { document_name: '婚姻証明書（日本人または外国人と婚姻している場合）', required: false },
      { document_name: '子の出生証明書（子がいる場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 8. 特定技能1号 在留資格認定証明書交付申請
  // ══════════════════════════════════════════════════
  {
    name: '特定技能1号 在留資格認定証明書交付申請',
    business_type: '入管・外国人',
    description: '特定産業分野（飲食料品製造・介護・建設等）での特定技能1号外国人の入国申請。令和6〜7年の対象分野拡大・書類変更に対応。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '在留資格認定証明書交付申請書（別記第六号の三様式）申請人等作成用1〜4・所属機関等作成用1〜2', required: true },
      { document_name: '写真（縦4cm×横3cm）', required: true },
      { document_name: '返信用封筒（404円切手貼付）', required: true },
      // ─ 申請人（外国人本人）関係 ─
      { document_name: '申請人のパスポートの写し（全ページ）', required: true },
      { document_name: '技能試験合格証明書（特定技能評価試験・各分野所管省庁認定試験）', required: true },
      { document_name: '日本語能力試験合格証明書（JLPT N4以上）または国際交流基金日本語基礎テスト合格証明書', required: true },
      { document_name: '健康診断個人票（所定の様式）', required: true },
      { document_name: '健康診断を行った医療機関の領収書または診断書', required: false },
      // ─ 雇用契約・処遇関係 ─
      { document_name: '特定技能雇用契約書の写し（賃金・労働時間・業務内容等の記載）', required: true },
      { document_name: '報酬に関する説明書（同等業務従事者の報酬と比較した説明）', required: true },
      { document_name: '1号特定技能外国人支援計画書', required: true },
      // ─ 特定技能所属機関（雇用企業）関係 ─
      { document_name: '登記事項証明書（法務局発行・3ヶ月以内）', required: true },
      { document_name: '直近の決算書一式（貸借対照表・損益計算書）', required: true },
      { document_name: '公的機関が発行した租税公課（法人税・消費税等）の納付証明書', required: true },
      { document_name: '社会保険料の納付証明書', required: true },
      { document_name: '労働保険料の納付証明書', required: true },
      // ─ 登録支援機関に支援委託する場合 ─
      { document_name: '登録支援機関との支援委託契約書の写し（支援委託する場合）', required: false },
      { document_name: '登録支援機関の登録証の写し（支援委託する場合）', required: false },
      // ─ 分野別追加書類 ─
      { document_name: '特定技能外国人の受入れに関する誓約書（特定産業分野によって異なる分野別書類）', required: true },
      // ─ 申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 9. 日本人の配偶者等 在留資格認定証明書交付申請
  // ══════════════════════════════════════════════════
  {
    name: '在留資格認定証明書交付申請（日本人の配偶者等）',
    business_type: '入管・外国人',
    description: '外国人が日本人の配偶者（夫または妻）として日本に入国するための在留資格認定申請。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '在留資格認定証明書交付申請書（別記第六号の三様式）申請人等作成用1〜3', required: true },
      { document_name: '写真（縦4cm×横3cm）', required: true },
      { document_name: '返信用封筒（404円切手貼付）', required: true },
      // ─ 申請人（外国人配偶者）関係 ─
      { document_name: '申請人のパスポートの写し（全ページ）', required: true },
      { document_name: '申請人の国籍国の婚姻証明書（日本語訳添付）', required: true },
      { document_name: '申請人の出生証明書（日本語訳添付）', required: true },
      { document_name: '申請人の国籍国のパスポートまたは国民識別証の写し', required: true },
      // ─ 日本人配偶者（呼び寄せる側）関係 ─
      { document_name: '日本人配偶者の戸籍謄本（婚姻事実の記載が必要・3ヶ月以内）', required: true },
      { document_name: '日本人配偶者の住民票（世帯全員・マイナンバー省略）', required: true },
      { document_name: '日本人配偶者の身元保証書', required: true },
      { document_name: '日本人配偶者の職業と収入に関する書類（在職証明書・源泉徴収票等）', required: true },
      { document_name: '日本人配偶者の住民税の課税証明書・納税証明書（直近1年分）', required: true },
      // ─ 交際・結婚の実態を示す書類 ─
      { document_name: '夫婦の2ショット写真（結婚前後の交際期間のものを複数枚）', required: true },
      { document_name: '夫婦間のやりとりを示す資料（メール・LINE・ビデオ通話記録等のスクリーンショット）', required: false },
      { document_name: '交際・結婚式の経緯を説明する申立書（自由書式）', required: false },
      // ─ 申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
      { document_name: '委任状（申請取次者への委任）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 10. 家族滞在 在留資格認定証明書交付申請
  // ══════════════════════════════════════════════════
  {
    name: '在留資格認定証明書交付申請（家族滞在）',
    business_type: '入管・外国人',
    description: '就労系・留学等の在留資格を持つ外国人が、配偶者・子を日本に呼び寄せる際の在留資格認定申請。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '在留資格認定証明書交付申請書（別記第六号の三様式）申請人等作成用1〜3', required: true },
      { document_name: '写真（縦4cm×横3cm）', required: true },
      { document_name: '返信用封筒（404円切手貼付）', required: true },
      // ─ 申請人（呼び寄せる家族）関係 ─
      { document_name: '申請人（呼び寄せる家族）のパスポートの写し（全ページ）', required: true },
      { document_name: '婚姻証明書または出生証明書（身分関係を証する書類・日本語訳添付）', required: true },
      // ─ 扶養者（日本在住の外国人）関係 ─
      { document_name: '扶養者の在留カードの写し（表裏）', required: true },
      { document_name: '扶養者のパスポートの写し（全ページ）', required: true },
      { document_name: '扶養者の身元保証書', required: true },
      { document_name: '扶養者の在職証明書または雇用契約書（収入状況の確認）', required: true },
      { document_name: '扶養者の直近1年分の住民税の課税証明書・納税証明書', required: true },
      { document_name: '扶養者の源泉徴収票（直近1年分・給与所得者の場合）', required: true },
      { document_name: '扶養者の住民票（世帯全員・マイナンバー省略）', required: true },
      // ─ 家族であることを示す書類 ─
      { document_name: '家族の続柄を証する書類（本国政府機関発行の戸籍・公文書等）', required: true },
      { document_name: '家族写真（扶養者・申請人を含む家族の写真）', required: false },
      // ─ 子の呼び寄せの場合 ─
      { document_name: '子の出生証明書（日本語訳添付）', required: false },
      // ─ 申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
      { document_name: '委任状（申請取次者への委任）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 11. 高度専門職1号 在留資格認定証明書交付申請
  // ══════════════════════════════════════════════════
  {
    name: '在留資格認定証明書交付申請（高度専門職1号）',
    business_type: '入管・外国人',
    description: '高度人材ポイント制（70点以上）を活用した高度外国人材の在留資格認定申請。イ（高度学術研究）、ロ（高度専門・技術）、ハ（高度経営・管理）の3類型。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '在留資格認定証明書交付申請書（別記第六号の三様式）申請人等作成用1〜4・所属機関等作成用1〜2', required: true },
      { document_name: '写真（縦4cm×横3cm）', required: true },
      { document_name: '返信用封筒（404円切手貼付）', required: true },
      // ─ ポイント計算関係（最重要） ─
      { document_name: '高度専門職ポイント計算表（入管庁書式・Excel）の記載・提出', required: true },
      { document_name: 'ポイントの各項目を立証する資料一式（学歴・職歴・年収・研究実績等）', required: true },
      // ─ 学歴関係 ─
      { document_name: '最終学歴の卒業証明書（博士・修士・学士等の学位を証するもの）', required: true },
      { document_name: '学位記の写し（博士・修士の場合）', required: true },
      { document_name: '在籍していた教育機関の世界大学ランキング掲載証明（該当する場合）', required: false },
      // ─ 職歴・研究実績関係 ─
      { document_name: '職務経歴書・在職証明書（3年以上の実務経験を証する書類）', required: true },
      { document_name: '論文・特許・研究成果の一覧と代表論文（研究者・技術者の場合）', required: false },
      { document_name: '学術論文データベースへの掲載証明（Google Scholar等）', required: false },
      // ─ 雇用・報酬関係 ─
      { document_name: '雇用契約書または内定通知書（年収額・業務内容の記載）', required: true },
      { document_name: '報酬を証する資料（直近の給与明細書・年収証明等）', required: true },
      // ─ 所属機関関係 ─
      { document_name: '登記事項証明書（法務局発行・3ヶ月以内）', required: true },
      { document_name: '直近の決算書一式（貸借対照表・損益計算書）', required: true },
      { document_name: '会社概要パンフレット・事業内容説明書', required: true },
      // ─ ボーナスポイント関連 ─
      { document_name: '日本の公的機関（JETRO・JST等）からの支援確認書（ボーナスポイント対象の場合）', required: false },
      { document_name: '中小企業・ベンチャー企業の認定証明書（ボーナスポイント対象の場合）', required: false },
      // ─ 申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
      { document_name: '委任状（申請取次者への委任）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // 12. 資格外活動許可申請
  // ══════════════════════════════════════════════════
  {
    name: '資格外活動許可申請（留学・家族滞在等）',
    business_type: '入管・外国人',
    description: '留学・家族滞在等の在留資格で在留中の外国人が、許可された活動以外（アルバイト等）を行うための許可申請。留学生は週28時間（長期休業中は40時間）まで。',
    items: [
      // ─ 申請書本体 ─
      { document_name: '資格外活動許可申請書（別記第二十八号様式）', required: true },
      { document_name: '在留カード（原本提示）', required: true },
      { document_name: 'パスポート（原本提示）', required: true },
      // ─ 活動内容の説明資料 ─
      { document_name: '活動予定機関が作成した資格外活動証明書（雇用予定先が作成）', required: true },
      { document_name: '雇用予定先との雇用契約書または内定通知書（業務内容・就労時間・報酬を記載）', required: true },
      // ─ 留学生の場合 ─
      { document_name: '在学証明書（在学中の教育機関が発行・3ヶ月以内）', required: false },
      { document_name: '成績証明書（大学生がインターンシップで単位修得の場合）', required: false },
      { document_name: '卒業に必要な単位数および修得単位数が確認できる書類', required: false },
      // ─ 家族滞在の場合 ─
      { document_name: '扶養者の在留カードの写し・在職証明書（家族滞在の場合）', required: false },
      // ─ インターンシップの場合 ─
      { document_name: 'インターンシップ受入れ機関が作成した受入証明書（インターンシップの場合）', required: false },
      { document_name: '大学等の単位認定確認書（単位取得を目的とするインターンシップの場合）', required: false },
      // ─ 収入に関する説明 ─
      { document_name: '申請人の収入・生計維持状況を説明する資料（任意書式）', required: false },
      // ─ 申請取次者関係 ─
      { document_name: '申請取次者証明書の写し（行政書士が申請取次を行う場合）', required: false },
      { document_name: '委任状（申請取次者への委任）', required: false },
    ],
  },
]
