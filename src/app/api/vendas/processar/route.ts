import { NextRequest, NextResponse } from 'next/server'
import { orquestradorVendas } from '@/lib/orquestradores/vendas'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { cod_pedido } = await request.json()

    if (!cod_pedido) {
      return NextResponse.json(
        { error: 'cod_pedido é obrigatório' },
        { status: 400 }
      )
    }

    await orquestradorVendas({
      cod_pedido,
      area: 'vendas',
    })

    return NextResponse.json({
      success: true,
      message: 'Pedido processado com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao processar pedido:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pedido' },
      { status: 500 }
    )
  }
}
