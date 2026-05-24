'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CASE_STATUSES, type Customer } from '@/types/database'

interface Props {
  initialQ?: string
  initialStatus?: string
  initialCustomerId?: string
  initialAssignee?: string
  initialBusinessType?: string
  initialDueFrom?: string
  initialDueTo?: string
  initialMissingDocs?: boolean
  initialDraftMissing?: boolean
  initialSort?: string
  initialDir?: string
  customers?: Customer[]
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

function normalizeDateInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed || /^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
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

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function CaseFilters({
  initialQ = '',
  initialStatus = '',
  initialCustomerId = '',
  initialAssignee = '',
  initialBusinessType = '',
  initialDueFrom = '',
  initialDueTo = '',
  initialMissingDocs = false,
  initialDraftMissing = false,
  initialSort = '',
  initialDir = '',
  customers = [],
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [q, setQ] = useState(initialQ)
  const [status, setStatus] = useState(initialStatus)
  const [customerId, setCustomerId] = useState(initialCustomerId)
  const [assignee, setAssignee] = useState(initialAssignee)
  const [businessType, setBusinessType] = useState(initialBusinessType)
  const [dueFrom, setDueFrom] = useState(initialDueFrom)
  const [dueTo, setDueTo] = useState(initialDueTo)
  const [missingDocs, setMissingDocs] = useState(initialMissingDocs)
  const [draftMissing, setDraftMissing] = useState(initialDraftMissing)
  const [sort, setSort] = useState(initialSort)
  const [dir, setDir] = useState(initialDir)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status && status !== 'all') params.set('status', status)
    if (customerId && customerId !== 'all') params.set('customer_id', customerId)
    if (assignee) params.set('assignee', assignee)
    if (businessType && businessType !== 'all') params.set('business_type', businessType)
    if (dueFrom) params.set('due_from', normalizeDateInput(dueFrom))
    if (dueTo) params.set('due_to', normalizeDateInput(dueTo))
    if (missingDocs) params.set('missing_docs', '1')
    if (draftMissing) params.set('draft_missing', '1')
    if (sort) params.set('sort', sort)
    if (dir) params.set('dir', dir)
    return params.toString()
  }, [q, status, customerId, assignee, businessType, dueFrom, dueTo, missingDocs, draftMissing, sort, dir])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startTransition(() => router.push(`/cases${queryString ? `?${queryString}` : ''}`))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [queryString, router])

  function clearFilters() {
    setQ('')
    setStatus('')
    setCustomerId('')
    setAssignee('')
    setBusinessType('')
    setDueFrom('')
    setDueTo('')
    setMissingDocs(false)
    setDraftMissing(false)
    setSort('')
    setDir('')
  }

  const hasFilters = Boolean(queryString)

  const dateFilter = (label: string, value: string, setter: (value: string) => void) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex w-72 max-w-full gap-2">
        <Input
          className="h-10 w-32 bg-white"
          inputMode="numeric"
          value={value}
          onChange={event => setter(event.target.value)}
          onBlur={event => setter(normalizeDateInput(event.target.value))}
          placeholder="0524"
        />
        <Input
          className="h-10 w-36 bg-white"
          type="date"
          value={isIsoDate(value) ? value : ''}
          onChange={event => setter(event.target.value)}
        />
      </div>
    </div>
  )

  return (
    <div className="rounded-md border bg-white p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">検索</Label>
          <div className="relative w-72 max-w-full">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-10 bg-white pl-8"
              value={q}
              onChange={event => setQ(event.target.value)}
              placeholder="案件名・顧客名"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">ステータス</Label>
          <Select value={status || 'all'} onValueChange={value => setStatus(value === 'all' ? '' : value)}>
            <SelectTrigger className="h-10 w-40 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {CASE_STATUSES.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">顧客</Label>
          <Select value={customerId || 'all'} onValueChange={value => setCustomerId(value === 'all' ? '' : value)}>
            <SelectTrigger className="h-10 w-56 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての顧客</SelectItem>
              {customers.map(customer => <SelectItem key={customer.id} value={customer.id}>{customer.company_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">並び替え</Label>
          <Select
            value={`${sort || 'created_at'}:${dir || 'desc'}`}
            onValueChange={value => {
              const [nextSort, nextDir] = value.split(':')
              setSort(nextSort === 'created_at' ? '' : nextSort)
              setDir(nextSort === 'created_at' && nextDir === 'desc' ? '' : nextDir)
            }}
          >
            <SelectTrigger className="h-10 w-44 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at:desc">登録が新しい順</SelectItem>
              <SelectItem value="planned_submission_date:asc">期限が近い順</SelectItem>
              <SelectItem value="planned_submission_date:desc">期限が遠い順</SelectItem>
              <SelectItem value="name:asc">案件名順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">担当者</Label>
          <Input className="h-10 w-36 bg-white" value={assignee} onChange={event => setAssignee(event.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">業務種別</Label>
          <Select value={businessType || 'all'} onValueChange={value => setBusinessType(value === 'all' ? '' : value)}>
            <SelectTrigger className="h-10 w-44 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {BUSINESS_TYPES.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {dateFilter('申請予定日 From', dueFrom, setDueFrom)}
        {dateFilter('申請予定日 To', dueTo, setDueTo)}

        <label className="flex h-10 items-center gap-2 text-sm">
          <input type="checkbox" checked={missingDocs} onChange={event => setMissingDocs(event.target.checked)} />
          資料不足
        </label>
        <label className="flex h-10 items-center gap-2 text-sm">
          <input type="checkbox" checked={draftMissing} onChange={event => setDraftMissing(event.target.checked)} />
          AI質問あり
        </label>
        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters} disabled={isPending}>
            <X className="mr-1 h-4 w-4" />
            クリア
          </Button>
        )}
      </div>
    </div>
  )
}
