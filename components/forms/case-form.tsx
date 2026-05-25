'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { caseSchema, type CaseFormValues } from '@/types/forms'
import { CASE_STATUSES, type AssigneeSetting, type Case, type Customer, type DocumentTemplate } from '@/types/database'
import { createCase, updateCase } from '@/lib/actions/cases'
import { applyTemplateToCase } from '@/lib/actions/document-templates'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CaseFormProps {
  caseData?: Case
  customers: Customer[]
  assignees?: AssigneeSetting[]
  templates?: DocumentTemplate[]
}

const BUSINESS_TYPES = [
  '運輸・自動車',
  '建設業',
  '産廃・廃棄物',
  '飲食・風俗・古物',
  '入管・国際',
  '農地・農業',
  '相続・遺言',
  '法人設立',
  '福祉・補助金',
  'ドローン',
  'その他許認可',
]

const APPLICATION_TYPES = ['新規', '更新', '変更', '届出', '廃止', '許可替え', '認可', '登録', '証明', '相談']

function normalizeDateInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  const digits = trimmed.replace(/[^\d]/g, '')
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
  if (digits.length === 6) return `20${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`
  if (digits.length === 4) return `${year}-${digits.slice(0, 2)}-${digits.slice(2, 4)}`
  if (digits.length <= 2) return `${year}-${String(month).padStart(2, '0')}-${digits.padStart(2, '0')}`
  return trimmed
}

