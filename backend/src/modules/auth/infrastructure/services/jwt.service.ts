import { createHmac } from 'node:crypto'
import type { IJwtService } from '../../application/use-cases/login.use-case.js'

export class JwtService implements IJwtService {
  constructor(private readonly secret: string) {}

  sign(payload: Record<string, unknown>, expiresIn: number): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const now = Math.floor(Date.now() / 1000)
    const body = Buffer.from(
      JSON.stringify({ ...payload, iat: now, exp: now + expiresIn }),
    ).toString('base64url')

    const sig = createHmac('sha256', this.secret)
      .update(`${header}.${body}`)
      .digest('base64url')

    return `${header}.${body}.${sig}`
  }
}
