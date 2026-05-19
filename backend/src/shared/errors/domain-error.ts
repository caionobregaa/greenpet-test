export abstract class DomainError extends Error {
  abstract readonly statusCode: number

  constructor(
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}
