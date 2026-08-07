/**
 * Standard paginated API response from backend.
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
};

/**
 * Standard success response with single item.
 */
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type UnwrappedPaginated<T> = {
  items: T[];
  pagination: PaginationMeta;
};

/**
 * Unwrap a paginated response.
 * Accepts full `PaginatedResponse<T>` or plain `T[]`.
 */
export function unwrapPaginated<T>(
  body: PaginatedResponse<T> | T[] | { data: T[] } | unknown,
  fallback: T[] = [],
): UnwrappedPaginated<T> {
  if (!body || typeof body !== "object") {
    return {
      items: fallback,
      pagination: { page: 1, limit: 0, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    };
  }

  const b = body as Record<string, unknown>;

  // Paginated format: PaginatedResponse<T>
  if (b.pagination && typeof b.pagination === "object") {
    const pag = b.pagination as PaginationMeta;
    return {
      items: (b.data as T[]) ?? fallback,
      pagination: pag,
    };
  }

  // Envelope format: { data: T[] }
  if ("data" in b && Array.isArray(b.data)) {
    const arr = b.data as T[];
    return {
      items: arr,
      pagination: { page: 1, limit: arr.length, totalItems: arr.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
  }

  // Direct array
  if (Array.isArray(body)) {
    const arr = body as T[];
    return {
      items: arr,
      pagination: { page: 1, limit: arr.length, totalItems: arr.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
  }

  return {
    items: fallback,
    pagination: { page: 1, limit: 0, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
  };
}

/**
 * Unwrap a single-item response — handles `ApiResponse<T>` envelope.
 */
export function unwrapData<T>(
  body: ApiResponse<T> | T | unknown,
  fallback?: T,
): T | undefined {
  if (!body || typeof body !== "object") return fallback;

  const b = body as Record<string, unknown>;

  // ApiResponse<T>: { success, data: T }
  if ("data" in b) {
    return b.data as T;
  }

  // Already a direct value
  return body as T;
}
