import { z } from "zod";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  createPrefix,
  updatePrefix,
  invalidatePrefixQueries,
  prefixListQueryKey,
  useGetPrefixByIdQuery,
} from "../services/index";
import type { ApiFnReturnType } from "@/lib/react-query";
import { useForm } from "@tanstack/react-form";

const prefixFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama prefix wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  value: z
    .string()
    .trim()
    .min(1, "Value prefix wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  type: z.enum(["sequence", "day", "month", "year", "text"], {
    message: "Tipe prefix wajib dipilih.",
  }),
  isActive: z.boolean(),
});

type PrefixFormValues = z.input<typeof prefixFormSchema>;

export const formValidators = {
  name: prefixFormSchema.shape.name,
  value: prefixFormSchema.shape.value,
  type: prefixFormSchema.shape.type,
  isActive: prefixFormSchema.shape.isActive,
};

const defaultValues: PrefixFormValues = {
  name: "",
  value: "",
  type: "sequence",
  isActive: true,
};

function toPayload(values: PrefixFormValues) {
  const parsed = prefixFormSchema.parse(values);
  return {
    name: parsed.name,
    value: parsed.value,
    type: parsed.type,
    isActive: parsed.isActive,
  };
}
type UsePrefixFormOptions = { prefixId?: string; open?: boolean };

export function usePrefixForm({ prefixId, open = false }: UsePrefixFormOptions) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(prefixId);

  // get Detail prefix by id for edit/readonly mode
  const prefixDetailQuery = useGetPrefixByIdQuery(prefixId as string, {
    queryConfig: { enabled: isEditMode },
  });
  const mutation = useMutation<
    ApiFnReturnType<typeof createPrefix>,
    Error,
    PrefixFormValues
  >({
    mutationFn: async (values: PrefixFormValues) => {
      const payload = toPayload(values);
      if (isEditMode && prefixId) {
        return updatePrefix(prefixId, payload);
      }
      return createPrefix(payload);
    },
    onSuccess: async () => {
      toast.success(
        isEditMode ? "Prefix berhasil diperbarui." : "Prefix berhasil dibuat.",
      );
      await invalidatePrefixQueries(queryClient);
      if (isEditMode) {
        await queryClient.invalidateQueries({
          queryKey: [...prefixListQueryKey, prefixId],
        });
      }
    },
    onError: (error) => {
      const msg = getErrorMessage(
        error,
        isEditMode ? "Gagal memperbarui prefix." : "Gagal membuat prefix.",
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

  // Reset the form every time the dialog opens so a previous create/edit session
  // never leaks its values into the next one (this also clears validation/touched
  // state). Create starts from defaults; edit seeds from the fetched detail.
  useEffect(() => {
    if (!open) return;
    if (isEditMode) {
      const data = prefixDetailQuery.data;
      if (!data) return;
      form.reset({
        name: data.name ?? "",
        value: data.value ?? "",
        type: data.type ?? "sequence",
        isActive: data.isActive ?? true,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [open, isEditMode, prefixDetailQuery.data, form]);

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: prefixDetailQuery.isLoading,
    formValidators,
  };
}
