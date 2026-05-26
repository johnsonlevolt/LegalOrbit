'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

interface AppShellProps {
  userEmail: string
  companyName?: string | null
  children: React.ReactNode
}

export function AppShell({ userEmail, companyName, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar userEmail={userEmail} companyName={companyName} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-3 border-b bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded hover:bg-gray-100" aria-label="メニューを開く">
            <Menu className="h-5 w-5" />
          </button>
          <Image src="/brand/icon-64.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="text-sm font-bold">Legal Orbit 行政書士</span>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
