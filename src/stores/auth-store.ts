import { createStore } from "@tanstack/store";
import { useSelector } from "@tanstack/react-store";
import type { QueryClient } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";
import {
  clearAuthCache,
  signOutAuth,
} from "@/features/auth/service/auth.service";
import { getErrorMessage } from "@/utils/error";
import { toast } from "sonner";

interface AuthStoreState {
  queryClient: QueryClient | null;
  router: AnyRouter | null;
}

const authStore = createStore<AuthStoreState>({
  queryClient: null,
  router: null,
});

export function configureAuthStore({
  queryClient,
  router,
}: {
  queryClient: QueryClient;
  router: AnyRouter;
}) {
  authStore.setState(() => ({ queryClient, router }));
}

export function useAuthStore() {
  const queryClient = useSelector(authStore, (s) => s.queryClient);
  const router = useSelector(authStore, (s) => s.router);

  return {
    auth: {
      reset: () => resetAuth(queryClient, router),
    },
  };
}

async function resetAuth(
  queryClient: QueryClient | null,
  router: AnyRouter | null,
) {
  if (!queryClient || !router) {
    toast.error("Autentikasi belum dikonfigurasi.");
    return;
  }

  const redirectTo = router.state.location.href;

  try {
    await signOutAuth();
    clearAuthCache(queryClient);
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
