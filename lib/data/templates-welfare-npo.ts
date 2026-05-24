/**
 * 介護・福祉・NPO・宅建業・警備業・旅行業・補助金 テンプレートデータ
 *
 * 参考法令・出典（2024〜2025年時点）:
 *   - 介護保険法・同施行規則（厚生労働省）
 *   - 障害者の日常生活及び社会生活を総合的に支援するための法律（障害者総合支援法）
 *   - 特定非営利活動促進法（内閣府 NPOホームページ https://www.npo-homepage.go.jp/）
 *   - 一般社団法人及び一般財団法人に関する法律
 *   - 公益社団法人及び公益財団法人の認定等に関する法律（令和6年12月改訂ガイドライン）
 *   - 宅地建物取引業法・同施行規則（国土交通省 https://www.mlit.go.jp/）
 *   - 警備業法（警察庁）
 *   - 旅行業法（観光庁）※平成30年改正・令和6年地域限定管理者試験実施
 *   - 小規模事業者持続化補助金 公募要領（中小企業庁・商工会議所）
 *   - 事業再構築補助金 公募要領（経済産業省）
 */

import type { TemplateData } from './template-types'

// ═══════════════════════════════════════════════════════════════
// 介護・福祉 カテゴリ
// ═══════════════════════════════════════════════════════════════

/** 1. 訪問介護事業者指定申請（介護保険法第70条・同施行規則第22条の23） */
const TEMPLATE_HOUMONKAIGO: TemplateData = {
  name: '訪問介護事業者 指定申請（新規）',
  business_type: '介護・福祉',
  description:
    '介護保険法第70条に基づく訪問介護事業者の都道府県知事指定申請。令和3年改正対応（LIFE・管理者要件等）。電子申請届出システム利用推奨。',
  items: [
    // ─ 申請書類（本体）─
    { document_name: '指定居宅サービス事業所 指定申請書（様式第一号）', required: true },
    { document_name: '付表7（訪問介護）', required: true },
    { document_name: '訪問介護事業所の指定に係る記載事項（種別・定員・勤務形態等）', required: true },

    // ─ 法人関係 ─
    { document_name: '法人の定款（目的欄に訪問介護事業の記載があること）', required: true },
    { document_name: '法人の登記事項証明書（履歴事項全部証明書）', required: true },
    { document_name: '法人税・住民税・事業税の納税証明書（直近年度）', required: false },

    // ─ 設備関係 ─
    { document_name: '事業所の平面図・見取図（各室の用途・面積を明示）', required: true },
    { document_name: '事業所の写真（外観・事務室・相談室・鍵のかかる保管庫）', required: true },
    { document_name: '事業所の使用権原を証する書類（賃貸借契約書または登記事項証明書）', required: true },

    // ─ 職員体制 ─
    { document_name: '従業者の勤務の体制及び勤務形態一覧表（常勤換算含む）', required: true },
    { document_name: '管理者の資格証または経歴書（3年以上の認知症ケア等の実務経験を証明）', required: true },
    { document_name: '訪問介護員（ヘルパー）の資格証の写し（介護福祉士・初任者研修等）', required: true },
    { document_name: 'サービス提供責任者の資格証の写し（介護福祉士等）', required: true },

    // ─ 運営関係 ─
    { document_name: '運営規程（訪問介護）', required: true },
    { document_name: '苦情処理の概要・体制を記載した書類', required: true },
    { document_name: '協力医療機関との契約書の写し', required: true },
    { document_name: '損害賠償保険の加入状況を証する書類（保険証書の写し）', required: true },

    // ─ 社会保険 ─
    { document_name: '社会保険・労働保険の適用状況を証する書類（加入証明または適用届の写し）', required: true },

    // ─ 電子申請関連 ─
    { document_name: '介護保険事業所番号 申請（電子申請届出システム：GビズID取得が必要）', required: true },
    { document_name: '介護サービス情報公表制度 基本情報報告書（指定後提出）', required: false },
  ],
}

/** 2. 障害福祉サービス事業者指定申請（就労継続支援B型）
 *  障害者総合支援法第36条・同施行規則第34条の16
 */
