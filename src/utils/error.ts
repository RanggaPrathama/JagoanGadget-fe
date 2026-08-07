import { AxiosError } from "axios";

type ErrorShape =
  | string
  | {
      message?: string;
      error?: {
        message?: string;
      };
    };

function readErrorMessage(
  error: ErrorShape,
): string | null {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (typeof error === "object" && error) {
    if (typeof error.message === "string" && error.message.trim().length > 0) {
      return error.message;
    }

    if (
      typeof error.error?.message === "string" &&
      error.error.message.trim().length > 0
    ) {
      return error.error.message;
    }
  }

  return null;
}

function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan tak terduga.",
) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string, errors?: string | string[] } | undefined;
    if (data?.message) {
      return data.message;
    }
    if (data?.errors) {
      if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors.join(", ");
      if (typeof data.errors === "string") return data.errors;
    }
  }

  if (typeof error === "object" && error !== null) {
    if ("error" in error) {
      const message = readErrorMessage(
        (error as { error?: ErrorShape }).error ?? "",
      );

      if (message) {
        return message;
      }
    }

    if ("message" in error) {
      const message = readErrorMessage(error as ErrorShape);

      if (message) {
        return message;
      }
    }
  }

  return fallback;
}

export { getErrorMessage };
