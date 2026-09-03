import { useState } from "react";
import { useDebounce } from "./useDebounce";


export function useTableFilter<TFilters extends Record<string, unknown>>(
  initialFilters: TFilters,
  defaultLimit = 25,
) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const [limit, setLimit] = useState(defaultLimit);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Function to update a specific key in the filters and reset the page to 1
  const updateFilter = <K extends keyof TFilters>(
    key: K,
    value: TFilters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); 
  };

  return {
    search,
    setSearch,
    debouncedSearch,
    filters,
    page,
    limit,
    handleSearch,
    updateFilter, // <-- fungsi update filter
    setPage,
    setLimit,
  };
}
