# Setup Casca e Motor

Antes de rodar a aplicação com as seções 2 e 3, execute este SQL no Supabase.

## 1. Criar tabelas no Supabase

1. Abra o painel do Supabase (https://app.supabase.com)
2. Vá para seu projeto
3. Abra **SQL Editor** → **New Query**
4. Cole o conteúdo de `supabase/tabelas_casca_motor.sql`
5. Clique em **Run**

As tabelas criadas:
- `execucoes_agentes` — registro de todas as execuções de agentes (com Realtime)
- `aprovacoes` — fila de aprovação de propostas

## 2. Iniciar o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e teste:
- Página inicial com menu de áreas
- `/admin` para gerenciar usuários (só para admin)
- Realtime no Organograma quando agentes rodarem
