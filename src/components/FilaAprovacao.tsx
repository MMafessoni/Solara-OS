'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Aprovacao {
  id: string
  area: string
  item_tipo: string
  item_id: string
  titulo: string
  proposta: any
  status: 'pendente' | 'aprovada' | 'editada' | 'rejeitada'
  observacao?: string
}

interface FilaAprovacaoProps {
  area: string
}

export default function FilaAprovacao({ area }: FilaAprovacaoProps) {
  const supabase = createClient()
  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>([])
  const [loading, setLoading] = useState(true)
  const [selecionada, setSelecionada] = useState<Aprovacao | null>(null)
  const [proposta_editada, setPropostaEditada] = useState('')
  const [observacao, setObservacao] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAprovacoes()

    const canal = supabase
      .channel(`aprovacoes_${area}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aprovacoes',
          filter: `area=eq.${area}`,
        },
        (payload: any) => {
          loadAprovacoes()
        }
      )
      .subscribe()

    return () => {
      canal.unsubscribe()
    }
  }, [area, supabase])

  const loadAprovacoes = async () => {
    const { data, error } = await supabase
      .from('aprovacoes')
      .select('*')
      .eq('area', area)
      .eq('status', 'pendente')
      .order('criado_em', { ascending: true })

    if (!error && data) {
      setAprovacoes(data as Aprovacao[])
    }
    setLoading(false)
  }

  const handleAprovar = async (aprovacao: Aprovacao) => {
    setSubmitting(true)
    const { error } = await supabase
      .from('aprovacoes')
      .update({
        status: 'aprovada',
        decidido_em: new Date().toISOString(),
      })
      .eq('id', aprovacao.id)

    if (!error) {
      setSelecionada(null)
      setPropostaEditada('')
      setObservacao('')
      await loadAprovacoes()
    }
    setSubmitting(false)
  }

  const handleEditar = async (aprovacao: Aprovacao) => {
    setSubmitting(true)
    const { error } = await supabase
      .from('aprovacoes')
      .update({
        status: 'editada',
        proposta: proposta_editada ? JSON.parse(proposta_editada) : aprovacao.proposta,
        decidido_em: new Date().toISOString(),
      })
      .eq('id', aprovacao.id)

    if (!error) {
      setSelecionada(null)
      setPropostaEditada('')
      setObservacao('')
      await loadAprovacoes()
    }
    setSubmitting(false)
  }

  const handleRejeitar = async (aprovacao: Aprovacao) => {
    if (!observacao.trim()) {
      alert('Informe um motivo para rejeição')
      return
    }

    setSubmitting(true)
    const { error } = await supabase
      .from('aprovacoes')
      .update({
        status: 'rejeitada',
        observacao,
        decidido_em: new Date().toISOString(),
      })
      .eq('id', aprovacao.id)

    if (!error) {
      setSelecionada(null)
      setPropostaEditada('')
      setObservacao('')
      await loadAprovacoes()
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-gray-500">Carregando fila...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">
              Fila de aprovação ({aprovacoes.length})
            </h3>
          </div>

          {aprovacoes.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              Nenhum item pendente
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {aprovacoes.map((aprovacao) => (
                <button
                  key={aprovacao.id}
                  onClick={() => {
                    setSelecionada(aprovacao)
                    setPropostaEditada(JSON.stringify(aprovacao.proposta, null, 2))
                    setObservacao('')
                  }}
                  className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition ${
                    selecionada?.id === aprovacao.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900 truncate">{aprovacao.titulo}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {aprovacao.item_tipo === 'pedido' ? 'Pedido' : 'Divergência'}:{' '}
                    {aprovacao.item_id}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detalhe */}
      {selecionada && (
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900">{selecionada.titulo}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {selecionada.item_id} • {selecionada.item_tipo}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposta
              </label>
              <textarea
                value={proposta_editada}
                onChange={(e) => setPropostaEditada(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observação (se rejeitar)
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Motivo da rejeição..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelecionada(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRejeitar(selecionada)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                disabled={submitting}
              >
                Rejeitar
              </button>
              <button
                onClick={() => handleEditar(selecionada)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
                disabled={submitting}
              >
                Editar e aprovar
              </button>
              <button
                onClick={() => handleAprovar(selecionada)}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Processando...' : 'Aprovar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
