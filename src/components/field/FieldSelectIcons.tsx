"use client";

import type { CSSProperties, ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as LucideIcons from "lucide-react";
import { Check, Search, X } from "lucide-react";

import { FieldShell } from "@/components/field/FieldShell";
import type { FieldBaseProps } from "@/components/field/types";
import { cn } from "@/lib/utils";

import { lucideIconEntries } from "./lucide-icon-registry";

type FieldSelectIconsProps = FieldBaseProps & {
  value?: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  name?: string;
};

const getIconComponent = (name?: string | null) => {
  if (!name) return Search;
  return (
    (LucideIcons as unknown as Record<string, ComponentType<{ className?: string }>>)[name] ??
    Search
  );
};

export function FieldSelectIcons({
  label,
  error,
  disabled = false,
  value,
  onValueChange,
  placeholder = "Pilih icon",
  searchPlaceholder = "Cari icon...",
  emptyText = "Tidak ada icon ditemukan.",
  name,
}: FieldSelectIconsProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const selectedIcon = useMemo(() => {
    if (!value) return null;
    return lucideIconEntries.find((entry) => entry.name === value);
  }, [value]);

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const icons = normalizedQuery
      ? lucideIconEntries.filter((entry) =>
          `${entry.label} ${entry.name}`.toLowerCase().includes(normalizedQuery),
        )
      : lucideIconEntries.slice(0, 180);

    return icons;
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePanelPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < 420 && spaceAbove > spaceBelow;

      setPanelStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        top: openUpward ? undefined : rect.bottom + 12,
        bottom: openUpward ? window.innerHeight - rect.top + 12 : undefined,
        zIndex: 60,
      });
    };

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open]);

  const ActiveIcon = selectedIcon ? getIconComponent(selectedIcon.name) : Search;

  return (
    <FieldShell label={label} error={error} htmlFor={name} disabled={disabled}>
      <div ref={rootRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border border-input bg-input/20 px-4 py-3 text-left transition-colors",
            "hover:border-border hover:bg-input/30 focus:outline-none focus:ring-2 focus:ring-ring/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 text-foreground ring-1 ring-border/80">
            <ActiveIcon className="h-4 w-4" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {selectedIcon?.label ?? placeholder}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {selectedIcon?.name ?? "Belum ada icon dipilih"}
            </span>
          </span>

          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {open ? "Close" : "Browse"}
          </span>

          {value ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="Hapus icon"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onValueChange("");
              }}
              className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </span>
          ) : null}
        </button>

        {open ? (
          <div
            style={panelStyle}
            className="rounded-2xl border border-border/80 bg-popover/95 p-4 shadow-2xl shadow-black/20 backdrop-blur"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-input bg-input/20 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{filteredIcons.length} icon</span>
              <span>klik untuk pilih</span>
            </div>

            <div className="mt-3 max-h-[min(18rem,calc(100vh-18rem))] overflow-y-auto pr-1">
              {filteredIcons.length ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredIcons.map((icon) => {
                    const Icon = getIconComponent(icon.name);
                    const active = icon.name === value;

                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => {
                          onValueChange(icon.name);
                          setOpen(false);
                        }}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                          active
                            ? "border-foreground/40 bg-accent/60"
                            : "border-border/70 bg-transparent hover:border-border hover:bg-accent/30",
                        )}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 ring-1 ring-border/80">
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {icon.label}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {icon.name}
                          </span>
                        </span>

                        {active ? <Check className="h-4 w-4 shrink-0 text-foreground" /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                  {emptyText}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
