export {
  permissionListQueryKey,
  getPermissionsListQueryKey,
  getPermissionsListQueryOptions,
  getPermissionByIdQueryOptions,
  useGetPermissionsListQuery,
  useGetPermissionByIdQuery,
  invalidatePermissionQueries,
} from "./permission.queries";
export {
  useDeletePermission,
  useCreatePermission,
  useUpdatePermission,
} from "./permission.mutations";

export {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from "./permission.service";
