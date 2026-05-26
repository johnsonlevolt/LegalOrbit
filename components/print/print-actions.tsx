'use client'

import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PrintActionsProps {
  fileName: string
}

export function PrintActions({ fileName }: PrintActionsProps) {
  const printDocument = (nextTitle?: string) => {
    const previousTitle = document.title
    if (nextTitle) document.title = nextTitle
    window.print()
    window.setTimeout(() => {
      document.title = previousTitle
    }, 500)
  }

  return (
    <div className="mb-4 flex justify-end gap-2 print:hidden">
        <Button type="button" variant="outline" onClick={() => printDocument(fileName)}>
          <Download className="mr-2 h-4 w-4" />
          PDF保存
        </Button>
        <Button type="button" onClick={() => printDocument()}>
          <Printer className="mr-2 h-4 w-4" />
          印刷
        </Button>
    </div>
  )
}
