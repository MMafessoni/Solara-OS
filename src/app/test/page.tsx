'use client'

import { useState } from 'react'
import Link from 'next/link'

interface TableStatus {
  pedidos_orcamento: {
    existe: boolean
    erro?: string
    count: number
  }
  clientes: {
    existe: boolean
    erro?: string
    count: number
  }
}

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tableStatus, setTableStatus] = useState<TableStatus | null>(null)

  const verificarTabelas = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/test/check-tables')
      const data = await response.json()
      setTableStatus(data)
    } catch (error) {
      setMessage('Erro ao verificar tabelas')
    } finally {
      setLoading(false)
    }
  }

  const criarAprovacaoTeste = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/test/criar-aprovacao', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(`Erro: ${data.error}`)
      } else {
        setMessage(
          'Aprovação de teste criada! Vá para /vendas e você verá na fila de aprovação.'
        )
      }
    } catch (error) {
      setMessage('Erro ao criar aprovação de teste')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Testes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Página para testar componentes e gerar dados de teste
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Verificar tabelas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Verificar tabelas</h2>
            <p className="text-sm text-gray-600 mb-4">
              Verifica se as tabelas foram criadas no Supabase.
            </p>

            <button
              onClick={verificarTabelas}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar tabelas'}
            </button>

            {tableStatus && (
              <div className="mt-4 space-y-2 text-sm">
                <div
                  className={`p-3 rounded ${
                    tableStatus.pedidos_orcamento.existe
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  <strong>pedidos_orcamento:</strong>{' '}
                  {tableStatus.pedidos_orcamento.existe
                    ? `✓ Existe (${tableStatus.pedidos_orcamento.count} pedidos)`
                    : `✗ Não existe - ${tableStatus.pedidos_orcamento.erro}`}
                </div>
                <div
                  className={`p-3 rounded ${
                    tableStatus.clientes.existe
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  <strong>clientes:</strong>{' '}
                  {tableStatus.clientes.existe
                    ? `✓ Existe (${tableStatus.clientes.count} clientes)`
                    : `✗ Não existe - ${tableStatus.clientes.erro}`}
                </div>
              </div>
            )}
          </div>

          {/* Criar aprovação de teste */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Criar aprovação de teste</h2>
            <p className="text-sm text-gray-600 mb-4">
              Cria uma aprovação pendente na fila de Vendas para testar Realtime, Organograma e
              FilaAprovacao.
            </p>

            <button
              onClick={criarAprovacaoTeste}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar aprovação de teste'}
            </button>

            {message && (
              <div
                className={`mt-4 p-3 rounded text-sm ${
                  message.includes('Erro')
                    ? 'bg-red-50 text-red-800'
                    : 'bg-green-50 text-green-800'
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Debug pedidos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Debug: Pedidos</h2>
            <p className="text-sm text-gray-600 mb-4">
              Verifica se os pedidos estão sendo carregados corretamente.
            </p>
            <a
              href="/api/test/debug-pedidos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
            >
              Abrir JSON de debug
            </a>
          </div>

          {/* Links úteis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Links úteis</h2>
            <div className="space-y-2">
              <p>
                <Link href="/vendas" className="text-blue-600 hover:underline">
                  → /vendas (Kanban e Aprovações)
                </Link>
              </p>
              <p>
                <Link href="/financeiro" className="text-blue-600 hover:underline">
                  → /financeiro (Fila de aprovação)
                </Link>
              </p>
              <p>
                <Link href="/admin" className="text-blue-600 hover:underline">
                  → /admin (Gerenciar usuários)
                </Link>
              </p>
              <p>
                <Link href="/setup" className="text-blue-600 hover:underline">
                  → /setup (Copiar SQL)
                </Link>
              </p>
            </div>
          </div>

          {/* Próximos passos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">Próximos passos</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Clique em "Criar aprovação de teste"</li>
              <li>Acesse /vendas → Aprovações</li>
              <li>Você verá a aprovação na fila</li>
              <li>Teste aprovar, rejeitar ou editar</li>
              <li>Próximo: Implementar Seção 4 (Vendas com agentes)</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
