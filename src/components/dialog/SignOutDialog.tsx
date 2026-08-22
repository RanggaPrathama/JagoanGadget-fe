import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";
import { useSignOut } from "@/hooks/useAuth";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  // const queryClient = useQueryClient();
  // const router = useRouter();
  const { handleSignOut } = useSignOut();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Sign out"
      destructive
      handleConfirm={() => void handleSignOut()}
      className="sm:max-w-sm"
    />
  );
}
