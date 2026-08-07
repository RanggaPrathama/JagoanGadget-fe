import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  notificationPrefsQueryKey,
  updateNotificationPreferences,
} from "../service/settings.service";
import type { NotificationPreferences } from "../types";

/**
 * Optimistic toggle untuk preferensi notifikasi — state langsung berubah,
 * di-rollback bila mutasi gagal.
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onMutate: async (next) => {
      await queryClient.cancelQueries({
        queryKey: notificationPrefsQueryKey,
      });
      const prev = queryClient.getQueryData<NotificationPreferences>(
        notificationPrefsQueryKey,
      );
      queryClient.setQueryData(notificationPrefsQueryKey, next);
      return { prev };
    },
    onError: (error, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(notificationPrefsQueryKey, context.prev);
      }
      const msg = getErrorMessage(
        error,
        "Gagal memperbarui preferensi notifikasi.",
      );
      toast.error(msg, { id: msg });
    },
    onSuccess: () => {
      toast.success("Preferensi notifikasi diperbarui.");
    },
  });
}
