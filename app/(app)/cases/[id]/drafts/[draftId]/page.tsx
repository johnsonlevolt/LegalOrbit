import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDocumentDraft } from '@/lib/actions/document-drafts'
import { DocumentDraftAnswersForm } from '@/components/forms/document-draft-answers-form'
import { DocumentDraftContentForm } from '@/components/forms/document-draft-content-form'
import { ApplyDraftExtractedFieldsButton } from '@/components/cases/apply-draft-extracted-fields-button'
import { DeleteDraftButton } from '@/components/cases/delete-draft-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  params: Promise<{ id: string; draftId: string }>
}

function statusLabel(status: string) {
  if (status === 'completed') return '完成'
  if (status === 'needs_input') return '追加入力あり'
  if (status === 'failed') return '失敗'
  return '作成中'
}

export default async function DocumentDraftPage(props: Props) {
  const params = await props.params;
  const draft = await getDocumentDraft(params.draftId)
  if (!draft || draft.case_id !== params.id) notFound()

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{draft.title}</h1>
            <Badge variant={draft.status === 'completed' ? 'default' : 'outline'}>{statusLabel(draft.status)}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">AIで抽出した情報と、不足項目の質問を確認します。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ApplyDraftExtractedFieldsButton draftId={draft.id} disabled={draft.extracted_fields.length === 0} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/cases/${params.id}/drafts/${draft.id}/word`}>Word出力</Link>
          </Button>
          <DeleteDraftButton caseId={params.id} draftId={draft.id} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/cases/${params.id}?tab=drafts`}>案件へ戻る</Link>
          </Button>
        </div>
      </div>

      {draft.missing_fields.some(field => !draft.answers[field.key]) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base text-orange-800">不足項目に回答してください</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentDraftAnswersForm draft={draft} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">抽出できた情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.extracted_fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">抽出情報はまだありません。</p>
            ) : draft.extracted_fields.map(field => (
              <div key={field.key} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{field.label}</p>
                  <span className="text-xs text-muted-foreground">{Math.round(field.confidence * 100)}%</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{field.value}</p>
                {field.source && <p className="mt-1 text-xs text-muted-foreground">出典: {field.source}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">完成プレビュー・手動編集</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentDraftContentForm draft={draft} />
            {draft.reviewed_at && (
              <p className="mt-2 text-xs text-green-700">
                人間確認済み: {new Date(draft.reviewed_at).toLocaleString('ja-JP')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {(draft.uploaded_files.length > 0 || draft.notes.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">読み込み情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.uploaded_files.length > 0 && (
              <div>
                <p className="text-sm font-semibold">添付ファイル</p>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {draft.uploaded_files.map(file => <li key={file.path}>{file.name}</li>)}
                </ul>
              </div>
            )}
            {draft.notes.length > 0 && (
              <div>
                <p className="text-sm font-semibold">AIメモ</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {draft.notes.map(note => <li key={note}>{note}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
