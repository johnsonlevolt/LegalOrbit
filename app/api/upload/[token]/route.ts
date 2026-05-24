import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hashCouponCode } from '@/lib/security/hash'
import { extractTextFromUpload } from '@/lib/document-extraction'
import { autoClassifyCaseFile } from '@/lib/file-classification'

export const runtime = 'nodejs'

interface Props {
  params: Promise<{ token: string }>
}

export async function POST(request: Request, props: Props) {
  const { token } = await props.params
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'アップロード設定が未完了です。' }, { status: 500 })

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data: link, error } = await supabase
    .from('upload_links')
    .select('*, cases(id, user_id)')
    .eq('token_hash', hashCouponCode(token))
    .eq('enabled', true)
    .single()

  if (error || !link) return NextResponse.json({ error: 'リンクが無効です。' }, { status: 404 })
  if (new Date(link.expires_at).getTime() < Date.now()) return NextResponse.json({ error: 'リンクの期限が切れています。' }, { status: 410 })
  if (link.max_uploads && link.upload_count >= link.max_uploads) return NextResponse.json({ error: 'アップロード上限に達しました。' }, { status: 429 })

  const formData = await request.formData()
  const files = formData.getAll('files').filter((file): file is File => file instanceof File && file.size > 0)
  if (files.length === 0) return NextResponse.json({ error: 'ファイルを選択してください。' }, { status: 400 })

  const note = String(formData.get('note') ?? '').trim()
  const uploader = String(formData.get('name') ?? '').trim()
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: '20MBを超えるファイルがあります。' }, { status: 400 })
    const buffer = Buffer.from(await file.arrayBuffer())
    const safeName = file.name.replace(/[^\w.\-()\u3040-\u30ff\u3400-\u9fff]/g, '_')
    const path = `${link.user_id}/${link.case_id}/client-upload/${Date.now()}-${safeName}`
    const upload = await supabase.storage.from('case-documents').upload(path, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 })
    const { data: insertedFile, error: insertError } = await supabase.from('case_files').insert({
      user_id: link.user_id,
      case_id: link.case_id,
      name: file.name,
      storage_path: path,
      content_type: file.type || 'application/octet-stream',
      size_bytes: file.size,
      source: 'client_portal',
      category: note || uploader ? [uploader, note].filter(Boolean).join(' / ') : null,
    }).select('id').single()
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    const parsed = extractTextFromUpload(file, buffer)
    if (insertedFile?.id) {
      await autoClassifyCaseFile({
        supabase,
        userId: link.user_id,
        caseId: link.case_id,
        fileId: insertedFile.id,
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        buffer,
        parsedText: parsed?.text,
      })
    }
  }

  await supabase.from('upload_links').update({ upload_count: link.upload_count + files.length }).eq('id', link.id)
  return NextResponse.json({ ok: true })
}
