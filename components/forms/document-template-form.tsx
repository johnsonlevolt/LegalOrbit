'use client'

import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createDocumentTemplate, updateDocumentTemplate } from '@/lib/actions/document-templates'
import { toast } from '@/hooks/use-toast'
import type { DocumentTemplate } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus, GripVertical } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'テンプレート名を入力してください'),
  business_type: z.string().optional(),
  description: z.string().optional(),
  input_fields_text: z.string().optional(),
  items: z.array(z.object({
    document_name: z.string().min(1, '書類名を入力してください'),
    required: z.boolean(),
    sort_order: z.number(),
  })).min(1, '書類を1つ以上追加してください'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  template?: DocumentTemplate
}

export function DocumentTemplateForm({ template }: Props) {
  const router = useRouter()
  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: template ? {
      name: template.name,
      business_type: template.business_type ?? '',
      description: template.description ?? '',
      input_fields_text: (template.input_fields ?? []).map(field =>
        `${field.label}${field.required ? ' *' : ''}${field.question ? `｜${field.question}` : ''}`
      ).join('\n'),
      items: (template.document_template_items ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item, i) => ({ document_name: item.document_name, required: item.required, sort_order: i })),
    } : {
      name: '',
      business_type: '',
      description: '',
      input_fields_text: '',
      items: [{ document_name: '', required: false, sort_order: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')

  async function onSubmit(values: FormValues) {
    const inputFields = (values.input_fields_text ?? '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [rawLabel, rawQuestion] = line.split('｜')
        const required = rawLabel.includes('*')
        const label = rawLabel.replace(/\*/g, '').trim()
        return {
          key: `field_${index + 1}`,
          label,
          required,
          question: rawQuestion?.trim() || `${label}を入力してください。`,
        }
      })

    const payload = { ...values, input_fields: inputFields }
    const result = template
      ? await updateDocumentTemplate(template.id, payload)
      : await createDocumentTemplate(payload)

    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: '保存しました' })
    router.push('/settings/templates')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* 基本情報 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">テンプレート名 *</Label>
          <Input id="name" {...register('name')} placeholder="例: 一般貨物自動車運送事業 新規許可" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business_type">業務種別</Label>
            <Input id="business_type" {...register('business_type')} placeholder="例: 一般貨物" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">メモ</Label>
            <Input id="description" {...register('description')} placeholder="テンプレートの説明" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="input_fields_text">AI書類作成で質問する入力項目</Label>
          <textarea
            id="input_fields_text"
            {...register('input_fields_text')}
            rows={5}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={'例:\n法人名 *｜正式な法人名を入力してください\n代表者住所 *｜代表者の住所を入力してください\n許可番号｜既存許可がある場合は入力してください'}
          />
          <p className="text-xs text-muted-foreground">1行1項目。「*」を付けると必須、「｜」の後ろを質問文として使います。</p>
        </div>
      </div>

      {/* 書類リスト */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>書類リスト *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ document_name: '', required: false, sort_order: fields.length })}
          >
            <Plus className="h-4 w-4 mr-1" />書類を追加
          </Button>
        </div>
        {errors.items && typeof errors.items.message === 'string' && (
          <p className="text-sm text-destructive">{errors.items.message}</p>
        )}
        <div className="space-y-2 rounded-md border p-3 bg-gray-50">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">書類を追加してください</p>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 bg-white rounded border p-2">
              <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
              <Input
                {...register(`items.${index}.document_name`)}
                placeholder="書類名"
                className="flex-1 h-8 text-sm"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <Checkbox
                  id={`required-${index}`}
                  checked={items[index]?.required ?? false}
                  onCheckedChange={v => setValue(`items.${index}.required`, !!v)}
                />
                <label htmlFor={`required-${index}`} className="text-xs text-muted-foreground cursor-pointer">必須</label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">計 {fields.length} 件</p>
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
