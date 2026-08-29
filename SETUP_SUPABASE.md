# Setup Supabase — Fundação

## 1. Variáveis de ambiente

Preencha `.env.local` com suas credenciais do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
ANTHROPIC_API_KEY=sua_api_key
```

## 2. Criar tabela `perfis` no Supabase

1. Abra o painel do Supabase (https://app.supabase.com)
2. Vá para seu projeto
3. Abra **SQL Editor** (sidebar esquerda)
4. Clique em **New Query**
5. Cole o conteúdo de `supabase/schema.sql`
6. Clique em **Run**

## 3. Criar primeiro usuário (Admin)

1. Vá para **Authentication** → **Users**
2. Clique em **Add user**
3. Digite:
   - Email: seu email
   - Password: sua senha (temporária, pode mudar depois)
4. Clique em **Save user**

A tabela `perfis` será automaticamente preenchida com o primeiro usuário como `admin` com acesso a `{vendas,financeiro}`.

## 4. Testar a autenticação

```bash
npm run dev
```

Visite http://localhost:3000 — será redirecionado para `/login`. Faça login com seu email e senha.
