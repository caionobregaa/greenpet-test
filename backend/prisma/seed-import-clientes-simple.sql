-- Importacao de clientes e animais -- GreenPET
-- Cole TUDO de uma vez no Postgres Client do EasyPanel

-- CLIENTES
INSERT INTO clientes (id, nome, telefone, endereco, bairro, cidade, "createdAt", "updatedAt") VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Yolanda Mucceda', '(92) 98643-8407', 'Rua Sebatiao de Melo, n17', 'Ponta Negra', 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000002', 'Eliane', '(92) 98131-1067', 'Rua Alvaro Braga, n5', 'Parque Dez', 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000003', 'Madalena', '(92) 98182-9453', 'Rua dos Banibas, 241, Cond. Maron, ap210 bl C', 'Parque Dez', 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000004', 'Caio Fernandes', '(92) 98110-2199', 'Rua Vasco Vasques', 'Parque Dez', 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000005', 'Rafael Nobrega', '(92) 98408-0216', NULL, 'Parque Dez', 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000006', 'Anatacha', '(92) 98408-4766', 'Rua Padre Augostinho, Caballero Martins, casa 8', 'Santo Agostinho', 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000007', 'Leandra Germana', '(92) 99319-3022', 'Cond. Smile Bloco 4A AP 3', 'Parque Dez', 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000008', 'Lea Alves', '(92) 98456-1111', NULL, 'Ponta Negra', 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000009', 'Brenda', '(92) 90000-0000', NULL, 'Parque Dez', 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000010', 'Paulo Amorim', '(92) 99521-4051', NULL, NULL, 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000011', 'Luiz', '(92) 99186-6665', NULL, NULL, 'Manaus', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000012', 'Domicio', '+351 913 462 026', 'Cond. Ponta Negra II, Rua Texas, 27', 'Ponta Negra', 'Manaus', NOW(), NOW());

-- ANIMAIS
INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Nala', 'a1000000-0000-0000-0000-000000000001', 'Cao', 'Golden', 'Indefinido', 0, 'Porte: Grande', NOW(), NOW()),
  (gen_random_uuid(), 'Frederico', 'a1000000-0000-0000-0000-000000000001', 'Cao', 'Golden', 'Indefinido', 0, 'Porte: Grande', NOW(), NOW()),
  (gen_random_uuid(), 'Lua', 'a1000000-0000-0000-0000-000000000001', 'Cao', 'Spitz', 'Indefinido', 0, 'Porte: Mini', NOW(), NOW()),
  (gen_random_uuid(), 'Malevola e Pits', 'a1000000-0000-0000-0000-000000000001', 'Cao', 'Cane Corso e Pitbull', 'Indefinido', 0, 'Porte: Gigante', NOW(), NOW()),
  (gen_random_uuid(), 'Olaf', 'a1000000-0000-0000-0000-000000000002', 'Cao', 'Spitz', 'Indefinido', 0, 'Porte: Mini', NOW(), NOW()),
  (gen_random_uuid(), 'Jimmy', 'a1000000-0000-0000-0000-000000000004', 'Cao', 'SRD', 'Indefinido', 0, 'Porte: Grande', NOW(), NOW()),
  (gen_random_uuid(), 'Fofinha', 'a1000000-0000-0000-0000-000000000003', 'Cao', 'SRD', 'Indefinido', 0, 'Porte: Grande', NOW(), NOW()),
  (gen_random_uuid(), 'Harmony', 'a1000000-0000-0000-0000-000000000003', 'Cao', 'SRD', 'Indefinido', 0, 'Porte: Medio', NOW(), NOW()),
  (gen_random_uuid(), 'Lili', 'a1000000-0000-0000-0000-000000000005', 'Cao', 'Dachshund', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW()),
  (gen_random_uuid(), 'Kyro', 'a1000000-0000-0000-0000-000000000005', 'Gato', 'Menicon', 'Indefinido', 0, 'Porte: Medio', NOW(), NOW()),
  (gen_random_uuid(), 'Pandora', 'a1000000-0000-0000-0000-000000000006', 'Cao', 'Shih Tzu', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW()),
  (gen_random_uuid(), 'Zoe', 'a1000000-0000-0000-0000-000000000006', 'Cao', 'Spitz', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW()),
  (gen_random_uuid(), 'Chihuahaha', 'a1000000-0000-0000-0000-000000000007', 'Cao', 'Chihuahua', 'Indefinido', 0, 'Porte: Mini', NOW(), NOW()),
  (gen_random_uuid(), 'Nick Cordeiro', 'a1000000-0000-0000-0000-000000000008', 'Cao', 'Lhasa Apso', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW()),
  (gen_random_uuid(), 'Mike Cordeiro', 'a1000000-0000-0000-0000-000000000008', 'Cao', 'Spitz', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW()),
  (gen_random_uuid(), 'Cao da Brenda', 'a1000000-0000-0000-0000-000000000009', 'Cao', 'SRD', 'Indefinido', 0, 'Porte: Medio', NOW(), NOW()),
  (gen_random_uuid(), 'Pitbull', 'a1000000-0000-0000-0000-000000000010', 'Cao', 'Pitbull', 'Indefinido', 0, 'Porte: Medio', NOW(), NOW()),
  (gen_random_uuid(), 'Animal do Luiz', 'a1000000-0000-0000-0000-000000000011', 'Cao', 'SRD', 'Indefinido', 0, 'Porte: Medio', NOW(), NOW()),
  (gen_random_uuid(), 'Carl Johnson', 'a1000000-0000-0000-0000-000000000012', 'Cao', 'SRD', 'Indefinido', 0, 'Porte: Medio', NOW(), NOW()),
  (gen_random_uuid(), 'Luca', 'a1000000-0000-0000-0000-000000000012', 'Cao', 'SRD', 'Indefinido', 0, 'Porte: Medio', NOW(), NOW());
