import { useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  createCategory,
  updateCategory,
  categoryListQueryKey,
  useGetCategoryByIdQuery,
} from "../service/index";
import type { CategoryPayload } from "../types";
import type { ApiFnReturnType } from "@/lib/react-query";
import { slugify } from "@/lib/slugify";

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .max(150, "Maksimal 150 karakter.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  parentId: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable(),
});

type CategoryFormValues = z.input<typeof categoryFormSchema>;

const defaultValues: CategoryFormValues = {
  name: "",
  slug: "",
  parentId: "",
};

function toPayload(values: CategoryFormValues): CategoryPayload {
  const parsed = categoryFormSchema.parse(values);
  return { name: parsed.name, slug: parsed.slug, parentId: parsed.parentId };
}

type UseCategoryFormOptions = { categoryId?: string; open?: boolean };

// Hook: manage category form state, auto-slug generation, create/update mutation, and load detail when editing.
export function useCategoryForm({ categoryId, open = false }: UseCategoryFormOptions) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(categoryId);
  const slugManuallyEditedRef = useRef(false);
  const seedInProgressRef = useRef(false);

  const categoryDetailQuery = useGetCategoryByIdQuery(categoryId as string, {
    queryConfig: { enabled: isEditMode },
  });

  const mutation = useMutation<
    ApiFnReturnType<typeof createCategory>,
    Error,
    CategoryFormValues
  >({
    mutationFn: async (values: CategoryFormValues) => {
      const payload = toPayload(values);
      if (isEditMode && categoryId) {
        return updateCategory(categoryId, payload);
      }
      return createCategory(payload);
    },
    onSuccess: async () => {
      toast.success(isEditMode ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan.");
      await queryClient.invalidateQueries({ queryKey: categoryListQueryKey });
      if (categoryId) {
        await queryClient.invalidateQueries({ queryKey: [...categoryListQueryKey, categoryId] });
      }
    },
    onError: (error) => {
      const msg = getErrorMessage(error, isEditMode ? "Gagal memperbarui kategori." : "Gagal menambahkan kategori.");
      toast.error(msg, { id: msg });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  // Seed the form every time the dialog opens so a previous create/edit session
  // never leaks its values into the next one. Create starts from defaults; edit
  // seeds from the fetched detail. We set each field with setFieldValue (instead
  // of an atomic form.reset) so the name-subscribed auto-slug effect below does
  // not race with a batched reset and drop the seeded name.
  useEffect(() => {
    if (!open) return;
    slugManuallyEditedRef.current = false;
    if (isEditMode) {
      const data = categoryDetailQuery.data;
      if (!data) return;
      seedInProgressRef.current = true;
      form.setFieldValue("name", data.name ?? "");
      form.setFieldValue("slug", data.slug ?? "");
      form.setFieldValue("parentId", data.parentId ?? "");
      seedInProgressRef.current = false;
    } else {
      form.setFieldValue("name", "");
      form.setFieldValue("slug", "");
      form.setFieldValue("parentId", "");
    }
  }, [open, isEditMode, categoryDetailQuery.data, form]);

  // Auto-generate slug from name until the user edits the slug field manually.
  // Skipped while seeding an edit payload so it does not overwrite the loaded slug.
  const nameValue = useStore(form.store, (state) => state.values.name);
  useEffect(() => {
    if (slugManuallyEditedRef.current || seedInProgressRef.current) return;
    const next = slugify(nameValue ?? "");
    if (next) form.setFieldValue("slug", next);
  }, [form, nameValue]);

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: categoryDetailQuery.isLoading,
    readonly: false,
    markSlugEdited: () => {
      slugManuallyEditedRef.current = true;
    },
  };
}
