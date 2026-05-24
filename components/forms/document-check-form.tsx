'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { documentCheckSchema, type DocumentCheckFormValues } from '@/types/forms'
import { createDocumentCheck, updateDocumentCheck } from '@/lib/actions/document-checks'
import { toast } from '@/hooks/use-toast'
import type { DocumentCheck } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface DocumentCheckFormProps {
  caseId: string
  documentCheck?: DocumentCheck
}

export function DocumentCheckForm({ caseId, documentCheck }: DocumentCheckFormProps) {
  const router = useRouter()
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<DocumentCheckFormValues>({
    resolver: zodResolver(documentCheckSchema),
    defaultValues: documentCheck
      ? {
          document_name: documentCheck.document_name,
          required: documentCheck.required,
          obtained: documentCheck.obtained,
          verified: documentCheck.verified,
          deficiency_note: documentCheck.deficiency_note ?? '',
          memo: documentCheck.memo ?? '',
        }
      : { required: false, obtained: false, verified: false },
  })

  async function onSubmit(values: DocumentCheckFormValues) {
    const result = documentCheck
      ? await updateDocumentCheck(documentCheck.id, caseId, values)
      : await createDocumentCheck(caseId, values)
    if (!result.success) { toast({ title: 'エラー', description: result.error, variant: 'destructive' }); return }
    toast({ title: documentCheck ? '更新しました' : '追加しました' })
    router.push(`/cases/${caseId}?tab=documents`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document_name">書類名 *</Label>
          <Input id="document_name" {...register('document_name')} />
          {errors.document_name && <p className="text-sm text-destructive">{errors.document_name.message}</p>}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Controller
              name="required"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="required"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="required">必須</Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              name="obtained"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="obtained"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="obtained">入手済</Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              name="verified"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="verified"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="verified">確認済</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deficiency_note">不備内容</Label>
          <Input id="deficiency_note" {...register('deficiency_note')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memo">メモ</Label>
          <Textarea id="memo" {...register('memo')} rows={3} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '保存中...' : '保存'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/cases/${caseId}?tab=documents`)}>キャンセル</Button>
      </div>
    </form>
  )
}
