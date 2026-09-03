/**
 * List of available font names (visit the url `/settings/appearance`).
 * This array is used to generate dynamic font classes (e.g., `font-inter`, `font-manrope`).
 *
 * 📝 How to Add a New Font (Tailwind v4+):
 * 1. Add the font name here.
 * 2. Update the `<link>` tag in 'index.html' to include the new font from Google Fonts (or any other source),
 *    OR install the `@fontsource-variable/<name>` package and import it in 'src/styles/index.css'.
 * 3. Add the font family to the `--font-*` CSS variables in 'src/styles/theme.css' (defines which faces exist),
 *    then map it in the `@theme inline` block (defines which classes are generated, e.g. `font-jakarta`).
 *
 * Example:
 * fonts.ts           → Add 'plus-jakarta' to this array.
 * index.css          → Import the installed font, e.g. `@import "@fontsource-variable/plus-jakarta-sans";`
 * theme.css          → Define `--font-plus-jakarta: "Plus Jakarta Sans Variable", system-ui, sans-serif;`
 */
export const fonts = ["inter", "manrope", "plus-jakarta", "system"] as const