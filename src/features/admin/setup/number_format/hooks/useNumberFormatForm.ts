import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNumberFormat, updateNumberFormat } from "../service";
import { useGetNumberFormatByIdQuery } from "../service/number_format.queries";

type UseNumberFormatOptions = {
  numberFormatId?: string;
};

const numberFormatFormSchema = z.object({
  menuId: z.string(),
  isActive: z.boolean().default(true),
  preview: z.string().optional(),
  segments: z
    .array(
      z.object({
        prefixId: z.string(),
        index: z.number(),
      }),
    )
    .min(1, "At least one segment is required")
    .max(20, "Maximum 20 segments are allowed"),
});

const toPayload = (values: NumberFormatFormValues) => {
  return {
    menuId: values.menuId,
    isActive: values.isActive,
    preview: values.preview,
    segments: values.segments.map((segment) => ({
      prefixId: segment.prefixId,
      index: segment.index,
    })),
  };
};

export type NumberFormatFormValues = z.input<typeof numberFormatFormSchema>;

const defaultValues: NumberFormatFormValues = {
  menuId: "",
  isActive: true,
  preview: "",
  segments: [],
};

export const formValidators = {
  menuId: numberFormatFormSchema.shape.menuId,
  isActive: numberFormatFormSchema.shape.isActive,
  preview: numberFormatFormSchema.shape.preview,
  segments: numberFormatFormSchema.shape.segments,
};

export const useNumberFormatForm = ({
  numberFormatId,
}: UseNumberFormatOptions) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(numberFormatId);

  // --- Fetch detail in edit mode ---
  const detailQuery = useGetNumberFormatByIdQuery(numberFormatId as string, {
    queryConfig: { enabled: isEditMode },
  });

  // --- Mutations (reuse existing mutation hooks pattern) ---
  const mutation = useMutation({
    mutationFn: async (values: NumberFormatFormValues) => {
      const payload = toPayload(values);
      if (isEditMode && numberFormatId) {
        return updateNumberFormat(numberFormatId, payload);
      }
      return createNumberFormat(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["number-formats"] });
    },
    onError: (error) => {
      console.error("Error saving number format:", error);
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  // --- Populate form from detail (edit mode) ---
  useEffect(() => {
    if (!detailQuery.data) return;
    const detail = detailQuery.data;

    form.setFieldValue("menuId", detail.menuId ?? "");
    form.setFieldValue("isActive", detail.isActive ?? true);
    form.setFieldValue("segments", detail.segments ?? []);
  }, [detailQuery.data, form]);

  return {
    isEditMode,
    form,
    mutation,
    formValidators,
    isLoadingDetail: detailQuery.isLoading,
  };
};
