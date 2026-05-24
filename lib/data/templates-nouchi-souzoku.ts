/**
 * 農地・産業廃棄物・相続・遺言 テンプレートデータ
 *
 * 参照法令・公式情報（2024〜2025年時点）:
 *   - 農地法（令和5年改正：農地取得の下限面積要件廃止、令和5年4月1日施行）
 *   - 農地法第3条の3（国籍等記載欄の追加、令和5年9月1日施行）
 *   - 廃棄物の処理及び清掃に関する法律（廃掃法）・同施行規則
 *   - 民法・不動産登記法（令和6年4月1日施行：相続登記義務化）
 *   - 相続土地国庫帰属制度（令和5年4月27日施行）
 *   - 自筆証書遺言書保管制度（法務省）
 *   - 法定相続情報証明制度（法務局）
 *   - 家事事件手続法（相続放棄）
 *
 * 農林水産省: https://www.maff.go.jp/j/nousin/noukei/totiriyo/nouchi_tenyo.html
 * 環境省:     https://www.env.go.jp/info/one-stop/11/023.html
 * 法務省:     https://www.moj.go.jp/MINJI/minji03_00051.html
 * 裁判所:     https://www.courts.go.jp/saiban/syurui/syurui_kazi/kazi_06_13/index.html
 */

import type { TemplateData } from './template-types'

// ══════════════════════════════════════════════════════════════════════════════
// 農地関係（農地法）テンプレート
// ══════════════════════════════════════════════════════════════════════════════

/**
 * 1. 農地転用許可申請（農地法第4条・自己転用）
 *    農地の所有者が自ら農地以外の目的に使用する場合
 *    申請先：農業委員会（4ha以下）または都道府県知事・農林水産大臣（4ha超）
 */
