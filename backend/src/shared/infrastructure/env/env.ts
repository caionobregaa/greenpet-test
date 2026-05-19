import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  TEST_DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.coerce.number().default(28800),
  REFRESH_TOKEN_EXPIRES_IN: z.coerce.number().default(30),
  BCRYPT_ROUNDS: z.coerce.number().min(10).default(12),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  TZ: z.string().default('America/Manaus'),
})

export const env = envSchema.parse(process.env)
