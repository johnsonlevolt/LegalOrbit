'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClipboardCopy, RotateCcw } from 'lucide-react'
import type { Case, DocumentCheck } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MissingDocsRequestBox({ caseData, documentChecks }: { caseData: Case; documentChecks: DocumentCheck[] }) {
  const [includeAssignee, setIncludeAssignee] = useState(false)
  const missingDocs = useMemo(
    () => documentChecks.filter(doc => doc.required && !doc.obtained),
    [documentChecks]
  )
  const generatedText = useMemo(
    () => buildMessage(caseData, missingDocs, includeAssignee),
    [caseData, missingDocs, includeAssignee]
  )
  const [text, setText] = useState(generatedText)

  useEffect(() => {
    setText(generatedText)
  }, [generatedText])

  if (missingDocs.length === 0) return null

  async function copyText() {
    await navigator.clipboard.writeText(text)
    toast({ title: '依頼文をコピーしました' })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">不足資料の依頼文</CardTitle>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={includeAssignee} onChange={event => setIncludeAssignee(event.target.checked)} />
            担当者名を宛名に入れる
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={text}
          onChange={event => setText(event.target.value)}
          className="min-h-56 w-full rounded-md border bg-white p-3 text-sm leading-6"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={copyText}>
            <ClipboardCopy className="mr-2 h-4 w-4" />
            コピー
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setText(generatedText)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            自動文に戻す
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function buildMessage(caseData: Case, docs: DocumentCheck[], includeAssignee: boolean) {
  const companyName = caseData.customers?.company_name ?? 'お客様'
  const assignee = caseData.assignee?.trim()
  const recipient = includeAssignee && assignee
    ? `${companyName}\n${assignee} 様`
    : `${companyName} 御中`

  return [
    recipient,
    '',
    'いつもお世話になっております。',
    `${caseData.name}の手続きに必要な資料について、下記のご準備をお願いいたします。`,
    '',
    ...docs.map((doc, index) => `${index + 1}. ${doc.document_name}${doc.deficiency_note ? `（${doc.deficiency_note}）` : ''}`),
    '',
    'スマートフォンで撮影した画像で確認できるものは、まず画像でお送りください。',
    '原本が必要な資料については、別途ご案内いたします。',
    '',
    'ご不明点がありましたらお知らせください。',
  ].join('\n')
}
