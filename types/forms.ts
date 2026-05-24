import { z } from 'zod'

export const customerSchema = z.object({
  customer_type: z.enum(['法人', '個人']).default('法人'),
  company_name: z.string().min(1, '法人名・屋号は必須です'),
  corporate_number: z.string().optional().or(z.literal('')),
  representative_name: z.string().optional().or(z.literal('')),
  postal_code: z.string().optional().or(z.literal('')),
  prefecture: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  street: z.string().optional().or(z.literal('')),
  building: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('メールアドレスの形式が正しくありません').optional().or(z.literal('')),
  contact_person: z.string().optional().or(z.literal('')),
  memo: z.string().optional().or(z.literal('')),
})
export type CustomerFormValues = z.infer<typeof customerSchema>

export const caseSchema = z.object({
  customer_id: z.string().min(1, '顧客は必須です'),
  name: z.string().min(1, '案件名は必須です'),
  business_type: z.string().optional().or(z.literal('')),
  application_type: z.string().optional().or(z.literal('')),
  status: z.enum(['相談中', '受任済', '資料収集中', '書類作成中', '確認待ち', '申請済', '補正対応中', '完了', '保留']),
  accepted_date: z.string().optional().or(z.literal('')),
  planned_submission_date: z.string().optional().or(z.literal('')),
  submission_date: z.string().optional().or(z.literal('')),
  completion_date: z.string().optional().or(z.literal('')),
  assignee: z.string().optional().or(z.literal('')),
  memo: z.string().optional().or(z.literal('')),
})
export type CaseFormValues = z.infer<typeof caseSchema>

export const vehicleSchema = z.object({
  registration_number: z.string().optional().or(z.literal('')),
  chassis_number: z.string().optional().or(z.literal('')),
  vehicle_name: z.string().optional().or(z.literal('')),
  model: z.string().optional().or(z.literal('')),
  usage: z.string().optional().or(z.literal('')),
  ownership_type: z.string().optional().or(z.literal('')),
  max_loading_capacity: z.string().optional().or(z.literal('')),
  gross_vehicle_weight: z.string().optional().or(z.literal('')),
  first_registration_date: z.string().optional().or(z.literal('')),
  inspection_expiry_date: z.string().optional().or(z.literal('')),
  owner_name: z.string().optional().or(z.literal('')),
  user_name: z.string().optional().or(z.literal('')),
  base_location: z.string().optional().or(z.literal('')),
  memo: z.string().optional().or(z.literal('')),
})
export type VehicleFormValues = z.infer<typeof vehicleSchema>

export const officeSchema = z.object({
  name: z.string().min(1, '名称は必須です'),
  postal_code: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  area: z.string().optional().or(z.literal('')),
  usage_rights: z.string().optional().or(z.literal('')),
  memo: z.string().optional().or(z.literal('')),
})
export type OfficeFormValues = z.infer<typeof officeSchema>

export const garageSchema = z.object({
  name: z.string().min(1, '名称は必須です'),
  postal_code: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  area: z.string().optional().or(z.literal('')),
  capacity: z.string().optional().or(z.literal('')),
  usage_rights: z.string().optional().or(z.literal('')),
  distance_from_office: z.string().optional().or(z.literal('')),
  memo: z.string().optional().or(z.literal('')),
})
export type GarageFormValues = z.infer<typeof garageSchema>

export const personSchema = z.object({
  full_name: z.string().min(1, '氏名は必須です'),
  furigana: z.string().optional().or(z.literal('')),
  role: z.enum(['役員', '運行管理者', '整備管理者', '常勤役員等', '担当者']),
  birth_date: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  license_number: z.string().optional().or(z.literal('')),
  appointment_date: z.string().optional().or(z.literal('')),
  memo: z.string().optional().or(z.literal('')),
})
export type PersonFormValues = z.infer<typeof personSchema>

export const documentCheckSchema = z.object({
  document_name: z.string().min(1, '書類名は必須です'),
  required: z.boolean().default(false),
  obtained: z.boolean().default(false),
  verified: z.boolean().default(false),
  deficiency_note: z.string().optional().or(z.literal('')),
  memo: z.string().optional().or(z.literal('')),
})
export type DocumentCheckFormValues = z.infer<typeof documentCheckSchema>
