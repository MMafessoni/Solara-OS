import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    // Teste 1: Buscar pedidos sem join
    const { data: pedidosSimplo, error: erroSimplo } = await supabase
      .from('pedidos_orcamento')
      .select('*')

    // Teste 2: Buscar com join
    const { data: pedidosComJoin, error: erroJoin } = await supabase
      .from('pedidos_orcamento')
      .select(
        `
        id,
        cod_pedido,
        data,
        canal,
        mensagem,
        status,
        cod_cliente,
        clientes:cod_cliente(nome)
      `
      )

    // Teste 3: Buscar clientes
    const { data: clientes, error: erroClientes } = await supabase
      .from('clientes')
      .select('cod_cliente, nome')
      .limit(3)

    return NextResponse.json({
      pedidos_simples: {
        count: pedidosSimplo?.length || 0,
        erro: erroSimplo?.message,
        exemplo: pedidosSimplo?.[0],
      },
      pedidos_com_join: {
        count: pedidosComJoin?.length || 0,
        erro: erroJoin?.message,
        exemplo: pedidosComJoin?.[0],
      },
      clientes: {
        count: clientes?.length || 0,
        erro: erroClientes?.message,
        exemplos: clientes,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { erro: error.message },
      { status: 500 }
    )
  }
}
