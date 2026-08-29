'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LinhaDoTempo from './LinhaDoTempo'

interface Pedido {
  id: string
  cod_pedido: string
  data: string
  canal: string
  mensagem: string
  status: string
  cliente_nome: string
  cliente_cod: string
}

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

const COLUNAS = [
  { id: 'novo', nome: 'Novo' },
  { id: 'processando', nome: 'Processando' },
  { id: 'aguardando_aprovacao', nome: 'Aguardando aprovação' },
  { id: 'respondido', nome: 'Respondido' },
  { id: 'rejeitado', nome: 'Rejeitado' },
]

export default function KanbanVendas() {
  const supabase = createClient()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [execucoes, setExecucoes] = useState<Map<string, Execucao[]>>(new Map())
  const [selecionado, setSelecionado] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState<Set<string>>(new Set())
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    loadPedidos()

    const canal = supabase
      .channel('pedidos_vendas')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos_orcamento',
        },
        () => {
          loadPedidos()
        }
      )
      .subscribe()

    return () => {
      canal.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (selecionado) {
      loadExecucoes(selecionado.cod_pedido)

      const canal = supabase
        .channel(`execucoes_${selecionado.cod_pedido}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'execucoes_agentes',
            filter: `item_id=eq.${selecionado.cod_pedido}`,
          },
          () => {
            loadExecucoes(selecionado.cod_pedido)
          }
        )
        .subscribe()

      return () => {
        canal.unsubscribe()
      }
    }
  }, [selecionado, supabase])

  const loadPedidos = async () => {
    try {
      // Buscar pedidos simples
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos_orcamento')
        .select('*')
        .order('data', { ascending: false })

      if (pedidosError) {
        console.error('Erro ao buscar pedidos:', pedidosError)
        setLoading(false)
        return
      }

      if (!pedidosData || pedidosData.length === 0) {
        setPedidos([])
        setLoading(false)
        return
      }

      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('cod_cliente, nome')

      if (clientesError) {
        console.error('Erro ao buscar clientes:', clientesError)
      }

      // Mapear pedidos com nomes de clientes
      const clientesMap = new Map(
        clientesData?.map((c: any) => [c.cod_cliente, c.nome]) || []
      )

      const pedidosMapeados = pedidosData.map((p: any) => ({
        id: p.id,
        cod_pedido: p.cod_pedido,
        data: p.data,
        canal: p.canal,
        mensagem: p.mensagem,
        status: p.status,
        cliente_nome: clientesMap.get(p.cod_cliente) || 'Cliente desconhecido',
        cliente_cod: p.cod_cliente,
      }))

      setPedidos(pedidosMapeados)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadExecucoes = async (cod_pedido: string) => {
    const { data, error } = await supabase
      .from('execucoes_agentes')
      .select('*')
      .eq('item_id', cod_pedido)
      .order('inicio', { ascending: true })

    if (!error && data) {
      const mapa = new Map<string, Execucao[]>()
      data.forEach((exec: Execucao) => {
        const list = mapa.get(cod_pedido) || []
        list.push(exec)
        mapa.set(cod_pedido, list)
      })
      setExecucoes(mapa)
    }
  }

  const handleProcessar = async (pedido: Pedido) => {
    setProcessando((prev) => new Set(prev).add(pedido.cod_pedido))

    try {
      const response = await fetch('/api/vendas/processar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cod_pedido: pedido.cod_pedido }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      } else {
        await loadPedidos()
      }
    } catch (error) {
      alert('Erro ao processar pedido')
    } finally {
      setProcessando((prev) => {
        const nova = new Set(prev)
        nova.delete(pedido.cod_pedido)
        return nova
      })
    }
  }

  if (loading) {
    return <div className="text-gray-500">Carregando pedidos...</div>
  }

  return (
    <div className="space-y-4">
      {/* Botão novo pedido */}
      <div className="flex gap-2">
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
        >
          {mostrarForm ? 'Cancelar' : '+ Novo pedido'}
        </button>
      </div>

      {mostrarForm && <FormNovoPedido onSuccess={() => { loadPedidos(); setMostrarForm(false) }} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kanban */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-5 gap-3">
            {COLUNAS.map((coluna) => {
              const pedidosColuna = pedidos.filter((p) => p.status === coluna.id)
              return (
                <div key={coluna.id} className="bg-gray-100 rounded-lg p-3">
                  <h3 className="font-bold text-sm text-gray-900 mb-3">
                    {coluna.nome} ({pedidosColuna.length})
                  </h3>
                  <div className="space-y-2 min-h-96 max-h-96 overflow-y-auto">
                    {pedidosColuna.map((pedido) => (
                      <div
                        key={pedido.id}
                        onClick={() => setSelecionado(pedido)}
                        className={`p-3 rounded-lg cursor-pointer text-xs transition ${
                          selecionado?.id === pedido.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <p className="font-bold">{pedido.cod_pedido}</p>
                        <p className="truncate">{pedido.cliente_nome}</p>
                        <p className="text-gray-500 lowercase">{pedido.canal}</p>
                        <p className="truncate text-gray-600 mt-1">
                          {pedido.mensagem.substring(0, 60)}...
                        </p>
                        {pedido.status === 'novo' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProcessar(pedido)
                            }}
                            disabled={processando.has(pedido.cod_pedido)}
                            className="mt-2 w-full px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            {processando.has(pedido.cod_pedido) ? 'Processando...' : 'Processar'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detalhe */}
        {selecionado && (
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-900 mb-2">{selecionado.cod_pedido}</h3>
              <p className="text-sm text-gray-600 mb-1">Cliente: {selecionado.cliente_nome}</p>
              <p className="text-sm text-gray-600 mb-1">Canal: {selecionado.canal}</p>
              <p className="text-sm text-gray-600 mb-3">Data: {selecionado.data}</p>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {selecionado.mensagem}
              </p>
            </div>

            {/* LinhaDoTempo */}
            <LinhaDoTempo execucoes={execucoes.get(selecionado.cod_pedido) || []} />
          </div>
        )}
      </div>
    </div>
  )
}

function FormNovoPedido({ onSuccess }: { onSuccess: () => void }) {
  const supabase = createClient()
  const [clientes, setClientes] = useState<any[]>([])
  const [cliente, setCliente] = useState('')
  const [canal, setCanal] = useState('e-mail')
  const [mensagem, setMensagem] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadClientes = async () => {
      const { data, error } = await supabase.from('clientes').select('cod_cliente, nome')

      if (!error && data) {
        setClientes(data)
      }
    }

    loadClientes()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Gerar próximo cod_pedido
      const { data: ultimoPedido, error: erroMax } = await supabase
        .from('pedidos_orcamento')
        .select('cod_pedido')
        .order('cod_pedido', { ascending: false })
        .limit(1)
        .single()

      let proximoNum = 1
      if (!erroMax && ultimoPedido) {
        const num = parseInt(ultimoPedido.cod_pedido.replace('PED', ''))
        proximoNum = num + 1
      }

      const novoCodPedido = `PED${String(proximoNum).padStart(3, '0')}`

      const { error } = await supabase.from('pedidos_orcamento').insert({
        cod_pedido: novoCodPedido,
        data: new Date().toISOString().split('T')[0],
        cod_cliente: cliente,
        canal,
        mensagem,
        status: 'novo',
      })

      if (error) {
        alert(`Erro: ${error.message}`)
      } else {
        onSuccess()
      }
    } catch (error) {
      alert('Erro ao criar pedido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
        <select
          required
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecione...</option>
          {clientes.map((c) => (
            <option key={c.cod_cliente} value={c.cod_cliente}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
        <select
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="e-mail">E-mail</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="telefone">Telefone</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
        <textarea
          required
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Digite a mensagem do cliente..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
      >
        {submitting ? 'Criando...' : 'Criar pedido'}
      </button>
    </form>
  )
}
