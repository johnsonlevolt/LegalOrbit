import type { TemplateData } from '@/lib/data/template-types'

const fields = (...items: Array<[string, string, boolean, string]>) =>
  items.map(([key, label, required, question]) => ({ key, label, required, question }))

export const GENERAL_ADMIN_TEMPLATES: TemplateData[] = [
  {
    name: '自動車保管場所証明申請（車庫証明）',
    business_type: '自動車登録・車庫証明',
    description: '普通自動車の登録・変更に先立つ保管場所証明。管轄警察署・都道府県様式差に対応。',
    input_fields: fields(
      ['vehicle_number', '車両番号', false, '車両番号が決まっていれば入力してください。'],
      ['parking_address', '保管場所所在地', true, '車庫として使う場所の所在地を入力してください。'],
      ['base_address', '使用の本拠', true, '使用の本拠の位置を入力してください。'],
      ['right_type', '使用権原', true, '自己所有・賃貸・使用承諾など使用権原を入力してください。']
    ),
    items: [
      { document_name: '自動車保管場所証明申請書', required: true },
      { document_name: '保管場所標章交付申請書', required: true },
      { document_name: '所在図・配置図', required: true },
      { document_name: '保管場所使用権原疎明書面（自認書または使用承諾証明書）', required: true },
      { document_name: '使用の本拠を確認できる資料', required: false },
    ],
  },
  {
    name: '自動車移転登録（名義変更）',
    business_type: '自動車登録・車庫証明',
    description: '売買・譲渡等による普通自動車の所有者変更。印鑑証明書の期限と車庫証明の要否を確認。',
    input_fields: fields(
      ['old_owner', '旧所有者', true, '旧所有者の氏名または名称を入力してください。'],
      ['new_owner', '新所有者', true, '新所有者の氏名または名称を入力してください。'],
      ['vehicle_number', '登録番号', true, '現在の登録番号を入力してください。'],
      ['change_reason', '移転理由', false, '売買・相続・贈与など移転理由を入力してください。']
    ),
    items: [
      { document_name: 'OCR申請書', required: true },
      { document_name: '手数料納付書', required: true },
      { document_name: '車検証', required: true },
      { document_name: '譲渡証明書', required: true },
      { document_name: '旧所有者の印鑑証明書', required: true },
      { document_name: '新所有者の印鑑証明書', required: true },
      { document_name: '委任状', required: false },
      { document_name: '車庫証明書', required: false },
    ],
  },
  {
    name: '自動車変更登録（住所・氏名・使用者変更）',
    business_type: '自動車登録・車庫証明',
    description: '所有者・使用者の住所、氏名、使用の本拠など登録事項変更。',
    input_fields: fields(
      ['change_target', '変更内容', true, '住所・氏名・使用者・使用の本拠など変更内容を入力してください。'],
      ['before', '変更前', true, '変更前の内容を入力してください。'],
      ['after', '変更後', true, '変更後の内容を入力してください。']
    ),
    items: [
      { document_name: 'OCR申請書', required: true },
      { document_name: '手数料納付書', required: true },
      { document_name: '車検証', required: true },
      { document_name: '変更原因を証する書面（住民票・登記事項証明書等）', required: true },
      { document_name: '車庫証明書', required: false },
      { document_name: '委任状', required: false },
    ],
  },
  {
    name: '自動車抹消登録（一時抹消・永久抹消）',
    business_type: '自動車登録・車庫証明',
    description: '使用中止・解体等による登録抹消。自動車税・重量税還付の関連確認も行う。',
    input_fields: fields(
      ['cancel_type', '抹消区分', true, '一時抹消・永久抹消・輸出抹消のいずれかを入力してください。'],
      ['vehicle_number', '登録番号', true, '登録番号を入力してください。'],
      ['reason', '抹消理由', false, '使用中止・解体・輸出など理由を入力してください。']
    ),
    items: [
      { document_name: 'OCR申請書', required: true },
      { document_name: '手数料納付書', required: true },
      { document_name: '車検証', required: true },
      { document_name: 'ナンバープレート', required: true },
      { document_name: '所有者の印鑑証明書', required: true },
      { document_name: '解体報告記録日を確認できる資料', required: false },
      { document_name: '委任状', required: false },
    ],
  },
  {
    name: '無人航空機 飛行許可・承認申請（DIPS）',
    business_type: 'ドローン・航空',
    description: '航空法上の特定飛行に係る飛行許可・承認。DIPS2.0申請情報と飛行マニュアルを整理。',
    input_fields: fields(
      ['flight_area', '飛行場所', true, '飛行場所・空域・管轄を入力してください。'],
      ['flight_method', '飛行方法', true, '夜間・目視外・DID・30m未満など該当する飛行方法を入力してください。'],
      ['aircraft', '機体情報', true, '機体登録記号・型式・重量を入力してください。'],
      ['pilot', '操縦者情報', true, '操縦者名・技能証明・経験を入力してください。']
    ),
    items: [
      { document_name: 'DIPS2.0申請入力情報', required: true },
      { document_name: '機体登録情報', required: true },
      { document_name: '操縦者情報・技能証明情報', required: true },
      { document_name: '飛行計画・飛行経路図', required: true },
      { document_name: '飛行マニュアル', required: true },
      { document_name: '安全対策・立入管理措置資料', required: true },
      { document_name: '第三者上空・催し場所等の個別説明資料', required: false },
    ],
  },
  {
    name: '帰化許可申請',
    business_type: '国籍・身分関係',
    description: '法務局相談を前提に、本人・家族・収入・納税・素行等の資料を整理。許可を保証しない。',
    input_fields: fields(
      ['nationality', '現在の国籍', true, '現在の国籍を入力してください。'],
      ['residence_history', '在留・居住歴', true, '日本での居住歴と在留資格の履歴を入力してください。'],
      ['family', '家族構成', true, '同居・別居を含めた家族構成を入力してください。'],
      ['income', '生計状況', true, '勤務先・収入・扶養・資産負債を入力してください。']
    ),
    items: [
      { document_name: '帰化許可申請書', required: true },
      { document_name: '親族の概要書', required: true },
      { document_name: '履歴書', required: true },
      { document_name: '帰化の動機書', required: true },
      { document_name: '生計の概要書', required: true },
      { document_name: '事業の概要書', required: false },
      { document_name: '住民票・戸籍関係資料', required: true },
      { document_name: '国籍・身分関係証明書', required: true },
      { document_name: '納税証明・所得証明', required: true },
    ],
  },
  {
    name: '内容証明郵便 作成',
    business_type: '市民法務・契約',
    description: '催告・通知・解除等の文案作成。紛争性が高い案件は弁護士法等の制限確認が必要。',
    input_fields: fields(
      ['sender', '差出人', true, '差出人の氏名・住所を入力してください。'],
      ['recipient', '受取人', true, '受取人の氏名・住所を入力してください。'],
      ['claim', '通知内容', true, '請求・通知したい内容を事実ベースで入力してください。'],
      ['deadline', '期限', false, '支払期限・回答期限があれば入力してください。']
    ),
    items: [
      { document_name: '内容証明文案', required: true },
      { document_name: '事実関係メモ', required: true },
      { document_name: '契約書・請求書・メール等の根拠資料', required: true },
      { document_name: '配達証明控え', required: false },
    ],
  },
  {
    name: '契約書作成（業務委託・売買・賃貸等）',
    business_type: '市民法務・契約',
    description: '権利義務書類としての契約書原案。業法規制・独占業務・紛争性は事前確認。',
    input_fields: fields(
      ['parties', '契約当事者', true, '契約当事者の氏名・住所・法人情報を入力してください。'],
      ['purpose', '契約目的', true, '契約の目的と取引内容を入力してください。'],
      ['price', '金額・報酬', false, '金額、支払条件、遅延損害金を入力してください。'],
      ['term', '契約期間', false, '契約期間・更新・解約条件を入力してください。']
    ),
    items: [
      { document_name: '契約書原案', required: true },
      { document_name: '取引条件整理シート', required: true },
      { document_name: '当事者確認資料', required: true },
      { document_name: '関連見積書・仕様書・図面', required: false },
    ],
  },
  {
    name: '離婚協議書・公正証書原案',
    business_type: '市民法務・契約',
    description: '合意済み条件の書面化。対立交渉・代理交渉は不可領域に注意。',
    input_fields: fields(
      ['children', '子の情報', false, '未成年の子がいる場合、氏名・生年月日を入力してください。'],
      ['custody', '親権・監護', false, '親権者・監護者・面会交流の合意内容を入力してください。'],
      ['money', '金銭条件', false, '養育費・財産分与・慰謝料・年金分割を入力してください。'],
      ['notary', '公正証書希望', false, '公正証書にする予定の有無を入力してください。']
    ),
    items: [
      { document_name: '離婚協議書原案', required: true },
      { document_name: '合意事項整理シート', required: true },
      { document_name: '戸籍謄本', required: false },
      { document_name: '財産・負債資料', required: false },
      { document_name: '公証役場提出用メモ', required: false },
    ],
  },
  {
    name: '任意後見契約・財産管理契約 原案',
    business_type: '市民法務・契約',
    description: '将来の判断能力低下に備える契約原案。公正証書化と本人意思確認を重視。',
    input_fields: fields(
      ['principal', '本人', true, '本人の氏名・住所・生年月日を入力してください。'],
      ['agent', '受任者', true, '受任者候補の氏名・住所・関係を入力してください。'],
      ['scope', '委任範囲', true, '財産管理・身上監護など委任範囲を入力してください。']
    ),
    items: [
      { document_name: '任意後見契約原案', required: true },
      { document_name: '財産管理等委任契約原案', required: false },
      { document_name: '本人確認資料', required: true },
      { document_name: '財産目録', required: true },
      { document_name: '公証役場提出用メモ', required: true },
    ],
  },
  {
    name: '旅館業営業許可申請',
    business_type: '生活衛生・宿泊',
    description: 'ホテル・旅館・簡易宿所等の営業許可。自治体条例・消防・建築用途を事前確認。',
    input_fields: fields(
      ['facility_type', '営業種別', true, '旅館・ホテル、簡易宿所など営業種別を入力してください。'],
      ['facility_address', '施設所在地', true, '施設所在地を入力してください。'],
      ['rooms', '客室概要', true, '客室数・面積・定員を入力してください。'],
      ['fire_status', '消防確認', false, '消防法令適合通知の取得状況を入力してください。']
    ),
    items: [
      { document_name: '旅館業営業許可申請書', required: true },
      { document_name: '施設平面図・配置図', required: true },
      { document_name: '見取図・周辺図', required: true },
      { document_name: '建物登記事項証明書または使用権原資料', required: true },
      { document_name: '消防法令適合通知書', required: true },
      { document_name: '水質検査成績書', required: false },
      { document_name: '法人登記事項証明書・定款', required: false },
    ],
  },
  {
    name: '住宅宿泊事業届出（民泊）',
    business_type: '生活衛生・宿泊',
    description: '住宅宿泊事業法に基づく住宅ごとの届出。民泊制度運営システム利用を想定。',
    input_fields: fields(
      ['housing_address', '届出住宅所在地', true, '届出住宅の所在地・部屋番号を入力してください。'],
      ['housing_type', '住宅の区分', true, '生活本拠・入居者募集・随時居住など住宅区分を入力してください。'],
      ['management', '管理委託', false, '住宅宿泊管理業者への委託有無を入力してください。'],
      ['condo_rule', '管理規約', false, 'マンション管理規約上の禁止有無を入力してください。']
    ),
    items: [
      { document_name: '住宅宿泊事業届出書', required: true },
      { document_name: '住宅の登記事項証明書', required: true },
      { document_name: '住宅の図面', required: true },
      { document_name: '賃貸人・転貸人の承諾書', required: false },
      { document_name: 'マンション管理規約または管理組合確認資料', required: false },
      { document_name: '消防法令適合通知書', required: true },
      { document_name: '住宅宿泊管理業者との契約書面', required: false },
    ],
  },
  {
    name: '薬局開設許可申請',
    business_type: '医療・薬事',
    description: '薬局開設・医薬品販売業の許可申請。都道府県等の様式・添付書類を確認。',
    input_fields: fields(
      ['pharmacy_name', '薬局名称', true, '薬局名称を入力してください。'],
      ['pharmacy_address', '薬局所在地', true, '薬局所在地を入力してください。'],
      ['manager', '管理薬剤師', true, '管理薬剤師の氏名・資格・勤務体制を入力してください。'],
      ['hours', '営業時間', false, '開局時間・休日を入力してください。']
    ),
    items: [
      { document_name: '薬局開設許可申請書', required: true },
      { document_name: '構造設備の概要・平面図', required: true },
      { document_name: '管理薬剤師・薬剤師の使用関係を証する資料', required: true },
      { document_name: '薬剤師免許証の写し', required: true },
      { document_name: '法人登記事項証明書', required: false },
      { document_name: '業務体制・勤務表', required: true },
    ],
  },
  {
    name: '化粧品製造販売業許可申請',
    business_type: '医療・薬事',
    description: '化粧品・医薬部外品等の製造販売業許可。総括製造販売責任者等の体制確認が重要。',
    input_fields: fields(
      ['product_type', '取扱区分', true, '化粧品・医薬部外品など取扱区分を入力してください。'],
      ['office', '主たる機能所在地', true, '主たる機能を有する事務所所在地を入力してください。'],
      ['responsible_person', '責任者', true, '総括製造販売責任者等の氏名・資格を入力してください。']
    ),
    items: [
      { document_name: '製造販売業許可申請書', required: true },
      { document_name: '登記事項証明書', required: false },
      { document_name: '組織図・業務分掌表', required: true },
      { document_name: '総括製造販売責任者の資格資料', required: true },
      { document_name: '品質管理・安全管理体制資料', required: true },
      { document_name: '雇用契約書または使用関係資料', required: true },
    ],
  },
  {
    name: '医療法人設立認可申請',
    business_type: '医療・法人',
    description: '医療法人設立の認可申請。都道府県スケジュール・事前審査・資産要件を確認。',
    input_fields: fields(
      ['clinic', '対象診療所', true, '法人化する診療所・病院の名称と所在地を入力してください。'],
      ['members', '役員・社員', true, '理事・監事・社員候補を入力してください。'],
      ['assets', '拠出財産', true, '拠出する資産・負債・運転資金を入力してください。']
    ),
    items: [
      { document_name: '医療法人設立認可申請書', required: true },
      { document_name: '定款または寄附行為案', required: true },
      { document_name: '設立総会議事録', required: true },
      { document_name: '役員・社員名簿', required: true },
      { document_name: '財産目録・拠出申込書', required: true },
      { document_name: '事業計画書・収支予算書', required: true },
      { document_name: '診療所開設許可・届出関係資料', required: true },
    ],
  },
  {
    name: '建築士事務所登録申請',
    business_type: '建設・不動産周辺',
    description: '建築士事務所の新規・更新登録。管理建築士の専任性と講習修了を確認。',
    input_fields: fields(
      ['office_name', '事務所名称', true, '建築士事務所の名称を入力してください。'],
      ['office_address', '所在地', true, '事務所所在地を入力してください。'],
      ['architect', '管理建築士', true, '管理建築士の氏名・資格・講習状況を入力してください。']
    ),
    items: [
      { document_name: '建築士事務所登録申請書', required: true },
      { document_name: '所属建築士名簿', required: true },
      { document_name: '管理建築士の建築士免許証写し', required: true },
      { document_name: '管理建築士講習修了証写し', required: true },
      { document_name: '略歴書・誓約書', required: true },
      { document_name: '法人登記事項証明書・定款', required: false },
    ],
  },
  {
    name: '電気工事業登録申請',
    business_type: '建設・不動産周辺',
    description: '登録電気工事業者等の登録。主任電気工事士・器具備付を確認。',
    input_fields: fields(
      ['business_kind', '業務区分', true, '一般用・自家用など工事区分を入力してください。'],
      ['chief', '主任電気工事士', true, '主任電気工事士の氏名・資格を入力してください。'],
      ['office', '営業所', true, '営業所所在地を入力してください。']
    ),
    items: [
      { document_name: '登録電気工事業者登録申請書', required: true },
      { document_name: '主任電気工事士の資格証明資料', required: true },
      { document_name: '主任電気工事士の雇用証明資料', required: true },
      { document_name: '備付器具調書', required: true },
      { document_name: '誓約書', required: true },
      { document_name: '法人登記事項証明書', required: false },
    ],
  },
  {
    name: '補助金 交付申請・実績報告',
    business_type: '補助金・助成金',
    description: '採択後の交付申請、変更承認、実績報告、証憑整理。制度ごとの公募要領を優先。',
    input_fields: fields(
      ['program', '補助金名', true, '補助金・助成金の名称を入力してください。'],
      ['project', '事業内容', true, '補助事業の内容を入力してください。'],
      ['budget', '経費内容', true, '対象経費・見積・支払予定を入力してください。'],
      ['deadline', '期限', true, '交付申請または実績報告の期限を入力してください。']
    ),
    items: [
      { document_name: '交付申請書', required: true },
      { document_name: '事業計画書', required: true },
      { document_name: '経費明細書', required: true },
      { document_name: '見積書・相見積', required: true },
      { document_name: '採択通知書', required: false },
      { document_name: '実績報告書', required: false },
      { document_name: '請求書・領収書・振込記録', required: false },
      { document_name: '成果物・写真・納品書', required: false },
    ],
  },
  {
    name: '一般社団法人・一般財団法人 設立',
    business_type: '法人設立・組織法務',
    description: '非営利型を含む一般法人設立の書類整理。登記申請は司法書士業務との切り分けを確認。',
    input_fields: fields(
      ['entity_type', '法人種別', true, '一般社団法人・一般財団法人の別を入力してください。'],
      ['purpose', '目的', true, '法人の目的・事業を入力してください。'],
      ['officers', '役員', true, '理事・監事・評議員候補を入力してください。'],
      ['assets', '拠出財産', false, '基金・拠出財産があれば入力してください。']
    ),
    items: [
      { document_name: '定款案', required: true },
      { document_name: '設立時社員・評議員・役員名簿', required: true },
      { document_name: '設立時議事録', required: true },
      { document_name: '就任承諾書', required: true },
      { document_name: '印鑑証明書', required: true },
      { document_name: '非営利型確認メモ', required: false },
    ],
  },
]
