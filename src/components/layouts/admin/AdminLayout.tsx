import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCookie } from "@/lib/cookies";
import { cn } from "@/utils/cn";
import { LayoutProvider } from "@/context/LayoutProvider";
import { SearchProvider } from "@/context/SearchProvider";
import { CommandMenu } from "@/components/CommandMenu";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/admin/AppSidebar";
import { SkipToMain } from "@/components/SkipToMain";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "./Header";
import { HeaderClock } from "./HeaderClock";
import { Main } from "./Main";
import { TopNav, type BreadcrumbLinkItem } from "./TopNav";
import { ModeSwitch } from "@/components/ModeSwitch";
import { ThemePresetPicker } from "@/components/ThemePresetPicker";
import { useThemeMetaColor } from "@/hooks/useThemeMetaColor";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useAutoBreadcrumbs } from "@/hooks/useAutoBreadcrumbs";

type AdminLayoutProps = {
  children?: React.ReactNode;
  breadcrumbs?: BreadcrumbLinkItem[];
  headerContent?: React.ReactNode;
  headerActions?: React.ReactNode;
  fixed?: boolean;
  fluid?: boolean;
  notificationCount?: number;
};

/**
 * Unified admin layout combining sidebar + header + main content
 * Replaces: AuthenticatedLayout (sidebar shell) + AdminPageShell (header+main)
 * Breadcrumbs auto-generated from route via useAutoBreadcrumbs hook
 */
export function AdminLayout({
  children,
  breadcrumbs,
  headerContent,
  headerActions,
  fixed = true,
  fluid = false,
  notificationCount = 0,
}: AdminLayoutProps) {
  const autoBreadcrumbs = useAutoBreadcrumbs();
  const finalBreadcrumbs = breadcrumbs ?? autoBreadcrumbs;
  const defaultOpen = getCookie("sidebar_state") !== "false";
  useThemeMetaColor();

  useEffect(() => {
    const { body, documentElement } = document;
    const root = document.getElementById("root");

    const previous = {
      htmlOverflow: documentElement.style.overflow,
      htmlHeight: documentElement.style.height,
      htmlOverscroll: documentElement.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyOverscroll: body.style.overscrollBehavior,
      rootOverflow: root?.style.overflow ?? "",
      rootHeight: root?.style.height ?? "",
    };

    documentElement.style.overflow = "hidden";
    documentElement.style.height = "100dvh";
    documentElement.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.height = "100dvh";
    body.style.overscrollBehavior = "none";

    if (root) {
      root.style.overflow = "hidden";
      root.style.height = "100dvh";
    }

    return () => {
      documentElement.style.overflow = previous.htmlOverflow;
      documentElement.style.height = previous.htmlHeight;
      documentElement.style.overscrollBehavior = previous.htmlOverscroll;
      body.style.overflow = previous.bodyOverflow;
      body.style.height = previous.bodyHeight;
      body.style.overscrollBehavior = previous.bodyOverscroll;

      if (root) {
        root.style.overflow = previous.rootOverflow;
        root.style.height = previous.rootHeight;
      }
    };
  }, []);

  return (
    <SearchProvider>
      <LayoutProvider>
        <TooltipProvider delayDuration={0}>
          <SidebarProvider
            defaultOpen={defaultOpen}
            data-layout="admin"
            className="h-svh overflow-hidden overscroll-none"
          >
            <SkipToMain />
            <AppSidebar />
            <SidebarInset
              className={cn(
                "@container/content min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden",
                fixed && "h-svh",
              )}
            >
              <Header fixed>
                {finalBreadcrumbs.length ? (
                  <TopNav items={finalBreadcrumbs} className="me-auto" />
                ) : (
                  <div className="me-auto" />
                )}
                {headerContent}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    className="relative size-10 rounded-full border-border/70 bg-background/70 shadow-none"
                  >
                    <Bell />
                    {notificationCount > 0 ? (
                      <span className="absolute -end-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    ) : null}
                    <span className="sr-only">Notifications</span>
                  </Button>
                  <ModeSwitch />
                  <ThemePresetPicker />
                  <HeaderClock />
                  {headerActions}
                </div>
              </Header>

              <Main fixed={fixed} fluid={fluid}>
                {children ?? <Outlet />}
              </Main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </LayoutProvider>
      {/* Command palette mounted once for the whole admin shell. */}
      <CommandMenu />
    </SearchProvider>
  );
}
