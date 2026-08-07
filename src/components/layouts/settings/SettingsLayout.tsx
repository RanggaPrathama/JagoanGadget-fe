import { Outlet, Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  UserRound,
  BadgeCheck,
  Star,
  Coins,
  CreditCard,
  Heart,
  Receipt,
  BookUser,
} from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const decorativeItems = [
  { label: "Metode Pembayaran", icon: CreditCard },
  { label: "Kumpulan Review Kamu", icon: Star },
  { label: "Wishlist", icon: Heart },
  { label: "Your Orders", icon: Receipt },
  { label: "Simpan Data Penerima", icon: BookUser },
];

type SettingsBasePath = "/settings" | "/admin/settings";

type SettingsLayoutProps = {
  /** Base path segmen settings — /settings (user) atau /admin/settings (admin). */
  basePath?: SettingsBasePath;
};

export function SettingsLayout({ basePath = "/settings" }: SettingsLayoutProps) {
  const { pathname } = useLocation();
  const { data: me } = useMe();

  const navItems = [
    { to: `${basePath}/account`, label: "Profil Akun", icon: UserRound },
    { to: `${basePath}/notifications`, label: "Notifikasi", icon: Bell },
  ] as const;

  const avatarUrl = me?.user?.avatarUrl || me?.user?.image;
  const initials = me?.user?.name
    ? me.user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:flex md:flex-row md:gap-8 md:py-10">
      {/* Mobile Header and Navigation */}
      <div className="md:hidden mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Pengaturan</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Kelola pengaturan akun dan preferensi sistem Anda.
        </p>

        {/* Scrollable Pills Menu for Mobile */}
        <div className="mt-4 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-2 pb-2 border-b border-border/50">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0 border border-transparent",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
          {decorativeItems.map((item) => (
            <button
              key={item.label}
              onClick={() => toast.info(`Fitur ${item.label} segera hadir!`)}
              className="flex items-center gap-1.5 rounded-full bg-muted/60 text-muted-foreground/60 hover:text-foreground px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer border border-transparent"
            >
              <item.icon className="size-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 flex-col gap-5">
        {/* Profile Card */}
        <div className="flex flex-col gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 shadow-sm border border-border/10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold overflow-hidden border border-blue-100 dark:border-slate-700">
              {avatarUrl ? (
                <img src={avatarUrl} alt={me?.user?.name ?? "Avatar"} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm">{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate font-semibold text-foreground text-sm">
                  {me?.user?.name ?? "Memuat..."}
                </p>
                <BadgeCheck className="size-4 shrink-0 text-blue-500 fill-blue-500 text-white" />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {me?.user?.email ?? ""}
              </p>
            </div>
          </div>

          {/* Tier Badge */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 p-[1px] dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 shadow-sm">
            <div className="flex items-center justify-between rounded-[11px] bg-slate-900 px-3 py-2.5 text-white dark:bg-slate-950">
              <div className="flex items-center gap-1.5">
                <div className="rounded-full bg-white/20 p-1">
                  <Star className="size-3 fill-slate-300 text-slate-300" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide text-slate-200">
                  Tier Silver
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Member
              </span>
            </div>
          </div>

          {/* Points Row */}
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <div className="flex items-center gap-1.5">
              <Coins className="size-4 text-blue-500 fill-blue-500/20" />
              <span className="text-xs text-muted-foreground font-medium">Gadget Poin</span>
            </div>
            <span className="text-xs font-bold text-foreground">0 Poin</span>
          </div>
        </div>

        {/* Menu Navigation Card */}
        <div className="flex flex-col gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/10 shadow-sm border border-border/10">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{
                className: "bg-blue-50/80 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 font-semibold shadow-2xs border border-blue-500/10",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent",
              }}
              activeOptions={{ exact: true }}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
          
          {/* Decorative Menu Items */}
          {decorativeItems.map((item) => (
            <button
              key={item.label}
              onClick={() => toast.info(`Fitur ${item.label} segera hadir!`)}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer text-left border border-transparent"
            >
              <item.icon className="size-4" />
              <span className="flex-1 truncate">{item.label}</span>
              <span className="text-[9px] font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground/50 border border-border/50 uppercase tracking-wider shrink-0">
                Nanti
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1">
        <header className="mb-6 hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola pengaturan akun dan preferensi sistem Anda.
          </p>
        </header>
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
