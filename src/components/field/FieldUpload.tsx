import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { FileText, Loader2, UploadCloud, X, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_MIME_TYPES,
  getFileKindFromUrl,
  getFileNameFromUrl,
  IMAGE_MIME_TYPES,
  validateUploadFile,
} from "@/lib/upload";
import { uploadTempFile } from "@/features/uploads/service/upload.service";
import type { UploadPurpose } from "@/features/uploads/types";
import { getErrorMessage } from "@/utils/error";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldShell } from "./FieldShell";
import type { FieldBaseProps } from "./types";

type FieldUploadProps = FieldBaseProps & {
  name?: string;
  id?: string;
  /** Uploaded temp key (`temp/...`) — the form value. Not a viewable URL. */
  value?: string | null;
  onChange: (tempKey: string | null) => void;
  /** Existing committed file URL (e.g. edit mode). Shown until replaced/removed. */
  previewUrl?: string | null;
  /** Restrict the picker to images only or documents only. */
  kind?: "image" | "document";
  /** Presign purpose. Defaults from `kind`: image → "avatar", document → "document". */
  purpose?: UploadPurpose;
  uploadLabel?: string;
  busyLabel?: string;
};

const DEFAULT_UPLOAD_LABEL = "Klik atau tarik file ke sini untuk mengunggah";
const DEFAULT_BUSY_LABEL = "Mengunggah file...";

type PendingPreview = {
  /** Blob URL from `URL.createObjectURL` — shown while the upload is in flight. */
  url: string;
  isImage: boolean;
  /** Original file name — blob URLs have no extension, so `getFileNameFromUrl` can't read it. */
  name: string;
};

function buildAccept(kind?: "image" | "document"): string {
  if (kind === "image") return Array.from(IMAGE_MIME_TYPES).join(",");
  if (kind === "document") return Array.from(DOCUMENT_MIME_TYPES).join(",");
  return [
    ...Array.from(IMAGE_MIME_TYPES),
    ...Array.from(DOCUMENT_MIME_TYPES),
  ].join(",");
}

