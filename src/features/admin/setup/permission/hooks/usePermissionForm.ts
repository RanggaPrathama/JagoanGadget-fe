import { useEffect, useMemo, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { FieldOption } from "@/components/field/types";
import {
  createPermission,
  updatePermission,
  type PermissionPayload,
} from "../service/permission.service";
import {
  useGetPermissionByIdQuery,
  invalidatePermissionQueries,
} from "../service/permission.queries";
import { useGetMenusListQuery } from "@/features/admin/setup/menu/service/menu.queries";
import { invalidateMe } from "@/features/auth/service/me.service";

const permissionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama permission wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  code: z
    .string()
    .trim()
    .min(1, "Code permission wajib diisi.")
    .max(100, "Maksimal 100 karakter."),
  description: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || value.length <= 255, {
      message: "Maksimal 255 karakter.",
    })
    .nullable(),
  menuId: z.string().trim().min(1, "Menu wajib dipilih."),
});

type PermissionFormValues = z.input<typeof permissionFormSchema>;

const defaultValues: PermissionFormValues = {
  name: "",
  code: "",
  description: "",
  menuId: "",
};

export const formValidators = {
  name: permissionFormSchema.shape.name,
  code: permissionFormSchema.shape.code,
  description: permissionFormSchema.shape.description,
  menuId: permissionFormSchema.shape.menuId,
};

type UsePermissionFormOptions = {
  permissionId?: string;
};

// Converts a permission name to a URL-safe slug (lowercase, underscores).
function slugifyPermissionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// Builds a permission code by combining the menu base code with the slugified name.
function generatePermissionCode(
  menuCode: string,
  permissionName: string,
): string {
  const slug = slugifyPermissionName(permissionName);
  if (!slug) return menuCode;
  // Use last segment of menu code (e.g. "setup.user" → "user")
  const base = menuCode.split(".").pop() ?? menuCode;
  return `${base}.${slug}`;
}

// Maps form values to the API payload expected by create/update endpoints.
function toPayload(values: PermissionFormValues): PermissionPayload {
  const parsed = permissionFormSchema.parse(values);
  return {
    name: parsed.name,
    code: parsed.code,
    description: parsed.description,
    menuId: parsed.menuId,
  };
}

// Hook: manages form state, auto-generated code, and submit mutation for permissions.
export function usePermissionForm({ permissionId }: UsePermissionFormOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(permissionId);
  const skipNextGenerateRef = useRef(isEditMode);

  // Load the permission being edited (disabled in create mode).
  const permissionDetailQuery = useGetPermissionByIdQuery(permissionId as string, {
    queryConfig: { enabled: isEditMode },
  });

  // Reuse the menu query to populate the "Menu" dropdown.
  const menusQuery = useGetMenusListQuery({ limit: 30 });

  // Build menu lookup map
  const rawMenus = useMemo(() => menusQuery.data?.items ?? [], [menusQuery.data?.items]);
  const menuMap = useMemo(
    () => new Map(rawMenus.map((menu) => [menu.id, menu])),
    [rawMenus],
  );

  const mutation = useMutation({
    mutationFn: async (values: PermissionFormValues) => {
      const payload = toPayload(values);

      if (isEditMode && permissionId) {
        return updatePermission(permissionId, payload);
      }

      return createPermission(payload);
    },
    onSuccess: async () => {
      toast.success(
        isEditMode
          ? "Permission berhasil diperbarui."
          : "Permission berhasil ditambahkan.",
      );
      await invalidatePermissionQueries(queryClient);
      await invalidateMe(queryClient);
      void navigate({ to: "/admin/setup/permission" });
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(
          error,
          isEditMode
            ? "Gagal memperbarui permission."
            : "Gagal menambahkan permission.",
        ),
      );
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  // Populate form on edit
  useEffect(() => {
    if (!permissionDetailQuery.data) return;

    const data = permissionDetailQuery.data;
    form.setFieldValue("name", data.name ?? "");
    form.setFieldValue("code", data.code ?? "");
    form.setFieldValue("description", data.description ?? "");
    form.setFieldValue("menuId", data.menuId ?? "");
    skipNextGenerateRef.current = true;
  }, [form, permissionDetailQuery.data]);

  // Watch menuId + name to auto-generate code
  const formSignature = useStore(
    form.store,
    (state: { values: PermissionFormValues }) =>
      `${state.values.menuId ?? ""}::${state.values.name ?? ""}`,
  );

  useEffect(() => {
    if (skipNextGenerateRef.current) {
      skipNextGenerateRef.current = false;
      return;
    }

    const [menuId, name] = formSignature.split("::");
    if (!menuId || !name.trim()) return;

    const menu = menuMap.get(menuId);
    if (!menu) return;

    const generated = generatePermissionCode(menu.code, name);
    form.setFieldValue("code", generated);
  }, [form, formSignature, menuMap]);

  const menuOptions: FieldOption[] = rawMenus.map((menu) => ({
    label: menu.name,
    value: menu.id,
  }));

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: permissionDetailQuery.isLoading,
    menuOptions,
    menuOptionsLoading: menusQuery.isLoading,
  };
}
