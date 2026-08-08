import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { meQueryKey } from "@/features/auth/service/me.service";
import { useMe } from "@/hooks/useMe";
import { getErrorMessage } from "@/utils/error";
import { updateMyProfile } from "../service/settings.service";
import type { UpdateMyProfilePayload } from "../types";

const nullableTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || value.length <= maxLength, {
      message: `Maksimal ${maxLength} karakter.`,
    });

const accountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Maksimal 100 karakter."),
  // Display-only — email tidak pernah dikirim ke payload update.
  email: z.string().email("Email tidak valid."),
  phoneNumber: nullableTrimmedString(20),
  avatarTempKey: z.string().trim().nullable().optional(),
});

type AccountFormValues = z.input<typeof accountFormSchema>;

const defaultValues: AccountFormValues = {
  name: "",
  email: "",
  phoneNumber: "",
  avatarTempKey: null,
};

export const formValidators = {
  name: accountFormSchema.shape.name,
  email: accountFormSchema.shape.email,
  phoneNumber: accountFormSchema.shape.phoneNumber,
  avatarTempKey: accountFormSchema.shape.avatarTempKey,
};

function toPayload(values: AccountFormValues): UpdateMyProfilePayload {
  const parsed = accountFormSchema.parse(values);
  return {
    name: parsed.name,
    phoneNumber: parsed.phoneNumber ?? null,
    avatarTempKey: parsed.avatarTempKey ?? null,
  };
}

export function useAccountForm(options?: { onSuccess?: () => void }) {
  const meQuery = useMe();
  const me = meQuery.data;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: AccountFormValues) => {
      if (!me) throw new Error("Data pengguna belum tersedia.");
      return updateMyProfile(toPayload(values), me.user);
    },
    onSuccess: async () => {
      toast.success("Profil berhasil diperbarui.");
      await queryClient.invalidateQueries({ queryKey: meQueryKey });
      options?.onSuccess?.();
    },
    onError: (error) => {
      const msg = getErrorMessage(error, "Gagal memperbarui profil.");
      toast.error(msg, { id: msg });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  useEffect(() => {
    if (!me) return;
    form.setFieldValue("name", me.user.name ?? "");
    form.setFieldValue("email", me.user.email ?? "");
    form.setFieldValue("phoneNumber", me.user.phoneNumber ?? "");
  }, [form, me]);

  return {
    form,
    isSubmitting: mutation.isPending,
    isLoading: meQuery.isLoading,
    avatarPreviewUrl: me?.user.avatarUrl || me?.user.image || null,
  };
}
