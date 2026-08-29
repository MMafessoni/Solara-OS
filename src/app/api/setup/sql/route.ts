import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verificar se é admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('papel')
    .eq('id', user.id)
    .single()

  if (perfil?.papel !== 'admin') {
    return NextResponse.json({ error: 'Apenas admins podem executar setup' }, { status: 403 })
  }

  try {
    // Ler arquivo SQL
    const sqlPath = path.join(process.cwd(), 'supabase', 'tabelas_casca_motor.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    // Dividir por statements (separados por ;)
    const statements = sqlContent
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'))

    const results = []

    // Executar cada statement
    for (const statement of statements) {
      try {
        // Usar query direto do supabase para rodar SQL
        const { data, error } = await supabase.rpc('_supabase_query', {
          query: statement,
        } as any)

        if (error && !error.message.includes('does not exist')) {
          console.error('SQL Error:', error)
        }

        results.push({
          statement: statement.substring(0, 50) + '...',
          success: !error || error.message.includes('does not exist'),
        })
      } catch (err: any) {
        console.error('Execute error:', err)
        // Continuar mesmo com erro, pois alguns statements podem falhar (ex: constraints duplicadas)
        results.push({
          statement: statement.substring(0, 50) + '...',
          success: false,
          error: err.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Setup concluído (verifique os resultados)',
      results,
    })
  } catch (err: any) {
    console.error('Setup error:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao executar setup' },
      { status: 500 }
    )
  }
}
