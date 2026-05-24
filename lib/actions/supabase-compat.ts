import { createClient } from '@/lib/supabase/server'

export function isMissingTableError(error: { message?: string } | null | undefined, table: string) {
  return Boolean(error?.message?.includes(table) && error.message.includes('schema cache'))
}

export function isMissingUserIdColumn(error: { message?: string } | null | undefined, table: string) {
  const message = error?.message ?? ''
  return message.includes(`column ${table}.user_id does not exist`) || (message.includes(table) && message.includes('user_id') && message.includes('schema cache'))
}

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function userOwnsCase(caseId: string) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return { supabase, user, owns: false }
  const { data } = await supabase
    .from('cases')
    .select('id')
    .eq('id', caseId)
    .eq('user_id', user.id)
    .single()
  return { supabase, user, owns: Boolean(data) }
}
