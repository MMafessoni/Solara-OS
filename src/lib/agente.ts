import Anthropic from '@anthropic-ai/sdk'
import { createClient } from './supabase/server'
import fs from 'fs'
import path from 'path'

interface AgenteContexto {
  area: string
  item_tipo: string
  item_id: string
  chamado_por?: string
}

interface AgenteResposta {
  saida: any
  execucao_id: string
}

export async function agente(
  papel: string,
  entrada: any,
  contexto: AgenteContexto
): Promise<AgenteResposta> {
  const supabase = await createClient()

  // 1. Criar execução com status 'rodando'
  const { data: execucao, error: erroInsert } = await supabase
    .from('execucoes_agentes')
    .insert({
      area: contexto.area,
      item_tipo: contexto.item_tipo,
      item_id: contexto.item_id,
      agente: papel,
      chamado_por: contexto.chamado_por || null,
      status: 'rodando',
      entrada: entrada,
      inicio: new Date().toISOString(),
    })
    .select()
    .single()

  if (erroInsert) {
    throw new Error(`Erro ao criar execução: ${erroInsert.message}`)
  }

  const execucao_id = execucao.id

  try {
    // 2. Ler prompt do arquivo
    const promptPath = path.join(
      process.cwd(),
      'prompts',
      contexto.area,
      `${papel}.md`
    )

    let systemPrompt = ''
    try {
      systemPrompt = fs.readFileSync(promptPath, 'utf-8')
    } catch (err) {
      throw new Error(`Prompt não encontrado: ${promptPath}`)
    }

    // 3. Chamar API Anthropic
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(entrada),
        },
      ],
    })

    // 4. Extrair texto e fazer parse JSON
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Resposta vazia da API')
    }

    let saida: any
    try {
      saida = JSON.parse(textContent.text)
    } catch (err) {
      throw new Error(`Resposta não é JSON válido: ${textContent.text}`)
    }

    // 5. Atualizar execução com status 'ok'
    const { error: erroUpdate } = await supabase
      .from('execucoes_agentes')
      .update({
        status: 'ok',
        saida: saida,
        tokens_entrada: response.usage.input_tokens,
        tokens_saida: response.usage.output_tokens,
        fim: new Date().toISOString(),
      })
      .eq('id', execucao_id)

    if (erroUpdate) {
      throw new Error(`Erro ao atualizar execução: ${erroUpdate.message}`)
    }

    return {
      saida,
      execucao_id,
    }
  } catch (erro: any) {
    // Marcar como erro
    const mensagemErro = erro.message || 'Erro desconhecido'

    await supabase
      .from('execucoes_agentes')
      .update({
        status: 'erro',
        erro: mensagemErro,
        fim: new Date().toISOString(),
      })
      .eq('id', execucao_id)

    throw erro
  }
}
