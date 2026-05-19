export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
