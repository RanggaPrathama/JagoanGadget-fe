import { useEffect, useMemo, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";

import { getErrorMessage } from "@/utils/error";
import {
  createRole,
  updateRole,
  useGetRoleByIdQuery,
  invalidateRoleQueries,
} from "../service";
import type { RolePayload } from "../types";
import { invalidateMe } from "@/features/auth/service/me.service";

const nullableTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || value.length <= maxLength, {
      message: `Maksimal ${maxLength} karakter.`,
    });

const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama role wajib diisi.")
    .max(100, "Maksimal 100 karakter."),
  code: z
    .string()
    .trim()
    .min(1, "Code role wajib diisi.")
    .max(100, "Maksimal 100 karakter."),
  description: nullableTrimmedString(255),
  isActive: z.boolean().default(true),
  permissionIds: z.array(z.string()).default([]),
});

export type RoleFormValues = z.input<typeof roleFormSchema>;

const defaultValues: RoleFormValues = {
  name: "",
  code: "",
  description: "",
  isActive: true,
  permissionIds: [],
};

export const formValidators = {
  name: roleFormSchema.shape.name,
  code: roleFormSchema.shape.code,
  description: roleFormSchema.shape.description,
  isActive: roleFormSchema.shape.isActive,
  permissionIds: roleFormSchema.shape.permissionIds,
};

type UseRoleFormOptions = {
  roleId?: string;
};

// Generate a normalized role code from a human-readable name (e.g. "Super Admin" → "SUPER_ADMIN").
function generateRoleCode(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// Convert raw form values into the API payload shape (validation + field selection).
function toPayload(values: RoleFormValues): RolePayload {
  const parsed = roleFormSchema.parse(values);

  return {
    name: parsed.name,
    code: parsed.code,
    description: parsed.description,
    isActive: parsed.isActive,
    permissionIds: parsed.permissionIds,
  };
}

// Hook: manage role create/edit form state, detail fetching, and submission.
export function useRoleForm({ roleId }: UseRoleFormOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(roleId);
  const lastGeneratedCodeRef = useRef("");
  const skipNextGenerateRef = useRef(isEditMode);
  const formValuesRef = useRef<RoleFormValues>(defaultValues);

  // Fetch role detail when in edit mode to pre-populate the form.
  const roleDetailQuery = useGetRoleByIdQuery(roleId as string, {
    queryConfig: { enabled: isEditMode },
  });

  const mutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      const payload = toPayload(values);

      if (isEditMode && roleId) {
        return updateRole(roleId, payload);
      }

      return createRole(payload);
    },
    onSuccess: async () => {
      toast.success(
        isEditMode ? "Role berhasil diperbarui." : "Role berhasil ditambahkan.",
      );
      // Invalidate role list/detail queries so any open observers refetch.
      await invalidateRoleQueries(queryClient);
      // Invalidate current-user access control so sidebar/permissions refresh.
      await invalidateMe(queryClient);
      void navigate({ to: "/admin/setup/role" });
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(
          error,
          isEditMode ? "Gagal memperbarui role." : "Gagal menambahkan role.",
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

  // Populate form fields from role detail once the query resolves (edit mode only).
  useEffect(() => {
    if (!roleDetailQuery.data) return;

    const data = roleDetailQuery.data;

    // Extract permissionIds from menus[].permissions[].is_checked (actual API shape)
    const permissionIds = data.menus
      ? data.menus.flatMap((menu) =>
          menu.permissions
            .filter((p) => p.is_checked)
            .map((p) => p.id),
        )
      : data.rolePermissions
        ? data.rolePermissions.map((rp) => rp.permissionId)
        : (data.permissionIds ?? []);

    form.setFieldValue("name", data.name ?? "");
    form.setFieldValue("code", data.code ?? "");
    form.setFieldValue("description", data.description ?? "");
    form.setFieldValue("isActive", data.isActive ?? true);
    form.setFieldValue("permissionIds", permissionIds);
    lastGeneratedCodeRef.current = data.code ?? "";
    skipNextGenerateRef.current = true;
  }, [form, roleDetailQuery.data]);

  // Keep formValuesRef in sync with the latest form state
  const currentFormValues = useStore(
    form.store,
    (state: { values: RoleFormValues }) => state.values,
  );
  useEffect(() => {
    formValuesRef.current = currentFormValues;
  });

  const formSignature = useStore(
    form.store,
    (state: { values: RoleFormValues }) =>
      `${state.values.name ?? ""}::${state.values.code ?? ""}`,
  );

  // Auto-generate role code from name field, skipping on initial edit load.
  useEffect(() => {
    if (skipNextGenerateRef.current) {
      skipNextGenerateRef.current = false;
      return;
    }

    const [name, currentCode] = formSignature.split("::");
    const generatedCode = generateRoleCode(name);

    if (!generatedCode) {
      lastGeneratedCodeRef.current = "";
      return;
    }

    if (!currentCode || currentCode === lastGeneratedCodeRef.current) {
      form.setFieldValue("code", generatedCode);
      lastGeneratedCodeRef.current = generatedCode;
    }
  }, [form, formSignature]);

  // Unique menu IDs from role detail (for initializing permission picker in edit mode)
  const initialMenuIds = useMemo(() => {
    if (roleDetailQuery.data?.menus) {
      return roleDetailQuery.data.menus.map((m) => m.id);
    }
    // fallback for old shape
    if (!roleDetailQuery.data?.rolePermissions) return [];
    const ids = new Set(
      roleDetailQuery.data.rolePermissions.map(
        (rp) => rp.permission.menuId ?? rp.permission.menu?.id,
      ),
    );
    return Array.from(ids).filter(Boolean) as string[];
  }, [roleDetailQuery.data]);

  const submitForm = () => {
    return mutation.mutateAsync(formValuesRef.current);
  };

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: roleDetailQuery.isLoading,
    initialMenuIds,
    submitForm,
  };
}
