import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useGetNumberFormatByIdQuery } from "../service/number_format.queries";
import {
  useCreateNumberFormat,
  useUpdateNumberFormat,
} from "../service/number_format.mutations";

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
  const navigate = useNavigate();
  const isEditMode = Boolean(numberFormatId);

  // --- Fetch detail in edit mode ---
  const detailQuery = useGetNumberFormatByIdQuery(numberFormatId as string, {
    queryConfig: { enabled: isEditMode },
  });

  // --- Mutations (use dedicated hooks with toast + redirect) ---
  const createMutation = useCreateNumberFormat();
  const updateMutation = useUpdateNumberFormat({
    numberFormatId: numberFormatId!,
  });

  const mutation = isEditMode ? updateMutation : createMutation;

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const payload = toPayload(value);
      if (isEditMode && numberFormatId) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      // Redirect to list after success
      void navigate({ to: "/admin/setup/number-format" });
    },
  });

  // --- Populate form from detail (edit mode) ---
  useEffect(() => {
    if (!detailQuery.data) return;
    const detail = detailQuery.data;

    form.setFieldValue("menuId", detail.menuId ?? "");
    form.setFieldValue("isActive", detail.isActive ?? true);
    form.setFieldValue("segments", detail.segments ?? []);
    form.setFieldValue("preview", detail.preview ?? "");
  }, [detailQuery.data, form]);

  return {
    isEditMode,
    form,
    mutation,
    formValidators,
    detailQuery,
    isLoadingDetail: detailQuery.isLoading,
    isSubmitting: mutation.isPending,
  };
};
