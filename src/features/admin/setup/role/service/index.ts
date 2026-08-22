export {
  roleListQueryKey,
  getRoleListQueryKey,
  getRoleListQueryOptions,
  getRoleByIdQueryOptions,
  useGetRoleListQuery,
  useGetRoleByIdQuery,
  invalidateRoleQueries,
} from "./role.queries";
export { useDeleteRole, useCreateRole, useUpdateRole } from "./role.mutations";

export {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "./role.service";
