export { createPrefix, updatePrefix } from "./prefix.service";
export {
  prefixListQueryKey,
  getPrefixesListQueryKey,
  getPrefixesListQueryOptions,
  useGetPrefixesListQuery,
  getPrefixByIdQueryOptions,
  useGetPrefixByIdQuery,
  invalidatePrefixQueries,
} from "./prefix.queries";
export { useDeletePrefix } from "./prefix.mutations";
