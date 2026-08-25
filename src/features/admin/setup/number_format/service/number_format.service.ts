import { api } from "@/lib/axios";
import {
  unwrapPaginated,
  type PaginatedResponse,
  type UnwrappedPaginated,
} from "@/lib/api-response";
import type { NumberFormatItem, NumberFormatListParams } from "../types";

/**
 * `GET admin/number-formats` — fetch the paginated number-format list.
 *
 * @param params - optional search term + pagination controls.
 * @returns unwrapped items with pagination meta.
 * @remarks Response envelope is ASSUMED to match other admin modules
 * (`PaginatedResponse<T>`); `unwrapPaginated` also tolerates array-shaped
 * bodies. Read-only module: no create/update/delete functions by design.
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
