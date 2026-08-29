# Solara OS

Sistema de agentes de IA para automação de processos de Vendas e Financeiro da Solara Distribuidora. Construído com Next.js, Supabase e API Anthropic.

## Visão Geral

O Solara OS automatiza tarefas repetitivas em duas áreas:
- **Vendas**: Processamento de pedidos de orçamento com triagem, pesquisa, redação e revisão automática
- **Financeiro**: Conciliação de extratos bancários com investigação de divergências

A máquina prepara, a pessoa decide. Todo agente deixa um rastro completo de execução.

## Stack

- **Frontend**: Next.js 15+ (App Router) + TypeScript
- **Backend**: Node.js com Supabase (Auth, Postgres, Realtime)
- **IA**: API Anthropic (claude-sonnet-4-6)
- **Infraestrutura**: Vercel (deploy)

## Requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase
- Chave de API Anthropic

## Instalação

1. Clone o repositório:
```bash
git clone <seu-repo>
cd solara-os
npm install
```

2. Configure o `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
ANTHROPIC_API_KEY=sua_api_key
```

3. Configure o Supabase:
- Abra [app.supabase.com](https://app.supabase.com)
- Vá para **SQL Editor** → **New Query**
- Cole o conteúdo de `supabase/schema.sql`
- Clique **Run**

4. Crie o primeiro usuário (admin):
- Vá para **Authentication** → **Users** → **Add user**
- Configure email e senha temporária
- O user será criado na tabela `perfis` com papel `admin`

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

Será redirecionado para `/login`. Faça login com suas credenciais.

## Documentação

- **[PRD.md](PRD.md)** — O que a Solara quer (problema, solução, métricas)
- **[SPEC.md](SPEC.md)** — Especificação técnica (áreas, tabelas, fluxos, agentes)
- **[CLAUDE.md](CLAUDE.md)** — Regras de construção (stack, padrões, convenções)
- **[SETUP_SUPABASE.md](SETUP_SUPABASE.md)** — Guia de configuração do Supabase

## Estrutura do Projeto

```
solara-os/
├── src/
│   ├── app/                    # Páginas (Next.js App Router)
│   │   ├── (auth)/             # Rotas de autenticação
│   │   ├── vendas/             # Área de Vendas
│   │   └── financeiro/         # Área de Financeiro
│   ├── lib/
│   │   ├── agente.ts           # Motor de agentes
│   │   ├── orquestradores/     # Orquestração por área
│   │   └── supabase/           # Clientes Supabase
│   └── components/             # Componentes React
├── prompts/                    # System prompts dos agentes
│   ├── vendas/
│   └── financeiro/
├── supabase/                   # Migrações e schema
└── public/                     # Arquivos estáticos
```

## Deploy

Fazer deploy na Vercel é automático ao fazer push para `main`.

```bash
git push origin main
```

Configure as variáveis de ambiente na dashboard da Vercel antes do primeiro deploy.

## Licença

Propriedade da Solara Distribuidora.
