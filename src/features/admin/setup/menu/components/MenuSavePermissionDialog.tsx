import { useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

type MenuSavePermissionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Menu display name, used to suggest a default permission name in the placeholder. */
  menuName?: string;
  /** True while the underlying menu create/update mutation is in flight. */
  isLoading?: boolean;
  /** User confirmed and provided a permission name (already trimmed). */
  onConfirm: (permissionName: string) => void;
  /** User chose to skip permission creation. */
  onSkip: () => void;
};

export function MenuSavePermissionDialog({
  open,
  onOpenChange,
  menuName,
  isLoading = false,
  onConfirm,
  onSkip,
}: MenuSavePermissionDialogProps) {
  const [permissionName, setPermissionName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const canConfirm = permissionName.trim().length > 0 && !isLoading;

  const placeholder = menuName
    ? `Misal: Kelola ${menuName}`
    : "Misal: Kelola Dashboard";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setPermissionName("");
        if (!isLoading) onOpenChange(next);
      }}
    >
      <DialogContent className="gap-5 p-6 sm:max-w-md">
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-2xl",
                "bg-primary/10 text-primary ring-1 ring-primary/15",
                "transition-transform duration-200 ease-out",
                open && "scale-100",
              )}
              aria-hidden
            >
              <ShieldCheck className="size-5" strokeWidth={2} />
            </span>
            <div className="space-y-1">
              <DialogTitle className="text-base">
                Buat permission untuk menu ini?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Menu berhasil divalidasi. Sekaligus buatkan permission agar menu
                ini bisa dikontrol aksesnya. Kosongkan jika tidak diperlukan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="menu-permission-name"
            className="text-sm font-medium text-foreground"
          >
            Nama Permission
            <span className="ml-1 text-muted-foreground">(opsional)</span>
          </label>
          <Input
            id="menu-permission-name"
            ref={inputRef}
            autoFocus
            value={permissionName}
            disabled={isLoading}
            placeholder={placeholder}
            onChange={(event) => setPermissionName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canConfirm) {
                event.preventDefault();
                onConfirm(permissionName.trim());
              }
            }}
            aria-describedby="menu-permission-hint"
          />
          <p
            id="menu-permission-hint"
            className="text-xs text-muted-foreground"
          >
            Backend akan men-generate code permission otomatis dari nama ini.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={isLoading}
            onClick={() => {
              setPermissionName("");
              onSkip();
            }}
          >
            Lewati
          </Button>
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm(permissionName.trim())}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Simpan &amp; Buat Permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
