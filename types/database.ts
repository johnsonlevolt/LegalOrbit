export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type CaseStatus =
  | '相談中'
  | '受任済'
  | '資料収集中'
  | '書類作成中'
  | '確認待ち'
  | '申請済'
  | '補正対応中'
  | '完了'
  | '保留'

export const CASE_STATUSES: CaseStatus[] = [
  '相談中', '受任済', '資料収集中', '書類作成中',
  '確認待ち', '申請済', '補正対応中', '完了', '保留'
]

export type PersonRole = '役員' | '運行管理者' | '整備管理者' | '常勤役員等' | '担当者'
export const PERSON_ROLES: PersonRole[] = ['役員', '運行管理者', '整備管理者', '常勤役員等', '担当者']

export type VehicleOwnershipType = '自家用' | '事業用'
export const VEHICLE_OWNERSHIP_TYPES: VehicleOwnershipType[] = ['自家用', '事業用']

export interface Customer {
  id: string
  user_id: string
  customer_type: '法人' | '個人'
  company_name: string
  corporate_number: string | null
  representative_name: string | null
  postal_code: string | null
  prefecture: string | null
  city: string | null
  street: string | null
  building: string | null
  address: string | null
  phone: string | null
  email: string | null
  contact_person: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface Case {
  id: string
  user_id: string
  customer_id: string
  name: string
  business_type: string | null
  application_type: string | null
  status: CaseStatus
  accepted_date: string | null
  planned_submission_date: string | null
  submission_date: string | null
  completion_date: string | null
  assignee: string | null
  memo: string | null
  created_at: string
  updated_at: string
  customers?: Customer
}

export interface Vehicle {
  id: string
  user_id: string
  case_id: string
  registration_number: string | null
  chassis_number: string | null
  vehicle_name: string | null
  model: string | null
  usage: string | null
  ownership_type: string | null
  max_loading_capacity: string | null
  gross_vehicle_weight: string | null
  first_registration_date: string | null
  inspection_expiry_date: string | null
  owner_name: string | null
  user_name: string | null
  base_location: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface Office {
  id: string
  user_id: string
  case_id: string
  name: string
  postal_code: string | null
  address: string | null
  phone: string | null
  area: string | null
  usage_rights: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface Garage {
  id: string
  user_id: string
  case_id: string
  name: string
  postal_code: string | null
  address: string | null
  area: string | null
  capacity: string | null
  usage_rights: string | null
  distance_from_office: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface Person {
  id: string
  user_id: string
  case_id: string
  full_name: string
  furigana: string | null
  role: string
  birth_date: string | null
  address: string | null
  phone: string | null
  license_number: string | null
  appointment_date: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface DocumentCheck {
  id: string
  user_id: string
  case_id: string
  document_name: string
  required: boolean
  obtained: boolean
  verified: boolean
  deficiency_note: string | null
  memo: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DocumentTemplate {
  id: string
  user_id: string
  name: string
  business_type: string | null
  description: string | null
  input_fields: TemplateInputField[]
  created_at: string
  updated_at: string
  document_template_items?: DocumentTemplateItem[]
}

export interface TemplateInputField {
  key: string
  label: string
  required: boolean
  question: string
}

export interface DocumentTemplateItem {
  id: string
  template_id: string
  document_name: string
  required: boolean
  sort_order: number
}

export type DocumentDraftStatus = 'draft' | 'needs_input' | 'completed' | 'failed'

export interface ExtractedField {
  key: string
  label: string
  value: string
  confidence: number
  source: string | null
}

export interface MissingField {
  key: string
  label: string
  question: string
  reason: string
  required: boolean
}

export interface UploadedDraftFile {
  name: string
  path: string
  type: string
  size: number
}

export interface DocumentDraft {
  id: string
  user_id: string
  case_id: string
  template_id: string | null
  title: string
  status: DocumentDraftStatus
  uploaded_files: UploadedDraftFile[]
  extracted_fields: ExtractedField[]
  missing_fields: MissingField[]
  answers: Record<string, string>
  generated_content: string | null
  notes: string[]
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
}

export interface CaseFile {
  id: string
  user_id: string
  case_id: string
  draft_id: string | null
  name: string
  storage_path: string
  content_type: string
  size_bytes: number
  category: string | null
  document_check_id: string | null
  source: string
  classification_confidence: number | null
  classification_source: string | null
  classification_reason: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  case_id: string | null
  action: string
  target_type: string
  target_id: string | null
  details: Record<string, unknown>
  created_at: string
}

export type CaseTaskStatus = 'todo' | 'doing' | 'done'
export type CaseTaskPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface CaseTask {
  id: string
  user_id: string
  case_id: string
  title: string
  description: string | null
  status: CaseTaskStatus
  priority: CaseTaskPriority
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  cases?: Pick<Case, 'id' | 'name' | 'planned_submission_date'>
}

export type CaseCorrectionStatus = 'open' | 'working' | 'done'

export interface CaseCorrection {
  id: string
  user_id: string
  case_id: string
  title: string
  detail: string | null
  requested_at: string
  due_date: string | null
  agency_staff: string | null
  status: CaseCorrectionStatus
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CaseDeadline {
  id: string
  user_id: string
  case_id: string | null
  customer_id: string | null
  title: string
  deadline_date: string
  kind: string
  note: string | null
  completed: boolean
  reminder_enabled: boolean
  reminder_days_before: number[]
  last_reminded_at: string | null
  created_at: string
  updated_at: string
  cases?: Pick<Case, 'id' | 'name' | 'planned_submission_date'>
  customers?: Pick<Customer, 'id' | 'company_name'>
}

export interface Agency {
  id: string
  user_id: string
  name: string
  department: string | null
  postal_code: string | null
  address: string | null
  phone: string | null
  reception_hours: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface UploadLink {
  id: string
  user_id: string
  case_id: string
  token_hash: string
  label: string
  expires_at: string
  max_uploads: number | null
  upload_count: number
  enabled: boolean
  created_at: string
}

export interface CaseReview {
  id: string
  user_id: string
  case_id: string
  title: string
  status: 'pending' | 'approved' | 'rejected'
  checklist: Array<{ label: string; checked: boolean }>
  note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface CaseCommunication {
  id: string
  user_id: string
  case_id: string | null
  customer_id: string | null
  channel: string
  direction: 'inbound' | 'outbound'
  subject: string
  body: string | null
  contacted_at: string
  created_at: string
}

export interface AgencyRule {
  id: string
  user_id: string
  agency_id: string | null
  business_type: string | null
  title: string
  detail: string
  checklist: Array<{ label: string; required?: boolean }>
  effective_from: string | null
  source_url: string | null
  created_at: string
  agencies?: Pick<Agency, 'id' | 'name'>
}

export interface CaseEstimate {
  id: string
  user_id: string
  case_id: string
  title: string
  fee_amount: number
  expense_amount: number
  tax_amount: number
  status: string
  recipient_name: string | null
  issued_at: string | null
  due_date: string | null
  invoice_document_id: string | null
  accepted_at: string | null
  memo: string | null
  created_at: string
}

export interface NotificationSetting {
  id: string
  user_id: string
  enabled: boolean
  days_before: number[]
  webhook_url: string | null
  email_to: string | null
  last_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface PdfFieldMapping {
  key: string
  label: string
  source: string
  page: number
  x: number
  y: number
  size?: number
}

export interface PdfFormTemplate {
  id: string
  user_id: string
  name: string
  business_type: string | null
  storage_path: string
  field_mappings: PdfFieldMapping[]
  created_at: string
  updated_at: string
}

export interface PdfFormOutput {
  id: string
  user_id: string
  case_id: string
  template_id: string
  storage_path: string
  created_at: string
  pdf_form_templates?: Pick<PdfFormTemplate, 'name'>
}

export interface AssigneeSetting {
  id: string
  user_id: string
  code: string
  name: string
  created_at: string
  updated_at: string
}

export interface BillingProfile {
  id: string
  user_id: string
  plan_name: string
  plan_status: string
  billing_cycle: 'monthly' | 'yearly'
  billing_name: string | null
  billing_email: string | null
  postal_code: string | null
  address: string | null
  tax_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  scheduled_plan_name: string | null
  scheduled_billing_cycle: string | null
  created_at: string
  updated_at: string
}

export interface BillingDocument {
  id: string
  user_id: string
  document_type: 'invoice' | 'receipt'
  document_number: string
  issue_date: string
  title: string
  recipient_name: string
  amount: number
  tax_amount: number
  status: string
  memo: string | null
  stripe_invoice_id: string | null
  invoice_pdf_url: string | null
  receipt_url: string | null
  hosted_invoice_url: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionCoupon {
  id: string
  owner_user_id: string
  code_hash: string
  code_hint: string
  label: string
  campaign_type: string
  referrer_name: string | null
  referrer_email: string | null
  referrer_user_id: string | null
  plan_name: string | null
  discount_type: 'percent' | 'amount' | 'free_months' | 'free_until'
  discount_value: number
  free_until: string | null
  expires_at: string | null
  max_redemptions: number | null
  used_count: number
  status: string
  stripe_coupon_id: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionCouponRedemption {
  id: string
  coupon_id: string
  redeemer_user_id: string
  billing_profile_id: string | null
  referrer_name: string | null
  referrer_email: string | null
  referrer_user_id: string | null
  plan_name: string | null
  billing_cycle: string | null
  redeemed_at: string
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  subscription_coupons?: Pick<SubscriptionCoupon, 'label' | 'code_hint' | 'referrer_name' | 'referrer_email'>
}

export interface CouponSheetSetting {
  id: string
  user_id: string
  provider: string
  spreadsheet_id: string | null
  sheet_name: string
  service_account_email: string | null
  encrypted_private_key: string | null
  enabled: boolean
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export interface CouponSheetSyncLog {
  id: string
  user_id: string
  status: string
  message: string | null
  imported_count: number
  created_at: string
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
