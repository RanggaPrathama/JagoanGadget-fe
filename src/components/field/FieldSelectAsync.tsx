import { useQuery, type QueryKey } from "@tanstack/react-query"

import { FieldSelect, type FieldSelectProps } from "./FieldSelect"
import type { FieldOption } from "./types"

export type FieldSelectAsyncProps<T> = Omit<FieldSelectProps, "loading" | "options"> & {
  queryKey: QueryKey
  queryFn: () => Promise<T[]>
  mapOption: (item: T) => FieldOption
  queryErrorMessage?: string
}

function FieldSelectAsync<T>({
  mapOption,
  queryErrorMessage = "Failed to load options.",
  queryFn,
  queryKey,
  searchable = true,
  error,
  ...props
}: FieldSelectAsyncProps<T>) {
  const { data, isError, isLoading } = useQuery({
    queryKey,
    queryFn,
  })

  const options = (data ?? []).map(mapOption)
  const resolvedError = error ?? (isError ? queryErrorMessage : undefined)

  return (
    <FieldSelect
      {...props}
      error={resolvedError}
      loading={isLoading}
      options={options}
      searchable={searchable}
    />
  )
}

export { FieldSelectAsync }
