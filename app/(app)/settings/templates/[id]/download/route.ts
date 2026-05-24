import { readFileSync } from 'node:fs'
import { NextResponse } from 'next/server'
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import ExcelJS from 'exceljs'
import { createClient } from '@/lib/supabase/server'
import type { DocumentTemplate } from '@/types/database'

export const runtime = 'nodejs'

interface Props {
  params: Promise<{ id: string }>
}

type DownloadFormat = 'word' | 'excel' | 'pdf'

export async function GET(request: Request, props: Props) {
  const { id } = await props.params
  const format = getFormat(new URL(request.url).searchParams.get('format'))
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data, error } = await supabase
    .from('document_templates')
    .select('*, document_template_items(id, document_name, required, sort_order)')
    .eq('id', id)
    .single()

  if (error || !data) return new NextResponse('Not found', { status: 404 })

  const template = data as DocumentTemplate
  if (format === 'pdf') return binaryResponse(await buildPdf(template), template.name, 'pdf', 'application/pdf')
  if (format === 'excel') {
    return binaryResponse(
      await buildXlsx(template),
      template.name,
      'xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }
  return binaryResponse(
    await buildDocx(template),
    template.name,
    'docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
}

function getFormat(value: string | null): DownloadFormat {
  if (value === 'excel' || value === 'pdf' || value === 'word') return value
  return 'word'
}

function binaryResponse(bytes: Uint8Array | Buffer, templateName: string, extension: string, contentType: string) {
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': disposition(templateName, extension),
    },
  })
}

function disposition(templateName: string, extension: string) {
  const filename = encodeURIComponent(`${templateName}-フォーマット.${extension}`)
  return `attachment; filename*=UTF-8''${filename}`
}

function sortedItems(template: DocumentTemplate) {
  return [...(template.document_template_items ?? [])].sort((a, b) => a.sort_order - b.sort_order)
}

function cell(text: string, bold = false) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold })],
      }),
    ],
  })
}

function emptyParagraph() {
  return new Paragraph({ text: '' })
}

async function buildDocx(template: DocumentTemplate) {
  const items = sortedItems(template)
  const fields = template.input_fields ?? []

  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: template.name,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph(`業務種別: ${template.business_type ?? ''}`),
          ...(template.description ? [new Paragraph(`説明: ${template.description}`)] : []),
          emptyParagraph(),
          new Paragraph({ text: '提出書類チェックリスト', heading: HeadingLevel.HEADING_2 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [cell('確認', true), cell('区分', true), cell('書類名', true), cell('メモ', true)] }),
              ...(items.length > 0
                ? items.map(item => new TableRow({
                    children: [
                      cell('□'),
                      cell(item.required ? '必須' : '任意'),
                      cell(item.document_name),
                      cell(''),
                    ],
                  }))
                : [new TableRow({ children: [cell('登録された提出書類はありません'), cell(''), cell(''), cell('')] })]),
            ],
          }),
          emptyParagraph(),
          new Paragraph({ text: '入力項目', heading: HeadingLevel.HEADING_2 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [cell('項目', true), cell('必須', true), cell('質問', true), cell('回答', true)] }),
              ...(fields.length > 0
                ? fields.map(field => new TableRow({
                    children: [
                      cell(field.label),
                      cell(field.required ? '必須' : ''),
                      cell(field.question),
                      cell(''),
                    ],
                  }))
                : [new TableRow({ children: [cell('登録された入力項目はありません'), cell(''), cell(''), cell('')] })]),
            ],
          }),
          emptyParagraph(),
          new Paragraph({ text: 'メモ', heading: HeadingLevel.HEADING_2 }),
          emptyParagraph(),
        ],
      },
    ],
  })

  return Packer.toBuffer(document)
}

async function buildXlsx(template: DocumentTemplate) {
  const rows: Array<Array<string>> = [
    [template.name],
    ['業務種別', template.business_type ?? ''],
    ['説明', template.description ?? ''],
    [],
    ['提出書類チェックリスト'],
    ['確認', '区分', '書類名', 'メモ'],
  ]

  const items = sortedItems(template)
  if (items.length > 0) {
    for (const item of items) rows.push(['', item.required ? '必須' : '任意', item.document_name, ''])
  } else {
    rows.push(['登録された提出書類はありません'])
  }

  rows.push([], ['入力項目'], ['項目', '必須', '質問', '回答'])
  const fields = template.input_fields ?? []
  if (fields.length > 0) {
    for (const field of fields) rows.push([field.label, field.required ? '必須' : '', field.question, ''])
  } else {
    rows.push(['登録された入力項目はありません'])
  }

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('フォーマット')
  worksheet.columns = [
    { width: 18 },
    { width: 14 },
    { width: 52 },
    { width: 30 },
  ]
  rows.forEach(row => worksheet.addRow(row))
  worksheet.eachRow(row => {
    row.eachCell(cell => {
      cell.alignment = { vertical: 'top', wrapText: true }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
  })
  ;[1, 5, 6, rows.findIndex(row => row[0] === '入力項目') + 1].forEach(rowNumber => {
    if (rowNumber <= 0) return
    const row = worksheet.getRow(rowNumber)
    row.font = { bold: true }
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } }
  })
  return Buffer.from(await workbook.xlsx.writeBuffer())
}

async function buildPdf(template: DocumentTemplate) {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const fontBytes = readFileSync('C:\\Windows\\Fonts\\NotoSansJP-VF.ttf')
  const font = await pdfDoc.embedFont(fontBytes, { subset: true })

  const pageSize: [number, number] = [595.28, 841.89]
  const margin = 42
  const fontSize = 10
  const lineHeight = 16
  let page = pdfDoc.addPage(pageSize)
  let y = pageSize[1] - margin

  const addPageIfNeeded = () => {
    if (y > margin) return
    page = pdfDoc.addPage(pageSize)
    y = pageSize[1] - margin
  }

  const drawLine = (text: string, size = fontSize, indent = 0) => {
    for (const line of wrapText(text, font, size, pageSize[0] - margin * 2 - indent)) {
      addPageIfNeeded()
      page.drawText(line, { x: margin + indent, y, size, font, color: rgb(0, 0, 0) })
      y -= lineHeight
    }
  }

  drawLine(template.name, 18)
  y -= 8
  drawLine(`業務種別: ${template.business_type ?? ''}`)
  if (template.description) drawLine(`説明: ${template.description}`)
  y -= 10

  drawLine('提出書類チェックリスト', 13)
  y -= 4
  const items = sortedItems(template)
  if (items.length > 0) {
    for (const item of items) {
      drawLine(`□ ${item.required ? '【必須】' : '【任意】'} ${item.document_name}`, fontSize, 8)
    }
  } else {
    drawLine('登録された提出書類はありません', fontSize, 8)
  }
  y -= 10

  drawLine('入力項目', 13)
  y -= 4
  const fields = template.input_fields ?? []
  if (fields.length > 0) {
    for (const field of fields) {
      drawLine(`${field.label}${field.required ? ' *' : ''}`, 11, 8)
      drawLine(`質問: ${field.question}`, fontSize, 16)
      drawLine('回答:', fontSize, 16)
      y -= 8
    }
  } else {
    drawLine('登録された入力項目はありません', fontSize, 8)
  }

  return pdfDoc.save()
}

function wrapText(text: string, font: { widthOfTextAtSize: (text: string, size: number) => number }, size: number, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  for (const char of Array.from(text)) {
    const next = line + char
    if (line && font.widthOfTextAtSize(next, size) > maxWidth) {
      lines.push(line)
      line = char
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.length > 0 ? lines : ['']
}
