/**
 * Convert an arbitrary label into a URL-safe slug.
 * Lowercases, trims, replaces spaces with dashes, strips characters that are
 * neither letters/digits nor dashes, collapses repeated dashes, and trims
 * leading/trailing dashes.
 * @param input - raw label, e.g. "Smart Phone!"
 * @returns slug, e.g. "smart-phone"
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
