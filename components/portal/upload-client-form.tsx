'use client'

import { useState, useTransition } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function UploadClientForm({ token }: { token: string }) {
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setMessage('')
    startTransition(async () => {
      const response = await fetch(`/api/upload/${token}`, { method: 'POST', body: formData })
      const json = await response.json().catch(() => ({}))
      setMessage(response.ok ? 'アップロードしました。ありがとうございました。' : json.error ?? 'アップロードできませんでした。')
    })
  }

  return (
    <form action={submit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">お名前</Label>
        <Input id="name" name="name" placeholder="例: 山田太郎" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">メモ</Label>
        <Textarea id="note" name="note" rows={3} placeholder="資料について補足があれば入力してください" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="files">資料ファイル</Label>
        <Input id="files" name="files" type="file" multiple required />
      </div>
      <Button type="submit" disabled={isPending}>
        <Upload className="mr-2 h-4 w-4" />
        {isPending ? 'アップロード中...' : 'アップロード'}
      </Button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  )
}
