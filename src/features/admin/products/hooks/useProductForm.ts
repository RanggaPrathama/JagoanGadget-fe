import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  createProduct,
  updateProduct,
  productListQueryKey,
  useGetProductByIdQuery,
} from "../service/index";
import type { ProductPayload, CreateSkuPayload } from "../types";
import type { ApiFnReturnType } from "@/lib/react-query";

// Helpers -------------------------------------------------------------

/** Trim a string, convert empty string to null, enforce optional max length. */
const nullableTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || value.length <= maxLength, {
      message: `Maksimal ${maxLength} karakter.`,
    });

/** Optional UUID that keeps null when empty (brandId optional). */
const optionalUuid = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
    message: "Pilih item yang valid.",
  });

// ---------------------------------------------------------------------
// Form values
// ---------------------------------------------------------------------

export type SkuFormValues = {
  skuCode: string;
  variantName: string;
  /** Price held as a string in the form (easy editing); converted to number on submit. */
  price: string;
  attributeValues: { attributeId: string; value: string }[];
};

export type ProductFormValues = {
  name: string;
  categoryId: string;
  /** Empty string means "no brand". */
  brandId: string;
  /** Empty string means "no description". */
  description: string;
  isActive: boolean;
  skus: SkuFormValues[];
};

const skuSchema = z.object({
  skuCode: z
    .string()
    .trim()
    .min(1, "SKU code wajib diisi.")
    .max(100, "Maksimal 100 karakter."),
  variantName: z
    .string()
    .trim()
    .min(1, "Nama varian wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  price: z
    .string()
    .trim()
    .refine(
      (value) => {
        const num = Number(value);
        return value === "" || (Number.isFinite(num) && num >= 0);
      },
      { message: "Harga harus angka ≥ 0." },
    ),
  attributeValues: z
    .array(
      z.object({
        attributeId: z.string().trim().min(1, "Pilih attribute."),
        value: z.string().trim().min(1, "Nilai wajib diisi.").max(255, "Maksimal 255 karakter."),
      }),
    )
    .optional()
    .default([]),
});

const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama produk wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  categoryId: z.string().trim().min(1, "Kategori wajib dipilih."),
  brandId: optionalUuid,
  description: nullableTrimmedString(2000),
  isActive: z.boolean().default(true),
  skus: z
    .array(skuSchema)
    .min(1, "Minimal satu SKU/variant wajib ditambahkan.")
    .default([]),
});

type ProductFormInput = z.input<typeof productFormSchema>;
type ProductFormOutput = z.output<typeof productFormSchema>;

const defaultValues: ProductFormInput = {
  name: "",
  categoryId: "",
  brandId: "",
  description: "",
  isActive: true,
  skus: [],
};

export const formValidators = {
  name: productFormSchema.shape.name,
  categoryId: productFormSchema.shape.categoryId,
  brandId: productFormSchema.shape.brandId,
  description: productFormSchema.shape.description,
  isActive: productFormSchema.shape.isActive,
  skus: productFormSchema.shape.skus,
};

export const defaultSku: SkuFormValues = {
  skuCode: "",
  variantName: "",
  price: "",
  attributeValues: [],
};

// Convert validated form values to the API payload shape.
// On edit, SKU matrix is excluded — the backend `update` only patches scalar fields.
function toPayload(values: ProductFormOutput, isEditMode: boolean): ProductPayload {
  const parsed = productFormSchema.parse(values);
  const skus: CreateSkuPayload[] = parsed.skus.map((sku) => ({
    skuCode: sku.skuCode,
    variantName: sku.variantName,
    price: Number(sku.price),
    attributeValues: sku.attributeValues.map((av) => ({
      attributeId: av.attributeId,
      value: av.value,
    })),
  }));

  return {
    name: parsed.name,
    categoryId: parsed.categoryId,
    brandId: parsed.brandId ?? null,
    description: parsed.description ?? null,
    isActive: parsed.isActive,
    ...(isEditMode ? {} : { skus }),
  };
}

type UseProductFormOptions = {
  productId?: string;
};

// Hook: manage product form state, create/update mutation, and detail fetching for the form view.
export function useProductForm({ productId }: UseProductFormOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(productId);

  const productDetailQuery = useGetProductByIdQuery(productId as string, {
    queryConfig: { enabled: isEditMode },
  });

  const mutation = useMutation<
    ApiFnReturnType<typeof createProduct>,
    Error,
    ProductFormOutput
  >({
    mutationFn: async (values: ProductFormOutput) => {
      const payload = toPayload(values, isEditMode);

      if (isEditMode && productId) {
        return updateProduct(productId, payload);
      }

      return createProduct(payload);
    },
    onSuccess: async () => {
      toast.success(
        isEditMode
          ? "Produk berhasil diperbarui."
          : "Produk berhasil ditambahkan.",
      );
      await queryClient.invalidateQueries({ queryKey: productListQueryKey });

      if (productId) {
        await queryClient.invalidateQueries({
          queryKey: [...productListQueryKey, productId],
        });
      }

      void navigate({ to: "/admin/master/products" });
    },
    onError: (error) => {
      const msg = getErrorMessage(
        error,
        isEditMode
          ? "Gagal memperbarui produk."
          : "Gagal menambahkan produk.",
      );
      toast.error(msg, { id: msg });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      // Validate the whole shape (including the nested SKU matrix) so failures
      // surface a precise message before the request is sent.
      const parsed = productFormSchema.safeParse(value);
      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        const message =
          (firstIssue?.path?.length ?? 0) > 0
            ? `[${firstIssue.path.join(".")}] ${firstIssue.message}`
            : firstIssue?.message ?? "Lengkapi data dengan benar.";
        toast.error(message, { id: message });
        return;
      }
      await mutation.mutateAsync(parsed.data);
    },
  });

  // Populate form fields from the fetched product detail when editing.
  // SKUs remain in the form (read-only in edit UI) so the matrix can be shown.
  useEffect(() => {
    if (!productDetailQuery.data) {
      return;
    }

    const data = productDetailQuery.data;
    form.reset({
      name: data.name ?? "",
      categoryId: data.categoryId ?? "",
      brandId: data.brandId ?? "",
      description: data.description ?? "",
      isActive: data.isActive ?? true,
      skus: (data.skus ?? []).map((sku) => ({
        skuCode: sku.skuCode ?? "",
        variantName: sku.variantName ?? "",
        price: sku.price ?? "",
        attributeValues: (sku.attributeValues ?? []).map((av) => ({
          attributeId: av.attribute?.id ?? "",
          value: av.value ?? "",
        })),
      })),
    });
  }, [form, productDetailQuery.data]);

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: productDetailQuery.isLoading,
  };
}
