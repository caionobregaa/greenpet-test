import { DomainError } from './domain-error.js'

export class NotFoundError extends DomainError {
  readonly statusCode = 404
}
