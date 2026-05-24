export type ParsedFileText = {
  filename: string
  type: string
  text: string
}

const TEXT_TYPES = new Set(['text/plain', 'text/csv', 'application/json'])

export function extractTextFromUpload(file: File, buffer: Buffer): ParsedFileText | null {
  const type = file.type || 'application/octet-stream'
  if (TEXT_TYPES.has(type) || /\.(txt|csv|json)$/i.test(file.name)) {
    return {
      filename: file.name,
      type,
      text: buffer.toString('utf8').slice(0, 80_000),
    }
  }
  return null
}
