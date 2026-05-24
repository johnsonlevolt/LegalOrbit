'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCustomer } from '@/lib/actions/customers'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface Props {
  customerId: string
}

export function DeleteCustomerButton({ customerId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('この顧客を削除しますか？関連する案件がある場合は削除できません。')) return
    setLoading(true)
    const result = await deleteCustomer(customerId)
    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      setLoading(false)
      return
    }
    router.push('/customers')
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? '削除中...' : '削除'}
    </Button>
  )
}
