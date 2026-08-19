// src/features/admin/setup/category/types/index.ts

/** Single category row returned by the API. */
export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  parentName?: string | null;
  children?: CategoryItem[];
  createdAt?: string;
  updatedAt?: string;
};

/** Payload sent to create/update a category. */
export type CategoryPayload = {
  name: string;
  slug: string;
  parentId: string | null;
};

/** Dialog visibility state for the category form modal. */
export type CategoryDialogMode = "create" | "edit" | "readonly" | "closed";
