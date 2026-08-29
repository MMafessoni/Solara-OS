'use client'

import { useState } from 'react'
import Link from 'next/link'
import KanbanVendas from '@/components/KanbanVendas'
import FilaAprovacao from '@/components/FilaAprovacao'
import LogoutButton from '@/components/LogoutButton'

type Tab = 'kanban' | 'aprovacoes'

export default function VendasPage() {
  const [aba, setAba] = useState<Tab>('kanban')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
            <p className="text-sm text-gray-600 mt-1">Processamento de pedidos de orçamento</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Voltar
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Abas */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setAba('kanban')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              aba === 'kanban'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setAba('aprovacoes')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              aba === 'aprovacoes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Aprovações
          </button>
        </div>

        {/* Conteúdo */}
        {aba === 'kanban' ? <KanbanVendas /> : <FilaAprovacao area="vendas" />}
      </main>
    </div>
  )
}
