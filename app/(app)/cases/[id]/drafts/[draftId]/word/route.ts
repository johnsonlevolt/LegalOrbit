import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string; draftId: string }>
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(_request: Request, props: Props) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: draft, error } = await supabase
    .from('document_drafts')
    .select('id, case_id, title, generated_content')
    .eq('id', params.draftId)
    .single()

  if (error || !draft || draft.case_id !== params.id) {
    return new NextResponse('Not found', { status: 404 })
  }

  const title = draft.title || 'document'
  const body = escapeHtml(draft.generated_content ?? '').replace(/\n/g, '<br />')
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: "Yu Gothic", "Meiryo", sans-serif; line-height: 1.7; font-size: 11pt; }
    h1 { font-size: 18pt; border-bottom: 1px solid #222; padding-bottom: 8px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div>${body}</div>
</body>
</html>`

  const fileName = encodeURIComponent(`${title}.doc`)
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/msword; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${fileName}`,
    },
  })
}

