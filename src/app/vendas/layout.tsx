import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function VendasLayout({
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

  if (!perfil?.areas?.includes('vendas')) {
    redirect('/')
  }

  return children
}
