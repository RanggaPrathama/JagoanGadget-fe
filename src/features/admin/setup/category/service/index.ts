// src/features/admin/setup/category/service/index.ts
export {
  categoryListQueryKey,
  getCategoriesListQueryKey,
  getCategoriesListQueryOptions,
  getCategoryByIdQueryOptions,
  useGetCategoriesListQuery,
  useGetCategoryByIdQuery,
  invalidateCategoryQueries,
} from "./category.queries";
export { useCreateCategory, useUpdateCategory, useDeleteCategory } from "./category.mutations";
export {
  getCategoriesList,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.service";
