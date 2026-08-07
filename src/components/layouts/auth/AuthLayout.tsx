import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeProvider";

interface AuthLayoutProps {
  children: ReactNode;
  mode: "sign-in" | "sign-up";
  eyebrow: string;
  title: string;
  subtitle: string;
  asideTitle: string;
  asideBody: string;
}

const showcasePoints = [
  "Cart dan wishlist tetap sinkron.",
  "Masuk atau daftar tanpa banyak distraksi.",
];

export function AuthLayout({
  children,
  mode,
  title,
  subtitle,
  asideTitle,
  asideBody,
}: AuthLayoutProps) {
  const { resolvedTheme } = useTheme();
  return (
    <div
      data-layout="user-auth"
      className="user-shell auth-shell min-h-svh overflow-hidden"
    >
      <div className="grid min-h-svh lg:grid-cols-[2fr_1.2fr]">
        <section className="relative flex min-h-svh">
          <div className="user-container relative flex min-h-svh flex-col py-6 md:py-8">
            <Link
              to="/"
              className="absolute z-20 top-6 left-6 md:top-8 md:left-8 inline-flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground no-underline"
            >
              <span className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/70 text-[11px] font-semibold text-foreground">
                JG
              </span>
              <span>Jagoan Gadget</span>
            </Link>

            <div className="flex flex-1 items-center justify-center py-8 md:py-10">
              <div className="mx-auto max-w-[34rem]">
                <h1 className="mt-4 text-center  text-[clamp(2.1rem,4vw,3.35rem)] font-semibold leading-[1] tracking-[-0.055em] text-foreground">
                  {title}
                </h1>

                <p className="mt-3 text-center  text-[14px] leading-7 tracking-[-0.01em] text-muted-foreground">
                  {subtitle}
                </p>

                <div className="mt-5 flex w-fit items-center mx-auto rounded-full border border-border/70 bg-background/70 p-1 backdrop-blur">
                  <Button
                    asChild
                    variant={mode === "sign-in" ? "default" : "ghost"}
                    className="h-9 rounded-full px-4 text-[13px]"
                  >
                    <Link to="/sign-in">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    variant={mode === "sign-up" ? "default" : "ghost"}
                    className="h-9 rounded-full px-4 text-[13px]"
                  >
                    <Link to="/sign-up">Sign Up</Link>
                  </Button>
                </div>

                {children}
              </div>
            </div>
          </div>
        </section>

        <aside className="relative hidden overflow-hidden border-l border-border/60 lg:flex">
          <img
            src={`/images/onboarding_${resolvedTheme}.jpg`}
            alt=""
            className="absolute inset-0 size-full object-cover object-[58%_center]"
          ></img>

          <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/4 to-black/18" />

          <div className="relative z-10 flex w-full flex-col justify-between p-8 xl:p-10">
            <div className="space-y-3">
              <div className="max-w-[22rem]">
                <p className="text-[clamp(1.6rem,2.2vw,2.3rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-white">
                  {asideTitle}
                </p>
                <p className="mt-3 text-[14px] leading-7 text-white/64">
                  {asideBody}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid gap-2.5">
                {showcasePoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-[13px] leading-6 text-white/78"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
