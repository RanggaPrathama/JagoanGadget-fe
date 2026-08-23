import { createContext, useContext } from "react";

/** Shared state for the admin command palette (opened via the Search button or ⌘K). */
export type SearchContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Toggle the palette open/closed (used by the ⌘K / Ctrl+K shortcut). */
  toggle: () => void;
};

export const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Access the command-palette state from anywhere inside `SearchProvider`.
 * Throws if used outside the provider (it is mounted in `AdminLayout`).
 */
export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch has to be used within SearchProvider");
  }
  return ctx;
}
