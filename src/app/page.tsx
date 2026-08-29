import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('papel, areas')
    .eq('id', user.id)
    .single()

  const areas = [
    {
      id: 'vendas',
      nome: 'Vendas',
      descricao: 'Processamento de pedidos de orçamento',
      ativo: perfil?.areas?.includes('vendas') ?? false,
    },
    {
      id: 'financeiro',
      nome: 'Financeiro',
      descricao: 'Conciliação de extratos bancários',
      ativo: perfil?.areas?.includes('financeiro') ?? false,
    },
    {
      id: 'rh',
      nome: 'RH',
      descricao: 'Gestão de pessoal',
      ativo: false,
    },
    {
      id: 'juridico',
      nome: 'Jurídico',
      descricao: 'Análise e documentação',
      ativo: false,
    },
    {
      id: 'operacoes',
      nome: 'Operações',
      descricao: 'Planejamento e execução',
      ativo: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solara OS</h1>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
          </div>
          {perfil?.papel === 'admin' && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Administração
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <div
              key={area.id}
              className={`rounded-lg shadow overflow-hidden transition-opacity ${
                area.ativo ? 'bg-white hover:shadow-lg cursor-pointer' : 'bg-gray-100 opacity-60'
              }`}
            >
              {area.ativo ? (
                <Link href={`/${area.id}`}>
                  <div className="px-6 py-8">
                    <h2 className="text-xl font-bold text-gray-900">{area.nome}</h2>
                    <p className="mt-2 text-sm text-gray-600">{area.descricao}</p>
                    <div className="mt-4 text-sm text-blue-600 font-medium">Acessar →</div>
                  </div>
                </Link>
              ) : (
                <div className="px-6 py-8">
                  <h2 className="text-xl font-bold text-gray-900">{area.nome}</h2>
                  <p className="mt-2 text-sm text-gray-600">{area.descricao}</p>
                  <div className="mt-4 text-sm text-gray-500 font-medium">Em breve</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
