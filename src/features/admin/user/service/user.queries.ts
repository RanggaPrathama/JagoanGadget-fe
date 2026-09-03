import {
  queryOptions,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getUsers, getUser, getStatisticsUser } from "./user.service";

// Base query key for all user queries (used for invalidation).
export const userListQueryKey = ["users"] as const;

export type UserListParams = {
  search?: string;
  page?: number;
  limit?: number;
};

// Build the full query key including current filter/page params.
export const getUserListQueryKey = (params?: UserListParams): unknown[] => [
  ...userListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.limit ?? 25,
];

// queryOptions for the user list (used by hooks and route prefetch).
export const getUserListQueryOptions = (params?: UserListParams) =>
  queryOptions({
    queryKey: getUserListQueryKey(params),
    queryFn: () => getUsers(params),
  });

// queryOptions for a single user (detail/edit screens).
export const getUserByIdQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: [...userListQueryKey, userId],
    queryFn: () => getUser(userId),
  });

export const getUserStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: [...userListQueryKey, "statistics"],
    queryFn: () => getStatisticsUser(),
  });

// Hook: paginated user list.
export const useGetUserListQuery = (
  params?: UserListParams,
  {
    queryConfig,
  }: { queryConfig?: QueryConfig<typeof getUserListQueryOptions> } = {},
) => useQuery({ ...getUserListQueryOptions(params), ...queryConfig });

// Hook: single user by id.
export const useGetUserByIdQuery = (
  userId: string,
  {
    queryConfig,
  }: { queryConfig?: QueryConfig<typeof getUserByIdQueryOptions> } = {},
) => useQuery({ ...getUserByIdQueryOptions(userId), ...queryConfig });

// Invalidate every user query so list/detail observers refetch.
export function invalidateUserQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: userListQueryKey });
}

// Hook: user statistics query.
export function useGetUserStatisticsQuery({
  queryConfig,
}: { queryConfig?: QueryConfig<typeof getUserStatisticsQueryOptions> } = {}) {
  return useQuery({ ...getUserStatisticsQueryOptions(), ...queryConfig });
}
