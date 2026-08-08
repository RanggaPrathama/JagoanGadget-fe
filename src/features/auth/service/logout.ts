import type { QueryClient } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { signOutAuth } from "./auth.service";
import { getErrorMessage } from "@/utils/error";

export async function resetAuth(
  queryClient: QueryClient,
  router: AnyRouter,
  opts?: { redirectTo?: string },
): Promise<void> {
  const redirectTo = opts?.redirectTo ?? router.state.location.href;

  try {
    await signOutAuth();
    queryClient.clear();
    await router.invalidate();
    toast.success("Berhasil keluar dari akun.");
    await router.navigate({
      to: "/",
      search: { redirect: redirectTo },
      replace: true,
    });
  } catch (error) {
    toast.error(getErrorMessage(error, "Gagal keluar dari akun."));
  }
}
