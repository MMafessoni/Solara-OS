import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    return NextResponse.json({ error: 'Apenas admins podem criar usuários' }, { status: 403 })
  }

  const { email, password, nome, papel, areas } = await request.json()

  if (!email || !password || !nome) {
    return NextResponse.json({ error: 'Campos obrigatórios: email, password, nome' }, { status: 400 })
  }

  try {
    // Criar usuário no Auth usando service role
    const adminAuthClient = createClient()
    const { data, error } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 400 })
    }

    // Inserir na tabela perfis
    const { error: perfisError } = await adminAuthClient
      .from('perfis')
      .insert({
        id: data.user.id,
        email,
        nome,
        papel,
        areas: areas || [],
      })

    if (perfisError) {
      // Se falhar, deletar o usuário criado
      await adminAuthClient.auth.admin.deleteUser(data.user.id)
      return NextResponse.json({ error: perfisError.message }, { status: 400 })
    }

    return NextResponse.json({
      id: data.user.id,
      email,
      nome,
      papel,
      areas,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
