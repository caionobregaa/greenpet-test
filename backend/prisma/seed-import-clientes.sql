-- Importação de clientes e animais — GreenPET
-- Rodar no console SQL do banco (EasyPanel → banco → Query)
-- Idempotente: só insere se não existir (checa nome + telefone)

DO $$
DECLARE
  yolanda_id   UUID;
  eliane_id    UUID;
  madalena_id  UUID;
  caio_id      UUID;
  rafael_id    UUID;
  anatacha_id  UUID;
  leandra_id   UUID;
  lea_id       UUID;
  brenda_id    UUID;
  paulo_id     UUID;
  luiz_id      UUID;
  domicio_id   UUID;
BEGIN

  -- ── CLIENTES ─────────────────────────────────────────────────────────────

  -- Yolanda Mucceda
  SELECT id INTO yolanda_id FROM clientes WHERE nome = 'Yolanda Mucceda' AND telefone = '(92) 98643-8407' AND "deletedAt" IS NULL LIMIT 1;
  IF yolanda_id IS NULL THEN
    yolanda_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, endereco, bairro, cidade, "createdAt", "updatedAt")
    VALUES (yolanda_id, 'Yolanda Mucceda', '(92) 98643-8407', 'Rua Sebatião de Melo, n17', 'Ponta Negra', 'Manaus', NOW(), NOW());
  END IF;

  -- Eliane
  SELECT id INTO eliane_id FROM clientes WHERE nome = 'Eliane' AND telefone = '(92) 98131-1067' AND "deletedAt" IS NULL LIMIT 1;
  IF eliane_id IS NULL THEN
    eliane_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, endereco, bairro, cidade, "createdAt", "updatedAt")
    VALUES (eliane_id, 'Eliane', '(92) 98131-1067', 'Rua Alvaro Braga, n5', 'Parque Dez', 'Manaus', NOW(), NOW());
  END IF;

  -- Madalena
  SELECT id INTO madalena_id FROM clientes WHERE nome = 'Madalena' AND telefone = '(92) 98182-9453' AND "deletedAt" IS NULL LIMIT 1;
  IF madalena_id IS NULL THEN
    madalena_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, endereco, bairro, cidade, "createdAt", "updatedAt")
    VALUES (madalena_id, 'Madalena', '(92) 98182-9453', 'Rua dos Banibas, 241, Cond. Maron, ap210 bl C', 'Parque Dez', 'Manaus', NOW(), NOW());
  END IF;

  -- Caio Fernandes
  SELECT id INTO caio_id FROM clientes WHERE nome = 'Caio Fernandes' AND telefone = '(92) 98110-2199' AND "deletedAt" IS NULL LIMIT 1;
  IF caio_id IS NULL THEN
    caio_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, endereco, bairro, cidade, "createdAt", "updatedAt")
    VALUES (caio_id, 'Caio Fernandes', '(92) 98110-2199', 'Rua Vasco Vasques', 'Parque Dez', 'Manaus', NOW(), NOW());
  END IF;

  -- Rafael Nóbrega
  SELECT id INTO rafael_id FROM clientes WHERE nome = 'Rafael Nóbrega' AND telefone = '(92) 98408-0216' AND "deletedAt" IS NULL LIMIT 1;
  IF rafael_id IS NULL THEN
    rafael_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, bairro, cidade, "createdAt", "updatedAt")
    VALUES (rafael_id, 'Rafael Nóbrega', '(92) 98408-0216', 'Parque Dez', 'Manaus', NOW(), NOW());
  END IF;

  -- Anatacha
  SELECT id INTO anatacha_id FROM clientes WHERE nome = 'Anatacha' AND telefone = '(92) 98408-4766' AND "deletedAt" IS NULL LIMIT 1;
  IF anatacha_id IS NULL THEN
    anatacha_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, endereco, bairro, cidade, "createdAt", "updatedAt")
    VALUES (anatacha_id, 'Anatacha', '(92) 98408-4766', 'Rua Padre Augostinho, Caballero Martins, casa 8', 'Santo Agostinho', 'Manaus', NOW(), NOW());
  END IF;

  -- Leandra Germana
  SELECT id INTO leandra_id FROM clientes WHERE nome = 'Leandra Germana' AND telefone = '(92) 99319-3022' AND "deletedAt" IS NULL LIMIT 1;
  IF leandra_id IS NULL THEN
    leandra_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, endereco, bairro, cidade, "createdAt", "updatedAt")
    VALUES (leandra_id, 'Leandra Germana', '(92) 99319-3022', 'Cond. Smile (Passeio do Mindu) Bloco 4A - AP 3', 'Parque Dez', 'Manaus', NOW(), NOW());
  END IF;

  -- Lea Alves
  SELECT id INTO lea_id FROM clientes WHERE nome = 'Lea Alves' AND telefone = '(92) 98456-1111' AND "deletedAt" IS NULL LIMIT 1;
  IF lea_id IS NULL THEN
    lea_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, bairro, cidade, "createdAt", "updatedAt")
    VALUES (lea_id, 'Lea Alves', '(92) 98456-1111', 'Ponta Negra', 'Manaus', NOW(), NOW());
  END IF;

  -- Brenda
  SELECT id INTO brenda_id FROM clientes WHERE nome = 'Brenda' AND "deletedAt" IS NULL LIMIT 1;
  IF brenda_id IS NULL THEN
    brenda_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, bairro, cidade, obs, "createdAt", "updatedAt")
    VALUES (brenda_id, 'Brenda', '(92) 9 0000-0000', 'Parque Dez', 'Manaus', 'Telefone incompleto na planilha original', NOW(), NOW());
  END IF;

  -- Paulo Amorim
  SELECT id INTO paulo_id FROM clientes WHERE nome = 'Paulo Amorim' AND telefone = '(92) 99521-4051' AND "deletedAt" IS NULL LIMIT 1;
  IF paulo_id IS NULL THEN
    paulo_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, cidade, "createdAt", "updatedAt")
    VALUES (paulo_id, 'Paulo Amorim', '(92) 99521-4051', 'Manaus', NOW(), NOW());
  END IF;

  -- Luiz
  SELECT id INTO luiz_id FROM clientes WHERE nome = 'Luiz' AND telefone = '(92) 99186-6665' AND "deletedAt" IS NULL LIMIT 1;
  IF luiz_id IS NULL THEN
    luiz_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, cidade, "createdAt", "updatedAt")
    VALUES (luiz_id, 'Luiz', '(92) 99186-6665', 'Manaus', NOW(), NOW());
  END IF;

  -- Domicio
  SELECT id INTO domicio_id FROM clientes WHERE nome = 'Domicio' AND "deletedAt" IS NULL LIMIT 1;
  IF domicio_id IS NULL THEN
    domicio_id := gen_random_uuid();
    INSERT INTO clientes (id, nome, telefone, endereco, bairro, cidade, "createdAt", "updatedAt")
    VALUES (domicio_id, 'Domicio', '+351 913 462 026', 'Cond. Ponta Negra II, Rua Texas, 27', 'Ponta Negra', 'Manaus', NOW(), NOW());
  END IF;

  -- ── ANIMAIS ──────────────────────────────────────────────────────────────

  -- Yolanda
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Nala' AND "clienteId" = yolanda_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Nala', yolanda_id, 'Cão', 'Golden', 'Indefinido', 0, 'Porte: Grande', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Frederico' AND "clienteId" = yolanda_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Frederico', yolanda_id, 'Cão', 'Golden', 'Indefinido', 0, 'Porte: Grande', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Lua' AND "clienteId" = yolanda_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Lua', yolanda_id, 'Cão', 'Spitz', 'Indefinido', 0, 'Porte: Mini', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Malevola e Pits' AND "clienteId" = yolanda_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Malevola e Pits', yolanda_id, 'Cão', 'Cane Corso e Pitbull', 'Indefinido', 0, 'Porte: Gigante', NOW(), NOW());
  END IF;

  -- Eliane
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Olaf' AND "clienteId" = eliane_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, nascimento, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Olaf', eliane_id, 'Cão', 'Spitz', 'Indefinido', '2026-01-01', 0, 'Porte: Mini', NOW(), NOW());
  END IF;

  -- Caio Fernandes
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Jimmy' AND "clienteId" = caio_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Jimmy', caio_id, 'Cão', 'SRD', 'Indefinido', 0, 'Porte: Grande', NOW(), NOW());
  END IF;

  -- Madalena
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Fofinha' AND "clienteId" = madalena_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Fofinha', madalena_id, 'Cão', 'SRD', 'Indefinido', 0, 'Porte: Grande', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Harmony' AND "clienteId" = madalena_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Harmony', madalena_id, 'Cão', 'SRD', 'Indefinido', 0, 'Porte: Médio', NOW(), NOW());
  END IF;

  -- Rafael Nóbrega
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Lili' AND "clienteId" = rafael_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Lili', rafael_id, 'Cão', 'Dachshund', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Kyro' AND "clienteId" = rafael_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Kyro', rafael_id, 'Gato', 'Mênicon', 'Indefinido', 0, 'Porte: Médio', NOW(), NOW());
  END IF;

  -- Anatacha
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Pandora' AND "clienteId" = anatacha_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Pandora', anatacha_id, 'Cão', 'Shih Tzu', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Zoe' AND "clienteId" = anatacha_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Zoe', anatacha_id, 'Cão', 'Spitz', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW());
  END IF;

  -- Leandra Germana
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Chihuahaha' AND "clienteId" = leandra_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Chihuahaha', leandra_id, 'Cão', 'Chihuahua', 'Indefinido', 0, 'Porte: Mini', NOW(), NOW());
  END IF;

  -- Lea Alves
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Nick Cordeiro' AND "clienteId" = lea_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Nick Cordeiro', lea_id, 'Cão', 'Lhasa Apso', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Mike Cordeiro' AND "clienteId" = lea_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Mike Cordeiro', lea_id, 'Cão', 'Spitz', 'Indefinido', 0, 'Porte: Pequeno', NOW(), NOW());
  END IF;

  -- Brenda
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Cão' AND "clienteId" = brenda_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, sexo, peso, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Cão', brenda_id, 'Cão', 'Indefinido', 0, NOW(), NOW());
  END IF;

  -- Paulo Amorim
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Pitbull' AND "clienteId" = paulo_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Pitbull', paulo_id, 'Cão', 'Pitbull', 'Indefinido', 0, 'Porte: Médio', NOW(), NOW());
  END IF;

  -- Luiz
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Não tem' AND "clienteId" = luiz_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, sexo, peso, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Não tem', luiz_id, 'Cão', 'Indefinido', 0, NOW(), NOW());
  END IF;

  -- Domicio
  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Carl Johnson' AND "clienteId" = domicio_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Carl Johnson', domicio_id, 'Cão', 'SRD', 'Indefinido', 0, 'Porte: Médio', NOW(), NOW());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM animais WHERE nome = 'Luca' AND "clienteId" = domicio_id AND "deletedAt" IS NULL) THEN
    INSERT INTO animais (id, nome, "clienteId", especie, raca, sexo, peso, obs, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Luca', domicio_id, 'Cão', 'SRD', 'Indefinido', 0, 'Porte: Médio', NOW(), NOW());
  END IF;

  RAISE NOTICE 'Importação concluída: 12 clientes e 20 animais processados.';
END $$;
