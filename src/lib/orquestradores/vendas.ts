import { agente } from '@/lib/agente'
import { createClient } from '@/lib/supabase/server'

interface OrchestradorContext {
  cod_pedido: string
  area: 'vendas'
}

export async function orquestradorVendas(context: OrchestradorContext) {
  const supabase = await createClient()

  try {
    // 1. Buscar dados do pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos_orcamento')
      .select(
        `
        *,
        clientes:cod_cliente(cod_cliente, nome, segmento)
      `
      )
      .eq('cod_pedido', context.cod_pedido)
      .single()

    if (pedidoError || !pedido) {
      throw new Error('Pedido não encontrado')
    }

    // 2. Criar execução raiz (orquestrador)
    const { data: execucaoRaiz, error: erroRaiz } = await supabase
      .from('execucoes_agentes')
      .insert({
        area: 'vendas',
        item_tipo: 'pedido',
        item_id: context.cod_pedido,
        agente: 'orquestrador',
        status: 'rodando',
        entrada: { pedido },
        inicio: new Date().toISOString(),
      })
      .select()
      .single()

    if (erroRaiz) {
      throw new Error(`Erro ao criar execução raiz: ${erroRaiz.message}`)
    }

    const chamado_por = execucaoRaiz.id

    // 3. Atualizar pedido para 'processando'
    await supabase
      .from('pedidos_orcamento')
      .update({ status: 'processando' })
      .eq('cod_pedido', context.cod_pedido)

    // 4. TRIADOR
    const triadorEntrada = {
      mensagem: pedido.mensagem,
      canal: pedido.canal,
      cliente: {
        cod_cliente: pedido.cod_cliente,
        nome: pedido.clientes.nome,
        segmento: pedido.clientes.segmento,
      },
    }

    const { saida: triagem, execucao_id: triadorId } = await agente(
      'triador',
      triadorEntrada,
      {
        area: 'vendas',
        item_tipo: 'pedido',
        item_id: context.cod_pedido,
        chamado_por,
      }
    )

    // Se não for orçamento nem complemento, criar aprovação e encerrar
    if (!['orcamento', 'complemento'].includes(triagem.tipo)) {
      await supabase.from('aprovacoes').insert({
        area: 'vendas',
        item_tipo: 'pedido',
        item_id: context.cod_pedido,
        titulo: `Não é orçamento: ${triagem.tipo}`,
        proposta: triagem,
        status: 'pendente',
      })

      await supabase
        .from('pedidos_orcamento')
        .update({ status: 'aguardando_aprovacao' })
        .eq('cod_pedido', context.cod_pedido)

      await supabase
        .from('execucoes_agentes')
        .update({
          status: 'ok',
          saida: { encerrado: true, motivo: triagem.tipo },
          fim: new Date().toISOString(),
        })
        .eq('id', chamado_por)

      return
    }

    // 5. PESQUISADOR
    const { saida: contexto } = await agente(
      'pesquisador',
      {
        itens_pedidos: triagem.itens,
        cliente: pedido.clientes,
      },
      {
        area: 'vendas',
        item_tipo: 'pedido',
        item_id: context.cod_pedido,
        chamado_por,
      }
    )

    // 6. REDATOR (primeira vez)
    let redatorEntrada = {
      triagem,
      contexto,
      cliente: pedido.clientes,
    }

    let { saida: redacao } = await agente('redator', redatorEntrada, {
      area: 'vendas',
      item_tipo: 'pedido',
      item_id: context.cod_pedido,
      chamado_por,
    })

    // 7. REVISOR (primeira vez)
    let { saida: revisao } = await agente(
      'revisor',
      {
        resposta: redacao.resposta,
        contexto,
        regras: contexto.regras || {},
      },
      {
        area: 'vendas',
        item_tipo: 'pedido',
        item_id: context.cod_pedido,
        chamado_por,
      }
    )

    // Se não foi aprovado, tentar de novo (máximo 2 voltas)
    let voltasRevisor = 1
    while (!revisao.aprovado && voltasRevisor < 2) {
      voltasRevisor++

      // Redator com ajustes
      const { saida: redacaoAjustada } = await agente(
        'redator',
        {
          ...redatorEntrada,
          ajustes: revisao.motivos,
        },
        {
          area: 'vendas',
          item_tipo: 'pedido',
          item_id: context.cod_pedido,
          chamado_por,
        }
      )

      redacao = redacaoAjustada

      // Revisor novamente
      const { saida: revisaoAjustada } = await agente(
        'revisor',
        {
          resposta: redacao.resposta,
          contexto,
          regras: contexto.regras || {},
        },
        {
          area: 'vendas',
          item_tipo: 'pedido',
          item_id: context.cod_pedido,
          chamado_por,
        }
      )

      revisao = revisaoAjustada
    }

    // 8. Criar item em aprovacoes
    await supabase.from('aprovacoes').insert({
      area: 'vendas',
      item_tipo: 'pedido',
      item_id: context.cod_pedido,
      titulo: `${pedido.clientes.nome} · ${redacao.resumo || 'Orçamento'}`,
      proposta: {
        resposta: redacao.resposta,
        triagem,
        contexto,
        revisao,
      },
      status: 'pendente',
    })

    // 9. Pedido para aguardando_aprovacao
    await supabase
      .from('pedidos_orcamento')
      .update({ status: 'aguardando_aprovacao' })
      .eq('cod_pedido', context.cod_pedido)

    // 10. Fechar execução raiz
    await supabase
      .from('execucoes_agentes')
      .update({
        status: 'ok',
        saida: { sucesso: true },
        fim: new Date().toISOString(),
      })
      .eq('id', chamado_por)
  } catch (erro: any) {
    console.error('Erro no orquestrador:', erro)

    // Atualizar pedido para 'rejeitado' em caso de erro
    await supabase
      .from('pedidos_orcamento')
      .update({ status: 'rejeitado' })
      .eq('cod_pedido', context.cod_pedido)

    throw erro
  }
}
