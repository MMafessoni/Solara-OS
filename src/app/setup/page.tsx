'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [copied, setCopied] = useState(false)
  const [sql, setSql] = useState('')

  const loadSql = async () => {
    try {
      const response = await fetch('/api/setup/sql')
      const data = await response.json()
      if (data.sql) {
        setSql(data.sql)
      } else {
        // Carregar do arquivo
        const sqlContent = await fetch('/setup-sql.txt').then((r) => r.text())
        setSql(sqlContent)
      }
    } catch (error) {
      console.error('Erro ao carregar SQL:', error)
    }
  }

  const handleCopy = async () => {
    try {
      const response = await fetch('/supabase/tabelas_casca_motor.sql')
      const content = await response.text()
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Setup Casca e Motor</h1>
          <p className="text-sm text-gray-600 mt-1">Execute o SQL no Supabase</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Passo a passo</h2>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
                <span>Acesse <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">app.supabase.com</a></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
                <span>Selecione seu projeto</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
                <span>Vá para <strong>SQL Editor</strong> → <strong>New Query</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
                <span>Cole o SQL abaixo (clique em "Copiar")</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">5.</span>
                <span>Clique em <strong>Run</strong></span>
              </li>
            </ol>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">SQL:</label>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? '✓ Copiado' : 'Copiar SQL'}
              </button>
            </div>
            <textarea
              readOnly
              value={`-- Tabela execucoes_agentes (Motor - seção 3.1)
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

create index idx_execucoes_item_id on execucoes_agentes(item_id);
create index idx_execucoes_area_item_tipo on execucoes_agentes(area, item_tipo);
create index idx_execucoes_status on execucoes_agentes(status);

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

create index idx_aprovacoes_area_status on aprovacoes(area, status);
create index idx_aprovacoes_item_id on aprovacoes(item_id);
create index idx_aprovacoes_status on aprovacoes(status);

alter publication supabase_realtime add table aprovacoes;

alter table execucoes_agentes enable row level security;

create policy "Usuários podem ler execuções de sua área"
on execucoes_agentes for select
using (
  exists (
    select 1 from perfis
    where id = auth.uid() and area = ANY(areas)
  )
);

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
);`}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              ℹ️ <strong>Importante:</strong> Após colar e executar o SQL no Supabase, as tabelas
              estará criadas e você poderá usar a aplicação normalmente. Realtime será ativado
              automaticamente.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
