import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('areas')
    .eq('id', user.id)
    .single()

  if (!perfil?.areas?.includes('financeiro')) {
    redirect('/')
  }

  return children
}