const TEMPLATE_SHURO_B: TemplateData = {
  name: '障害福祉サービス事業者 指定申請（就労継続支援B型）',
  business_type: '介護・福祉',
  description:
    '障害者総合支援法第36条に基づく就労継続支援B型の都道府県・指定都市知事指定申請。農福連携・工賃向上計画も考慮。',
  items: [
    // ─ 申請書本体 ─
    { document_name: '障害福祉サービス事業者 指定申請書', required: true },
    { document_name: '付表9（就労継続支援A型・B型用）', required: true },
    { document_name: '指定に係る記載事項（事業所概要・定員・利用時間等）', required: true },

    // ─ 法人関係 ─
    { document_name: '法人の定款（目的欄に障害福祉サービス事業の記載）', required: true },
    { document_name: '法人の登記事項証明書（履歴事項全部証明書）', required: true },
    { document_name: '役員名簿・役員全員の住民票（欠格事由確認用）', required: true },

    // ─ 設備関係 ─
    { document_name: '事業所の平面図（各室の用途・面積・作業スペースを明示）', required: true },
    { document_name: '事業所の写真（外観・作業室・相談室・トイレ等のバリアフリー状況）', required: true },
    { document_name: '事業所の使用権原を証する書類（賃貸借契約書または登記事項証明書）', required: true },
    { document_name: '建築基準法・消防法の適合を証する書類（建築確認済証・消防署確認書等）', required: true },

    // ─ 職員体制 ─
    { document_name: '従業者の勤務の体制及び勤務形態一覧表', required: true },
    { document_name: '管理者の経歴書・資格証明書類', required: true },
    { document_name: 'サービス管理責任者の資格証の写し（相談支援従事者研修・実務経験証明）', required: true },
    { document_name: '職業指導員・生活支援員の資格証または経歴書', required: true },

    // ─ 運営計画・規程 ─
    { document_name: '運営規程（就労継続支援B型）', required: true },
    { document_name: '利用者負担額等計算書', required: true },
    { document_name: '工賃向上計画書（前年度実績または計画値）', required: true },
    { document_name: '苦情処理体制の概要', required: true },
    { document_name: '損害賠償保険の加入を証する書類', required: true },

    // ─ 社会保険 ─
    { document_name: '社会保険・労働保険の加入を証する書類', required: true },

    // ─ 事前協議（多くの自治体で必須）─
    { document_name: '事前協議申請書（指定日の3か月前の15日までに提出）', required: true },
    { document_name: '就労継続支援B型 事業計画書（定員・面積・収支見込み）', required: true },
  ],
}

/** 3. 居宅介護支援事業者指定申請（介護保険法第79条） */
const TEMPLATE_KYOTAKU_SHIEN: TemplateData = {
  name: '居宅介護支援事業者 指定申請（新規）',
  business_type: '介護・福祉',
  description:
    '介護保険法第79条に基づく居宅介護支援事業者の市町村長・都道府県知事指定申請（令和6年度改正：管理者要件の主任ケアマネジャー義務化継続）。',
  items: [
    // ─ 申請書類（本体）─
    { document_name: '指定居宅介護支援事業所 指定申請書（様式第一号）', required: true },
    { document_name: '付表12（居宅介護支援）', required: true },

    // ─ 法人関係 ─
    { document_name: '法人の定款（目的欄に居宅介護支援事業の記載）', required: true },
    { document_name: '法人の登記事項証明書（履歴事項全部証明書）', required: true },

    // ─ 設備関係 ─
    { document_name: '事業所の平面図・見取図（相談室・事務室・鍵付き書庫を明示）', required: true },
    { document_name: '事業所の写真（外観・相談室・鍵付き書庫）', required: true },
    { document_name: '事業所の使用権原を証する書類', required: true },

    // ─ 職員体制 ─
    { document_name: '従業者の勤務体制及び勤務形態一覧表', required: true },
    {
      document_name: '管理者の主任介護支援専門員証の写し（令和9年3月31日まで経過措置あり）',
      required: true,
    },
    { document_name: '介護支援専門員証の写し（担当ケアマネジャー全員分）', required: true },
    { document_name: '介護支援専門員の実務研修修了証明書の写し', required: false },

    // ─ 運営関係 ─
    { document_name: '運営規程（居宅介護支援）', required: true },
    { document_name: '苦情処理体制の概要を記載した書類', required: true },
    { document_name: '協力医療機関・協力歯科医療機関との協定書の写し', required: true },
    { document_name: '損害賠償保険の加入を証する書類（保険証書の写し）', required: true },

    // ─ 社会保険 ─
    { document_name: '社会保険・労働保険の適用状況を証する書類', required: true },

    // ─ 電子申請 ─
    { document_name: '電子申請届出システムによる申請（GビズIDプライム取得済みであること）', required: false },
  ],
}

