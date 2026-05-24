'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UpcomingCase {
  id: string
  name: string
  planned_submission_date: string
}

interface Props {
  upcomingCases: UpcomingCase[]
}

export function DeadlineNotifier({ upcomingCases }: Props) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission)

    // 既に許可済みなら通知を送信
    if (Notification.permission === 'granted') {
      sendNotifications(upcomingCases)
    }
  }, [upcomingCases])

  async function requestAndNotify() {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm === 'granted') {
      sendNotifications(upcomingCases)
    }
  }

  // 許可済みか通知不要なら何も表示しない
  if (permission === 'unsupported' || permission === 'granted' || dismissed) return null
  if (upcomingCases.length === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm">
      <Bell className="h-4 w-4 text-orange-600 shrink-0" />
      <span className="text-orange-800 flex-1">
        申請期限が近い案件が <strong>{upcomingCases.length}件</strong> あります。ブラウザ通知を有効にしますか？
      </span>
      <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100 shrink-0" onClick={requestAndNotify}>
        通知を許可
      </Button>
      <button onClick={() => setDismissed(true)} className="text-orange-400 hover:text-orange-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function sendNotifications(cases: UpcomingCase[]) {
  const today = Date.now()
  cases.forEach(c => {
    const days = Math.ceil((new Date(c.planned_submission_date).getTime() - today) / (1000 * 60 * 60 * 24))
    const label = days === 0 ? '本日が期限です！' : `期限まであと ${days} 日です`
    new Notification(`📋 ${c.name}`, {
      body: `申請予定日: ${c.planned_submission_date}　${label}`,
      icon: '/favicon.ico',
      tag: c.id,  // 同じ案件の通知は重複しない
    })
  })
}
