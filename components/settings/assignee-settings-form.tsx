'use client'

import { useState } from 'react'
import { saveAssigneeSettings } from '@/lib/actions/assignee-settings'
import { toast } from '@/hooks/use-toast'
import type { AssigneeSetting } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

type Row = { code: string; name: string }

export function AssigneeSettingsForm({ assignees }: { assignees: AssigneeSetting[] }) {
  const [rows, setRows] = useState<Row[]>(
    assignees.length > 0 ? assignees.map(a => ({ code: a.code, name: a.name })) : [{ code: '1', name: '' }]
  )
  const [isSaving, setIsSaving] = useState(false)

  function updateRow(index: number, patch: Partial<Row>) {
    setRows(current => current.map((row, i) => i === index ? { ...row, ...patch } : row))
  }

  async function onSave() {
    setIsSaving(true)
    const result = await saveAssigneeSettings(rows)
    setIsSaving(false)
    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: '担当者設定を保存しました' })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[96px_1fr_40px] items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">番号</Label>
              <Input
                inputMode="numeric"
                value={row.code}
                onChange={event => updateRow(index, { code: event.target.value.replace(/[^\dA-Za-z-]/g, '') })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">担当者名</Label>
              <Input value={row.name} onChange={event => updateRow(index, { name: event.target.value })} />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setRows(current => current.filter((_, i) => i !== index))}
              disabled={rows.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setRows(current => [...current, { code: String(current.length + 1), name: '' }])}>
          <Plus className="mr-1 h-4 w-4" />追加
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        案件登録時に番号を入力すると、対応する担当者名を自動入力します。
      </p>
    </div>
  )
}
