import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    // Tentar buscar pedidos
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos_orcamento')
      .select('*')
      .limit(1)

    // Tentar buscar clientes
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .limit(1)

    return NextResponse.json({
      pedidos_orcamento: {
        existe: !pedidosError,
        erro: pedidosError?.message,
        count: pedidos?.length || 0,
      },
      clientes: {
        existe: !clientesError,
        erro: clientesError?.message,
        count: clientes?.length || 0,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { erro: error.message },
      { status: 500 }
    )
  }
}
