import { useMe } from "@/hooks/useMe";
import { FieldSwitch } from "@/components/field/FieldSwitch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isStaff } from "../lib/role";
import { useNotificationPreferences } from "../hooks/useNotificationPreferences";
import { useUpdateNotificationPreferences } from "../hooks/useUpdateNotificationPreferences";

function NotificationRowSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-52" />
      <Skeleton className="h-3.5 w-80 max-w-full" />
    </div>
  );
}

export function NotificationsView() {
  const { data: me } = useMe();
  const { data: prefs, isLoading } = useNotificationPreferences();
  const { mutate } = useUpdateNotificationPreferences();

  const staff = isStaff(me);

  if (isLoading || !prefs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferensi Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <NotificationRowSkeleton />
          <NotificationRowSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10 lg:space-y-7 lg:pb-14">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Preferensi Notifikasi
        </h2>
      </div>

      <Card className="overflow-hidden border border-border/10 shadow-sm rounded-2xl p-0 gap-0">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
          <CardTitle className="text-base">Preferensi Notifikasi</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Pilih jenis komunikasi yang ingin kamu terima dari Jagoan Gadget.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-5 py-5 sm:px-7 sm:py-7">
          <FieldSwitch
            label="Aktivitas Akun &amp; Transaksi"
            hint="Pembaruan mengenai status pesanan, perubahan sandi, dan aktivitas keamanan."
            checked
            disabled
            onCheckedChange={() => {}}
            switchLabel="Aktif"
          />

          {staff ? (
            <FieldSwitch
              label="Pembaruan Sistem &amp; Laporan"
              hint="Notifikasi mengenai downtime, ringkasan laporan mingguan, atau aktivitas operasional."
              checked={prefs.systemUpdates}
              onCheckedChange={(value) =>
                mutate({ ...prefs, systemUpdates: value })
              }
              switchLabel={prefs.systemUpdates ? "Aktif" : "Non-Aktif"}
            />
          ) : (
            <FieldSwitch
              label="Promo dan Penawaran Spesial"
              hint="Dapatkan email tentang diskon, produk baru, dan acara eksklusif."
              checked={prefs.promos}
              onCheckedChange={(value) => mutate({ ...prefs, promos: value })}
              switchLabel={prefs.promos ? "Aktif" : "Non-Aktif"}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