function FieldUpload({
  className,
  disabled = false,
  error,
  hint,
  id,
  kind,
  label,
  name,
  onChange,
  previewUrl,
  purpose,
  required = false,
  uploadLabel = DEFAULT_UPLOAD_LABEL,
  busyLabel = DEFAULT_BUSY_LABEL,
}: FieldUploadProps) {
  const autoId = React.useId();
  const fieldId = id || name || autoId;

  const [internalError, setInternalError] = React.useState<string | null>(null);
  const effectiveError = internalError ?? error;

  const [pendingPreview, setPendingPreview] =
    React.useState<PendingPreview | null>(null);

  // state preview popup
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // state drag and drop
  const [isDragging, setIsDragging] = React.useState(false);

  // Once the user picks/removes a file, the legacy `previewUrl` must not
  // reappear. Not set on pick, so an upload failure falls back to the legacy
  // avatar; set on success/remove so a tempKey/cleared value never shows it.
  const [hideLegacy, setHideLegacy] = React.useState(false);

  const resolvedPurpose: UploadPurpose =
    purpose ?? (kind === "document" ? "document" : "avatar");

  // Revoke the blob URL on every exit path: upload error, remove,
  // replacement, and unmount. React runs the cleanup after the DOM commit,
  // so the old blob URL is only revoked once the old <img> is detached.
  React.useEffect(() => {
    const url = pendingPreview?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [pendingPreview]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadTempFile(file, resolvedPurpose),
    onSuccess: (result) => {
      onChange(result.tempKey);
      // Keep the blob preview — a tempKey is not a viewable URL.
      setHideLegacy(true);
    },
    onError: (err) => {
      setInternalError(
        getErrorMessage(err, "Gagal mengunggah file. Coba lagi."),
      );
      setPendingPreview(null);
      console.log("FieldUpload: upload error", err); // eslint-disable-line no-console
    },
  });

  const isBusy = uploadMutation.isPending;

  // handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); // Wajib agar event drop bisa terpicu
    e.stopPropagation();
    if (!disabled && !isBusy) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isBusy) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateUploadFile(file);
    if (validationError) {
      setInternalError(validationError);
      return;
    }

    setInternalError(null);
    setPendingPreview({
      url: URL.createObjectURL(file),
      isImage: kind
        ? kind === "image"
        : IMAGE_MIME_TYPES.has(file.type.toLowerCase()),
      name: file.name,
    });
    uploadMutation.mutate(file);
  };

  // handle file input change event
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Always reset the input first so re-picking the same file still fires.
    event.target.value = "";
    if (!file) return;

    const validationError = validateUploadFile(file);
    if (validationError) {
      setInternalError(validationError);
      return;
    }

    setInternalError(null);
    setPendingPreview({
      url: URL.createObjectURL(file),
      isImage: kind
        ? kind === "image"
        : IMAGE_MIME_TYPES.has(file.type.toLowerCase()),
      name: file.name,
    });
    uploadMutation.mutate(file);
  }

  function handleRemove() {
    setInternalError(null);
    setPendingPreview(null);
    setHideLegacy(true);
    onChange(null);
  }

  // Display source: pending blob preview wins; otherwise fall back to the
  // legacy `previewUrl` (existing committed file, e.g. edit mode) until the
  // user replaces/removes it. `value` is a tempKey and is never an image src.
  const pendingUrl = pendingPreview?.url ?? null;
  const legacyUrl =
    !pendingUrl && previewUrl && !hideLegacy ? previewUrl : null;
  const displayUrl = pendingUrl ?? legacyUrl;
  const displayName =
    pendingPreview?.name ?? (legacyUrl ? getFileNameFromUrl(legacyUrl) : "");
  const isImagePreview = pendingPreview
    ? pendingPreview.isImage
    : legacyUrl
      ? getFileKindFromUrl(legacyUrl) === "image"
      : false;

  return (
    <FieldShell
      className={className}
      disabled={disabled}
      error={effectiveError}
      hint={hint}
      htmlFor={fieldId}
      label={label}
      required={required}
    >
      <div className="flex flex-col gap-2">
        {displayUrl ? (
          <div className="flex items-center gap-3">
            {isImagePreview ? (
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <div className="relative group cursor-pointer">
                    <img
                      src={displayUrl}
                      alt={displayName}
                      loading="lazy"
                      className="h-28 w-28 rounded-2xl border border-border object-cover transition-colors group-hover:border-accent"
                    />

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                      <Eye className="size-6 text-white" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100svh-4rem)] p-1 bg-transparent border-none shadow-none focus-visible:outline-none">
                  <div className="aspect-square flex items-center justify-center p-4">
                    <img
                      src={displayUrl}
                      alt={`${displayName} - Preview Besar`}
                      className="max-h-full max-w-full rounded-2xl object-contain shadow-xl"
                    />
                  </div>
                  <DialogHeader className="sr-only">
                    <DialogTitle>Preview Foto Profil</DialogTitle>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border bg-input/30 px-3 py-2.5">
                <FileText className="size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 break-all text-sm text-foreground">
                  {displayName || displayUrl}
                </span>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              aria-label="Hapus file"
              disabled={disabled || isBusy}
              onClick={handleRemove}
            >
              <X />
            </Button>
          </div>
        ) : null}

        <label
          htmlFor={fieldId}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed text-sm transition-colors focus-within:ring-[3px] focus-within:ring-ring/50",
            // Logika state Dragging
            isDragging
              ? "border-primary bg-primary/10 text-primary" // Warna saat file ditahan di atas area
              : "border-input bg-input/30 text-muted-foreground hover:bg-input/50 hover:text-foreground",
            // Logika Error
            effectiveError &&
              "border-destructive/60 focus-within:ring-destructive/20",
            // Logika Disabled
            (disabled || isBusy) && "pointer-events-none opacity-50",
          )}
        >
          {isBusy ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              <span>{busyLabel}</span>
            </>
          ) : (
            <>
              <UploadCloud className="size-5" aria-hidden="true" />
              <span className="px-4 text-center">{uploadLabel}</span>
            </>
          )}
        </label>

        <input
          id={fieldId}
          type="file"
          className="sr-only"
          accept={buildAccept(kind)}
          onChange={handleFileChange}
          aria-invalid={effectiveError ? true : undefined}
          aria-busy={isBusy}
          disabled={disabled || isBusy}
        />
      </div>
    </FieldShell>
  );
}

export { FieldUpload };
export type { FieldUploadProps };
