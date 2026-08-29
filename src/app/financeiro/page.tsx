'use client'

import { useState } from 'react'
import Link from 'next/link'
import Organograma from '@/components/Organograma'
import FilaAprovacao from '@/components/FilaAprovacao'
import LogoutButton from '@/components/LogoutButton'

type Tab = 'conciliacao' | 'aprovacoes'

export default function FinanceiroPage() {
  const [aba, setAba] = useState<Tab>('conciliacao')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-sm text-gray-600 mt-1">Conciliação de extratos bancários</p>
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
            onClick={() => setAba('conciliacao')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              aba === 'conciliacao'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Conciliação
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
        {aba === 'conciliacao' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Conciliação de extratos</h2>
            <p className="text-sm text-gray-500">
              Esta seção será implementada com o agente de negócio (seção 5 do SPEC)
            </p>
          </div>
        ) : (
          <FilaAprovacao area="financeiro" />
        )}
      </main>
    </div>
  )
}