// ═══════════════════════════════════════════════════════════════
// 法人設立・NPO カテゴリ
// ═══════════════════════════════════════════════════════════════

/** 4. NPO法人設立認証申請（特定非営利活動促進法第10条）
 *  所管：内閣府 / 都道府県（活動区域が2以上の都道府県にまたがる場合は内閣府）
 */
const TEMPLATE_NPO_SETSURITSU: TemplateData = {
  name: 'NPO法人 設立認証申請',
  business_type: '法人設立',
  description:
    '特定非営利活動促進法第10条に基づく設立認証申請。社員10人以上が必要。申請から認証まで約4か月（縦覧2か月・審査2か月）。内閣府電子申請対応。',
  items: [
    // ─ 申請書本体（法10条1項各号） ─
    { document_name: '設立認証申請書（様式第1号）', required: true },

    // ─ 定款 ─
    { document_name: '定款（目的・名称・特定非営利活動の種類・事務所の所在地・役員・社員資格等を記載）', required: true },

    // ─ 役員関係 ─
    { document_name: '役員名簿（氏名・住所・役職・常勤非常勤の別）', required: true },
    { document_name: '役員全員の就任承諾書及び誓約書（欠格事由非該当の誓約）', required: true },
    {
      document_name: '役員全員の住民票の写し（本籍地記載・個人番号記載なし・発行3か月以内）',
      required: true,
    },

    // ─ 社員関係（10人以上が必要）─
    { document_name: '社員名簿（10人以上：氏名・住所を記載）', required: true },
    {
      document_name: '社員のうち10名の署名または記名押印がある書面（設立趣意書等）',
      required: true,
    },

    // ─ 設立趣意書・計画 ─
    { document_name: '設立趣意書', required: true },
    { document_name: '設立についての意思の決定を証する議事録の謄本（設立総会議事録）', required: true },

    // ─ 活動計画・財務 ─
    {
      document_name: '設立当初の事業年度及び翌事業年度の事業計画書（様式第2号）',
      required: true,
    },
    {
      document_name: '設立当初の事業年度及び翌事業年度の活動予算書（様式第3号）',
      required: true,
    },
    {
      document_name: '設立当初の事業年度及び翌事業年度の収支予算書',
      required: true,
    },

    // ─ 事務所 ─
    { document_name: '事務所の所在地を確認できる書類（賃貸借契約書または登記事項証明書）', required: true },

    // ─ 電子申請 ─
    {
      document_name:
        '電子申請の場合：電子署名付き定款（PDF/A形式）および申請書類一式（内閣府NPO法人ポータルサイト）',
      required: false,
    },

    // ─ その他 ─
    { document_name: '定款に規定する特定非営利活動の種類及び活動内容の説明書', required: false },
  ],
}

/** 5. 一般社団法人設立（定款認証・設立登記）
 *  根拠：一般社団法人及び一般財団法人に関する法律
 */
const TEMPLATE_SHADAN_SETSURITSU: TemplateData = {
  name: '一般社団法人 設立（定款認証・設立登記）',
  business_type: '法人設立',
  description:
    '一般社団法人の設立手続き。公証役場での定款認証（手数料5万円）と法務局での設立登記（登録免許税6万円）の2段階。電子定款（PDF署名）で印紙税4万円を節約可能。',
  items: [
    // ─ 【STEP1】定款認証（公証役場）─
    { document_name: '定款（原始定款）2通または3通（紙定款：収入印紙4万円貼付）', required: true },
    { document_name: '電子定款の場合：電子署名付きPDF定款（印紙代4万円不要）', required: false },
    { document_name: '設立時社員全員の印鑑証明書（発行3か月以内）', required: true },
    { document_name: '設立時社員全員の実印（認証当日持参または委任状）', required: true },
    { document_name: '代理人が認証手続きを行う場合の委任状（代理人の実印・印鑑証明書）', required: false },
    {
      document_name: '実質的支配者となるべき者の申告書（反社確認・公証役場提出）',
      required: true,
    },
    { document_name: '定款認証手数料（5万円）の準備', required: true },

    // ─ 【STEP2】設立登記（法務局）─
    { document_name: '一般社団法人設立登記申請書', required: true },
    { document_name: '公証人認証済みの定款（原本）', required: true },
    { document_name: '設立時役員（理事・監事）の就任承諾書', required: true },
    { document_name: '設立時役員全員の印鑑証明書（発行3か月以内）', required: true },
    { document_name: '設立時代表理事の印鑑届書（法務局届出用実印）', required: true },
    { document_name: '設立時理事・監事の資格を証する書類（住民票等）', required: false },
    { document_name: '設立時社員の同意書（定款で定める以外の事項を決議した場合）', required: false },
    { document_name: '登録免許税（6万円）の収入印紙または電子納付', required: true },

    // ─ 登記後の手続き ─
    { document_name: '法人設立届出書（税務署・都道府県税事務所・市区町村）', required: true },
    { document_name: '健康保険・厚生年金保険 新規適用届（年金事務所）', required: false },
    { document_name: '法人実印の作成（登記後、印鑑証明書取得のため）', required: true },
  ],
}

