'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { officeSchema, type OfficeFormValues } from '@/types/forms'
import { type Office } from '@/types/database'
import { createOffice, updateOffice } from '@/lib/actions/offices'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface OfficeFormProps { caseId: string; office?: Office }

export function OfficeForm({ caseId, office }: OfficeFormProps) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OfficeFormValues>({
    resolver: zodResolver(officeSchema),
    defaultValues: office ? {
      name: office.name,
      postal_code: office.postal_code ?? '',
      address: office.address ?? '',
      phone: office.phone ?? '',
      area: office.area ?? '',
      usage_rights: office.usage_rights ?? '',
      memo: office.memo ?? '',
    } : {},
  })

  async function onSubmit(values: OfficeFormValues) {
    const result = office ? await updateOffice(office.id, caseId, values) : await createOffice(caseId, values)
    if (!result.success) { toast({ title: 'エラー', description: result.error, variant: 'destructive' }); return }
    toast({ title: '保存しました' })
    router.push(`/cases/${caseId}?tab=offices`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">名称 *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal_code">郵便番号</Label>
          <Input id="postal_code" {...register('postal_code')} placeholder="123-4567" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">電話番号</Label>
          <Input id="phone" {...register('phone')} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="address">所在地</Label>
          <Input id="address" {...register('address')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">面積</Label>
          <Input id="area" {...register('area')} placeholder="例: 50㎡" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usage_rights">使用権原</Label>
          <Input id="usage_rights" {...register('usage_rights')} placeholder="例: 自己所有, 賃貸借" />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="memo">メモ</Label>
          <Textarea id="memo" {...register('memo')} rows={3} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '保存中...' : '保存'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/cases/${caseId}?tab=offices`)}>キャンセル</Button>
      </div>
    </form>
  )
}
