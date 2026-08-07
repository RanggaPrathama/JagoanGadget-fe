import { useLayout } from "@/context/LayoutProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Search } from "@/components/Search";
import { useMe } from "@/hooks/useMe";
import { buildSidebarDataFromMe } from "@/utils/access-control";
import { AppTitle } from "./AppTitle";
import { NavGroup } from "./NavGroup";
import { FooterNav } from "./FooterNav";

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const { data } = useMe();
  const sidebarData = data ? buildSidebarDataFromMe(data) : null;

  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
      className="border-sidebar-border/60 bg-sidebar"
    >
      <SidebarHeader className="gap-3 px-2.5 pt-3 pb-3">
        <AppTitle />
        <Search
          iconOnly={isCollapsed}
          placeholder="Search menu..."
          className="h-10 w-full rounded-xl border border-primary/15 bg-primary/8 px-3 text-sm text-sidebar-foreground shadow-none ring-1 ring-primary/8 transition-colors hover:bg-primary/12 focus-visible:ring-primary/20"
        />
        <SidebarSeparator className="mx-0 bg-sidebar-border/60" />
      </SidebarHeader>
      <SidebarContent className="admin-scrollbar sidebar-scroll min-h-0 px-2.5 pb-3 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:pb-2">
        {(sidebarData?.navGroups ?? []).map((props, index) => (
          <NavGroup key={`${props.title}-${index}`} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className="shrink-0 px-2.5 pt-2 pb-3 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:pb-2.5">
        {sidebarData ? <FooterNav user={sidebarData.user} /> : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
