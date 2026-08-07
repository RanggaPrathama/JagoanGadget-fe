import { useEffect, useState } from "react";

/**
 * Debounce a value by the specified delay.
 *
 * Returns the latest `value` only after `delay` ms of inactivity.
 * Useful for search inputs, filter fields, or any rapidly-changing
 * value that triggers an expensive operation (API call, heavy filter).
 *
 * @example
 * ```ts
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 400);
 *
 * useEffect(() => {
 *   if (!debouncedSearch) return;
 *   api.search(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
