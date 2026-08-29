-- Tabela pedidos_orcamento (Seção 4.1)
create table if not exists pedidos_orcamento (
  id uuid primary key default gen_random_uuid(),
  cod_pedido text unique not null,
  data date not null,
  cod_cliente text not null references clientes(cod_cliente) on delete restrict,
  canal text not null,
  mensagem text not null,
  status text not null default 'novo',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Índices
create index idx_pedidos_status on pedidos_orcamento(status);
create index idx_pedidos_cod_cliente on pedidos_orcamento(cod_cliente);
create index idx_pedidos_data on pedidos_orcamento(data);

-- Realtime
alter publication supabase_realtime add table pedidos_orcamento;

-- RLS
alter table pedidos_orcamento enable row level security;

create policy "Usuários com área vendas podem ler pedidos"
on pedidos_orcamento for select
using (
  exists (
    select 1 from perfis
    where id = auth.uid() and 'vendas' = ANY(areas)
  )
);

create policy "Usuários com área vendas podem atualizar pedidos"
on pedidos_orcamento for update
using (
  exists (
    select 1 from perfis
    where id = auth.uid() and 'vendas' = ANY(areas)
  )
);

-- Importar dados de exemplo
insert into pedidos_orcamento (cod_pedido, data, cod_cliente, canal, mensagem, status)
values
  ('PED001', '2026-08-24', 'C001', 'e-mail', 'Bom dia, preciso de 200 parafusos sextavados 3/8 e umas 50 arruelas, se tiver. É pra semana que vem, tem como? E qual o preço pra esse volume?', 'novo'),
  ('PED002', '2026-08-24', 'C003', 'e-mail', 'Favor cotar 500 porcas sextavadas 3/8 e 500 arruelas lisas 3/8. Entrega em BH, prazo normal.', 'novo'),
  ('PED003', '2026-08-24', 'C006', 'whatsapp', 'Tem retentor 40x62x10? Preciso de 10. Manda o preço.', 'novo'),
  ('PED004', '2026-08-24', 'C009', 'whatsapp', 'Boa tarde. 30 luvas de raspa e 30 óculos pra equipe nova. Pode faturar no prazo de sempre?', 'novo'),
  ('PED005', '2026-08-25', 'C002', 'telefone', 'Oi, tudo bem? Vocês vendem porca de bronze? Se tiverem, me passa o valor da porca 1/4.', 'novo'),
  ('PED006', '2026-08-25', 'C005', 'e-mail', 'Cotar 100 chaves Phillips PH2 e 100 chaves Phillips PH3. Preço unitário e total.', 'novo');
