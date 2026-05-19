import { DomainError } from './domain-error.js'

export class ValidationError extends DomainError {
  readonly statusCode = 400
}
