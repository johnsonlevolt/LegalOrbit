'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Briefcase, Building2, ClipboardList, FileStack, LayoutDashboard, ListChecks, ListTodo, LogOut, Settings, User, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/workbench', label: '今日やること', icon: ListChecks },
  { href: '/customers', label: '顧客管理', icon: Users },
  { href: '/cases', label: '案件管理', icon: Briefcase },
  { href: '/tasks', label: 'タスク', icon: ListTodo },
  { href: '/agencies', label: '提出先マスタ', icon: Building2 },
  { href: '/pdf-forms', label: 'PDF帳票', icon: FileStack },
  { href: '/audit-logs', label: '監査ログ', icon: ClipboardList },
  { href: '/settings/templates', label: '書類テンプレート', icon: Settings },
  { href: '/settings/notifications', label: '通知設定', icon: Bell },
  { href: '/settings/account', label: 'アカウント設定', icon: User },
]

interface SidebarProps {
  userEmail: string
  companyName?: string | null
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ userEmail, companyName, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'w-64 flex flex-col bg-white border-r border-border',
        'fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out',
        'lg:static lg:translate-x-0 lg:z-auto lg:transform-none lg:transition-none',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="p-4 border-b relative">
        <div className="flex items-center gap-3 pr-8">
          <Image
            src="/brand/icon-64.png"
            alt="Legal Orbit 行政書士"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <h1 className="text-sm font-bold text-foreground leading-tight">Legal Orbit 行政書士</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">{companyName || userEmail}</p>
        {onClose && (
          <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 lg:hidden" aria-label="サイドバーを閉じる">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t">
        <form action={logout}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-3" type="submit">
            <LogOut className="h-4 w-4" />
            ログアウト
          </Button>
        </form>
      </div>
    </aside>
  )
}
