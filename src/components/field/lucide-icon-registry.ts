import * as LucideIcons from "lucide-react";

export type LucideIconName = keyof typeof LucideIcons;

export type LucideIconEntry = {
  name: LucideIconName;
  label: string;
};

const formatLabel = (name: string) =>
  name
    .replace(/Icon$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();

const excludedExports = new Set([
  "Icon",
  "IconNode",
  "createLucideIcon",
  "default",
  "LucideProvider",
]);

const isLucideIconExport = (name: string, value: unknown) => {
  if (excludedExports.has(name)) return false;
  if (!name || !/^[A-Z]/.test(name)) return false;

  return (
    typeof value === "function" ||
    (typeof value === "object" && value !== null && ("render" in value || "$$typeof" in value))
  );
};

export const lucideIconEntries = Object.entries(LucideIcons)
  .filter(([name, value]) => isLucideIconExport(name, value))
  .map(([name]) => ({
    name: name as LucideIconName,
    label: formatLabel(name),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
