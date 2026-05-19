export abstract class Entity<T> {
  protected readonly _id: string
  protected props: T
  public readonly createdAt: Date
  public updatedAt: Date

  constructor(props: T, id?: string) {
    this._id = id ?? crypto.randomUUID()
    this.props = props
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  get id(): string {
    return this._id
  }

  equals(other: Entity<T>): boolean {
    if (other === null || other === undefined) return false
    if (other === this) return true
    if (!(other instanceof Entity)) return false
    return this._id === other._id
  }
}
