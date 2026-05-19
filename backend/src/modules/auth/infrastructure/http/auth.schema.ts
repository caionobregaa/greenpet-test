import { z } from 'zod'

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const RefreshBodySchema = z.object({
  refreshToken: z.string().uuid(),
})

export type LoginBody = z.infer<typeof LoginBodySchema>
export type RefreshBody = z.infer<typeof RefreshBodySchema>
