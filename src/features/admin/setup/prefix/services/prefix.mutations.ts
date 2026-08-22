import { type MutationConfig } from "@/lib/react-query";
import { deletePrefix } from "./prefix.service";
import { invalidatePrefixQueries } from "./prefix.queries";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;

type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

type UseDeletePrefixOptions = {
  mutationConfig?: MutationConfig<typeof deletePrefix>;
};

// Hook: delete a prefix by ID. Invalidates prefix list queries on success.
export const useDeletePrefix = ({
  mutationConfig,
}: UseDeletePrefixOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deletePrefix,
    onSuccess: (...args: SuccessParams<typeof deletePrefix>) => {
      toast.success("Prefix berhasil dihapus.");
      void invalidatePrefixQueries(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus prefix.")),
  });
};