/** 6. 公益社団法人 認定申請（設立後）
 *  根拠：公益社団法人及び公益財団法人の認定等に関する法律（令和6年12月改訂ガイドライン反映）
 *  所管：内閣府公益認定等委員会（内閣総理大臣所轄）または都道府県知事
 */
const TEMPLATE_KOUEKI_SHADAN: TemplateData = {
  name: '公益社団法人 認定申請（一般社団法人からの移行）',
  business_type: '法人設立',
  description:
    '公益認定等委員会（内閣府）または都道府県知事への公益認定申請。令和6年12月改訂の公益認定等ガイドライン・新公益法人会計基準に対応。審査期間は申請から約6か月。',
  items: [
    // ─ 申請書類 ─
    { document_name: '公益認定申請書（様式第1号）', required: true },
    { document_name: '定款（公益認定申請時点の現行定款）', required: true },
    { document_name: '法人の登記事項証明書（発行3か月以内）', required: true },

    // ─ 役員関係 ─
    { document_name: '役員名簿（氏名・住所・役職・常勤非常勤・他法人への役員兼務状況）', required: true },
    { document_name: '役員全員の欠格事由非該当誓約書（様式）', required: true },
    { document_name: '理事会・評議員会の構成の独立性説明書（親族・特定法人関係者の割合）', required: true },

    // ─ 事業計画・財務 ─
    { document_name: '申請年度及び翌年度の事業計画書', required: true },
    { document_name: '申請年度及び翌年度の収支予算書（正味財産増減予算書・貸借対照表予算含む）', required: true },
    { document_name: '直近3事業年度の事業報告書・財務諸表（正味財産増減計算書・貸借対照表・注記）', required: true },
    {
      document_name: '公認会計士または監査法人による監査報告書（直近事業年度分）',
      required: true,
    },

    // ─ 公益目的事業の説明 ─
    { document_name: '公益目的事業の概要を記載した書類（事業の内容・実施方法・財源等）', required: true },
    { document_name: 'パブリックサポートテスト（PST）の計算書（自己申告書）', required: true },

    // ─ ガバナンス ─
    { document_name: '理事会・評議員会・監事の職務執行体制の説明書', required: true },
    { document_name: '内部統制・コンプライアンス規程の写し', required: false },
    { document_name: '資産・会計の管理体制を記載した書類（経理規程等）', required: true },

    // ─ その他 ─
    { document_name: '公益認定等委員会への事前相談記録（推奨）', required: false },
    { document_name: '公益認定申請に係る添付書類一覧表（チェックリスト）', required: true },
  ],
}

// ═══════════════════════════════════════════════════════════════
// 宅建業・不動産 カテゴリ
// ═══════════════════════════════════════════════════════════════

/** 7. 宅地建物取引業免許申請（都道府県知事・新規）
 *  根拠：宅地建物取引業法第3条・同施行規則第1条の2
 *  令和7年4月1日様式変更（性別・生年月日欄削除）対応
 */
