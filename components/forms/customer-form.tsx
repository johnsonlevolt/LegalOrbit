'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerFormValues } from '@/types/forms'
import { createCustomer, updateCustomer } from '@/lib/actions/customers'
import { toast } from '@/hooks/use-toast'
import type { Customer } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CustomerFormProps {
  customer?: Customer
}

type ZipCloudResponse = {
  status: number
  message: string | null
  results: Array<{
    address1: string
    address2: string
    address3: string
  }> | null
}

function toHalfWidth(value: string) {
  return value.replace(/[０-９Ａ-Ｚａ-ｚ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
}

function normalizeNumericText(value: string) {
  return toHalfWidth(value).replace(/[ー－―‐]/g, '-')
}

function normalizePostalCode(value: string) {
  const digits = normalizeNumericText(value).replace(/[^\d]/g, '').slice(0, 7)
  if (digits.length <= 3) return digits
  return `${digits.slice(0, 3)}-${digits.slice(3)}`
}

function normalizePhone(value: string) {
  return normalizeNumericText(value).replace(/[^\d-]/g, '')
}

function normalizeDigits(value: string, maxLength?: number) {
  const digits = normalizeNumericText(value).replace(/[^\d]/g, '')
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits
}

function composeAddress(values: Partial<CustomerFormValues>) {
  return [values.prefecture, values.city, values.street, values.building]
    .map(value => value?.trim())
    .filter(Boolean)
    .join('')
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false)
  const [addressLookupError, setAddressLookupError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          company_name: customer.company_name,
          customer_type: customer.customer_type ?? '法人',
          corporate_number: customer.corporate_number ?? '',
          representative_name: customer.representative_name ?? '',
          postal_code: customer.postal_code ?? '',
          prefecture: customer.prefecture ?? '',
          city: customer.city ?? '',
          street: customer.street ?? '',
          building: customer.building ?? '',
          address: customer.address ?? '',
          phone: customer.phone ?? '',
          email: customer.email ?? '',
          contact_person: customer.contact_person ?? '',
          memo: customer.memo ?? '',
        }
      : { customer_type: '法人' },
  })

  const watchedAddressParts = watch(['prefecture', 'city', 'street', 'building'])
  const addressPreview = useMemo(() => composeAddress({
    prefecture: watchedAddressParts[0],
    city: watchedAddressParts[1],
    street: watchedAddressParts[2],
    building: watchedAddressParts[3],
  }), [watchedAddressParts])

  useEffect(() => {
    setValue('address', addressPreview, { shouldDirty: true })
  }, [addressPreview, setValue])

  const corporateNumberField = register('corporate_number')
  const postalCodeField = register('postal_code')
  const phoneField = register('phone')

  async function lookupAddress(postalCode: string) {
    const digits = postalCode.replace(/[^\d]/g, '')
    if (digits.length !== 7) return

    setIsLookingUpAddress(true)
    setAddressLookupError(null)
    try {
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`)
      const json = await response.json() as ZipCloudResponse
      const result = json.results?.[0]
      if (!result) {
        setAddressLookupError('住所が見つかりませんでした。')
        return
      }
      setValue('prefecture', result.address1, { shouldDirty: true, shouldValidate: true })
      setValue('city', `${result.address2}${result.address3}`, { shouldDirty: true, shouldValidate: true })
    } catch {
      setAddressLookupError('住所の自動入力に失敗しました。手入力してください。')
    } finally {
      setIsLookingUpAddress(false)
    }
  }

  async function onSubmit(values: CustomerFormValues) {
    const normalizedValues: CustomerFormValues = {
      ...values,
      corporate_number: normalizeDigits(values.corporate_number ?? '', 13),
      postal_code: normalizePostalCode(values.postal_code ?? ''),
      phone: normalizePhone(values.phone ?? ''),
      address: composeAddress(values),
    }

    const result = customer
      ? await updateCustomer(customer.id, normalizedValues)
      : await createCustomer(normalizedValues)

    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: '保存しました' })
    router.push('/customers')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customer_type">顧客区分</Label>
          <select
            id="customer_type"
            {...register('customer_type')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="法人">法人</option>
            <option value="個人">個人</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="company_name">法人名・屋号 *</Label>
          <Input id="company_name" {...register('company_name')} />
          {errors.company_name && <p className="text-sm text-destructive">{errors.company_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="corporate_number">法人番号</Label>
          <Input
            id="corporate_number"
            inputMode="numeric"
            maxLength={13}
            {...corporateNumberField}
            onChange={event => {
              event.target.value = normalizeDigits(event.target.value, 13)
              corporateNumberField.onChange(event)
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="representative_name">代表者名</Label>
          <Input id="representative_name" {...register('representative_name')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal_code">郵便番号</Label>
          <Input
            id="postal_code"
            inputMode="numeric"
            placeholder="123-4567"
            {...postalCodeField}
            onChange={event => {
              event.target.value = normalizePostalCode(event.target.value)
              postalCodeField.onChange(event)
            }}
            onBlur={event => {
              postalCodeField.onBlur(event)
              void lookupAddress(event.target.value)
            }}
          />
          {isLookingUpAddress && <p className="text-xs text-muted-foreground">住所を検索しています...</p>}
          {addressLookupError && <p className="text-xs text-destructive">{addressLookupError}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">電話番号</Label>
          <Input
            id="phone"
            inputMode="tel"
            {...phoneField}
            onChange={event => {
              event.target.value = normalizePhone(event.target.value)
              phoneField.onChange(event)
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prefecture">都道府県</Label>
          <Input id="prefecture" {...register('prefecture')} placeholder="東京都" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">市区町村</Label>
          <Input id="city" {...register('city')} placeholder="千代田区" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="street">番地</Label>
          <Input id="street" {...register('street')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="building">建物名</Label>
          <Input id="building" {...register('building')} />
        </div>
        <input type="hidden" {...register('address')} />
        <div className="space-y-2 md:col-span-2">
          <Label>所在地</Label>
          <div className="min-h-10 rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
            {addressPreview || <span className="text-muted-foreground">都道府県・市区町村・番地・建物名から自動作成されます</span>}
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">メール</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contact_person">担当者名</Label>
          <Input id="contact_person" {...register('contact_person')} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="memo">メモ</Label>
          <Textarea id="memo" {...register('memo')} rows={4} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