const nochi4jo: TemplateData = {
  name: '農地転用許可申請（農地法第4条・自己転用）',
  business_type: '農地・農業',
  description:
    '農地所有者が自ら農地を宅地・資材置場・駐車場等に転用する場合の許可申請。農業振興地域の農用地区域内の場合は事前に農振除外手続きが必要。4ha以下は農業委員会経由で都道府県知事、4ha超は農林水産大臣許可。',
  items: [
    // ─ 申請書本体 ─
    { document_name: '農地法第4条第1項の規定による許可申請書（様式例第4号の1）', required: true },
    { document_name: '転用事業の概要を記載した事業計画書', required: true },

    // ─ 土地関係書類 ─
    { document_name: '土地の登記事項証明書（全部事項証明書）', required: true },
    { document_name: '公図の写し（地番が確認できるもの）', required: true },
    { document_name: '付近見取図（1/5,000〜1/10,000程度）', required: true },
    { document_name: '土地の現況を示す図面（地目・地番・面積・隣地地番記載）', required: true },
    { document_name: '建設計画に係る図面（平面図・配置図 1/200〜1/2,000程度）', required: true },
    { document_name: '転用後の土地利用計画図', required: true },

    // ─ 申請地に関わる権利・同意書類 ─
    { document_name: '転用の妨げとなる権利を有する者の同意書（抵当権者・賃借人等がいる場合）', required: false },
    { document_name: '土地改良区の意見書（申請地が土地改良地区内にある場合）', required: false },

    // ─ 資力証明 ─
    { document_name: '転用事業を実施するために十分な資力を有することを証する書面（残高証明書・預貯金通帳の写し・貸借対照表のいずれか）', required: true },

    // ─ 農業振興地域関係（農用地区域内の場合） ─
    {
      document_name:
        '【農用地区域内の場合】農業振興地域整備計画変更（農振除外）申請書及び許可書の写し（転用申請前に農振除外が完了していること）',
      required: false,
    },
    { document_name: '農業振興地域の農用地区域に該当しないことを確認できる書面（農業振興地域外の場合）', required: false },

    // ─ 現況写真・その他 ─
    { document_name: '申請地の現況写真（4方向以上・作物の生育状況が確認できるもの）', required: true },
    { document_name: '転用後の施設・建物の構造・用途を説明する書面', required: true },
    { document_name: '申請者が法人の場合：定款の写し・登記事項証明書', required: false },
    { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
  ],
}

/**
 * 2. 農地転用許可申請（農地法第5条・権利移転を伴う転用）
 *    農地を農地以外の目的で取得または賃借する場合
 *    申請先：農業委員会経由で都道府県知事または農林水産大臣
 */
const nochi5jo: TemplateData = {
  name: '農地転用許可申請（農地法第5条・権利移転を伴う転用）',
  business_type: '農地・農業',
  description:
    '農地を農地以外の目的で第三者が取得・賃借する場合の許可申請（例：住宅用地取得・資材置場整備目的での購入）。第4条申請に加え、権利移転に関する書類が追加で必要。農業振興地域農用地区域内は事前の農振除外手続きが必要。',
  items: [
    // ─ 申請書本体 ─
    { document_name: '農地法第5条第1項の規定による許可申請書（様式例第5号の1）', required: true },
    { document_name: '転用事業の概要を記載した事業計画書', required: true },

    // ─ 土地関係書類 ─
    { document_name: '土地の登記事項証明書（全部事項証明書）', required: true },
    { document_name: '公図の写し（地番が確認できるもの）', required: true },
    { document_name: '付近見取図（1/5,000〜1/10,000程度）', required: true },
    { document_name: '土地の現況を示す図面（地目・地番・面積・隣地地番記載）', required: true },
    { document_name: '建設計画に係る図面（平面図・配置図 1/200〜1/2,000程度）', required: true },
    { document_name: '転用後の土地利用計画図', required: true },

    // ─ 権利移転関係書類 ─
    { document_name: '売買契約書または売買予約契約書の写し（買主・売主双方署名捺印のもの）', required: true },
    { document_name: '賃貸借契約書の写し（権利設定の場合）', required: false },
    { document_name: '農地の所有者（売主・貸主）の同意書', required: true },

    // ─ 転用の妨げとなる権利者の同意書類 ─
    { document_name: '転用の妨げとなる権利を有する者の同意書（抵当権者等がいる場合）', required: false },
    { document_name: '土地改良区の意見書（申請地が土地改良地区内にある場合）', required: false },

    // ─ 資力証明 ─
    { document_name: '転用事業を実施するために十分な資力を有することを証する書面（残高証明書・預貯金通帳の写し等）', required: true },

    // ─ 農業振興地域関係 ─
    {
      document_name:
        '【農用地区域内の場合】農振除外申請書及び許可書の写し（転用申請前に完了要）',
      required: false,
    },

    // ─ 現況・その他 ─
    { document_name: '申請地の現況写真（4方向以上）', required: true },
    { document_name: '転用後の施設・建物の構造・用途を説明する書面', required: true },
    { document_name: '申請者（取得者）が法人の場合：定款の写し・登記事項証明書', required: false },
    { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
  ],
}

/**
 * 3. 農地法第3条許可申請（農地の権利取得）
 *    農地を農地のまま権利移転・設定する場合
 *    令和5年4月1日改正：農地取得の下限面積要件（原則50a）を撤廃
 *    申請先：農業委員会
 */
const nochi3jo: TemplateData = {
  name: '農地法第3条許可申請（農地の権利取得・耕作目的）',
  business_type: '農地・農業',
  description:
    '農地を農地のまま売買・贈与・賃貸借等で権利を移転・設定する場合の許可申請。令和5年4月1日の農地法改正により下限面積要件（原則50a）が廃止。全部効率利用要件・農作業常時従事要件・地域との調和要件を満たすことが必要。申請先は農地所在地の農業委員会。',
  items: [
    // ─ 申請書本体 ─
    { document_name: '農地法第3条の規定による許可申請書（様式例第1号の1・個人用または法人用）', required: true },
    { document_name: '農業経営の状況を記載した書面（耕作計画書・農業経営計画書）', required: true },

    // ─ 土地関係書類 ─
    { document_name: '土地の登記事項証明書（全部事項証明書）', required: true },
    { document_name: '公図の写し（地番が確認できるもの）', required: true },
    { document_name: '申請地及び申請者が現に耕作する農地の位置図（付近見取図）', required: true },

    // ─ 権利移転関係書類 ─
    { document_name: '農地売買契約書または売買予約契約書の写し', required: true },
    { document_name: '農地賃貸借契約書の写し（賃借権設定の場合）', required: false },
    { document_name: '贈与契約書の写し（贈与の場合）', required: false },
    { document_name: '農地の所有者（売主・貸主）の同意書', required: true },

    // ─ 申請者の農業経営状況 ─
    { document_name: '申請者の農業経営の状況を証する書面（農業手帳・農地台帳の写し等）', required: true },
    { document_name: '申請者（世帯員含む）の農作業常時従事状況を証する書面', required: true },
    { document_name: '現在耕作中の農地の一覧表（地番・面積・作付け作物を記載）', required: true },

    // ─ 法人の場合 ─
    { document_name: '【農業法人の場合】農業法人の定款の写し・登記事項証明書', required: false },
    { document_name: '【農業法人の場合】農業法人の組合員・社員・株主の氏名・農業への従事状況等を記載した書面', required: false },

    // ─ 農業委員会意見書等 ─
    { document_name: '土地改良区の意見書（申請地が土地改良地区内にある場合）', required: false },

    // ─ その他 ─
    { document_name: '申請地の現況写真', required: true },
    { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
  ],
}

/**
 * 4. 農地法第3条の3届出（相続等による権利取得届出）
 *    相続・遺産分割・包括遺贈・法人合併等で農地を取得した場合
 *    権利取得を知った日から概ね10か月以内に農業委員会へ届出
 *    令和5年9月1日より届出書に国籍等の記載欄が追加
 */
const nochi3jono3: TemplateData = {
  name: '農地法第3条の3届出（相続等による農地権利取得届出）',
  business_type: '農地・農業',
  description:
    '相続（遺産分割・包括遺贈を含む）、法人の合併・分割、時効等により農地の権利を取得した場合に農業委員会へ届出。農地法第3条（許可申請）は不要だが、届出は義務。権利の取得を知った日から概ね10か月以内に提出。令和5年9月1日より届出書に国籍等の記載欄が追加。',
  items: [
    // ─ 届出書本体 ─
    { document_name: '農地法第3条の3第1項の規定による届出書（国籍等の記載欄あり：令和5年9月1日改正後様式）', required: true },

    // ─ 権利取得を証明する書類 ─
    { document_name: '農地の登記事項証明書（相続登記完了後のもの）', required: true },
    { document_name: '遺産分割協議書の写し（遺産分割により取得した場合）', required: false },
    { document_name: '遺言書の写しまたは遺言執行者の証明書（遺贈の場合）', required: false },
    { document_name: '相続の事実を証する戸籍謄本（被相続人・届出人の関係が確認できるもの）', required: true },
    { document_name: '被相続人の死亡が記載された戸籍謄本または除籍謄本', required: true },
    { document_name: '法定相続情報一覧図の写し（戸籍謄本類に代えて使用可）', required: false },
    { document_name: '法人合併・分割を証する書面（法人の合併・分割による取得の場合）', required: false },

    // ─ 届出者関係書類 ─
    { document_name: '届出者の住民票（本人確認・住所確認のため）', required: true },
    { document_name: '届出者が法人の場合：登記事項証明書', required: false },

    // ─ 土地関係書類 ─
    { document_name: '公図の写し（農地の位置確認のため）', required: true },
    { document_name: '農地の現況写真', required: false },

    // ─ その他 ─
    { document_name: '委任状（行政書士等が代理届出する場合）', required: false },
  ],
}

// ══════════════════════════════════════════════════════════════════════════════
// 産業廃棄物関係（廃掃法）テンプレート
// ══════════════════════════════════════════════════════════════════════════════

/**
 * 5. 産業廃棄物収集運搬業許可申請（新規・積替え保管なし）
 *    廃棄物の処理及び清掃に関する法律第14条に基づく許可
 *    申請先：運搬を行う各都道府県・政令市（積替え保管なしの場合は積込み地・降ろし地の両方）
 *    JWセンター（公益財団法人日本産業廃棄物処理振興センター）の講習会修了が必要
 */
const sanpaiShushu: TemplateData = {
  name: '産業廃棄物収集運搬業許可申請（新規・積替え保管なし）',
  business_type: '産業廃棄物',
  description:
    '廃棄物の処理及び清掃に関する法律第14条に基づく産業廃棄物収集運搬業（積替え保管なし）の新規許可申請。申請先は運搬実施区域（積込み地・降ろし地）の都道府県・政令市ごと。JWセンター実施の産業廃棄物収集運搬課程の講習会修了が必須要件。',
  items: [
    // ─ 申請書本体 ─
    { document_name: '産業廃棄物収集運搬業許可申請書（廃掃法施行規則第9条の2第2項に基づく様式）', required: true },
    { document_name: '事業計画の概要を記載した書類（取り扱う廃棄物の種類・運搬先・運搬方法）', required: true },
    { document_name: '事業の開始に要する資金の総額及び調達方法を記載した書類（資金計画書）', required: true },

    // ─ 講習会修了証明 ─
    { document_name: 'JWセンター（公益財団法人日本産業廃棄物処理振興センター）実施の産業廃棄物収集運搬課程の講習会修了証の写し（法人の場合は代表者または業務執行役員が受講）', required: true },

    // ─ 法人関係書類 ─
    { document_name: '定款の写し（目的欄に「産業廃棄物収集運搬業」または「廃棄物処理業」の記載があること）', required: true },
    { document_name: '登記事項証明書（履歴事項全部証明書）', required: true },
    { document_name: '5%以上の株主または出資者が法人の場合：その法人の登記事項証明書', required: false },
    { document_name: '株主名簿または出資者名簿', required: true },
    { document_name: '欠格事項に該当しないことの誓約書（法人の代表者・役員・政令使用人・株主等全員分）', required: true },

    // ─ 役員・代表者関係 ─
    { document_name: '代表者・全役員・政令使用人の住民票（本籍地記載・マイナンバー記載なし）', required: true },
    { document_name: '代表者・全役員・政令使用人の成年後見登記制度における登記されていないことの証明書（東京法務局発行）', required: true },

    // ─ 財務関係書類 ─
    { document_name: '直前3年の各事業年度における貸借対照表・損益計算書（新設法人は期首の財務状況）', required: true },
    { document_name: '直前3年の各事業年度の法人税の納税証明書（その1）', required: true },

    // ─ 車両関係 ─
    { document_name: '使用する車両の車検証の写し（全車両）', required: true },
    { document_name: '使用する車両の写真（車体前面・側面・後面・番号が確認できるもの）', required: true },
    { document_name: '車両のリース契約書の写し（リース車両の場合）', required: false },
    { document_name: '車両の積載可能な産業廃棄物の種類および容量を記載した書類', required: true },

    // ─ 事業所関係 ─
    { document_name: '事業所の付近見取図（所在地が確認できるもの）', required: true },
    { document_name: '事業所の使用権原を証する書面（賃貸借契約書または登記事項証明書）', required: true },

    // ─ マニフェスト管理関係 ─
    { document_name: 'マニフェスト（産業廃棄物管理票）の取り扱い方法を記載した書類（電子マニフェスト利用の場合は加入証明）', required: false },

    // ─ その他 ─
    { document_name: '個人申請の場合：住民票（本籍地記載）および成年後見登記されていないことの証明書', required: false },
    { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
  ],
}

/**
 * 6. 産業廃棄物処分業許可申請（新規）
 *    廃棄物の処理及び清掃に関する法律第14条の4に基づく許可
 *    施設の設置・構造・維持管理基準を満たすことが必要
 *    JWセンターの処分課程講習会修了が必須
 */
const sanpaiShobun: TemplateData = {
  name: '産業廃棄物処分業許可申請（新規）',
  business_type: '産業廃棄物',
  description:
    '廃棄物の処理及び清掃に関する法律第14条の4に基づく産業廃棄物処分業の新規許可申請。申請先は処分施設所在地の都道府県・政令市。施設の設置・構造・維持管理が廃掃法施行令・施行規則の技術上の基準に適合することの証明が必要。JWセンター実施の処分課程講習会修了が必須。',
  items: [
    // ─ 申請書本体 ─
    { document_name: '産業廃棄物処分業許可申請書（廃掃法施行規則第10条の5第2項に基づく様式）', required: true },
    { document_name: '事業計画の概要を記載した書類（処分する廃棄物の種類・処分方法・処理能力）', required: true },
    { document_name: '事業の開始に要する資金の総額及び調達方法を記載した書類（資金計画書）', required: true },

    // ─ 講習会修了証明 ─
    { document_name: 'JWセンター実施の産業廃棄物処分課程の講習会修了証の写し（法人の場合は代表者または業務執行役員が受講）', required: true },

    // ─ 施設関係書類（最重要）─
    { document_name: '処分施設の構造を明らかにする図面（平面図・立面図・断面図・構造図及び設計計算書）', required: true },
    { document_name: '処分施設の設置場所の付近見取図（1/2,500〜1/10,000程度）', required: true },
    { document_name: '処分施設の所有権または使用権原を有することを証する書面（登記事項証明書・賃貸借契約書等）', required: true },
    { document_name: '廃棄物の保管場所の構造・容量を示す図面', required: true },
    { document_name: '処分施設の維持管理計画書（モニタリング計画・定期点検計画含む）', required: true },
    { document_name: '施設が廃掃法施行令・施行規則の技術上の基準に適合していることを証する書類', required: true },
    { document_name: '処分した産業廃棄物の残さ・残渣の処理先を示す書面（委託契約書の写し等）', required: true },
    { document_name: '施設の現況写真（施設全景・内部・搬出入口）', required: true },

    // ─ 法人関係書類 ─
    { document_name: '定款の写し（目的欄に「産業廃棄物処分業」の記載があること）', required: true },
    { document_name: '登記事項証明書（履歴事項全部証明書）', required: true },
    { document_name: '株主名簿または出資者名簿', required: true },
    { document_name: '欠格事項に該当しないことの誓約書（代表者・役員・政令使用人・株主等全員分）', required: true },

    // ─ 役員・代表者関係 ─
    { document_name: '代表者・全役員・政令使用人の住民票（本籍地記載・マイナンバー記載なし）', required: true },
    { document_name: '代表者・全役員・政令使用人の成年後見登記されていないことの証明書', required: true },

    // ─ 財務関係書類 ─
    { document_name: '直前3年の各事業年度における貸借対照表・損益計算書', required: true },
    { document_name: '直前3年の各事業年度の法人税の納税証明書（その1）', required: true },

    // ─ その他 ─
    { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
  ],
}

/**
 * 7. 産業廃棄物収集運搬業許可更新申請
 *    許可の有効期間は5年（更新）、優良認定業者は7年
 *    有効期間満了の概ね2〜3か月前から申請可能
 */
const sanpaiKoshin: TemplateData = {
  name: '産業廃棄物収集運搬業許可更新申請（積替え保管なし）',
  business_type: '産業廃棄物',
  description:
    '産業廃棄物収集運搬業許可（積替え保管なし）の5年ごとの更新申請。優良認定業者は7年有効。有効期間満了の2〜3か月前から申請受付。JWセンターの更新用講習会修了が必要（有効期間内に受講）。新規許可取得後に車両・役員等に変更がある場合は変更届も確認。',
  items: [
    // ─ 申請書本体 ─
    { document_name: '産業廃棄物収集運搬業許可更新申請書', required: true },
    { document_name: '事業計画の概要を記載した書類（取り扱う廃棄物の種類・運搬先・運搬方法）', required: true },
    { document_name: '事業の開始に要する資金の総額及び調達方法を記載した書類', required: true },

    // ─ 現在の許可書 ─
    { document_name: '現在の産業廃棄物収集運搬業許可証の写し', required: true },

    // ─ 講習会修了証 ─
    { document_name: 'JWセンター実施の産業廃棄物収集運搬課程（更新用）の講習会修了証の写し（現在の許可期間内に受講したもの）', required: true },

    // ─ 法人関係書類 ─
    { document_name: '定款の写し（目的欄に「産業廃棄物収集運搬業」の記載）', required: true },
    { document_name: '登記事項証明書（履歴事項全部証明書・申請日より3か月以内のもの）', required: true },
    { document_name: '株主名簿または出資者名簿', required: true },
    { document_name: '欠格事項に該当しないことの誓約書（代表者・役員・政令使用人・株主等全員分）', required: true },

    // ─ 役員・代表者関係 ─
    { document_name: '代表者・全役員・政令使用人の住民票（本籍地記載）', required: true },
    { document_name: '代表者・全役員・政令使用人の成年後見登記されていないことの証明書', required: true },

    // ─ 財務関係書類 ─
    { document_name: '直前3年の各事業年度における貸借対照表・損益計算書', required: true },
    { document_name: '直前3年の各事業年度の法人税の納税証明書（その1）', required: true },

    // ─ 車両関係 ─
    { document_name: '使用する車両の車検証の写し（全車両・有効期限内のもの）', required: true },
    { document_name: '使用する車両の写真（前面・側面・後面）', required: true },
    { document_name: '車両のリース契約書の写し（リース車両の場合）', required: false },

    // ─ 事業所関係 ─
    { document_name: '事業所の付近見取図', required: true },
    { document_name: '事業所の使用権原を証する書面（賃貸借契約書または登記事項証明書）', required: true },

    // ─ 優良認定申請（任意） ─
    { document_name: '【優良認定申請の場合】情報公開・環境配慮・電子マニフェスト使用・財務体質健全性に関する資料', required: false },

    // ─ その他 ─
    { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
  ],
}

// ══════════════════════════════════════════════════════════════════════════════
// 相続・遺言関係テンプレート
// ══════════════════════════════════════════════════════════════════════════════

/**
 * 8. 遺産分割協議書作成支援（相続人確認・書類収集）
 *    令和6年4月1日施行：相続登記の申請義務化（知った日から3年以内）
 *    令和5年4月27日施行：相続土地国庫帰属制度
 */
const isanBunkatsu: TemplateData = {
  name: '遺産分割協議書作成支援（相続人確認・書類収集）',
  business_type: '相続・遺言',
  description:
    '相続人全員の合意のもと遺産分割協議書を作成する際の書類収集・確認支援。令和6年4月1日から相続登記が義務化（所有権取得を知った日から3年以内。正当な理由なき懈怠は10万円以下の過料）。不要な土地は令和5年施行の相続土地国庫帰属制度の活用も検討。',
  items: [
    // ─ 被相続人に関する書類 ─
    {
      document_name:
        '被相続人の出生から死亡までの連続した戸籍謄本・除籍謄本・改製原戸籍謄本（全相続人を特定するために必須：本籍地の市区町村役場で取得）',
      required: true,
    },
    { document_name: '被相続人の死亡が記載された戸籍謄本または除籍謄本', required: true },
    { document_name: '被相続人の住民票の除票（本籍地記載）または戸籍の附票', required: true },

    // ─ 相続人全員に関する書類 ─
    { document_name: '相続人全員の現在の戸籍謄本（被相続人との関係が確認できるもの）', required: true },
    { document_name: '相続人全員の住民票（不動産を取得する者は本籍地記載のもの）', required: true },
    { document_name: '相続人全員の印鑑証明書（遺産分割協議書への実印押印・3か月以内のもの）', required: true },
    { document_name: '法定相続情報一覧図の写し（戸籍謄本類の代替として利用可・法務局で交付）', required: false },

    // ─ 不動産関係書類 ─
    { document_name: '相続不動産の登記事項証明書（全部事項証明書・法務局で取得）', required: true },
    { document_name: '相続不動産の固定資産評価証明書または固定資産税・都市計画税納税通知書（課税明細書）', required: true },
    { document_name: '相続不動産の地積測量図または建物図面（法務局で取得）', required: false },

    // ─ 金融資産関係書類 ─
    { document_name: '預貯金通帳の写しまたは残高証明書（被相続人の全金融機関・相続開始日現在の残高）', required: true },
    { document_name: '有価証券・株式の評価証明書または残高証明書', required: false },
    { document_name: '生命保険証書の写し（死亡保険金の受取人確認のため）', required: false },

    // ─ 負債関係書類 ─
    { document_name: '借入金・ローンの残高証明書（相続財産に負債がある場合）', required: false },
    { document_name: '保証債務の確認書類（被相続人が保証人になっていた場合）', required: false },

    // ─ 遺言書関係 ─
    { document_name: '遺言書（自筆証書遺言の場合：家庭裁判所の検認証明書または法務局の保管証・遺言書の写し）', required: false },
    { document_name: '遺言書（公正証書遺言の場合：公正証書遺言の写し）', required: false },

    // ─ 相続登記義務化（令和6年4月1日施行）対応 ─
    {
      document_name:
        '【令和6年4月義務化】相続登記申請書（法務局提出用）：遺産分割成立から3年以内に申請義務あり',
      required: false,
    },
    {
      document_name:
        '【相続土地国庫帰属制度・令和5年4月施行】相続土地国庫帰属承認申請書（不要な土地の国庫帰属を希望する場合：審査手数料1筆14,000円）',
      required: false,
    },

    // ─ 遺産分割協議書 ─
    { document_name: '遺産分割協議書（相続人全員の実印押印・印鑑証明書を添付）', required: true },
    { document_name: '委任状（行政書士等が代理で書類収集・調査を行う場合）', required: false },
  ],
}

/**
 * 9. 法定相続情報一覧図の保管・交付申請（法務局）
 *    相続手続きの簡略化のため、法務局に申し出て認証済み一覧図の交付を受ける
 *    申し出から5年間保存・再交付可能（無料）
 */
const hoteisouzokuJoho: TemplateData = {
  name: '法定相続情報一覧図の保管及び交付申出（法務局）',
  business_type: '相続・遺言',
  description:
    '相続手続きの簡略化を図る法定相続情報証明制度の利用申し出。法務局に戸籍謄本類と法定相続情報一覧図を提出し、登記官の認証文付き一覧図の写しを無料で必要通数交付してもらう。交付された写しは各種相続手続き（不動産登記・金融機関等）で戸籍謄本の代わりに使用可能。5年間再交付可能。',
  items: [
    // ─ 申出書 ─
    { document_name: '法定相続情報一覧図の保管及び交付の申出書（別記第1号様式）', required: true },
    { document_name: '法定相続情報一覧図（申出人が自ら作成するもの・A4用紙・所定の記載事項あり）', required: true },

    // ─ 被相続人に関する書類 ─
    {
      document_name:
        '被相続人の出生から死亡までの連続した戸籍謄本・除籍謄本・改製原戸籍謄本（全セット）',
      required: true,
    },
    { document_name: '被相続人の住民票の除票（本籍地記載）または戸籍の附票', required: true },

    // ─ 相続人全員に関する書類 ─
    { document_name: '相続人全員の現在の戸籍謄本（続柄が確認できるもの）', required: true },
    { document_name: '相続人の住民票（住所が一覧図に記載される相続人分）', required: false },

    // ─ 申出人の本人確認書類 ─
    { document_name: '申出人（またはその代理人）の氏名・住所が確認できる公的書類（運転免許証表裏両面の写し・マイナンバーカード表面の写し・住民票の写しのいずれか）', required: true },

    // ─ 代理人関係 ─
    { document_name: '委任状（親族以外の代理人による申出の場合：行政書士・司法書士等）', required: false },
    { document_name: '代理人の資格を証する書類（資格者代理人の場合：弁護士・司法書士・行政書士等の証明）', required: false },

    // ─ その他 ─
    { document_name: '不動産がある場合：相続不動産の登記事項証明書（被相続人の最後の住所確認のため）', required: false },
    { document_name: '返信用封筒・切手（郵送で一覧図の写しの交付を受ける場合）', required: false },
  ],
}

/**
 * 10. 自筆証書遺言書保管申請（法務局）
 *     法務省令で定める様式に従った自筆証書遺言書を法務局（遺言書保管所）に保管
 *     遺言者本人が管轄の法務局へ事前予約の上、出頭して申請
 *     申請手数料：1件3,900円
 */
const juhitsushoyo: TemplateData = {
  name: '自筆証書遺言書保管申請（法務局・遺言書保管所）',
  business_type: '相続・遺言',
  description:
    '法務省が運営する自筆証書遺言書保管制度（令和2年7月10日施行）の申請。遺言者本人が管轄の遺言書保管所（法務局）に事前予約の上、出頭して申請。保管手数料1件3,900円。家庭裁判所の検認が不要になる。遺言者の住所地・本籍地・所有不動産所在地のいずれかを管轄する法務局に申請。遺言書は法務省令で定める様式（各ページに通し番号記載、封のされていないもの）で作成。',
  items: [
    // ─ 申請書 ─
    { document_name: '遺言書保管申請書（法務省所定の様式・法務局窓口またはホームページから入手）', required: true },

    // ─ 遺言書本体 ─
    {
      document_name:
        '自筆証書遺言書の原本（法務省令で定める様式に従って作成：A4サイズ・各ページに通し番号記載・封なし・本文・作成日・氏名を手書き・押印）',
      required: true,
    },
    { document_name: '財産目録（自書でない財産目録を添付する場合：各ページに署名押印）', required: false },

    // ─ 遺言者の本人確認書類 ─
    {
      document_name:
        '遺言者本人確認書類（マイナンバーカード・運転免許証・在留カードのいずれか1点、または住民票の写し等の2点）',
      required: true,
    },

    // ─ 手数料 ─
    { document_name: '申請手数料：1件3,900円分の収入印紙（申請書に貼付）', required: true },

    // ─ 遺言書の記載内容確認のための書類 ─
    { document_name: '不動産に関する遺言がある場合：固定資産税の課税明細書または登記事項証明書（遺言書の記載内容確認のため）', required: false },
    { document_name: '法定相続人の範囲を確認できる書類（任意：事前に相続関係の確認に活用）', required: false },

    // ─ 事前予約 ─
    { document_name: '遺言書保管所への来庁予約（電話またはウェブ予約システムで事前予約必須）', required: true },

    // ─ その他 ─
    {
      document_name:
        '【遺言書変更の場合】変更の申請書および変更後の遺言書（保管中の遺言書を変更・撤回する場合は別途手続き）',
      required: false,
    },
    {
      document_name:
        '【閲覧・交付請求の場合】遺言書の閲覧請求書または遺言書情報証明書・遺言書保管事実証明書の交付請求書（相続開始後に相続人等が請求する場合）',
      required: false,
    },
  ],
}

/**
 * 11. 公正証書遺言作成支援
 *     公証役場で公証人が作成・原本保存
 *     証人2名以上の立会いが必要（行政書士等も証人になれる）
 */
const kojinshosho: TemplateData = {
  name: '公正証書遺言作成支援（公証役場手続き）',
  business_type: '相続・遺言',
  description:
    '公証役場において公証人が作成する公正証書遺言の作成支援。証人2名以上の立会いが必要（推定相続人・受遺者およびその配偶者・直系血族は証人不可）。原本は公証役場に保管。家庭裁判所の検認不要。自筆証書遺言に比べ信頼性・安全性が高い。公証人手数料は遺言財産の価額により異なる。',
  items: [
    // ─ 遺言者に関する書類 ─
    { document_name: '遺言者の本人確認書類（実印・印鑑証明書または顔写真付き公的証明書2点）', required: true },
    { document_name: '遺言者の戸籍謄本（現在の戸籍・相続人との関係確認のため）', required: true },
    { document_name: '遺言者の印鑑証明書（3か月以内のもの・実印確認のため）', required: true },

    // ─ 相続人・受遺者に関する書類 ─
    { document_name: '相続人全員の戸籍謄本（遺言者との続柄確認のため）', required: true },
    { document_name: '受遺者（相続人以外に遺贈する場合）の住民票', required: false },
    { document_name: '法定相続情報一覧図の写し（戸籍謄本類の代替として利用可）', required: false },

    // ─ 財産に関する書類 ─
    { document_name: '不動産の登記事項証明書（全部事項証明書）', required: true },
    { document_name: '不動産の固定資産評価証明書または固定資産税納税通知書（課税明細書）', required: true },
    { document_name: '預貯金の通帳の写しまたは残高証明書（金融機関名・口座番号確認のため）', required: true },
    { document_name: '有価証券・株式の評価証明書（株式等がある場合）', required: false },
    { document_name: '生命保険証書の写し（受取人指定に関する内容を遺言に含める場合）', required: false },

    // ─ 証人関係 ─
    { document_name: '証人2名の氏名・住所・生年月日・職業を記載したメモ（公証人が証人情報を遺言書に記載）', required: true },
    { document_name: '証人の本人確認書類（立会い当日に持参）', required: true },

    // ─ 遺言内容の確定 ─
    { document_name: '遺言内容の草案・メモ（行政書士が整理して公証人に提出）', required: true },
    { document_name: '祭祀承継者・遺言執行者の指定がある場合：その者の住民票', required: false },

    // ─ 公証人手数料 ─
    { document_name: '公証人手数料（遺言財産の価額に応じた金額・公証役場で確認）', required: true },

    // ─ その他 ─
    { document_name: '委任状（行政書士が代理で公証役場との調整・原案作成を行う場合）', required: false },
    { document_name: '遺言執行者の就任承諾書（遺言執行者を指定する場合・事前に承諾を得る）', required: false },
  ],
}

/**
 * 12. 相続放棄申述書作成支援（家庭裁判所）
 *     相続開始を知った日から3か月以内に被相続人の最後の住所地を管轄する家庭裁判所へ申述
 *     申述人と被相続人との関係（配偶者・子・親・兄弟姉妹）によって必要書類が異なる
 */
const souzokuHoki: TemplateData = {
  name: '相続放棄申述書作成支援（家庭裁判所）',
  business_type: '相続・遺言',
  description:
    '相続開始を知った日から3か月以内に、被相続人の最後の住所地を管轄する家庭裁判所に相続放棄の申述書を提出。申述人と被相続人との関係により必要な戸籍謄本の範囲が異なる。行政書士は書類作成支援のみ（申述書の提出は本人または弁護士・司法書士が行う）。申し立て費用：収入印紙800円＋郵便切手。',
  items: [
    // ─ 申述書 ─
    { document_name: '相続放棄申述書（家庭裁判所所定の書式・成人用または未成年者用）', required: true },
    { document_name: '収入印紙800円（申述書に貼付・申述人1名につき）', required: true },
    { document_name: '連絡用郵便切手（家庭裁判所指定の金額分）', required: true },

    // ─ 被相続人に関する書類（共通） ─
    { document_name: '被相続人の死亡が記載された戸籍謄本（除籍謄本・改製原戸籍謄本）', required: true },
    { document_name: '被相続人の住民票の除票または戸籍の附票（最後の住所確認のため）', required: true },

    // ─ 申述人と被相続人の関係別必要書類 ─
    {
      document_name:
        '【配偶者が申述する場合】申述人（配偶者）の現在の戸籍謄本',
      required: true,
    },
    {
      document_name:
        '【子・孫が申述する場合】申述人の現在の戸籍謄本（代襲相続人の場合は被代襲者の死亡記載の戸籍も必要）',
      required: false,
    },
    {
      document_name:
        '【親・祖父母（直系尊属）が申述する場合】被相続人の出生から死亡までの連続した戸籍謄本・申述人の現在の戸籍謄本・子が全員放棄済みの場合はその証明書',
      required: false,
    },
    {
      document_name:
        '【兄弟姉妹・甥姪が申述する場合】被相続人の出生から死亡までの連続した戸籍謄本・申述人の現在の戸籍謄本・親の死亡が確認できる戸籍謄本・子が全員放棄済みの証明書',
      required: false,
    },

    // ─ 法定相続情報一覧図の活用 ─
    { document_name: '法定相続情報一覧図の写し（戸籍謄本類の一部代替として使用可：申述先の家庭裁判所に事前確認要）', required: false },

    // ─ 申述期間の伸長関係 ─
    {
      document_name:
        '【3か月の熟慮期間を過ぎた場合】相続放棄の熟慮期間伸長申し立て書・伸長を必要とする理由を記載した書面（期間内に申述できない事情がある場合）',
      required: false,
    },

    // ─ 照会書・回答書 ─
    { document_name: '家庭裁判所から送付される照会書への回答書（申述後に届く場合がある）', required: false },

    // ─ 業務委託関係 ─
    { document_name: '業務委任契約書（行政書士が申述書作成支援を行う場合）', required: false },
    {
      document_name:
        '【注意】相続放棄申述書の家庭裁判所への提出は本人・弁護士・司法書士が行うこと（行政書士は提出代理不可）',
      required: false,
    },
  ],
}

// ══════════════════════════════════════════════════════════════════════════════
// エクスポート
// ══════════════════════════════════════════════════════════════════════════════

/**
 * 農地・産業廃棄物・相続・遺言カテゴリのプリセットテンプレート一覧
 *
 * 農地（4件）：農地法第4条・第5条・第3条・第3条の3
 * 産業廃棄物（3件）：収集運搬業新規・処分業新規・収集運搬業更新
 * 相続・遺言（5件）：遺産分割・法定相続情報・自筆証書保管・公正証書遺言・相続放棄
 */
export const NOUCHI_SOUZOKU_TEMPLATES: TemplateData[] = [
  nochi4jo,
  nochi5jo,
  nochi3jo,
  nochi3jono3,
  sanpaiShushu,
  sanpaiShobun,
  sanpaiKoshin,
  isanBunkatsu,
  hoteisouzokuJoho,
  juhitsushoyo,
  kojinshosho,
  souzokuHoki,
]
