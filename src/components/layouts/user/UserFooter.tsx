import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = [
  { label: "Products", to: "/products" },
  { label: "Cart", to: "/cart" },
  { label: "Sign In", to: "/sign-in" },
  { label: "Sign Up", to: "/sign-up" },
];

export function UserFooter() {
  return (
    <footer className="user-section-tight border-t border-border/60 bg-background">
      <div className="user-container">
        <div className="py-8 md:py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-[26rem] flex-col gap-4">
              <Badge variant="outline" className="w-fit rounded-full px-4 py-1.5 text-[11px] tracking-[0.24em]">
                Public Experience
              </Badge>
              <h2 className="text-[28px] font-semibold tracking-[-0.055em] text-foreground">
                Shopping yang terasa lebih bersih dan langsung ke tujuan.
              </h2>
              <p className="text-[15px] leading-7 text-muted-foreground">
                Landing, produk, cart, dan auth sekarang diarahkan ke visual yang lebih ringan
                supaya user fokus ke intent belanja.
              </p>
            </div>

            <nav className="grid gap-3 text-[14px] text-muted-foreground sm:grid-cols-2 md:text-right">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-0 py-1 no-underline transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col gap-3 text-[12px] text-muted-foreground md:flex-row md:items-center md:justify-between">
            <Link
              to="/"
              className="font-medium tracking-[-0.02em] text-foreground no-underline"
            >
              Jagoan Gadget
            </Link>
            <p>&copy; {new Date().getFullYear()} Jagoan Gadget. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
