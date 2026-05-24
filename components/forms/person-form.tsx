'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personSchema, type PersonFormValues } from '@/types/forms'
import { PERSON_ROLES, type Person } from '@/types/database'
import { createPerson, updatePerson } from '@/lib/actions/people'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PersonFormProps { caseId: string; person?: Person }

export function PersonForm({ caseId, person }: PersonFormProps) {
  const router = useRouter()
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: person ? {
      full_name: person.full_name,
      furigana: person.furigana ?? '',
      role: person.role as PersonFormValues['role'],
      birth_date: person.birth_date ?? '',
      address: person.address ?? '',
      phone: person.phone ?? '',
      license_number: person.license_number ?? '',
      appointment_date: person.appointment_date ?? '',
      memo: person.memo ?? '',
    } : { role: '役員' },
  })

  async function onSubmit(values: PersonFormValues) {
    const result = person
      ? await updatePerson(person.id, caseId, values)
      : await createPerson(caseId, values)
    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: '保存しました' })
    router.push(`/cases/${caseId}?tab=people`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">氏名 *</Label>
          <Input id="full_name" {...register('full_name')} />
          {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="furigana">フリガナ</Label>
          <Input id="furigana" {...register('furigana')} />
        </div>
        <div className="space-y-2">
          <Label>役割 *</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="役割を選択" /></SelectTrigger>
                <SelectContent>
                  {PERSON_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="birth_date">生年月日</Label>
          <Input id="birth_date" type="date" {...register('birth_date')} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="address">住所</Label>
          <Input id="address" {...register('address')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">電話番号</Label>
          <Input id="phone" {...register('phone')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license_number">資格者証番号</Label>
          <Input id="license_number" {...register('license_number')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="appointment_date">選任日</Label>
          <Input id="appointment_date" type="date" {...register('appointment_date')} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="memo">メモ</Label>
          <Textarea id="memo" {...register('memo')} rows={3} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '保存中...' : '保存'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/cases/${caseId}?tab=people`)}>キャンセル</Button>
      </div>
    </form>
  )
}
