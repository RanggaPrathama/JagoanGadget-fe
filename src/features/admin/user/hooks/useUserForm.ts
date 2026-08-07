import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import type { UserFormInput } from "../types";
import { getErrorMessage } from "@/utils/error";
import type { RoleItem } from "../../setup/role/service/role.service";
import { createUser, getUser, updateUser } from "../service/user.service";
import { userListQueryKey } from "./useUserList";
import { invalidateMe } from "@/features/auth/service/me.service";

const nullableTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || value.length <= maxLength, {
      message: `Maksimal ${maxLength} karakter.`,
    });

const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Maksimal 100 karakter."),
  email: z.string().email("Email tidak valid."),
  phoneNumber: nullableTrimmedString(20),
  isActive: z.boolean().default(true),
  isSuperadmin: z.boolean().default(false),
  roleIds: z.array(z.string()).default([]),
  avatarTempKey: z.string().trim().nullable().optional(),
});

type UserFormValues = z.input<typeof userFormSchema>;

const defaultValues: UserFormValues = {
  name: "",
  email: "",
  phoneNumber: "",
  isActive: true,
  isSuperadmin: false,
  roleIds: [],
  avatarTempKey: null,
};

export const formValidators = {
  name: userFormSchema.shape.name,
  email: userFormSchema.shape.email,
  phoneNumber: userFormSchema.shape.phoneNumber,
  isActive: userFormSchema.shape.isActive,
  isSuperadmin: userFormSchema.shape.isSuperadmin,
  roleIds: userFormSchema.shape.roleIds,
  avatarTempKey: userFormSchema.shape.avatarTempKey,
};

function toPayload(values: UserFormValues): UserFormInput {
  const parsed = userFormSchema.parse(values);

  return {
    name: parsed.name,
    email: parsed.email,
    phoneNumber: parsed.phoneNumber ?? undefined,
    isActive: parsed.isActive,
    // isSuperadmin: parsed.isSuperadmin,
    roleIds: parsed.roleIds,
    avatarTempKey: parsed.avatarTempKey ?? undefined,
  };
}

type UseUserFormOptions = {
  userId?: string;
};

export function useUserForm({ userId }: UseUserFormOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(userId);

  const userDetailQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId!),
    enabled: isEditMode,
  });

  const mutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const payload = toPayload(values);

      if (isEditMode && userId) {
        return updateUser(userId, payload);
      }

      return createUser(payload);
    },
    onSuccess: async () => {
      toast.success(
        isEditMode ? "User berhasil diperbarui." : "User berhasil ditambahkan.",
      );
      await queryClient.invalidateQueries({ queryKey: userListQueryKey });

      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ["user", userId],
        });
      }

      await invalidateMe(queryClient);
      void navigate({ to: "/admin/user" });
    },
    onError: (error) => {
      const msg = getErrorMessage(
        error,
        isEditMode ? "Gagal memperbarui user." : "Gagal menambahkan user.",
      );
      toast.error(msg);
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  useEffect(() => {
    if (!userDetailQuery.data) {
      return;
    }

    const data = userDetailQuery.data;
    form.setFieldValue("name", data.name ?? "");
    form.setFieldValue("email", data.email ?? "");
    form.setFieldValue("phoneNumber", data.phoneNumber ?? "");
    form.setFieldValue("isActive", data.isActive ?? true);
    // form.setFieldValue("isSuperadmin", data.isSuperadmin ?? false);

    form.setFieldValue("roleIds", data.userRoles?.map((ur) => ur.roleId) ?? []);
  }, [form, userDetailQuery.data]);

  const userRoles = userDetailQuery.data?.userRoles ?? [];

  const initialRoleItems = userRoles
    .map((ur) => ur.role)
    .filter(Boolean) as RoleItem[];

  const [selectedRoleItems, setSelectedRoleItems] =
    useState<RoleItem[]>(initialRoleItems);

  if (
    initialRoleItems.length > 0 &&
    selectedRoleItems.length === 0 &&
    selectedRoleItems !== initialRoleItems
  ) {
    setSelectedRoleItems(initialRoleItems);
  }

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: userDetailQuery.isLoading,
    selectedRoleItems,
    setSelectedRoleItems,
    existingAvatarUrl: userDetailQuery.data?.avatarUrl ?? null,
  };
}
