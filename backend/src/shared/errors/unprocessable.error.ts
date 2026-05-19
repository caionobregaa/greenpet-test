import { DomainError } from './domain-error.js'

export class UnprocessableError extends DomainError {
  readonly statusCode = 422
}
