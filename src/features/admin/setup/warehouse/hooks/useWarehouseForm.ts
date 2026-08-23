import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  createWarehouse,
  updateWarehouse,
  warehouseListQueryKey,
  useGetWarehouseByIdQuery,
} from "../service/index";
import type { WarehousePayload } from "../types";
import type { ApiFnReturnType } from "@/lib/react-query";

import { invalidateMe } from "@/features/auth/service/me.service";

// Zod schema helper: trim a string, convert empty string to null, enforce optional max length.
const nullableTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || value.length <= maxLength, {
      message: `Maksimal ${maxLength} karakter.`,
    });

const warehouseFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code wajib diisi.")
    .max(50, "Maksimal 50 karakter."),
  name: z
    .string()
    .trim()
    .min(1, "Nama warehouse wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  address: nullableTrimmedString(500),
  isActive: z.boolean().default(true),
});

type WarehouseFormValues = z.input<typeof warehouseFormSchema>;

const defaultValues: WarehouseFormValues = {
  code: "",
  name: "",
  address: "",
  isActive: true,
};

export const formValidators = {
  code: warehouseFormSchema.shape.code,
  name: warehouseFormSchema.shape.name,
  address: warehouseFormSchema.shape.address,
  isActive: warehouseFormSchema.shape.isActive,
};

// Convert validated form values to the API payload shape expected by createWarehouse/updateWarehouse.
function toPayload(values: WarehouseFormValues): WarehousePayload {
  const parsed = warehouseFormSchema.parse(values);

  return {
    code: parsed.code,
    name: parsed.name,
    address: parsed.address,
    isActive: parsed.isActive,
  };
}

type UseWarehouseFormOptions = {
  warehouseId?: string;
};

// Hook: manage warehouse form state, create/update mutation, and detail fetching for the warehouse form view.
export function useWarehouseForm({ warehouseId }: UseWarehouseFormOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(warehouseId);

  const warehouseDetailQuery = useGetWarehouseByIdQuery(warehouseId as string, {
    queryConfig: { enabled: isEditMode },
  });

  const mutation = useMutation<
    ApiFnReturnType<typeof createWarehouse>,
    Error,
    WarehouseFormValues
  >({
    mutationFn: async (values: WarehouseFormValues) => {
      const payload = toPayload(values);

      if (isEditMode && warehouseId) {
        return updateWarehouse(warehouseId, payload);
      }

      return createWarehouse(payload);
    },
    onSuccess: async () => {
      toast.success(
        isEditMode
          ? "Warehouse berhasil diperbarui."
          : "Warehouse berhasil ditambahkan.",
      );
      await queryClient.invalidateQueries({ queryKey: warehouseListQueryKey });

      if (warehouseId) {
        await queryClient.invalidateQueries({
          queryKey: [...warehouseListQueryKey, warehouseId],
        });
      }

      await invalidateMe(queryClient);
      void navigate({ to: "/admin/setup/warehouse" });
    },
    onError: (error) => {
      const msg = getErrorMessage(
        error,
        isEditMode
          ? "Gagal memperbarui warehouse."
          : "Gagal menambahkan warehouse.",
      );
      toast.error(msg, { id: msg });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  // Populate form fields from the fetched warehouse detail when editing.
  useEffect(() => {
    if (!warehouseDetailQuery.data) {
      return;
    }

    const data = warehouseDetailQuery.data;
    form.setFieldValue("code", data.code ?? "");
    form.setFieldValue("name", data.name ?? "");
    form.setFieldValue("address", data.address ?? "");
    form.setFieldValue("isActive", data.isActive ?? true);
  }, [form, warehouseDetailQuery.data]);

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: warehouseDetailQuery.isLoading,
  };
}
