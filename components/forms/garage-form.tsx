'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { garageSchema, type GarageFormValues } from '@/types/forms'
import { type Garage } from '@/types/database'
import { createGarage, updateGarage } from '@/lib/actions/garages'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface GarageFormProps { caseId: string; garage?: Garage }

export function GarageForm({ caseId, garage }: GarageFormProps) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GarageFormValues>({
    resolver: zodResolver(garageSchema),
    defaultValues: garage ? {
      name: garage.name,
      postal_code: garage.postal_code ?? '',
      address: garage.address ?? '',
      area: garage.area ?? '',
      capacity: garage.capacity ?? '',
      usage_rights: garage.usage_rights ?? '',
      distance_from_office: garage.distance_from_office ?? '',
      memo: garage.memo ?? '',
    } : {},
  })

  async function onSubmit(values: GarageFormValues) {
    const result = garage ? await updateGarage(garage.id, caseId, values) : await createGarage(caseId, values)
    if (!result.success) { toast({ title: 'エラー', description: result.error, variant: 'destructive' }); return }
    toast({ title: '保存しました' })
    router.push(`/cases/${caseId}?tab=garages`)
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
        <div className="col-span-2 space-y-2">
          <Label htmlFor="address">所在地</Label>
          <Input id="address" {...register('address')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">面積</Label>
          <Input id="area" {...register('area')} placeholder="例: 100㎡" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">収容台数</Label>
          <Input id="capacity" {...register('capacity')} placeholder="例: 10台" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usage_rights">使用権原</Label>
          <Input id="usage_rights" {...register('usage_rights')} placeholder="例: 自己所有, 賃貸借" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="distance_from_office">営業所からの距離</Label>
          <Input id="distance_from_office" {...register('distance_from_office')} placeholder="例: 500m" />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="memo">メモ</Label>
          <Textarea id="memo" {...register('memo')} rows={3} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '保存中...' : '保存'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/cases/${caseId}?tab=garages`)}>キャンセル</Button>
      </div>
    </form>
  )
}
