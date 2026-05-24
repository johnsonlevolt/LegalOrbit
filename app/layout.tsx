import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ReleaseBanner } from '@/components/layout/release-banner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Legal Orbit 行政書士',
  description: '行政書士向けの案件管理・書類作成支援システム',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" translate="no">
      <body className={inter.className} suppressHydrationWarning>
        <ReleaseBanner />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
