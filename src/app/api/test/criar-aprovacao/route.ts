import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const adminClient = createAdminClient()

  try {
    // Inserir uma aprovação de teste em Vendas
    const { data, error } = await adminClient
      .from('aprovacoes')
      .insert({
        area: 'vendas',
        item_tipo: 'pedido',
        item_id: 'PED001',
        titulo: 'Cliente Teste · Orçamento de peças',
        proposta: {
          resposta:
            'Prezado cliente,\n\nSegue nosso orçamento:\n- 10x Parafuso M8 - R$ 5,00 cada\n- 5x Arruela - R$ 1,00 cada\n\nTotal: R$ 55,00\nPrazo: 5 dias úteis',
          triagem: {
            tipo: 'orcamento',
            itens: [
              { descricao_cliente: 'parafuso m8', quantidade: 10, unidade: un' },
              { descricao_cliente: 'arruela', quantidade: 5, unidade: 'un' },
            ],
            prazo_desejado: '5 dias',
            pede_desconto: false,
            urgencia: 'normal',
          },
          contexto: {
            itens: [
              {
                cod_produto: 'PARA-M8-001',
                descricao: 'Parafuso M8x30 Aço Inox',
                quantidade: 10,
                preco_aplicado: 5.0,
                estoque: 150,
                atende_estoque: true,
                prazo_reposicao_dias: 0,
              },
              {
                cod_produto: 'ARRE-001',
                descricao: 'Arruela M8 Aço Inox',
                quantidade: 5,
                preco_aplicado: 1.0,
                estoque: 500,
                atende_estoque: true,
                prazo_reposicao_dias: 0,
              },
            ],
            condicao_pagamento_dias: 30,
            desconto_maximo_pct: 5,
          },
          revisao: {
            aprovado: true,
            motivos: [],
          },
        },
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Aprovação de teste criada',
      data,
    })
  } catch (err: any) {
    console.error('Erro:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
