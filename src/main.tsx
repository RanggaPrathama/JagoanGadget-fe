import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { AxiosError } from "axios";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { handleServerError } from "@/lib/handle-server-error";
import {
  AllCommunityModule,
  ModuleRegistry,
  ValidationModule,
} from "ag-grid-community";
import { FontProvider } from "./context/FontProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { routeTree } from "./routeTree.gen";
import "./styles/index.css";

ModuleRegistry.registerModules([
  AllCommunityModule,
  ...(import.meta.env.DEV ? [ValidationModule] : []),
]);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error });
        if (failureCount >= 0 && import.meta.env.DEV) return false;
        if (failureCount > 3 && import.meta.env.PROD) return false;
        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        );
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000,
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);
        if (error instanceof AxiosError && error.response?.status === 304) {
          toast.error("Content not modified!");
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        console.error(error);
        if (error.response?.status === 401) {
          toast.error("Session expired!");
        }
        if (error.response?.status === 500) {
          toast.error("Internal Server Error!");
        }
      }
    },
  }),
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultPendingMs: 200,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <RouterProvider router={router} />
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