const TEMPLATE_TAKKEN_SHINKI: TemplateData = {
  name: '宅地建物取引業 免許申請（都道府県知事・新規）',
  business_type: '宅建業・不動産',
  description:
    '宅地建物取引業法第3条に基づく都道府県知事免許（1つの都道府県内のみに事務所を設置）の新規申請。令和7年4月1日からの様式変更対応。申請手数料3.3万円。',
  items: [
    // ─ 申請書類（正本1部・副本1部）─
    { document_name: '宅地建物取引業免許申請書（別記様式第1号・令和7年4月改訂版）', required: true },
    { document_name: '第1面（申請者の概要）', required: true },
    { document_name: '第2面（事務所の概要）', required: true },
    { document_name: '第3面（役員・政令使用人の概要）', required: true },
    { document_name: '第4面（専任の宅地建物取引士）', required: true },
    { document_name: '第5面（相談役・顧問・大株主等）', required: true },

    // ─ 法人関係 ─
    { document_name: '法人の登記事項証明書（履歴事項全部証明書・発行3か月以内）', required: true },
    { document_name: '定款の写し', required: true },
    { document_name: '直近の事業年度における貸借対照表（新設法人は設立時のもの）', required: true },
    { document_name: '株主名簿（5%超の株主を記載）', required: true },

    // ─ 役員・政令使用人 ─
    { document_name: '役員全員・政令使用人の住民票（本籍地記載・個人番号なし・発行3か月以内）', required: true },
    { document_name: '役員全員・政令使用人の身分証明書（市区町村発行：禁治産・後見・破産の記録なし）', required: true },
    { document_name: '役員全員・政令使用人の略歴書（過去5年の職歴）', required: true },
    { document_name: '役員全員・政令使用人の誓約書（欠格事由非該当）', required: true },

    // ─ 専任の宅地建物取引士 ─
    { document_name: '専任の宅地建物取引士の宅地建物取引士証の写し（有効期限内）', required: true },
    { document_name: '専任の宅地建物取引士の誓約書（専任性の確認）', required: true },
    { document_name: '専任の宅地建物取引士の在籍を証する書類（雇用契約書・勤務体制一覧等）', required: true },

    // ─ 事務所関係 ─
    { document_name: '事務所の使用権原を証する書類（賃貸借契約書または登記事項証明書）', required: true },
    { document_name: '事務所の写真（外観・内部・宅建業専用の独立スペースが確認できるもの）', required: true },
    { document_name: '事務所の案内図・平面図', required: true },

    // ─ 営業保証金・保証協会 ─
    {
      document_name:
        '営業保証金供託書の写し（本店：1,000万円、支店：500万円）または保証協会加入証明書',
      required: true,
    },
    { document_name: '宅地建物取引業保証協会への加入を証する書類（弁済業務保証金分担金：60万円等）', required: false },

    // ─ 申請手数料 ─
    { document_name: '免許申請手数料（都道府県収入証紙または電子納付：33,000円）', required: true },
  ],
}

/** 8. 宅地建物取引業免許更新申請（宅建業法第3条第3項）*/
const TEMPLATE_TAKKEN_KOSHIN: TemplateData = {
  name: '宅地建物取引業 免許更新申請（都道府県知事）',
  business_type: '宅建業・不動産',
  description:
    '宅建業法第3条第3項に基づく5年ごとの免許更新申請。有効期限90日前から30日前までに申請が必要。様式は令和7年4月改訂版を使用。',
  items: [
    // ─ 申請書類 ─
    { document_name: '宅地建物取引業免許申請書（更新・別記様式第1号）', required: true },
    { document_name: '第1面〜第5面（新規申請と同様の各面）', required: true },

    // ─ 法人関係 ─
    { document_name: '法人の登記事項証明書（発行3か月以内）', required: true },
    { document_name: '直近2事業年度の財務諸表（貸借対照表・損益計算書）', required: true },

    // ─ 役員・政令使用人 ─
    { document_name: '役員・政令使用人の住民票（本籍地記載・3か月以内）', required: true },
    { document_name: '役員・政令使用人の身分証明書（3か月以内）', required: true },
    { document_name: '役員・政令使用人の略歴書', required: true },
    { document_name: '役員・政令使用人の誓約書（欠格事由非該当）', required: true },

    // ─ 専任の宅建士 ─
    { document_name: '専任の宅地建物取引士証の写し（有効期限内・法定講習受講済み）', required: true },
    { document_name: '専任の宅建士の在籍を証する書類', required: true },

    // ─ 事務所 ─
    { document_name: '事務所の使用権原を証する書類（更新後も継続して使用できること）', required: true },
    { document_name: '事務所の写真（現況）', required: true },

    // ─ 標識・従業者名簿 ─
    {
      document_name: '従業者名簿（令和7年4月改訂：性別・生年月日欄削除、代表者氏名欄追加）',
      required: false,
    },
    {
      document_name:
        '標識（宅建業者票）の写真（令和7年4月改訂：「この事務所の代表者氏名」欄追加）',
      required: false,
    },

    // ─ 申請手数料 ─
    { document_name: '免許更新申請手数料（33,000円・都道府県収入証紙または電子納付）', required: true },

    // ─ 変更があった場合 ─
    { document_name: '変更届出書（役員・事務所・専任取引士等に変更がある場合）', required: false },
  ],
}

