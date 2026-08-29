'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Execucao {
  id: string
  agente: string
  status: 'rodando' | 'ok' | 'erro'
  tokens_entrada?: number
  tokens_saida?: number
  inicio: string
  fim?: string
}

interface OrganogramaProps {
  area: string
  item_id: string
}

const AGENTES_VENDAS = ['triador', 'pesquisador', 'redator', 'revisor']
const AGENTES_FINANCEIRO = ['investigador', 'consolidador', 'revisor']

export default function Organograma({ area, item_id }: OrganogramaProps) {
  const supabase = createClient()
  const [execucoes, setExecucoes] = useState<Map<string, Execucao>>(new Map())
  const [raiz, setRaiz] = useState<Execucao | null>(null)

  const agentes = area === 'vendas' ? AGENTES_VENDAS : AGENTES_FINANCEIRO

  useEffect(() => {
    // Carregar execuções iniciais
    const loadExecucoes = async () => {
      const { data, error } = await supabase
        .from('execucoes_agentes')
        .select('*')
        .eq('item_id', item_id)
        .order('inicio', { ascending: true })

      if (!error && data) {
        const mapa = new Map()
        let raizExec = null

        data.forEach((exec: Execucao) => {
          mapa.set(exec.agente, exec)
          if (exec.agente === 'orquestrador') {
            raizExec = exec
          }
        })

        setExecucoes(mapa)
        setRaiz(raizExec)
      }
    }

    loadExecucoes()

    // Subscribe ao Realtime
    const canal = supabase
      .channel(`execucoes_${item_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'execucoes_agentes',
          filter: `item_id=eq.${item_id}`,
        },
        (payload: any) => {
          const exec = payload.new as Execucao
          setExecucoes((prev) => new Map(prev).set(exec.agente, exec))

          if (exec.agente === 'orquestrador') {
            setRaiz(exec)
          }
        }
      )
      .subscribe()

    return () => {
      canal.unsubscribe()
    }
  }, [item_id, supabase])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rodando':
        return 'bg-yellow-100 border-yellow-300 animate-pulse'
      case 'ok':
        return 'bg-green-100 border-green-300'
      case 'erro':
        return 'bg-red-100 border-red-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'rodando':
        return 'Rodando'
      case 'ok':
        return 'Concluído'
      case 'erro':
        return 'Erro'
      default:
        return 'Aguardando'
    }
  }

  const tempoDecorrido = (inicio: string, fim?: string) => {
    const start = new Date(inicio)
    const end = fim ? new Date(fim) : new Date()
    const segundos = Math.floor((end.getTime() - start.getTime()) / 1000)
    return `${segundos}s`
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Organograma de execução</h3>

      {!raiz ? (
        <p className="text-sm text-gray-500">Aguardando processamento...</p>
      ) : (
        <div className="space-y-8">
          {/* Orquestrador */}
          <div className="flex justify-center">
            <div
              className={`px-4 py-3 rounded border-2 ${getStatusColor(raiz.status)} text-center`}
            >
              <p className="font-bold text-sm text-gray-900">Orquestrador</p>
              <p className="text-xs text-gray-600 mt-1">{getStatusText(raiz.status)}</p>
              {raiz.status === 'ok' && (
                <p className="text-xs text-gray-500 mt-1">{tempoDecorrido(raiz.inicio, raiz.fim)}</p>
              )}
            </div>
          </div>

          {/* Linha de conexão */}
          <div className="flex justify-center">
            <div className="w-1 h-8 bg-gray-300"></div>
          </div>

          {/* Agentes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {agentes.map((agente) => {
              const exec = execucoes.get(agente)
              const status = exec?.status || 'aguardando'

              return (
                <div key={agente} className="text-center">
                  <div
                    className={`px-4 py-3 rounded border-2 ${getStatusColor(status)} text-center min-h-20 flex flex-col justify-center`}
                  >
                    <p className="font-bold text-sm text-gray-900 capitalize">{agente}</p>
                    <p className="text-xs text-gray-600 mt-1">{getStatusText(status)}</p>
                    {exec && exec.status === 'ok' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {tempoDecorrido(exec.inicio, exec.fim)}
                      </p>
                    )}
                    {exec && exec.status === 'ok' && (
                      <p className="text-xs text-gray-500">
                        {(exec.tokens_entrada || 0) + (exec.tokens_saida || 0)} tokens
                      </p>
                    )}
                    {exec && exec.status === 'erro' && (
                      <p className="text-xs text-red-600 mt-1">Falha</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
