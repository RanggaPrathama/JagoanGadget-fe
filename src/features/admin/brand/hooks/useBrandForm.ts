import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  createBrand,
  updateBrand,
  brandListQueryKey,
  useGetBrandByIdQuery,
} from "../service/index";
import type { BrandPayload } from "../types";
import type { ApiFnReturnType } from "@/lib/react-query";

const brandFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama brand wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  logoUrl: z
    .string()
    .nullable()
    .refine((value) => !value || value.length <= 512, {
      message: "URL logo maksimal 512 karakter.",
    }),
});

type BrandFormValues = z.input<typeof brandFormSchema>;

const defaultValues: BrandFormValues = {
  name: "",
  logoUrl: null,
};

// Convert validated form values to the API payload shape expected by createBrand/updateBrand.
function toPayload(values: BrandFormValues): BrandPayload {
  const parsed = brandFormSchema.parse(values);
  return { name: parsed.name, logoUrl: parsed.logoUrl };
}

type UseBrandFormOptions = { brandId?: string; open?: boolean };

// Hook: manage brand form state, create/update mutation, and load detail when editing.
export function useBrandForm({ brandId, open = false }: UseBrandFormOptions) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(brandId);
  const readonly = false;

  const brandDetailQuery = useGetBrandByIdQuery(brandId as string, {
    queryConfig: { enabled: isEditMode },
  });

  const mutation = useMutation<
    ApiFnReturnType<typeof createBrand>,
    Error,
    BrandFormValues
  >({
    mutationFn: async (values: BrandFormValues) => {
      const payload = toPayload(values);
      if (isEditMode && brandId) {
        return updateBrand(brandId, payload);
      }
      return createBrand(payload);
    },
    onSuccess: async () => {
      toast.success(isEditMode ? "Brand berhasil diperbarui." : "Brand berhasil ditambahkan.");
      await queryClient.invalidateQueries({ queryKey: brandListQueryKey });
      if (brandId) {
        await queryClient.invalidateQueries({ queryKey: [...brandListQueryKey, brandId] });
      }
    },
    onError: (error) => {
      const msg = getErrorMessage(error, isEditMode ? "Gagal memperbarui brand." : "Gagal menambahkan brand.");
      toast.error(msg, { id: msg });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  // Reset the form every time the dialog opens so a previous create/edit session
  // never leaks its values into the next one (also clears validation/touched state).
  // Create starts from defaults; edit seeds from the fetched detail.
  useEffect(() => {
    if (!open) return;
    if (isEditMode) {
      const data = brandDetailQuery.data;
      if (!data) return;
      form.reset({
        name: data.name ?? "",
        logoUrl: data.logoUrl ?? null,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [open, isEditMode, brandDetailQuery.data, form]);

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: brandDetailQuery.isLoading,
    readonly,
  };
}
