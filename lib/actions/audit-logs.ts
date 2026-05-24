'use server'

import { createClient } from '@/lib/supabase/server'
import type { AuditLog } from '@/types/database'
import { isMissingTableError } from './supabase-compat'

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (isMissingTableError(error, 'audit_logs')) return []
  if (error) throw new Error(error.message)
  return (data ?? []) as AuditLog[]
}

