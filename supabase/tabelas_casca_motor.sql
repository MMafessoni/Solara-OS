-- Tabela execucoes_agentes (Motor - seção 3.1)
create table if not exists execucoes_agentes (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  item_tipo text not null,
  item_id text not null,
  agente text not null,
  chamado_por uuid references execucoes_agentes(id) on delete set null,
  status text not null default 'rodando',
  entrada jsonb,
  saida jsonb,
  erro text,
  tokens_entrada int,
  tokens_saida int,
  inicio timestamptz not null default now(),
  fim timestamptz,
  criado_em timestamptz not null default now()
);

-- Índices para performance
create index idx_execucoes_item_id on execucoes_agentes(item_id);
create index idx_execucoes_area_item_tipo on execucoes_agentes(area, item_tipo);
create index idx_execucoes_status on execucoes_agentes(status);

-- Habilitar Realtime na tabela execucoes_agentes
alter publication supabase_realtime add table execucoes_agentes;

-- Tabela aprovacoes (Motor - seção 3.4)
create table if not exists aprovacoes (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  item_tipo text not null,
  item_id text not null,
  titulo text not null,
  proposta jsonb not null,
  status text not null default 'pendente',
  decidido_por uuid references perfis(id) on delete set null,
  decidido_em timestamptz,
  observacao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Índices para performance
create index idx_aprovacoes_area_status on aprovacoes(area, status);
create index idx_aprovacoes_item_id on aprovacoes(item_id);
create index idx_aprovacoes_status on aprovacoes(status);

-- Habilitar Realtime na tabela aprovacoes
alter publication supabase_realtime add table aprovacoes;

-- RLS para execucoes_agentes
alter table execucoes_agentes enable row level security;

create policy "Usuários podem ler execuções de sua área"
on execucoes_agentes for select
using (
  exists (
    select 1 from perfis
    where id = auth.uid() and area = ANY(areas)
  )
);

-- RLS para aprovacoes
alter table aprovacoes enable row level security;

create policy "Usuários podem ler aprovações de sua área"
on aprovacoes for select
using (
  exists (
    select 1 from perfis
    where id = auth.uid() and area = ANY(areas)
  )
);

create policy "Usuários podem atualizar aprovações de sua área"
on aprovacoes for update
using (
  exists (
    select 1 from perfis
    where id = auth.uid() and area = ANY(areas)
  )
);
