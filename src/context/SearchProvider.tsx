import { useEffect, useState } from "react";
import { SearchContext } from "@/hooks/useSearch";

type SearchProviderProps = {
  children: React.ReactNode;
};

export function SearchProvider({ children }: SearchProviderProps) {
  const [open, setOpen] = useState(false);

  // Global ⌘K / Ctrl+K shortcut to toggle the command palette.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <SearchContext
      value={{
        open,
        setOpen,
        toggle: () => setOpen((open) => !open),
      }}
    >
      {children}
    </SearchContext>
  );
}
