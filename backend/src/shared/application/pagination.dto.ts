export interface PaginationInput {
  page: number
  limit: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}