// ═══════════════════════════════════════════════════════════════
// 警備業・旅行業 カテゴリ
// ═══════════════════════════════════════════════════════════════

/** 9. 警備業認定申請（新規）
 *  根拠：警備業法第4条・同施行規則第4条
 *  所管：主たる営業所の所在地を管轄する都道府県公安委員会
 */
const TEMPLATE_KEIBI_NINTEI: TemplateData = {
  name: '警備業 認定申請（新規）',
  business_type: 'その他許認可',
  description:
    '警備業法第4条に基づく都道府県公安委員会への認定申請。申請手数料23,000円、審査期間約40日。有効期間5年（更新制）。警備員指導教育責任者の資格者証が必要。',
  items: [
    // ─ 申請書類 ─
    { document_name: '警備業認定申請書（法定様式）', required: true },

    // ─ 法人の場合 ─
    { document_name: '法人の定款の写し', required: true },
    { document_name: '法人の登記事項証明書（履歴事項全部証明書・発行3か月以内）', required: true },
    { document_name: '役員全員の住民票の写し（本籍地記載・個人番号記載なし・3か月以内）', required: true },
    {
      document_name:
        '役員全員の身分証明書（市区町村発行：禁治産・後見・破産等の記録がないことを証明）',
      required: true,
    },
    { document_name: '役員全員の履歴書（過去5年間の職歴・住所の記載）', required: true },
    { document_name: '役員全員の誓約書（警備業法第3条の欠格事由非該当）', required: true },
    { document_name: '役員全員の診断書（精神機能障害等に関する医師の診断書）', required: true },

    // ─ 警備員指導教育責任者 ─
    { document_name: '警備員指導教育責任者 資格者証の写し（業務区分ごとに選任）', required: true },
    { document_name: '警備員指導教育責任者の誓約書（欠格事由非該当）', required: true },
    { document_name: '警備員指導教育責任者の住民票（本籍地記載・3か月以内）', required: true },
    { document_name: '警備員指導教育責任者の身分証明書（3か月以内）', required: true },
    { document_name: '警備員指導教育責任者の履歴書', required: true },
    { document_name: '警備員指導教育責任者の診断書', required: true },

    // ─ 営業所関係 ─
    { document_name: '主たる営業所・その他の営業所の所在地を証する書類（賃貸借契約書等）', required: true },

    // ─ 個人事業の場合 ─
    {
      document_name:
        '個人の場合：申請者本人の住民票・身分証明書・履歴書・誓約書・診断書',
      required: false,
    },

    // ─ 手数料 ─
    { document_name: '認定申請手数料（23,000円・収入証紙または電子納付）', required: true },
  ],
}

/** 10. 旅行業登録申請（第3種・地域限定）
 *  根拠：旅行業法第3条・同施行規則第1条の5
 *  令和6年度：地域限定旅行業務取扱管理者試験 実施（観光庁）
 *  平成30年改正：地域限定旅行業者の旅行業務取扱管理者として選任可能
 */
