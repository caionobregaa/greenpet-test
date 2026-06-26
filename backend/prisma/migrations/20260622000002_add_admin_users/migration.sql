-- Insert Caio Nóbrega (ADMIN)
INSERT INTO "users" ("id", "nome", "email", "senhaHash", "papel", "loginAttempts", "lockedUntil", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Caio Nóbrega (ADMIN)',
  'caionobrega@greenpet.com',
  '$2a$12$HO8IiyXsAJ/jmtop2TnHruUMQYnR/vzj2rJthWu9wTJn1XrDY.Uwm',
  'admin',
  0,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

-- Insert Lucy Nóbrega (ADMIN)
INSERT INTO "users" ("id", "nome", "email", "senhaHash", "papel", "loginAttempts", "lockedUntil", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Lucy Nóbrega (ADMIN)',
  'lucynobrega@greenpet.com',
  '$2a$12$XSrHFmqLSY1wGwMtQmQ5o.vr0/IxT1r2BycpWDO996en5dv3FDiSa',
  'admin',
  0,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;
