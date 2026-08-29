-- Apenas os dados de exemplo para pedidos_orcamento
-- Execute isto se a tabela já foi criada

insert into pedidos_orcamento (cod_pedido, data, cod_cliente, canal, mensagem, status)
values
  ('PED001', '2026-08-24', 'C001', 'e-mail', 'Bom dia, preciso de 200 parafusos sextavados 3/8 e umas 50 arruelas, se tiver. É pra semana que vem, tem como? E qual o preço pra esse volume?', 'novo'),
  ('PED002', '2026-08-24', 'C003', 'e-mail', 'Favor cotar 500 porcas sextavadas 3/8 e 500 arruelas lisas 3/8. Entrega em BH, prazo normal.', 'novo'),
  ('PED003', '2026-08-24', 'C006', 'whatsapp', 'Tem retentor 40x62x10? Preciso de 10. Manda o preço.', 'novo'),
  ('PED004', '2026-08-24', 'C009', 'whatsapp', 'Boa tarde. 30 luvas de raspa e 30 óculos pra equipe nova. Pode faturar no prazo de sempre?', 'novo'),
  ('PED005', '2026-08-25', 'C002', 'telefone', 'Oi, tudo bem? Vocês vendem porca de bronze? Se tiverem, me passa o valor da porca 1/4.', 'novo'),
  ('PED006', '2026-08-25', 'C005', 'e-mail', 'Cotar 100 chaves Phillips PH2 e 100 chaves Phillips PH3. Preço unitário e total.', 'novo');
