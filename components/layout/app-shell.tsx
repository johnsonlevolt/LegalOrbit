'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

interface AppShellProps {
  userEmail: string
  children: React.ReactNode
}

export function AppShell({ userEmail, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar userEmail={userEmail} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 bg-white border-b px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded hover:bg-gray-100" aria-label="メニューを開く">
            <Menu className="h-5 w-5" />
          </button>
          <Image src="/brand/icon-64.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="text-sm font-bold">Legal Orbit 行政書士</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
