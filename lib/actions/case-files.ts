'use server'

import { createClient } from '@/lib/supabase/server'
import type { CaseFile } from '@/types/database'

export async function getCaseFiles(caseId: string): Promise<CaseFile[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('case_files')
    .select('*')
    .eq('case_id', caseId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) {
    if (error.message.includes('case_files') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as CaseFile[]
}