function isIsoDate(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

export function CaseForm({ caseData, customers, assignees = [], templates = [] }: CaseFormProps) {
  const router = useRouter()
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('all')
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: caseData
      ? {
          customer_id: caseData.customer_id,
          name: caseData.name,
          business_type: caseData.business_type ?? '',
          application_type: caseData.application_type ?? '',
          status: caseData.status,
          accepted_date: caseData.accepted_date ?? '',
          planned_submission_date: caseData.planned_submission_date ?? '',
          submission_date: caseData.submission_date ?? '',
          completion_date: caseData.completion_date ?? '',
          assignee: caseData.assignee ?? '',
          memo: caseData.memo ?? '',
        }
      : { status: CASE_STATUSES[0], accepted_date: new Date().toISOString().split('T')[0] },
  })

  const templateCategories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const template of templates) {
      const category = template.business_type || '未分類'
      counts.set(category, (counts.get(category) ?? 0) + 1)
    }
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b, 'ja'))
  }, [templates])

  const visibleTemplates = selectedTemplateCategory === 'all'
    ? templates
    : templates.filter(template => (template.business_type || '未分類') === selectedTemplateCategory)

  const selectedTemplate = templates.find(template => template.id === selectedTemplateId)

  function selectTemplate(value: string) {
    const template = templates.find(item => item.id === value)
    setSelectedTemplateId(value)
    if (!template) return
    setValue('name', template.name, { shouldDirty: true, shouldValidate: true })
    if (template.business_type) setValue('business_type', template.business_type, { shouldDirty: true, shouldValidate: true })
  }

  async function onSubmit(values: CaseFormValues) {
    const normalizedValues = {
      ...values,
      accepted_date: normalizeDateInput(values.accepted_date ?? ''),
      planned_submission_date: normalizeDateInput(values.planned_submission_date ?? ''),
      submission_date: normalizeDateInput(values.submission_date ?? ''),
      completion_date: normalizeDateInput(values.completion_date ?? ''),
    }
    const result = caseData ? await updateCase(caseData.id, normalizedValues) : await createCase(normalizedValues)
    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      return
    }
    if (!caseData && selectedTemplateId) {
      const templateResult = await applyTemplateToCase(result.data.id, selectedTemplateId)
      if (!templateResult.success) {
        toast({ title: '案件は保存しましたが、テンプレート適用に失敗しました', description: templateResult.error, variant: 'destructive' })
        router.push('/cases')
        return
      }
      toast({ title: '案件を保存し、テンプレートを適用しました' })
      router.push('/cases')
      return
    }
    toast({ title: '保存しました' })
    router.push(caseData ? `/cases/${caseData.id}` : '/cases')
  }

  const dateField = (
    name: 'accepted_date' | 'planned_submission_date' | 'submission_date' | 'completion_date',
    label: string,
    placeholder: string,
  ) => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const value = field.value ?? ''
          return (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_10rem]">
              <Input
                id={name}
                className="bg-white"
                inputMode="numeric"
                value={value}
                placeholder={placeholder}
                onChange={field.onChange}
                onBlur={event => field.onChange(normalizeDateInput(event.target.value))}
              />
              <Input
                className="bg-white"
                type="date"
                aria-label={`${label}をカレンダーで選択`}
                value={isIsoDate(value) ? value : ''}
                onChange={event => field.onChange(event.target.value)}
              />
            </div>
          )
        }}
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {!caseData && (
          <div className="space-y-4 rounded-md border bg-white p-4 md:col-span-2">
            <div>
              <Label>書類テンプレート</Label>
              <p className="mt-1 text-xs text-muted-foreground">業務カテゴリを選ぶと右側に候補が出ます。テンプレート選択時は案件名と業務種別を自動反映します。</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>業務カテゴリ</Label>
                <Select
                  value={selectedTemplateCategory}
                  onValueChange={value => {
                    setSelectedTemplateCategory(value)
                    setSelectedTemplateId('')
                    if (value !== 'all' && value !== '未分類') setValue('business_type', value, { shouldDirty: true, shouldValidate: true })
                  }}
                >
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて ({templates.length}件)</SelectItem>
                    {templateCategories.map(([category, count]) => <SelectItem key={category} value={category}>{category} ({count}件)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>テンプレート</Label>
                <Select value={selectedTemplateId} onValueChange={selectTemplate}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="テンプレートを選択" /></SelectTrigger>
                  <SelectContent>
                    {visibleTemplates.map(template => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedTemplate && (
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{selectedTemplate.name}</p>
                <p className="text-muted-foreground">
                  {selectedTemplate.business_type ?? '未分類'}
                  {selectedTemplate.document_template_items?.length ? ` / 必要書類 ${selectedTemplate.document_template_items.length}件` : ''}
                </p>
                {selectedTemplate.description && <p className="mt-1 text-muted-foreground">{selectedTemplate.description}</p>}
              </div>
            )}
          </div>
        )}

        <div className="space-y-1 md:col-span-2 md:max-w-xl">
          <Label>顧客 *</Label>
          <Controller
            name="customer_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="顧客を選択" /></SelectTrigger>
                <SelectContent>
                  {customers.map(customer => <SelectItem key={customer.id} value={customer.id}>{customer.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.customer_id && <p className="text-sm text-destructive">{errors.customer_id.message}</p>}
        </div>

        <div className="space-y-1 md:col-span-2 md:max-w-xl">
          <Label htmlFor="name">案件名 *</Label>
          <Input id="name" className="bg-white" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>業務種別</Label>
          <Controller
            name="business_type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="業務種別を選択" /></SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label>申請区分</Label>
          <Controller
            name="application_type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="申請区分を選択" /></SelectTrigger>
                <SelectContent>
                  {APPLICATION_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label>ステータス *</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CASE_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="assignee_code">担当者番号</Label>
          <Input
            id="assignee_code"
            className="bg-white"
            inputMode="numeric"
            placeholder="例: 1"
            onChange={event => {
              const assignee = assignees.find(item => item.code === event.target.value.trim())
              if (assignee) setValue('assignee', assignee.name, { shouldDirty: true })
            }}
          />
        </div>

        <div className="space-y-1">
          <Label>担当者</Label>
          <Controller
            name="assignee"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="担当者を選択" /></SelectTrigger>
                <SelectContent>
                  {assignees.map(assignee => <SelectItem key={assignee.id} value={assignee.name}>{assignee.code}. {assignee.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {dateField('accepted_date', '受任日', '2026-05-24 / 0524 / 24')}
        {dateField('planned_submission_date', '申請予定日', '2026-05-31 / 0531 / 31')}
        {dateField('submission_date', '申請日', '申請後に入力')}
        {dateField('completion_date', '完了日', '完了後に入力')}

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="memo">メモ</Label>
          <Textarea id="memo" className="bg-white" {...register('memo')} rows={4} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '保存中...' : '保存'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>キャンセル</Button>
      </div>
    </form>
  )
}
