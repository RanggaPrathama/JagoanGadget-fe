import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";
import { resetAuth } from "@/features/auth/service/logout";

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={() => void resetAuth(queryClient, router)}
      className='sm:max-w-sm'
    />
  )
}