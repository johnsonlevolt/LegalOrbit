'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vehicleSchema, type VehicleFormValues } from '@/types/forms'
import { VEHICLE_OWNERSHIP_TYPES, type Vehicle } from '@/types/database'
import { createVehicle, updateVehicle } from '@/lib/actions/vehicles'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface VehicleFormProps {
  caseId: string
  vehicle?: Vehicle
}

export function VehicleForm({ caseId, vehicle }: VehicleFormProps) {
  const router = useRouter()
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle ? {
      registration_number: vehicle.registration_number ?? '',
      chassis_number: vehicle.chassis_number ?? '',
      vehicle_name: vehicle.vehicle_name ?? '',
      model: vehicle.model ?? '',
      usage: vehicle.usage ?? '',
      ownership_type: vehicle.ownership_type ?? '',
      max_loading_capacity: vehicle.max_loading_capacity ?? '',
      gross_vehicle_weight: vehicle.gross_vehicle_weight ?? '',
      first_registration_date: vehicle.first_registration_date ?? '',
      inspection_expiry_date: vehicle.inspection_expiry_date ?? '',
      owner_name: vehicle.owner_name ?? '',
      user_name: vehicle.user_name ?? '',
      base_location: vehicle.base_location ?? '',
      memo: vehicle.memo ?? '',
    } : {},
  })

  async function onSubmit(values: VehicleFormValues) {
    const result = vehicle
      ? await updateVehicle(vehicle.id, caseId, values)
      : await createVehicle(caseId, values)
    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: '保存しました' })
    router.push(`/cases/${caseId}?tab=vehicles`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registration_number">登録番号</Label>
          <Input id="registration_number" {...register('registration_number')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chassis_number">車台番号</Label>
          <Input id="chassis_number" {...register('chassis_number')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicle_name">車名</Label>
          <Input id="vehicle_name" {...register('vehicle_name')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">型式</Label>
          <Input id="model" {...register('model')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usage">用途</Label>
          <Input id="usage" {...register('usage')} placeholder="例: 貨物" />
        </div>
        <div className="space-y-2">
          <Label>自家用・事業用区分</Label>
          <Controller
            name="ownership_type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                <SelectContent>
                  {VEHICLE_OWNERSHIP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_loading_capacity">最大積載量</Label>
          <Input id="max_loading_capacity" {...register('max_loading_capacity')} placeholder="例: 2000kg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gross_vehicle_weight">車両総重量</Label>
          <Input id="gross_vehicle_weight" {...register('gross_vehicle_weight')} placeholder="例: 5000kg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="first_registration_date">初度登録年月</Label>
          <Input id="first_registration_date" {...register('first_registration_date')} placeholder="例: 令和3年6月" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inspection_expiry_date">車検満了日</Label>
          <Input id="inspection_expiry_date" type="date" {...register('inspection_expiry_date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner_name">所有者名</Label>
          <Input id="owner_name" {...register('owner_name')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user_name">使用者名</Label>
          <Input id="user_name" {...register('user_name')} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="base_location">使用の本拠</Label>
          <Input id="base_location" {...register('base_location')} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="memo">メモ</Label>
          <Textarea id="memo" {...register('memo')} rows={3} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '保存中...' : '保存'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/cases/${caseId}?tab=vehicles`)}>キャンセル</Button>
      </div>
    </form>
  )
}
