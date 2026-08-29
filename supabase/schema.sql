-- Tabela de perfis de usuários
create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome text,
  papel text default 'operador',
  areas text[] default '{}',
  criado_em timestamptz default now()
);

-- Inserir o primeiro usuário (admin) a partir dos usuários já criados no Auth
insert into perfis (id, email, nome, papel, areas)
select id, email, 'Iago', 'admin', '{vendas,financeiro}' from auth.users
on conflict (id) do nothing;

-- Habilitar RLS
alter table perfis enable row level security;

-- Política: usuários podem ler seu próprio perfil
create policy "Usuários podem ler seu próprio perfil"
on perfis for select
using (auth.uid() = id);

-- Política: admins podem ler todos os perfis
create policy "Admins podem ler todos os perfis"
on perfis for select
using (
  exists (
    select 1 from perfis
    where id = auth.uid() and papel = 'admin'
  )
);
