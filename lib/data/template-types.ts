/**
 * テンプレートデータの共通インターフェース
 * 国土交通省・都道府県建設業担当課の公式情報に基づく書類テンプレート
 */
export interface TemplateData {
  name: string
  business_type: string
  description: string
  items: Array<{ document_name: string; required: boolean }>
  input_fields?: Array<{ key: string; label: string; required: boolean; question: string }>
}
