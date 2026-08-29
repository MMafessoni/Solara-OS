'use client'

import { useState } from 'react'

interface Execucao {
  id: string
  agente: string
  status: 'rodando' | 'ok' | 'erro'
  tokens_entrada?: number
  tokens_saida?: number
  entrada?: any
  saida?: any
  erro?: string
  inicio: string
  fim?: string
}

interface LinhaDoTempoProps {
  execucoes: Execucao[]
}

export default function LinhaDoTempo({ execucoes }: LinhaDoTempoProps) {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const nova = new Set(expandidas)
    if (nova.has(id)) {
      nova.delete(id)
    } else {
      nova.add(id)
    }
    setExpandidas(nova)
  }

  const tempoDecorrido = (inicio: string, fim?: string) => {
    const start = new Date(inicio)
    const end = fim ? new Date(fim) : new Date()
    const segundos = Math.floor((end.getTime() - start.getTime()) / 1000)
    return `${segundos}s`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rodando':
        return 'bg-yellow-100 text-yellow-800'
      case 'ok':
        return 'bg-green-100 text-green-800'
      case 'erro':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Linha do tempo</h3>

      {execucoes.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma execução registrada</p>
      ) : (
        <div className="space-y-4">
          {execucoes.map((exec) => (
            <div key={exec.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleExpand(exec.id)}
                className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium capitalize">
                      {exec.agente}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                          exec.status
                        )}`}
                      >
                        {exec.status === 'ok' ? 'Concluído' : exec.status === 'erro' ? 'Erro' : 'Rodando'}
                      </span>
                      {exec.status === 'ok' && (
                        <>
                          <span className="text-xs text-gray-500">
                            {tempoDecorrido(exec.inicio, exec.fim)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(exec.tokens_entrada || 0) + (exec.tokens_saida || 0)} tokens
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-gray-400">
                  {expandidas.has(exec.id) ? '▼' : '▶'}
                </div>
              </button>

              {expandidas.has(exec.id) && (
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-4 space-y-4 text-sm">
                  {exec.entrada && (
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Entrada</p>
                      <pre className="bg-white border border-gray-200 rounded p-3 overflow-x-auto text-xs">
                        {JSON.stringify(exec.entrada, null, 2)}
                      </pre>
                    </div>
                  )}

                  {exec.saida && (
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Saída</p>
                      <pre className="bg-white border border-gray-200 rounded p-3 overflow-x-auto text-xs">
                        {JSON.stringify(exec.saida, null, 2)}
                      </pre>
                    </div>
                  )}

                  {exec.erro && (
                    <div>
                      <p className="font-medium text-red-900 mb-2">Erro</p>
                      <p className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-xs">
                        {exec.erro}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    {exec.inicio && (
                      <p>
                        Início: {new Date(exec.inicio).toLocaleTimeString('pt-BR')}
                      </p>
                    )}
                    {exec.fim && (
                      <p>
                        Fim: {new Date(exec.fim).toLocaleTimeString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
