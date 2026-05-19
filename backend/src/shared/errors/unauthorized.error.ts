import { DomainError } from './domain-error.js'

export class UnauthorizedError extends DomainError {
  readonly statusCode = 401
}
