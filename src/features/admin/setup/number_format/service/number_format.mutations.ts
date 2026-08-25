import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  createNumberFormat,
  deleteNumberFormat,
  updateNumberFormat,
} from "./number_format.service";
import type { NumberFormatPayload } from "../types";
import { invalidateNumberFormatQueries, numberFormatListQueryKey } from "./number_format.queries";

// Hook: create a new number format. Invalidates number-format list queries on success.
export const useCreateNumberFormat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNumberFormat,
    onSuccess: () => {
      toast.success("Number format berhasil ditambahkan.");
      void invalidateNumberFormatQueries(queryClient);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menambahkan number format.")),
  });
};

// Hook: update an existing number format by ID. Invalidates list + detail queries on success.
export const useUpdateNumberFormat = ({
  numberFormatId,
}: {
  numberFormatId: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NumberFormatPayload) =>
      updateNumberFormat(numberFormatId, payload),
    onSuccess: () => {
      toast.success("Number format berhasil diperbarui.");
      void invalidateNumberFormatQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: [...numberFormatListQueryKey, numberFormatId],
      });
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui number format.")),
  });
};

// Hook: delete a number format by ID. Invalidates number-format list queries on success.
export const useDeleteNumberFormat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNumberFormat,
    onSuccess: () => {
      toast.success("Number format berhasil dihapus.");
      void invalidateNumberFormatQueries(queryClient);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus number format.")),
  });
};
