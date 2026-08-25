import { api } from "@/lib/axios";
import {
  unwrapData,
  unwrapPaginated,
  type ApiResponse,
  type PaginatedResponse,
  type UnwrappedPaginated,
} from "@/lib/api-response";
import type {
  NumberFormatItem,
  NumberFormatListParams,
  NumberFormatPayload,
} from "../types";

/**
 * `GET admin/number-formats` — fetch the paginated number-format list.
 *
 * @param params - optional search/status filter + pagination controls.
 * @returns unwrapped items with pagination meta.
 * @remarks Response envelope is ASSUMED to match other admin modules
 * (`PaginatedResponse<T>`); `unwrapPaginated` also tolerates array-shaped
 * bodies.
 */
export async function getNumberFormatsList(
  params?: NumberFormatListParams,
): Promise<UnwrappedPaginated<NumberFormatItem>> {
  const response = await api.get<PaginatedResponse<NumberFormatItem>>(
    "admin/number-formats",
    { params },
  );
  return unwrapPaginated<NumberFormatItem>(response.data);
}

/**
 * `GET admin/number-formats/:numberFormatId` — fetch a single number format.
 *
 * @param numberFormatId - target format UUID.
 * @returns the unwrapped item, or undefined when the body has no data.
 */
export async function getNumberFormatById(numberFormatId: string) {
  const response = await api.get<ApiResponse<NumberFormatItem>>(
    `admin/number-formats/${numberFormatId}`,
  );
  return unwrapData<NumberFormatItem>(response.data);
}

/**
 * `POST admin/number-formats` — create a new number format.
 *
 * @param payload - segments (1..20), optional menuId and isActive.
 * @returns the created item, unwrapped.
 */
export async function createNumberFormat(payload: NumberFormatPayload) {
  const response = await api.post<ApiResponse<NumberFormatItem>>(
    "admin/number-formats",
    payload,
  );
  return unwrapData<NumberFormatItem>(response.data);
}

/**
 * `PUT admin/number-formats/:numberFormatId` — update an existing format.
 *
 * @param numberFormatId - target format UUID.
 * @param payload - replacement segments/menuId/isActive.
 * @returns the updated item, unwrapped.
 */
export async function updateNumberFormat(
  numberFormatId: string,
  payload: NumberFormatPayload,
) {
  const response = await api.put<ApiResponse<NumberFormatItem>>(
    `admin/number-formats/${numberFormatId}`,
    payload,
  );
  return unwrapData<NumberFormatItem>(response.data);
}

/**
 * `DELETE admin/number-formats/:numberFormatId` — delete a format by ID.
 *
 * @param numberFormatId - target format UUID.
 * @returns backend acknowledgement payload.
 */
export async function deleteNumberFormat(numberFormatId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/number-formats/${numberFormatId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}

