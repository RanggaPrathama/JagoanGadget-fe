import { Link } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppTitle() {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="h-auto rounded-xl border border-primary/15 bg-gradient-to-br from-primary/14 via-primary/8 to-transparent px-2.5 py-2.5 hover:bg-primary/10 active:bg-primary/12 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0"
          asChild
        >
          <div className="flex min-w-0 items-center gap-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
            <Link
              to="/admin"
              onClick={() => setOpenMobile(false)}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-start group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30">
                <LayoutDashboard className="size-4.5" />
              </div>
              <div className="grid min-w-0 flex-1 text-start leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-[0.82rem] font-bold tracking-[0.1em] text-sidebar-foreground uppercase">
                  Jagoan Gadget
                </span>
                <span className="truncate text-[11px] text-sidebar-foreground/60">
                  Admin Dashboard
                </span>
              </div>
            </Link>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
