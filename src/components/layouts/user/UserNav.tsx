import { Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Gem,
  LayoutGrid,
  LogOut,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
const navItems = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
] as const;

function getUserInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "A";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function UserNav() {
  const { isAuthenticated, isLoading, user, accessControl, handleSignOut } = useAuth();

  const initials = getUserInitials(user?.name, user?.email);
  const accountLabel = user?.name || user?.email || "Account";
  const canAccessAdmin = Boolean(accessControl?.canAccessAdmin);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 rounded-[1.75rem] border border-border/60 bg-background/80 px-3 text-foreground shadow-[0_22px_80px_rgba(15,23,42,0.16)] backdrop-blur-2xl md:h-18 md:px-5">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <Gem className="size-5" />
          </span>
          <span className="hidden min-w-0 flex-col leading-none sm:flex">
            <span className="truncate text-sm font-black tracking-wide">
              Jagoan Gadget
            </span>
            <span className="mt-1 truncate text-xs font-medium text-muted-foreground">
              Curated tech store
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-2xl bg-muted/60 p-1 lg:flex">
          {navItems.map((item) => (
            <Button
              key={item.to}
              asChild
              variant="ghost"
              size="sm"
              className="rounded-xl px-4 font-semibold text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <Link
                to={item.to}
                activeProps={{
                  className:
                    "bg-background text-foreground shadow-sm shadow-foreground/5",
                }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="hidden min-w-48 flex-1 items-center justify-center md:flex">
          <label className="group flex h-11 w-full max-w-md items-center gap-3 rounded-2xl border border-border/70 bg-muted/45 px-4 text-sm text-muted-foreground transition-colors focus-within:border-primary/40 focus-within:bg-background">
            <Search className="size-4 shrink-0 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search phones, laptops, accessories"
              className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Badge
              variant="outline"
              className="hidden text-[10px] lg:inline-flex"
            >
              Ctrl K
            </Badge>
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="rounded-2xl md:hidden"
          >
            <Search />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Categories"
            className="hidden rounded-2xl sm:inline-flex lg:hidden"
          >
            <LayoutGrid />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="hidden rounded-2xl sm:inline-flex"
          >
            <Bell />
          </Button>

          <Button
            asChild
            variant="outline"
            size="icon"
            className="relative rounded-2xl"
          >
            <Link to="/cart" aria-label="Cart">
              <ShoppingCart />
              <Badge className="absolute -right-1 -top-1 size-5 px-0 text-[10px]">
                2
              </Badge>
            </Link>
          </Button>

          {!isLoading && !isAuthenticated ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                asChild
                variant="ghost"
                className="rounded-2xl px-5 font-bold"
              >
                <Link to="/sign-up">Sign Up</Link>
              </Button>

              <Button asChild className="rounded-2xl px-4">
                <Link to="/sign-in">Sign In</Link>
              </Button>
            </div>
          ) : null}

          {!isLoading && isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-12 rounded-2xl px-2 pr-3 hover:bg-muted"
                  aria-label={accountLabel}
                >
                  <Avatar size="lg" className="rounded-2xl">
                    <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">
                    {accountLabel}
                  </span>
                  <ChevronDown className="hidden text-muted-foreground md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-64">
                <DropdownMenuLabel className="p-2">
                  <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-2">
                    <Avatar size="lg" className="rounded-2xl">
                      <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {accountLabel}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user?.email || "Member account"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/settings/account">
                      <CircleUserRound />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/products">
                      <Sparkles />
                      Explore Products
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/cart">
                      <ShoppingBag />
                      Shopping Cart
                    </Link>
                  </DropdownMenuItem>
                  {canAccessAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    onClick={() => handleSignOut()}
                    className="cursor-pointer"
                  >
                    <LogOut />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

export default UserNav;