const TEMPLATE_RYOKOGYO: TemplateData = {
  name: '旅行業 登録申請（第3種・地域限定）',
  business_type: 'その他許認可',
  description:
    '旅行業法第3条に基づく都道府県知事登録（第3種・地域限定）。地域限定は令和元年施行の改正旅行業法で創設。令和6年度より地域限定旅行業務取扱管理者試験実施。基準資産額：第3種100万円・地域限定100万円。',
  items: [
    // ─ 申請書類 ─
    {
      document_name: '旅行業登録申請書（様式第1号：新規・更新・変更登録申請書）',
      required: true,
    },

    // ─ 法人関係 ─
    { document_name: '定款の写し', required: true },
    { document_name: '法人の登記事項証明書（発行3か月以内）', required: true },
    { document_name: '直近の事業年度の貸借対照表（新設法人は設立時財産目録）', required: true },
    { document_name: '基準資産額の計算書（第3種・地域限定：100万円以上）', required: true },

    // ─ 役員関係 ─
    { document_name: '役員全員の住民票（本籍地記載・3か月以内）', required: true },
    { document_name: '役員全員の身分証明書（市区町村発行・3か月以内）', required: true },
    { document_name: '役員全員の略歴書・誓約書（旅行業法第6条の欠格事由非該当）', required: true },

    // ─ 旅行業務取扱管理者 ─
    {
      document_name:
        '旅行業務取扱管理者の資格証明書（地域限定：地域限定旅行業務取扱管理者試験合格証または国内旅行業務取扱管理者試験合格証・総合旅行業務取扱管理者試験合格証）',
      required: true,
    },
    {
      document_name:
        '旅行業務取扱管理者の選任を証する書類（在籍証明・雇用契約書等）',
      required: true,
    },
    {
      document_name:
        '旅行業務取扱管理者の定期研修を受講させる旨の誓約書（新規登録時）',
      required: true,
    },

    // ─ 営業所関係 ─
    { document_name: '営業所の使用権原を証する書類（賃貸借契約書または登記事項証明書）', required: true },
    { document_name: '営業所の平面図（旅行業専用スペースの確認）', required: false },

    // ─ 財産的基礎 ─
    { document_name: '財産に関する調書（様式第2号）', required: true },
    {
      document_name:
        '弁済業務保証金分担金の払込証明書（旅行業協会加入の場合：第3種1.5万円・地域限定0.5万円）または旅行業保証金の供託証書（第3種300万円・地域限定100万円）',
      required: true,
    },

    // ─ その他 ─
    { document_name: '欠格事由に該当しない旨の宣誓書（様式）', required: true },
    { document_name: '登録手数料（都道府県収入証紙：第3種・地域限定 各都道府県ごとに設定）', required: true },
    { document_name: '旅行業約款（国土交通大臣認可の標準約款を使用する場合は不要）', required: false },
  ],
}

// ═══════════════════════════════════════════════════════════════
// 補助金・助成金 カテゴリ
// ═══════════════════════════════════════════════════════════════

/** 11. 小規模事業者持続化補助金申請（通常枠）
 *  所管：中小企業庁・日本商工会議所・全国商工会連合会
 *  電子申請：Jグランツ（GビズIDプライムが必要）
 */
const TEMPLATE_JIZOKUKA: TemplateData = {
  name: '小規模事業者持続化補助金 申請（通常枠）',
  business_type: '補助金・助成金',
  description:
    '中小企業庁所管・日本商工会議所実施の持続化補助金（通常枠：補助上限50万円・補助率2/3）。電子申請（Jグランツ）が主流。商工会議所・商工会の事業支援計画書（様式4）が必要。',
  items: [
    // ─ 申請書類（電子申請：Jグランツ）─
    { document_name: 'GビズIDプライムの取得（電子申請に必須・取得まで約2週間）', required: true },
    { document_name: '補助金申請書（様式1：事業者の概要）', required: true },
    { document_name: '経営計画書（様式2：自社の経営状況・経営課題・今後の方針）', required: true },
    { document_name: '補助事業計画書（様式3：補助事業の内容・経費明細・効果）', required: true },

    // ─ 商工会議所・商工会 ─
    {
      document_name:
        '事業支援計画書（様式4：商工会議所または商工会が発行・締切前に必ず相談）',
      required: true,
    },

    // ─ 添付書類（法人）─
    { document_name: '直近1期分の確定申告書（法人税申告書：表紙・損益計算書・貸借対照表）の写し', required: true },
    { document_name: '法人の登記事項証明書（発行3か月以内）', required: true },

    // ─ 添付書類（個人事業主）─
    {
      document_name: '直近1期分の確定申告書（所得税：第一表・第二表・収支内訳書または青色申告決算書）の写し',
      required: false,
    },
    { document_name: '個人事業主の場合：開業届の写し（創業1年未満の場合）', required: false },
    {
      document_name:
        '個人事業主の場合：実印を押印した申請書の写し及び市区町村発行の印鑑登録証明書',
      required: false,
    },

    // ─ 賃金引上げ枠の場合 ─
    { document_name: '賃金引上げの特例を申請する場合：賃金台帳（直近1か月分）', required: false },

    // ─ 電子申請補足 ─
    { document_name: 'Jグランツ（補助金申請システム）上での申請完了確認スクリーンショット', required: false },
    { document_name: '見積書（補助事業に係る経費の見積：50万円超の場合は2者以上の相見積もり）', required: true },
    { document_name: '発注予定先・取引先との関係を説明する書類（関連会社・代表者の親族等の場合）', required: false },
  ],
}

