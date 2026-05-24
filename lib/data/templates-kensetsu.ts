/**
 * 建設業カテゴリ テンプレートデータ
 *
 * 参照法令・根拠:
 *   - 建設業法（令和2年10月改正、令和6年12月13日改正施行）
 *   - 建設業法施行規則（令和5年1月1日改正を含む）
 *   - 国土交通省「許可申請に必要となる書類の一覧」（令和6年12月13日より適用）
 *   - 各都道府県建設業担当課公表の申請手引き（2024〜2025年時点）
 *
 * 主な改正ポイント（反映済み）:
 *   - 令和2年10月: 経営業務管理責任者要件の緩和（組合せ要件導入）
 *   - 令和5年1月:  一定条件下での経管廃止・業務執行社員制度の整備
 *   - 令和6年12月: 様式番号の一部改訂、社会保険確認書類の義務化
 */

import type { TemplateData } from './template-types'

export const TEMPLATES_KENSETSU: TemplateData[] = [

  // ══════════════════════════════════════════════════════════════════════
  // 1. 建設業許可 新規申請（一般建設業・都道府県知事）
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 新規申請（一般建設業・都道府県知事）',
    business_type: '建設業',
    description:
      '1つの都道府県内のみに営業所を有する場合の一般建設業許可（知事許可）新規申請。' +
      '法人・個人で添付書類が一部異なる。令和6年12月13日施行の改正様式を使用。',
    items: [
      // ── 申請書本体（様式類） ──
      { document_name: '建設業許可申請書（様式第1号）正本1部・副本1部', required: true },
      { document_name: '役員等の一覧表（別紙一）【法人のみ】', required: true },
      { document_name: '営業所一覧表 新規許可等（別紙二(一)）', required: true },
      { document_name: '収入印紙貼付書（知事許可新規：9万円）', required: true },
      { document_name: '工事経歴書（様式第2号）', required: true },
      { document_name: '直前3年の各事業年度における工事施工金額（様式第3号）', required: true },
      { document_name: '使用人数（様式第4号）', required: true },
      { document_name: '経営業務の管理責任者証明書（様式第7号）', required: true },
      { document_name: '専任技術者証明書 新規・追加（様式第8号）', required: true },
      { document_name: '誓約書（様式第6号）', required: true },
      { document_name: '許可申請者の住所、生年月日等に関する調書（様式第12号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の一覧表（様式第11号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の住所、生年月日等（様式第13号）', required: false },
      { document_name: '株主（出資者）調書（様式第14号）【法人のみ】', required: true },
      // ── 財務諸表（法人用） ──
      { document_name: '貸借対照表（様式第15号）【法人用】', required: true },
      { document_name: '損益計算書・完成工事原価報告書（様式第16号）【法人用】', required: true },
      { document_name: '株主資本等変動計算書（様式第17号）【法人用】', required: true },
      { document_name: '注記表（様式第17号の2）【法人用】', required: true },
      { document_name: '附属明細表（様式第17号の3）【資本金1億円超・負債200億円以上の法人のみ】', required: false },
      // ── 財務諸表（個人用） ──
      { document_name: '貸借対照表（様式第18号）【個人用】', required: true },
      { document_name: '損益計算書（様式第19号）【個人用】', required: true },
      // ── 法人関係書類 ──
      { document_name: '登記事項証明書（履歴事項全部証明書）【法人のみ・3か月以内】', required: true },
      { document_name: '定款の写し【法人のみ】', required: true },
      // ── 個人関係書類 ──
      { document_name: '住民票（個人事業主本人・本籍地記載）【個人のみ】', required: true },
      // ── 経営業務管理責任者の確認書類 ──
      { document_name: '経営業務の管理責任者の略歴書', required: true },
      { document_name: '経管の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      { document_name: '経管の経営経験を証明する書類（許可通知書・工事請負契約書等）', required: true },
      // ── 専任技術者の確認書類 ──
      { document_name: '専任技術者の資格証明書類（国家資格証・合格証書の写し）', required: true },
      { document_name: '専任技術者の実務経験証明書（様式第9号）【実務経験による場合】', required: false },
      { document_name: '指導監督的実務経験証明書（様式第10号）【指導監督的実務経験による場合】', required: false },
      { document_name: '専任技術者の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      // ── 社会保険・労働保険 ──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類（標準報酬決定通知書等）', required: true },
      { document_name: '雇用保険の加入状況確認書類（雇用保険適用事業所設置届の写し等）', required: true },
      // ── その他 ──
      { document_name: '営業所の写真（外観・内部・看板）', required: true },
      { document_name: '確定申告書の写し（個人事業主の場合・直前5年分）', required: false },
      { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 2. 建設業許可 新規申請（特定建設業・都道府県知事）
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 新規申請（特定建設業・都道府県知事）',
    business_type: '建設業',
    description:
      '発注者から直接4,500万円（建築一式は7,000万円）以上を下請負人に出す場合に必要な特定建設業許可（知事許可）新規申請。' +
      '財産的基礎要件（資本金2,000万円以上・純資産4,000万円以上等）を満たすことが必要。',
    items: [
      // ── 申請書本体（様式類）──
      { document_name: '建設業許可申請書（様式第1号）正本1部・副本1部', required: true },
      { document_name: '役員等の一覧表（別紙一）【法人のみ】', required: true },
      { document_name: '営業所一覧表 新規許可等（別紙二(一)）', required: true },
      { document_name: '収入印紙貼付書（知事許可新規：9万円）', required: true },
      { document_name: '工事経歴書（様式第2号）', required: true },
      { document_name: '直前3年の各事業年度における工事施工金額（様式第3号）', required: true },
      { document_name: '使用人数（様式第4号）', required: true },
      { document_name: '経営業務の管理責任者証明書（様式第7号）', required: true },
      { document_name: '専任技術者証明書 新規・追加（様式第8号）', required: true },
      { document_name: '誓約書（様式第6号）', required: true },
      { document_name: '許可申請者の住所、生年月日等に関する調書（様式第12号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の一覧表（様式第11号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の住所、生年月日等（様式第13号）', required: false },
      { document_name: '株主（出資者）調書（様式第14号）【法人のみ】', required: true },
      // ── 財務諸表（法人用）──
      { document_name: '貸借対照表（様式第15号）【法人用】', required: true },
      { document_name: '損益計算書・完成工事原価報告書（様式第16号）【法人用】', required: true },
      { document_name: '株主資本等変動計算書（様式第17号）【法人用】', required: true },
      { document_name: '注記表（様式第17号の2）【法人用】', required: true },
      // ── 財産的基礎確認書類（特定建設業のみ）──
      { document_name: '財産的基礎等に関する確認書類（直前決算の貸借対照表）', required: true },
      { document_name: '直前の決算期における純資産額が4,000万円以上であることの確認書類', required: true },
      { document_name: '資本金2,000万円以上であることを示す登記事項証明書（資本金欄確認）', required: true },
      { document_name: '流動比率75%以上であることの計算書', required: true },
      { document_name: '欠損額が資本金の20%以下であることの計算書', required: true },
      // ── 法人関係書類 ──
      { document_name: '登記事項証明書（履歴事項全部証明書）【法人のみ・3か月以内】', required: true },
      { document_name: '定款の写し【法人のみ】', required: true },
      // ── 経営業務管理責任者の確認書類 ──
      { document_name: '経営業務の管理責任者の略歴書', required: true },
      { document_name: '経管の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      { document_name: '経管の経営経験を証明する書類（許可通知書・工事請負契約書等）', required: true },
      // ── 専任技術者の確認書類（特定：1級資格または指導監督的実務経験必須）──
      { document_name: '専任技術者の1級国家資格証・監理技術者資格者証の写し', required: true },
      { document_name: '専任技術者の実務経験証明書（様式第9号）【実務経験10年以上の場合】', required: false },
      { document_name: '指導監督的実務経験証明書（様式第10号）【指導監督的実務経験2年以上の場合】', required: false },
      { document_name: '専任技術者の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      // ── 社会保険・労働保険 ──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類（標準報酬決定通知書等）', required: true },
      { document_name: '雇用保険の加入状況確認書類（雇用保険適用事業所設置届の写し等）', required: true },
      // ── その他 ──
      { document_name: '営業所の写真（外観・内部・看板）', required: true },
      { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 3. 建設業許可 更新申請
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 更新申請',
    business_type: '建設業',
    description:
      '許可の有効期間（5年）満了前に行う更新申請。許可満了日の3か月前から30日前までに提出。' +
      '知事許可更新手数料：5万円。決算変更届の提出状況を事前に確認すること。',
    items: [
      // ── 申請書本体 ──
      { document_name: '建設業許可申請書（様式第1号）正本1部・副本1部', required: true },
      { document_name: '役員等の一覧表（別紙一）【法人のみ】', required: true },
      { document_name: '営業所一覧表 新規許可等（別紙二(一)）', required: true },
      { document_name: '収入印紙貼付書（知事許可更新：5万円）', required: true },
      { document_name: '工事経歴書（様式第2号）', required: true },
      { document_name: '直前3年の各事業年度における工事施工金額（様式第3号）', required: true },
      { document_name: '使用人数（様式第4号）', required: true },
      { document_name: '経営業務の管理責任者証明書（様式第7号）', required: true },
      { document_name: '専任技術者証明書 新規・追加（様式第8号）', required: true },
      { document_name: '誓約書（様式第6号）', required: true },
      { document_name: '許可申請者の住所、生年月日等に関する調書（様式第12号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の一覧表（様式第11号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の住所、生年月日等（様式第13号）', required: false },
      { document_name: '株主（出資者）調書（様式第14号）【法人のみ】', required: true },
      // ── 財務諸表 ──
      { document_name: '貸借対照表（様式第15号）【法人用】', required: true },
      { document_name: '損益計算書・完成工事原価報告書（様式第16号）【法人用】', required: true },
      { document_name: '株主資本等変動計算書（様式第17号）【法人用】', required: true },
      { document_name: '注記表（様式第17号の2）【法人用】', required: true },
      { document_name: '貸借対照表（様式第18号）・損益計算書（様式第19号）【個人用】', required: true },
      // ── 法人関係書類 ──
      { document_name: '登記事項証明書（履歴事項全部証明書）【法人のみ・3か月以内】', required: true },
      { document_name: '定款の写し【法人のみ】', required: true },
      // ── 経営業務管理責任者の確認書類 ──
      { document_name: '経営業務の管理責任者の略歴書', required: true },
      { document_name: '経管の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      // ── 専任技術者の確認書類 ──
      { document_name: '専任技術者の資格証・合格証書の写し（更新時も改めて確認）', required: true },
      { document_name: '専任技術者の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      // ── 社会保険・労働保険 ──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類', required: true },
      { document_name: '雇用保険の加入状況確認書類', required: true },
      // ── 決算変更届の確認 ──
      { document_name: '直前5年分の決算変更届（事業年度終了届）提出済み確認書', required: true },
      { document_name: '許可通知書の写し（現在の許可番号確認用）', required: true },
      // ── その他 ──
      { document_name: '営業所の写真（外観・内部・看板）', required: false },
      { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 4. 建設業許可 業種追加申請
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 業種追加申請',
    business_type: '建設業',
    description:
      '既に建設業許可を受けている者が、新たな業種を追加する申請。' +
      '許可の有効期間は、追加後も既存許可の有効期限に揃えられる（同一申請人の場合は有効期限統一）。',
    items: [
      // ── 申請書本体 ──
      { document_name: '建設業許可申請書（様式第1号）正本1部・副本1部', required: true },
      { document_name: '役員等の一覧表（別紙一）【法人のみ】', required: true },
      { document_name: '営業所一覧表 新規許可等（別紙二(一)）', required: true },
      { document_name: '収入印紙貼付書（知事許可：5万円 ※有効期間の残期間に応じた按分）', required: true },
      { document_name: '工事経歴書（様式第2号）（追加業種分）', required: true },
      { document_name: '直前3年の各事業年度における工事施工金額（様式第3号）', required: true },
      { document_name: '使用人数（様式第4号）', required: true },
      { document_name: '経営業務の管理責任者証明書（様式第7号）', required: true },
      { document_name: '専任技術者証明書 新規・追加（様式第8号）（追加業種の技術者分）', required: true },
      { document_name: '誓約書（様式第6号）', required: true },
      { document_name: '許可申請者の住所、生年月日等に関する調書（様式第12号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の一覧表（様式第11号）', required: true },
      { document_name: '株主（出資者）調書（様式第14号）【法人のみ】', required: true },
      // ── 財務諸表 ──
      { document_name: '貸借対照表・損益計算書等（直前決算期分・様式第15〜19号のうち該当するもの）', required: true },
      // ── 法人関係書類 ──
      { document_name: '登記事項証明書（履歴事項全部証明書）【法人のみ・3か月以内】', required: true },
      { document_name: '定款の写し【法人のみ】', required: true },
      // ── 経営業務管理責任者の確認書類 ──
      { document_name: '経営業務の管理責任者の略歴書', required: true },
      { document_name: '経管の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      // ── 追加業種の専任技術者確認書類 ──
      { document_name: '追加業種の専任技術者の国家資格証・合格証書の写し', required: true },
      { document_name: '追加業種の専任技術者の実務経験証明書（様式第9号）【実務経験による場合】', required: false },
      { document_name: '指導監督的実務経験証明書（様式第10号）【特定建設業の場合】', required: false },
      { document_name: '追加業種の専任技術者の在職・常勤を証明する書類', required: true },
      // ── 社会保険・労働保険 ──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類', required: true },
      { document_name: '雇用保険の加入状況確認書類', required: true },
      // ── その他 ──
      { document_name: '現在の許可通知書の写し（許可番号確認用）', required: true },
      { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 5. 建設業許可 大臣許可 新規申請（一般建設業）
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 大臣許可 新規申請（一般建設業）',
    business_type: '建設業',
    description:
      '2以上の都道府県に営業所を有する場合の国土交通大臣許可新規申請。' +
      '登録免許税15万円が必要。地方整備局（主たる営業所の所在地を管轄）に提出。' +
      '申請から許可まで約90〜120日かかるため、余裕をもって準備すること。',
    items: [
      // ── 申請書本体 ──
      { document_name: '建設業許可申請書（様式第1号）正本2部・副本1部', required: true },
      { document_name: '役員等の一覧表（別紙一）【法人のみ】', required: true },
      { document_name: '営業所一覧表 新規許可等（別紙二(一)）（全都道府県の営業所を記載）', required: true },
      { document_name: '登録免許税の収入印紙または領収書（15万円）', required: true },
      { document_name: '工事経歴書（様式第2号）（各営業所分）', required: true },
      { document_name: '直前3年の各事業年度における工事施工金額（様式第3号）', required: true },
      { document_name: '使用人数（様式第4号）', required: true },
      { document_name: '経営業務の管理責任者証明書（様式第7号）', required: true },
      { document_name: '専任技術者証明書 新規・追加（様式第8号）（全営業所分）', required: true },
      { document_name: '誓約書（様式第6号）', required: true },
      { document_name: '許可申請者の住所、生年月日等に関する調書（様式第12号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の一覧表（様式第11号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の住所、生年月日等（様式第13号）', required: true },
      { document_name: '株主（出資者）調書（様式第14号）【法人のみ】', required: true },
      // ── 財務諸表 ──
      { document_name: '貸借対照表（様式第15号）【法人用】', required: true },
      { document_name: '損益計算書・完成工事原価報告書（様式第16号）【法人用】', required: true },
      { document_name: '株主資本等変動計算書（様式第17号）【法人用】', required: true },
      { document_name: '注記表（様式第17号の2）【法人用】', required: true },
      { document_name: '附属明細表（様式第17号の3）【資本金1億円超・負債200億円以上の法人のみ】', required: false },
      { document_name: '貸借対照表（様式第18号）・損益計算書（様式第19号）【個人用】', required: true },
      // ── 法人関係書類 ──
      { document_name: '登記事項証明書（履歴事項全部証明書）【法人のみ・3か月以内】', required: true },
      { document_name: '定款の写し【法人のみ】', required: true },
      // ── 経営業務管理責任者 ──
      { document_name: '経営業務の管理責任者の略歴書', required: true },
      { document_name: '経管の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      { document_name: '経管の経営経験を証明する書類（許可通知書・工事請負契約書等）', required: true },
      // ── 専任技術者（全営業所分）──
      { document_name: '各営業所の専任技術者の国家資格証・合格証書の写し', required: true },
      { document_name: '各営業所の専任技術者の在職・常勤を証明する書類', required: true },
      { document_name: '各営業所の専任技術者の実務経験証明書（様式第9号）【実務経験による場合】', required: false },
      // ── 令3条の使用人（各従たる営業所）──
      { document_name: '令3条の使用人（各従たる営業所の代表者）の略歴書', required: true },
      { document_name: '令3条の使用人の欠格事由確認書類（住民票等）', required: true },
      // ── 社会保険・労働保険 ──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類', required: true },
      { document_name: '雇用保険の加入状況確認書類', required: true },
      // ── 営業所関係 ──
      { document_name: '各営業所の写真（外観・内部・看板）', required: true },
      { document_name: '各営業所の使用権原を証する書面（賃貸借契約書等）', required: true },
      // ── その他 ──
      { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 6. 建設業許可 決算変更届（事業年度終了届）
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 決算変更届（事業年度終了届）',
    business_type: '建設業',
    description:
      '建設業法第11条第2項に基づき、事業年度終了後4か月以内に提出が義務付けられた年次届出。' +
      '未提出の場合は許可更新が受けられない。毎期必ず提出すること。',
    items: [
      // ── 届出書本体 ──
      { document_name: '変更届出書（様式第22号の2）表紙', required: true },
      { document_name: '工事経歴書（様式第2号）（当該事業年度分）', required: true },
      { document_name: '直前3年の各事業年度における工事施工金額（様式第3号）', required: true },
      { document_name: '使用人数（様式第4号）', required: true },
      // ── 財務諸表（法人用）──
      { document_name: '貸借対照表（様式第15号）【法人用・当該事業年度末】', required: true },
      { document_name: '損益計算書・完成工事原価報告書（様式第16号）【法人用】', required: true },
      { document_name: '株主資本等変動計算書（様式第17号）【法人用】', required: true },
      { document_name: '注記表（様式第17号の2）【法人用】', required: true },
      { document_name: '附属明細表（様式第17号の3）【資本金1億円超・負債200億円以上の法人のみ】', required: false },
      // ── 財務諸表（個人用）──
      { document_name: '貸借対照表（様式第18号）【個人用・当該事業年度末】', required: true },
      { document_name: '損益計算書（様式第19号）【個人用】', required: true },
      // ── 納税証明書 ──
      { document_name: '法人税の納税証明書（その1）【法人用】', required: true },
      { document_name: '所得税の納税証明書（その1）【個人用】', required: true },
      // ── 社会保険・労働保険（令和2年改正で確認義務化）──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類（標準報酬決定通知書等）', required: true },
      { document_name: '雇用保険の加入状況確認書類（雇用保険適用事業所設置届の写し等）', required: true },
      // ── 役員変更があった場合 ──
      { document_name: '変更届出書（様式第22号の2）役員欄（役員変更があった場合）', required: false },
      { document_name: '登記事項証明書（役員変更があった場合）', required: false },
      // ── 決算書（確認用）──
      { document_name: '法人の確定申告書・別表一の写し（税務署受理済み）【確認資料】', required: false },
      { document_name: '個人の確定申告書の写し（税務署受理済み）【個人用・確認資料】', required: false },
      // ── その他 ──
      { document_name: '許可通知書の写し（許可番号確認用）', required: true },
      { document_name: '委任状（行政書士等が代理提出する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 7. 建設業許可 役員・経営業務管理責任者変更届
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 役員・経営業務管理責任者変更届',
    business_type: '建設業',
    description:
      '役員の就任・退任または経営業務管理責任者の変更が生じた場合の届出。' +
      '変更日から2週間以内（役員等は30日以内の都道府県もある）に提出。' +
      '経管の変更は要件確認が必要。令和5年改正の要件緩和を踏まえて対応。',
    items: [
      // ── 届出書本体 ──
      { document_name: '変更届出書（様式第22号の2）', required: true },
      { document_name: '役員等の一覧表（別紙一）（変更後の内容）【法人のみ】', required: true },
      // ── 新任役員の確認書類 ──
      { document_name: '新任役員の住民票（本籍地記載・3か月以内）', required: true },
      { document_name: '新任役員の略歴書', required: true },
      { document_name: '新任役員の欠格事由非該当の誓約書（様式第6号準拠）', required: true },
      // ── 法人関係書類 ──
      { document_name: '登記事項証明書（役員変更後のもの・履歴事項全部証明書）', required: true },
      // ── 経営業務管理責任者の変更（経管交替の場合）──
      { document_name: '経営業務の管理責任者証明書（様式第7号）（新しい経管分）', required: false },
      { document_name: '新しい経管の略歴書', required: false },
      { document_name: '新しい経管の在職・常勤を証明する書類（健康保険証の写し等）', required: false },
      { document_name: '新しい経管の経営経験証明書類（許可通知書・工事請負契約書等）', required: false },
      { document_name: '新しい経管の実務経験証明書（様式第9号）【補佐経験による場合】', required: false },
      { document_name: '組合せ要件（複数者合算）に関する確認資料【令和2年改正対応】', required: false },
      // ── 旧経管の退任確認 ──
      { document_name: '退任した経管の退任日が確認できる書類（議事録・登記事項証明書等）', required: false },
      // ── 社会保険・労働保険 ──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類', required: true },
      { document_name: '雇用保険の加入状況確認書類', required: true },
      // ── その他 ──
      { document_name: '許可通知書の写し（許可番号確認用）', required: true },
      { document_name: '株主（出資者）調書（様式第14号）（出資比率変動がある場合）', required: false },
      { document_name: '委任状（行政書士等が代理提出する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 8. 建設業許可 専任技術者変更届
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 専任技術者変更届',
    business_type: '建設業',
    description:
      '営業所の専任技術者に変更（退職・死亡・交替等）が生じた場合の届出。' +
      '変更日から2週間以内に提出（都道府県により期限が異なる場合あり）。' +
      '退任後に新しい専任技術者が確保できない場合は許可要件を欠くため速やかに対応。',
    items: [
      // ── 届出書本体 ──
      { document_name: '変更届出書（様式第22号の2）表紙', required: true },
      { document_name: '専任技術者証明書 新規・追加（様式第8号）（新任技術者分）', required: true },
      { document_name: '専任技術者証明書 交替・廃止（様式第8号の2）（退任技術者分）', required: true },
      // ── 新任専任技術者の確認書類 ──
      { document_name: '新任専任技術者の国家資格証・合格証書の写し', required: true },
      { document_name: '新任専任技術者の実務経験証明書（様式第9号）【実務経験による場合】', required: false },
      { document_name: '指導監督的実務経験証明書（様式第10号）【特定建設業の指導監督的経験】', required: false },
      { document_name: '新任専任技術者の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      { document_name: '新任専任技術者の住民票（本籍地記載）', required: true },
      // ── 実務経験証明の裏付け書類 ──
      { document_name: '実務経験証明期間の工事請負契約書・注文書・請書の写し（経験10年分）', required: false },
      { document_name: '実務経験証明期間の所属会社の建設業許可通知書の写し', required: false },
      // ── 退任専任技術者の書類 ──
      { document_name: '退任した専任技術者の退任日が確認できる書類（退職証明書等）', required: false },
      // ── 社会保険・労働保険 ──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類（新任技術者分含む）', required: true },
      { document_name: '雇用保険の加入状況確認書類', required: true },
      // ── その他 ──
      { document_name: '許可通知書の写し（許可番号・業種確認用）', required: true },
      { document_name: '営業所一覧表（別紙二(一)）（営業所ごとの技術者変更の場合）', required: false },
      { document_name: '委任状（行政書士等が代理提出する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 9. 建設業許可 営業所新設・変更届
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 営業所新設・変更届',
    business_type: '建設業',
    description:
      '主たる営業所または従たる営業所の新設・移転・廃止・名称変更があった場合の届出。' +
      '新設または所在地変更は変更前に確認を要する（変更日から2週間以内に提出）。' +
      '新設の場合は専任技術者・令3条の使用人を配置する必要がある。',
    items: [
      // ── 届出書本体 ──
      { document_name: '変更届出書（様式第22号の2）表紙', required: true },
      { document_name: '営業所一覧表 新規許可等（別紙二(一)）（変更後の全営業所分）', required: true },
      { document_name: '営業所一覧表 追加（別紙二(二)）（営業所新設の場合）', required: false },
      { document_name: '営業所一覧表 廃止（別紙二(三)）（営業所廃止の場合）', required: false },
      // ── 専任技術者（新設営業所分）──
      { document_name: '専任技術者証明書 新規・追加（様式第8号）（新設営業所の技術者分）', required: false },
      { document_name: '新設営業所の専任技術者の国家資格証・合格証書の写し', required: false },
      { document_name: '新設営業所の専任技術者の在職・常勤を証明する書類', required: false },
      // ── 令3条の使用人（従たる営業所の場合）──
      { document_name: '建設業法施行令第3条に規定する使用人の一覧表（様式第11号）', required: true },
      { document_name: '令3条の使用人の住所、生年月日等（様式第13号）', required: false },
      { document_name: '令3条の使用人の略歴書', required: false },
      { document_name: '令3条の使用人の欠格事由確認書類（住民票等）', required: false },
      // ── 新設・移転営業所の物件関係書類 ──
      { document_name: '新設・移転営業所の使用権原を証する書面（賃貸借契約書または登記事項証明書）', required: true },
      { document_name: '新設・移転営業所の案内図・見取図・平面図', required: true },
      { document_name: '新設・移転営業所の写真（外観・内部・看板）', required: true },
      { document_name: '営業所が都市計画法・建築基準法等に抵触しないことを証する書面', required: false },
      // ── 社会保険・労働保険 ──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類', required: true },
      { document_name: '雇用保険の加入状況確認書類', required: true },
      // ── 知事→大臣許可への切替が伴う場合 ──
      { document_name: '許可換え新規申請書（他都道府県に新設で許可種別が変わる場合）', required: false },
      // ── その他 ──
      { document_name: '許可通知書の写し（許可番号確認用）', required: true },
      { document_name: '委任状（行政書士等が代理提出する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 10. 経営事項審査（経審）申請
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '経営事項審査（経審）申請',
    business_type: '建設業',
    description:
      '公共工事を直接請け負うために必要な経営事項審査（経審）の申請。' +
      '決算変更届提出後に経営規模等評価申請と総合評定値請求を同時に行う。' +
      '令和5年1月改正（CPD・技能レベル向上）および社会保険確認強化に対応。',
    items: [
      // ── 申請書本体 ──
      { document_name: '経営規模等評価申請書・総合評定値請求書（様式20001号）', required: true },
      { document_name: '工事種類別（元請）完成工事高（別紙1 様式20002号）', required: true },
      { document_name: '工事種類別（下請）完成工事高（別紙2 様式20003号）', required: true },
      { document_name: 'その他の審査項目（社会性等）（別紙3 様式20004号）', required: true },
      { document_name: '技術職員名簿（別紙4 様式20005号）', required: true },
      { document_name: '工事経歴書（様式第2号）（審査対象事業年度分）', required: true },
      { document_name: '直前3年の各事業年度における工事施工金額（様式第3号）', required: true },
      // ── 財務諸表 ──
      { document_name: '貸借対照表（様式第15号）【法人用・審査基準日時点】', required: true },
      { document_name: '損益計算書・完成工事原価報告書（様式第16号）【法人用】', required: true },
      { document_name: '株主資本等変動計算書（様式第17号）・注記表（様式第17号の2）【法人用】', required: true },
      { document_name: '貸借対照表（様式第18号）・損益計算書（様式第19号）【個人用】', required: true },
      // ── 税務・会計書類 ──
      { document_name: '法人税の確定申告書（別表一・別表四・別表五(一)）の写し【法人用】', required: true },
      { document_name: '法人税の納税証明書（その1・直前事業年度分）【法人用】', required: true },
      { document_name: '所得税の確定申告書の写し【個人用】', required: true },
      { document_name: '所得税の納税証明書（その1）【個人用】', required: true },
      // ── 技術職員の資格証明書類 ──
      { document_name: '技術職員の1級・2級施工管理技士合格証書の写し', required: true },
      { document_name: '技術職員の建築士（1級・2級）免許証の写し', required: false },
      { document_name: '技術職員の技能士（1級・2級）合格証書の写し【登録基幹技能者等】', required: false },
      { document_name: '技術職員の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      { document_name: '監理技術者資格者証の写し（監理技術者として評価を受ける場合）', required: false },
      // ── 社会保険確認書類（令和2年改正・令和5年強化）──
      { document_name: '健康保険・厚生年金保険の標準報酬決定通知書または納入告知書の写し', required: true },
      { document_name: '雇用保険の労働保険概算・確定保険料申告書および領収証書の写し', required: true },
      { document_name: '建設業退職金共済（建退共）の加入証明書', required: false },
      { document_name: '中小企業退職金共済（中退共）の加入証明書', required: false },
      { document_name: '退職一時金・年金制度の設定を証する書類（企業年金等）', required: false },
      // ── CPD・技能者評価（令和5年改正追加項目）──
      { document_name: 'CPD（継続職業教育）単位取得者の証明書類（各機関発行のもの）', required: false },
      { document_name: '建設キャリアアップシステム（CCUS）技能者の能力評価証明書（レベル3・4）', required: false },
      { document_name: '建設工事に従事する者の就業履歴蓄積措置実施の誓約書（別記様式第6号）', required: false },
      // ── 審査手数料 ──
      { document_name: '経営事項審査手数料の収入証紙または振込証明書（業種数に応じた金額）', required: true },
      // ── その他 ──
      { document_name: '現在の建設業許可通知書の写し（許可番号確認用）', required: true },
      { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 11. 建設業許可 許可換え新規申請（知事→大臣・大臣→知事）
  // ══════════════════════════════════════════════════════════════════════
  {
    name: '建設業許可 許可換え新規申請（知事→大臣・大臣→知事）',
    business_type: '建設業',
    description:
      '他の都道府県への営業所新設等により許可行政庁が変わる場合の「許可換え新規」申請。' +
      '知事→大臣の場合：登録免許税15万円。大臣→知事の場合：収入印紙9万円。' +
      '許可換え後は旧許可番号は消滅するため、経審の許可番号更新にも注意が必要。',
    items: [
      // ── 申請書本体 ──
      { document_name: '建設業許可申請書（様式第1号）正本（知事→大臣は2部、大臣→知事は1部）・副本1部', required: true },
      { document_name: '役員等の一覧表（別紙一）【法人のみ】', required: true },
      { document_name: '営業所一覧表 新規許可等（別紙二(一)）（変更後の全営業所分）', required: true },
      { document_name: '登録免許税の収入印紙または領収書（知事→大臣：15万円）【知事→大臣のみ】', required: false },
      { document_name: '収入印紙貼付書（大臣→知事：9万円）【大臣→知事のみ】', required: false },
      { document_name: '工事経歴書（様式第2号）', required: true },
      { document_name: '直前3年の各事業年度における工事施工金額（様式第3号）', required: true },
      { document_name: '使用人数（様式第4号）', required: true },
      { document_name: '経営業務の管理責任者証明書（様式第7号）', required: true },
      { document_name: '専任技術者証明書 新規・追加（様式第8号）（全営業所分）', required: true },
      { document_name: '誓約書（様式第6号）', required: true },
      { document_name: '許可申請者の住所、生年月日等に関する調書（様式第12号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の一覧表（様式第11号）', required: true },
      { document_name: '建設業法施行令第3条に規定する使用人の住所、生年月日等（様式第13号）', required: false },
      { document_name: '株主（出資者）調書（様式第14号）【法人のみ】', required: true },
      // ── 財務諸表 ──
      { document_name: '貸借対照表（様式第15号）【法人用】', required: true },
      { document_name: '損益計算書・完成工事原価報告書（様式第16号）【法人用】', required: true },
      { document_name: '株主資本等変動計算書（様式第17号）・注記表（様式第17号の2）【法人用】', required: true },
      { document_name: '貸借対照表（様式第18号）・損益計算書（様式第19号）【個人用】', required: true },
      // ── 法人関係書類 ──
      { document_name: '登記事項証明書（履歴事項全部証明書）【法人のみ・3か月以内】', required: true },
      { document_name: '定款の写し【法人のみ】', required: true },
      // ── 経営業務管理責任者の確認書類 ──
      { document_name: '経営業務の管理責任者の略歴書', required: true },
      { document_name: '経管の在職・常勤を証明する書類（健康保険証の写し等）', required: true },
      { document_name: '経管の経営経験を証明する書類', required: true },
      // ── 専任技術者（全営業所分）──
      { document_name: '各営業所の専任技術者の国家資格証・合格証書の写し', required: true },
      { document_name: '各営業所の専任技術者の在職・常勤を証明する書類', required: true },
      // ── 令3条の使用人（従たる営業所）──
      { document_name: '各従たる営業所の令3条の使用人の略歴書', required: false },
      { document_name: '各従たる営業所の令3条の使用人の欠格事由確認書類（住民票等）', required: false },
      // ── 社会保険・労働保険 ──
      { document_name: '健康保険・厚生年金保険の加入状況確認書類', required: true },
      { document_name: '雇用保険の加入状況確認書類', required: true },
      // ── 旧許可関係 ──
      { document_name: '旧許可通知書の写し（旧許可番号・許可業種確認用）', required: true },
      { document_name: '各営業所の写真（外観・内部・看板）', required: true },
      { document_name: '各営業所の使用権原を証する書面（賃貸借契約書等）', required: true },
      // ── その他 ──
      { document_name: '委任状（行政書士等が代理申請する場合）', required: false },
    ],
  },
]
