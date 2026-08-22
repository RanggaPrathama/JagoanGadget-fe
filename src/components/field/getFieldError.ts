// Mirrors the auth forms' display gate: never surface a field error until the
// field has been touched (isTouched). TanStack Form force-sets isTouched on
// every field during handleSubmit (FormApi._handleSubmit), so this also reveals
// all errors after a submit attempt — hidden on open, shown on blur, shown on submit.
type FieldErrorLike = string | { message?: string } | undefined;

export type FieldErrorMeta = {
  isTouched: boolean;
  errors?: Array<FieldErrorLike>;
};

export function getFieldError(meta: FieldErrorMeta): string | undefined {
  if (!meta.isTouched) {
    return undefined;
  }

  const err = meta.errors?.find((e) => {
    if (typeof e === "string") {
      return e.length > 0;
    }
    return Boolean(e?.message);
  });

  if (!err) {
    return undefined;
  }

  return typeof err === "string" ? err : err.message;
}
