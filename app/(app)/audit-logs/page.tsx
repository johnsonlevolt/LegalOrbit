import { getAuditLogs } from '@/lib/actions/audit-logs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function AuditLogsPage() {
  const logs = await getAuditLogs()
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">監査ログ</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI書類作成、抽出反映、削除などの操作履歴を確認します。</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">直近100件</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日時</TableHead>
                <TableHead>操作</TableHead>
                <TableHead>対象</TableHead>
                <TableHead>詳細</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">ログはまだありません</TableCell></TableRow>
              ) : logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs">{new Date(log.created_at).toLocaleString('ja-JP')}</TableCell>
                  <TableCell>{actionLabel(log.action)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.target_type}</TableCell>
                  <TableCell><pre className="max-w-xl whitespace-pre-wrap break-all text-xs">{JSON.stringify(log.details, null, 2)}</pre></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    'document_draft.create': 'AIドラフト作成',
    'document_draft.answer': 'AI質問回答',
    'document_draft.save_answers': '回答一時保存',
    'document_draft.manual_edit': 'ドラフト手動編集',
    'document_draft.review': '人間確認済み',
    'document_draft.delete': 'ドラフト削除',
    'document_draft.apply_extracted_fields': '抽出情報反映',
  }
  return labels[action] ?? action
}
