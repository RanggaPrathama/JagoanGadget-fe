import { useLayout } from "@/context/LayoutProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Search } from "@/components/Search";
import { useMe } from "@/hooks/useMe";
import { buildSidebarDataFromMe } from "@/utils/access-control";
import { Skeleton } from "@/components/ui/skeleton";
import { AppTitle } from "./AppTitle";
import { NavGroup } from "./NavGroup";
import { FooterNav } from "./FooterNav";
import { StaggerItem } from "@/components/motion";

/** Placeholder rows mirroring NavGroup's row height (h-9) + icon (size-4). */
function SidebarNavSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 px-1.5 py-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex h-9 items-center gap-2.5 rounded-lg px-3">
          <Skeleton className="size-4 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function SidebarFooterSkeleton() {
  return (
    <div className="flex h-11 items-center gap-2.5 rounded-xl px-2.5">
      <Skeleton className="size-8 rounded-xl ring-1 ring-sidebar-border/60" />
      <div className="grid flex-1 gap-1.5">
        <Skeleton className="h-3.5 w-28 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-md" />
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const { data, isLoading } = useMe();
  const sidebarData = data ? buildSidebarDataFromMe(data) : null;
  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
      className="border-sidebar-border/60 bg-sidebar h-full flex flex-col overflow-hidden"
    >
      <SidebarHeader className="gap-3 px-2.5 pt-3 pb-3">
        <AppTitle
          roles={data?.accessControl.roles ?? []}
          isSuperadmin={data?.user.isSuperadmin ?? false}
          isLoading={isLoading}
        />
        <Search
          iconOnly={isCollapsed}
          placeholder="Search menu..."
          className={
            isCollapsed
              ? "size-10 rounded-2xl border-sidebar-border/60 bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
              : "h-9 w-full rounded-xl border-sidebar-border/60 bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
          }
        />
        <SidebarSeparator className="mx-0 bg-sidebar-border/60" />
      </SidebarHeader>
      <div className="flex-1 min-h-0  admin-scrollbar sidebar-scroll overflow-y-auto">
        <SidebarContent className="pb-3 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:pb-2 ">
          <SidebarGroup className="gap-1 px-1  py-0.5 group-data-[collapsible=icon]:px-0.5 group-data-[collapsible=icon]:py-0.5">
            <SidebarGroupLabel className="px-1.5 text-sm  tracking-tight text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
              Menu
            </SidebarGroupLabel>
            {isLoading || !sidebarData ? (
              <SidebarNavSkeleton />
            ) : (
              sidebarData.navGroups.map((props, index) => (
                <StaggerItem
                  key={`${props.title}-${index}`}
                  index={index}
                  inView={false}
                  className="group-data-[collapsible=icon]:contents"
                >
                  <NavGroup {...props} />
                </StaggerItem>
              ))
            )}
          </SidebarGroup>
        </SidebarContent>
      </div>
      <SidebarFooter className="shrink-0 px-2.5 pt-2 pb-3 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:pb-2.5">
        {sidebarData ? (
          <FooterNav user={sidebarData.user} />
        ) : (
          <SidebarFooterSkeleton />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
