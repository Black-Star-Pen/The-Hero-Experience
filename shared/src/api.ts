/** Body of every error response of the API. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** For validation errors: problems grouped by field (Zod flattened error). */
    details?: unknown;
  };
}

/** A page of results. `page` starts at 1. */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
