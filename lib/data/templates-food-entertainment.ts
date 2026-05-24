// 飲食・風俗・酒類・古物商カテゴリのテンプレートデータ
// 根拠法令: 食品衛生法・風営法・酒税法・古物営業法・旅館業法・住宅宿泊事業法

export interface TemplateData {
  name: string
  business_type: string // カテゴリに応じて "飲食・風俗営業" または "酒類・古物" を使用
  description: string
  items: Array<{ document_name: string; required: boolean }>
}

export const foodEntertainmentTemplates: TemplateData[] = [
  // ─────────────────────────────────────────────────────────────────
  // 1. 飲食店営業許可申請（食品衛生法・保健所）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "飲食店営業許可申請（食品衛生法）",
    business_type: "飲食・風俗営業",
    description:
      "食品衛生法第55条に基づく飲食店営業の許可申請。保健所（都道府県・政令市・特別区）に申請する。",
    items: [
      { document_name: "食品営業許可申請書（様式第1号）", required: true },
      {
        document_name: "営業設備の大要・配置図（様式第2号）",
        required: true,
      },
      {
        document_name: "営業所の平面図（縮尺1/50以上、設備の配置を明記）",
        required: true,
      },
      {
        document_name: "営業所の配置図（周辺地図・建物位置図）",
        required: true,
      },
      { document_name: "食品衛生責任者の資格証明書の写し", required: true },
      {
        document_name: "水質検査成績書（井戸水・地下水使用の場合）",
        required: false,
      },
      {
        document_name: "建物の登記事項証明書または建物賃貸借契約書の写し",
        required: true,
      },
      { document_name: "登記事項証明書（法人の場合）", required: false },
      { document_name: "定款の写し（法人の場合）", required: false },
      {
        document_name:
          "住民票の写し・本籍記載（個人申請者、発行3か月以内のもの）",
        required: false,
      },
      {
        document_name: "申請手数料（都道府県条例による。目安16,000円前後）",
        required: true,
      },
      {
        document_name: "厨房機器・設備一覧（シンクの槽数、冷蔵設備等を記載）",
        required: true,
      },
      {
        document_name:
          "食品衛生法施行規則別表第17に定める施設基準の適合確認書類",
        required: true,
      },
      { document_name: "防虫・防そ設備の概要を記載した書類", required: true },
      {
        document_name: "上下水道の使用状況を示す書類（水道局発行）",
        required: false,
      },
      {
        document_name:
          "HACCPに沿った衛生管理計画書（食品衛生法改正対応・2021年6月以降義務）",
        required: true,
      },
      {
        document_name: "従業員の健康診断書（腸内細菌検査含む）",
        required: false,
      },
      {
        document_name: "メニュー表（提供食品・調理方法の概要）",
        required: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. 深夜酒類提供飲食店営業開始届出（風営法第33条）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "深夜酒類提供飲食店営業開始届出（風営法第33条）",
    business_type: "飲食・風俗営業",
    description:
      "風俗営業等の規制及び業務の適正化等に関する法律第33条に基づく、深夜（午前0時以降）に主として酒類を提供する飲食店（バー・居酒屋等）の届出。営業開始10日前までに所轄警察署経由で公安委員会へ届出する。",
    items: [
      {
        document_name:
          "深夜における酒類提供飲食店営業開始届出書（別記様式第47号・第103条）",
        required: true,
      },
      {
        document_name: "営業の方法を記載した書類（別記様式第48号）",
        required: true,
      },
      {
        document_name:
          "営業所の平面図（各室の用途・面積・客室の構造・照明設備等を明記）",
        required: true,
      },
      {
        document_name:
          "営業所の周辺の略図（半径200m以内の学校・病院等の位置を明記）",
        required: true,
      },
      {
        document_name:
          "住民票の写し・本籍記載（個人、発行3か月以内のもの）",
        required: false,
      },
      {
        document_name: "法人登記事項証明書（法人の場合、発行3か月以内）",
        required: false,
      },
      { document_name: "定款の写し（法人の場合）", required: false },
      {
        document_name: "飲食店営業許可証の写し（食品衛生法に基づくもの）",
        required: true,
      },
      {
        document_name: "建物賃貸借契約書の写し（賃借物件の場合）",
        required: true,
      },
      {
        document_name: "建物の登記事項証明書（自己所有物件の場合）",
        required: false,
      },
      {
        document_name:
          "用途地域が確認できる書類（都市計画証明書または用途地域図）",
        required: true,
      },
      {
        document_name: "照明設備の概要を記載した書類（10ルクス超を確認）",
        required: true,
      },
      {
        document_name: "音響設備の概要を記載した書類",
        required: false,
      },
      {
        document_name:
          "建物所有者の承諾書（転借・又貸しの場合）",
        required: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. 風俗営業許可申請（1号営業：キャバレー・クラブ等）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "風俗営業許可申請（1号営業：キャバレー・クラブ・スナック等）",
    business_type: "飲食・風俗営業",
    description:
      "風営法第2条第1項第1号に基づくキャバレー・ナイトクラブ・スナック・ホストクラブ等の許可申請。所轄警察署経由で都道府県公安委員会へ申請する。申請手数料は東京都24,000円。",
    items: [
      {
        document_name:
          "風俗営業許可申請書（別記様式第1号その1（ア））",
        required: true,
      },
      {
        document_name:
          "風俗営業1号から3号営業用附属書類（別記様式第1号その2(A)）",
        required: true,
      },
      {
        document_name: "営業の方法を記載した書類（別記様式第5号）",
        required: true,
      },
      {
        document_name:
          "営業所の平面図（縮尺1/50以上、客室・照明・音響設備の位置、面積・求積図を含む）",
        required: true,
      },
      {
        document_name:
          "営業所の配置図（周辺の保護対象施設・用途地域等を明記）",
        required: true,
      },
      {
        document_name:
          "照明設備の概要を記載した書類（各客室の照度）",
        required: true,
      },
      {
        document_name: "音響設備の概要を記載した書類",
        required: true,
      },
      {
        document_name:
          "住民票の写し・本籍記載（申請者個人、発行3か月以内）",
        required: false,
      },
      {
        document_name:
          "住民票の写し・本籍記載（法人の場合：役員全員分）",
        required: false,
      },
      {
        document_name:
          "身分証明書（本籍地市区町村発行、申請者・役員全員）",
        required: true,
      },
      {
        document_name:
          "登記されていないことの証明書（成年後見登記・東京法務局発行）",
        required: true,
      },
      {
        document_name: "略歴書（申請者・管理者・役員全員）",
        required: true,
      },
      {
        document_name:
          "誓約書（申請者・管理者・役員全員・欠格事由非該当）",
        required: true,
      },
      {
        document_name: "管理者の写真（縦3.0cm×横2.4cm、2枚）",
        required: true,
      },
      {
        document_name: "法人の登記事項証明書（法人の場合、発行3か月以内）",
        required: false,
      },
      { document_name: "定款の写し（法人の場合）", required: false },
      {
        document_name: "建物賃貸借契約書の写し（賃借物件の場合）",
        required: true,
      },
      {
        document_name: "建物の登記事項証明書（自己所有の場合）",
        required: false,
      },
      {
        document_name:
          "用途地域確認書類（都市計画証明書または用途地域図）",
        required: true,
      },
      {
        document_name: "飲食店営業許可証の写し（食品衛生法）",
        required: true,
      },
      {
        document_name:
          "建物所有者の使用承諾書（転借の場合）",
        required: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. 風俗営業許可申請（2号営業：低照度飲食店）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "風俗営業許可申請（2号営業：低照度飲食店）",
    business_type: "飲食・風俗営業",
    description:
      "風営法第2条第1項第2号に基づく、営業所内の照度を10ルクス以下として客に飲食させる営業（低照度飲食店）の許可申請。所轄警察署経由で都道府県公安委員会へ申請する。",
    items: [
      {
        document_name:
          "風俗営業許可申請書（別記様式第1号その1（ア））",
        required: true,
      },
      {
        document_name:
          "風俗営業2号営業用附属書類（別記様式第1号その2(B)）",
        required: true,
      },
      {
        document_name: "営業の方法を記載した書類（別記様式第5号）",
        required: true,
      },
      {
        document_name:
          "営業所の平面図（縮尺1/50以上、照明設備・客室面積・求積図を含む）",
        required: true,
      },
      {
        document_name:
          "営業所の配置図（保護対象施設・用途地域等を明記）",
        required: true,
      },
      {
        document_name:
          "照明設備の概要を記載した書類（照度10ルクス以下の根拠を記載）",
        required: true,
      },
      {
        document_name: "音響設備の概要を記載した書類",
        required: false,
      },
      {
        document_name:
          "住民票の写し・本籍記載（申請者、発行3か月以内）",
        required: false,
      },
      {
        document_name:
          "住民票の写し・本籍記載（法人の場合：役員全員分）",
        required: false,
      },
      {
        document_name:
          "身分証明書（本籍地市区町村発行、申請者・役員全員）",
        required: true,
      },
      {
        document_name:
          "登記されていないことの証明書（成年後見登記・東京法務局発行）",
        required: true,
      },
      {
        document_name: "略歴書（申請者・管理者・役員全員）",
        required: true,
      },
      {
        document_name: "誓約書（申請者・管理者・役員全員）",
        required: true,
      },
      {
        document_name: "管理者の写真（縦3.0cm×横2.4cm、2枚）",
        required: true,
      },
      {
        document_name: "法人の登記事項証明書（法人の場合、発行3か月以内）",
        required: false,
      },
      { document_name: "定款の写し（法人の場合）", required: false },
      {
        document_name: "建物賃貸借契約書の写し（賃借物件の場合）",
        required: true,
      },
      {
        document_name:
          "用途地域確認書類（都市計画証明書または用途地域図）",
        required: true,
      },
      { document_name: "飲食店営業許可証の写し（食品衛生法）", required: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. 風俗営業許可申請（5号営業：ゲームセンター等）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "風俗営業許可申請（5号営業：ゲームセンター等遊技施設）",
    business_type: "飲食・風俗営業",
    description:
      "風営法第2条第1項第5号に基づくゲームセンター・アミューズメント施設等の許可申請。所轄警察署経由で都道府県公安委員会へ申請する。客室内照度は10ルクス超が要件。",
    items: [
      {
        document_name:
          "風俗営業許可申請書（別記様式第1号その1（ア））",
        required: true,
      },
      {
        document_name:
          "風俗営業5号営業用附属書類（別記様式第1号その2(C)・遊技機の一覧を含む）",
        required: true,
      },
      {
        document_name: "営業の方法を記載した書類（別記様式第5号）",
        required: true,
      },
      {
        document_name:
          "営業所の平面図（縮尺1/50以上、遊技機配置・照明設備・見通し確保の状況・面積求積図を含む）",
        required: true,
      },
      {
        document_name:
          "営業所の配置図（保護対象施設・用途地域等を明記）",
        required: true,
      },
      {
        document_name:
          "遊技機の種類・台数・規格一覧表（型式確認書を含む）",
        required: true,
      },
      {
        document_name:
          "照明設備の概要を記載した書類（照度10ルクス超の根拠）",
        required: true,
      },
      {
        document_name: "騒音・振動防止設備の概要を記載した書類",
        required: true,
      },
      {
        document_name:
          "住民票の写し・本籍記載（申請者、発行3か月以内）",
        required: false,
      },
      {
        document_name:
          "住民票の写し・本籍記載（法人の場合：役員全員分）",
        required: false,
      },
      {
        document_name:
          "身分証明書（本籍地市区町村発行、申請者・役員全員）",
        required: true,
      },
      {
        document_name:
          "登記されていないことの証明書（成年後見登記・東京法務局発行）",
        required: true,
      },
      {
        document_name: "略歴書（申請者・管理者・役員全員）",
        required: true,
      },
      {
        document_name: "誓約書（申請者・管理者・役員全員）",
        required: true,
      },
      {
        document_name: "管理者の写真（縦3.0cm×横2.4cm、2枚）",
        required: true,
      },
      {
        document_name: "法人の登記事項証明書（法人の場合、発行3か月以内）",
        required: false,
      },
      { document_name: "定款の写し（法人の場合）", required: false },
      {
        document_name: "建物賃貸借契約書の写し（賃借物件の場合）",
        required: true,
      },
      {
        document_name:
          "用途地域確認書類（都市計画証明書または用途地域図）",
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. 特定遊興飲食店営業許可申請
  // ─────────────────────────────────────────────────────────────────
  {
    name: "特定遊興飲食店営業許可申請（ナイトクラブ・ライブハウス等）",
    business_type: "飲食・風俗営業",
    description:
      "風営法第2条第11項に基づく特定遊興飲食店営業（深夜に遊興させかつ酒類を提供して飲食させる営業）の許可申請。所轄警察署経由で都道府県公安委員会へ申請する。",
    items: [
      {
        document_name:
          "特定遊興飲食店営業許可申請書（別記様式第1号その1（イ））",
        required: true,
      },
      {
        document_name:
          "特定遊興飲食店営業用附属書類（別記様式第1号その3）",
        required: true,
      },
      {
        document_name: "営業の方法を記載した書類（別記様式第5号）",
        required: true,
      },
      {
        document_name:
          "営業所の平面図（縮尺1/50以上、客室・DJ・照明・音響・防音設備の位置、面積求積図を含む）",
        required: true,
      },
      {
        document_name:
          "営業所の配置図（保護対象施設・用途地域等を明記）",
        required: true,
      },
      {
        document_name:
          "照明設備の概要を記載した書類（10ルクス超を確認）",
        required: true,
      },
      {
        document_name: "音響設備の概要を記載した書類",
        required: true,
      },
      {
        document_name:
          "防音設備の概要を記載した書類（防音性能の計算書または測定値）",
        required: true,
      },
      {
        document_name:
          "住民票の写し・本籍記載（申請者、発行3か月以内）",
        required: false,
      },
      {
        document_name:
          "住民票の写し・本籍記載（法人の場合：役員全員分）",
        required: false,
      },
      {
        document_name:
          "身分証明書（本籍地市区町村発行、申請者・役員全員）",
        required: true,
      },
      {
        document_name:
          "登記されていないことの証明書（成年後見登記・東京法務局発行）",
        required: true,
      },
      {
        document_name: "略歴書（申請者・管理者・役員全員）",
        required: true,
      },
      {
        document_name: "誓約書（申請者・管理者・役員全員）",
        required: true,
      },
      {
        document_name: "管理者の写真（縦3.0cm×横2.4cm、2枚）",
        required: true,
      },
      {
        document_name: "法人の登記事項証明書（法人の場合、発行3か月以内）",
        required: false,
      },
      { document_name: "定款の写し（法人の場合）", required: false },
      {
        document_name: "建物賃貸借契約書の写し（賃借物件の場合）",
        required: true,
      },
      {
        document_name:
          "用途地域確認書類（都市計画証明書・特定遊興飲食店営業が可能な地域であること）",
        required: true,
      },
      {
        document_name: "飲食店営業許可証の写し（食品衛生法）",
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 7. 酒類小売業免許申請（一般酒類小売業免許）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "酒類小売業免許申請（一般酒類小売業免許）",
    business_type: "酒類・古物",
    description:
      "酒税法第9条に基づく一般酒類小売業免許の申請。販売場の所在地を所轄する税務署（酒類指導官）へ申請する。審査期間は申請から約2か月。",
    items: [
      {
        document_name:
          "酒類販売業免許申請書（CC1-5104-1）",
        required: true,
      },
      {
        document_name:
          "申請書チェック表（一般酒類小売業免許用・CC1-5104-2(1)）",
        required: true,
      },
      {
        document_name: "販売場の土地・建物の登記事項証明書（法務局発行）",
        required: true,
      },
      {
        document_name: "建物賃貸借契約書の写し（賃借物件の場合）",
        required: false,
      },
      {
        document_name: "販売場の見取図（平面図・売場面積・設備の配置を明記）",
        required: true,
      },
      {
        document_name: "住民票の写し（個人申請者・発行3か月以内）",
        required: false,
      },
      {
        document_name:
          "法人の登記事項証明書（法人申請の場合、発行3か月以内）",
        required: false,
      },
      { document_name: "定款の写し（法人申請の場合）", required: false },
      {
        document_name:
          "最近3事業年度の財務諸表（貸借対照表・損益計算書・法人の場合）",
        required: true,
      },
      {
        document_name:
          "事業計画書（酒類の品目・販売方法・仕入先等を記載）",
        required: true,
      },
      {
        document_name:
          "酒類の仕入れ先（酒類卸売業者等）の承諾書または内定書",
        required: false,
      },
      {
        document_name:
          "納税証明書（その3の3：国税）・地方税完納証明書（申請者・法人役員）",
        required: true,
      },
      {
        document_name: "履歴書（個人申請者・法人役員・発行3か月以内）",
        required: true,
      },
      {
        document_name:
          "申請者・法人役員の酒類販売業経験または経営経験を証明する書類",
        required: false,
      },
      {
        document_name:
          "他の酒類販売業者と距離が重複しないことの確認書（陳列棚の配置等）",
        required: false,
      },
      {
        document_name: "申請手数料（3万円・収入印紙）",
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 8. 酒類小売業免許申請（通信販売酒類小売業免許）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "酒類小売業免許申請（通信販売酒類小売業免許）",
    business_type: "酒類・古物",
    description:
      "酒税法第9条に基づく通信販売酒類小売業免許の申請。インターネット・カタログ等で2都道府県以上の消費者へ通信販売する場合に必要。所轄税務署の酒類指導官へ申請する。",
    items: [
      {
        document_name:
          "酒類販売業免許申請書（CC1-5104-1）",
        required: true,
      },
      {
        document_name:
          "申請書チェック表（通信販売酒類小売業免許用・CC1-5104-2(4)）",
        required: true,
      },
      {
        document_name: "販売場の土地・建物の登記事項証明書（法務局発行）",
        required: true,
      },
      {
        document_name: "建物賃貸借契約書の写し（賃借物件の場合）",
        required: false,
      },
      {
        document_name: "販売場の見取図（平面図・設備の配置を明記）",
        required: true,
      },
      {
        document_name:
          "通信販売に使用するカタログ・ウェブサイトの概要（URL等）",
        required: true,
      },
      {
        document_name:
          "販売する酒類の品目・品目ごとの年間仕入量の見込みを記載した書類",
        required: true,
      },
      {
        document_name:
          "仕入先酒類製造業者（または輸入業者）の通信販売対象品目証明書",
        required: true,
      },
      {
        document_name: "住民票の写し（個人申請者・発行3か月以内）",
        required: false,
      },
      {
        document_name:
          "法人の登記事項証明書（法人申請の場合、発行3か月以内）",
        required: false,
      },
      { document_name: "定款の写し（法人申請の場合）", required: false },
      {
        document_name:
          "最近3事業年度の財務諸表（貸借対照表・損益計算書・法人の場合）",
        required: true,
      },
      {
        document_name:
          "事業計画書（通信販売の方法・販売地域・年間販売見込量等を記載）",
        required: true,
      },
      {
        document_name:
          "納税証明書（その3の3：国税）・地方税完納証明書",
        required: true,
      },
      {
        document_name: "履歴書（個人申請者・法人役員）",
        required: true,
      },
      {
        document_name:
          "未成年者飲酒防止に関する表示の概要（ウェブサイト等の対応状況）",
        required: true,
      },
      {
        document_name: "申請手数料（3万円・収入印紙）",
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 9. 古物商許可申請（法人）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "古物商許可申請（法人）",
    business_type: "酒類・古物",
    description:
      "古物営業法第3条に基づく古物商許可の申請（法人）。主たる営業所の所在地を管轄する警察署の生活安全担当課経由で都道府県公安委員会へ申請する。審査期間は約40日。",
    items: [
      {
        document_name:
          "古物商許可申請書（別記様式第1号その1（ア）・法人用）",
        required: true,
      },
      {
        document_name:
          "主たる営業所および他の営業所の所在地・名称等を記載した書類（別記様式第1号その4）",
        required: true,
      },
      {
        document_name: "法人の登記事項証明書（法務局発行、発行3か月以内）",
        required: true,
      },
      {
        document_name: "定款の写し（毎葉割印・代表者原本証明・代表者印押印）",
        required: true,
      },
      {
        document_name:
          "役員全員の住民票の写し・本籍記載（発行3か月以内、マイナンバー記載不要）",
        required: true,
      },
      {
        document_name:
          "役員全員の身分証明書（本籍地の市区町村発行・禁治産・破産宣告等のないことの証明）",
        required: true,
      },
      {
        document_name: "役員全員の略歴書（過去5年間の経歴・様式第1号その3）",
        required: true,
      },
      {
        document_name:
          "役員全員の誓約書（欠格事由非該当・法人役員用様式）",
        required: true,
      },
      {
        document_name: "営業所の管理者の住民票の写し・本籍記載",
        required: true,
      },
      {
        document_name: "営業所の管理者の身分証明書（本籍地市区町村発行）",
        required: true,
      },
      {
        document_name: "営業所の管理者の略歴書（過去5年間）",
        required: true,
      },
      {
        document_name: "営業所の管理者の誓約書（管理者用様式）",
        required: true,
      },
      {
        document_name: "営業所の使用権原を証する書類（賃貸借契約書の写し等）",
        required: true,
      },
      {
        document_name:
          "取り扱う古物の区分（13区分）を記載した書類（申請書に記載）",
        required: true,
      },
      {
        document_name: "ホームページを利用する場合はURLを届け出る書類",
        required: false,
      },
      {
        document_name:
          "申請手数料（19,000円・証紙または収入印紙、都道府県により異なる）",
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 10. 古物商許可申請（個人）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "古物商許可申請（個人）",
    business_type: "酒類・古物",
    description:
      "古物営業法第3条に基づく古物商許可の申請（個人）。主たる営業所の所在地を管轄する警察署の生活安全担当課経由で都道府県公安委員会へ申請する。審査期間は約40日。",
    items: [
      {
        document_name:
          "古物商許可申請書（別記様式第1号その1（ア）・個人用）",
        required: true,
      },
      {
        document_name:
          "主たる営業所および他の営業所の所在地・名称等を記載した書類（別記様式第1号その4）",
        required: true,
      },
      {
        document_name:
          "申請者本人の住民票の写し・本籍記載（発行3か月以内、マイナンバー記載不要）",
        required: true,
      },
      {
        document_name:
          "申請者本人の身分証明書（本籍地の市区町村発行・禁治産・破産宣告等のないことの証明）",
        required: true,
      },
      {
        document_name: "申請者本人の略歴書（過去5年間の経歴・様式第1号その3）",
        required: true,
      },
      {
        document_name: "申請者本人の誓約書（欠格事由非該当・個人用様式）",
        required: true,
      },
      {
        document_name: "営業所の管理者の住民票の写し・本籍記載（申請者兼任の場合は省略可）",
        required: false,
      },
      {
        document_name:
          "営業所の管理者の身分証明書（申請者と異なる場合）",
        required: false,
      },
      {
        document_name:
          "営業所の管理者の略歴書（申請者と異なる場合）",
        required: false,
      },
      {
        document_name: "営業所の管理者の誓約書（管理者用様式・申請者と異なる場合）",
        required: false,
      },
      {
        document_name: "営業所の使用権原を証する書類（賃貸借契約書の写し等）",
        required: true,
      },
      {
        document_name:
          "取り扱う古物の区分（13区分）を記載した書類（申請書に記載）",
        required: true,
      },
      {
        document_name: "ホームページを利用する場合はURLを届け出る書類",
        required: false,
      },
      {
        document_name:
          "申請手数料（19,000円・証紙または収入印紙、都道府県により異なる）",
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 11. 旅館業許可申請（簡易宿所営業・ゲストハウス）
  // ─────────────────────────────────────────────────────────────────
  {
    name: "旅館業許可申請（簡易宿所営業・ゲストハウス・ホステル）",
    business_type: "飲食・風俗営業",
    description:
      "旅館業法第3条に基づく簡易宿所営業の許可申請。都道府県知事（保健所設置市・特別区は市長・区長）に申請する。民泊・ゲストハウス・ホステル等が対象。",
    items: [
      {
        document_name:
          "旅館業営業許可申請書（旅館業法施行規則様式第1号・施設構造設備の概要を含む）",
        required: true,
      },
      {
        document_name:
          "旅館業法第3条第2項に該当することの有無に関する申告書",
        required: true,
      },
      {
        document_name:
          "見取図（施設周辺半径300m以内の住宅・道路・学校・病院等の位置を記載）",
        required: true,
      },
      {
        document_name:
          "各階平面図（縮尺1/50以上、客室・浴室・便所・洗面設備・非常照明の位置・各室面積・求積図を含む）",
        required: true,
      },
      {
        document_name:
          "配置図（敷地・建物・出入口・駐車場の位置を明記）",
        required: true,
      },
      {
        document_name: "正面図および側面図（建物外観）",
        required: true,
      },
      {
        document_name:
          "給排水設備・ガス設備の配管図（ガス設備を設ける場合）",
        required: false,
      },
      {
        document_name: "建物の登記事項証明書（法務局発行）",
        required: true,
      },
      {
        document_name: "建物賃貸借契約書の写し（賃借物件の場合）",
        required: false,
      },
      {
        document_name: "定款の写し（法人申請の場合）",
        required: false,
      },
      {
        document_name: "法人の登記事項証明書（法人申請の場合）",
        required: false,
      },
      {
        document_name:
          "住民票の写し（個人申請者・発行3か月以内）",
        required: false,
      },
      {
        document_name:
          "消防法令適合通知書（所轄消防署長発行・申請前に取得）",
        required: true,
      },
      {
        document_name:
          "建築基準法第9条の適合証明書または検査済証の写し",
        required: true,
      },
      {
        document_name:
          "マンション管理規約の写し（区分所有建物の場合・宿泊施設としての利用可否を確認）",
        required: false,
      },
      {
        document_name:
          "水質検査成績書（専用水道・簡易専用水道・井戸水使用の場合）",
        required: false,
      },
      {
        document_name:
          "申請手数料（都道府県条例による。東京都の場合16,000円前後）",
        required: true,
      },
      {
        document_name:
          "非常用照明器具・誘導灯の設置を示す書類（消防設備点検報告書等）",
        required: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 12. 住宅宿泊事業（民泊）届出
  // ─────────────────────────────────────────────────────────────────
  {
    name: "住宅宿泊事業（民泊新法）届出",
    business_type: "飲食・風俗営業",
    description:
      "住宅宿泊事業法（民泊新法・2018年6月施行）第3条に基づく住宅宿泊事業者の届出。年間提供日数上限180日。都道府県知事（保健所設置市・特別区は市長・区長）に届け出る。原則として民泊制度運営システム（minpaku）で電子申請。",
    items: [
      {
        document_name:
          "住宅宿泊事業届出書（第一号様式）",
        required: true,
      },
      {
        document_name:
          "届出住宅の周辺の略図（住宅の位置・周辺の主要施設を明記）",
        required: true,
      },
      {
        document_name:
          "届出住宅の各階平面図（台所・浴室・便所・洗面設備・非常用照明器具の位置・間取り・出入口・各居室の床面積を明記）",
        required: true,
      },
      {
        document_name:
          "入居者の居住を証する書類（住民票の写し・賃貸借契約書等）",
        required: true,
      },
      {
        document_name:
          "マンション管理規約の写し（専用部分の用途に関する規約・区分所有建物の場合）",
        required: false,
      },
      {
        document_name:
          "管理組合の承諾書または使用許可書（マンションで民泊が規約上許容される場合）",
        required: false,
      },
      {
        document_name:
          "建物の登記事項証明書（所有者・用途を確認）",
        required: true,
      },
      {
        document_name:
          "建物賃貸借契約書の写し（転貸・賃借物件の場合）",
        required: false,
      },
      {
        document_name:
          "建物所有者の転貸承諾書（賃借物件を民泊に利用する場合）",
        required: false,
      },
      {
        document_name:
          "消防用設備等の設置状況を示す書類（住宅宿泊事業法施行令に基づく消防設備確認）",
        required: true,
      },
      {
        document_name:
          "法人の登記事項証明書（法人届出の場合・発行3か月以内）",
        required: false,
      },
      {
        document_name: "定款の写し（法人届出の場合）",
        required: false,
      },
      {
        document_name:
          "住宅宿泊管理業者との委託契約書の写し（不在型民泊・家主不在の場合）",
        required: false,
      },
      {
        document_name:
          "外国語による宿泊者への案内文書（非常口・設備使用方法の多言語表示）",
        required: true,
      },
      {
        document_name:
          "周辺住民への周知状況を示す書類（条例による届出が必要な場合）",
        required: false,
      },
      {
        document_name:
          "建築基準法上の用途・構造の適合確認書類（特定行政庁の確認済証または検査済証等）",
        required: false,
      },
    ],
  },
]