/** 12. 事業再構築補助金申請
 *  所管：経済産業省・中小企業庁
 *  電子申請のみ（専用電子申請システム）
 */
const TEMPLATE_SAIKOCHIKU: TemplateData = {
  name: '事業再構築補助金 申請（成長枠・グリーン成長枠等）',
  business_type: '補助金・助成金',
  description:
    '経済産業省・中小企業庁所管の事業再構築補助金。電子申請専用システムのみ受付。GビズIDプライムが必要。認定支援機関（金融機関等）との事前確認が必須。補助額3,000万円超は金融機関の確認書も必要。',
  items: [
    // ─ 電子申請準備 ─
    { document_name: 'GビズIDプライムの取得（電子申請に必須・取得まで約2週間）', required: true },
    { document_name: '事業再構築補助金 電子申請システムへのログイン・申請者情報登録', required: true },

    // ─ 事業計画書 ─
    {
      document_name:
        '事業計画書（自由形式・15ページ以内推奨：現状分析・再構築内容・市場分析・収益計画・効果）',
      required: true,
    },
    { document_name: '認定支援機関による確認書（認定経営革新等支援機関が署名・押印）', required: true },
    {
      document_name:
        '金融機関（銀行・信用金庫等）による確認書（補助額3,000万円超の場合に追加で必要）',
      required: false,
    },

    // ─ 財務・売上関係 ─
    {
      document_name:
        '直近2期分の確定申告書（法人税申告書：別表一・損益計算書・貸借対照表）の写し',
      required: true,
    },
    {
      document_name: '売上高が対象期間（コロナ禍等）に減少したことを証明する書類（売上台帳・試算表等）',
      required: false,
    },
    {
      document_name:
        '付加価値額または売上高の10%以上減少を証明する書類（成長枠：主力製品・サービスが過去の市場縮小を示す資料）',
      required: false,
    },

    // ─ 法人関係 ─
    { document_name: '法人の登記事項証明書（発行3か月以内）', required: true },
    { document_name: '株主名簿（直近のもの）', required: false },

    // ─ 労働関係（賃上げ要件）─
    {
      document_name:
        '賃金引上げに係る誓約書（給与支給総額・事業場内最低賃金の引上げコミットメント）',
      required: true,
    },

    // ─ 業種・規模確認 ─
    { document_name: '中小企業・中堅企業に該当することを確認できる書類（従業員数・資本金等）', required: false },

    // ─ 見積もり・発注 ─
    { document_name: '設備投資等に係る見積書（補助対象経費ごとに2者以上の相見積もりを原則とする）', required: true },
    { document_name: '設備仕様書・カタログ等（設備の必要性・効果が確認できるもの）', required: false },

    // ─ グリーン成長枠の場合 ─
    {
      document_name:
        'グリーン成長枠を申請する場合：研究開発・技術開発または人材育成を行う計画を記載した書類',
      required: false,
    },

    // ─ 交付申請（採択後）─
    { document_name: '交付申請書（採択後・補助事業期間開始前に提出）', required: false },
    { document_name: '取得財産管理台帳（事業完了後）', required: false },
  ],
}

// ═══════════════════════════════════════════════════════════════
// エクスポート
// ═══════════════════════════════════════════════════════════════

/** 介護・福祉・NPO・宅建業・警備業・旅行業・補助金テンプレート一覧 */
export const WELFARE_NPO_TEMPLATES: TemplateData[] = [
  TEMPLATE_HOUMONKAIGO,
  TEMPLATE_SHURO_B,
  TEMPLATE_KYOTAKU_SHIEN,
  TEMPLATE_NPO_SETSURITSU,
  TEMPLATE_SHADAN_SETSURITSU,
  TEMPLATE_KOUEKI_SHADAN,
  TEMPLATE_TAKKEN_SHINKI,
  TEMPLATE_TAKKEN_KOSHIN,
  TEMPLATE_KEIBI_NINTEI,
  TEMPLATE_RYOKOGYO,
  TEMPLATE_JIZOKUKA,
  TEMPLATE_SAIKOCHIKU,
]
