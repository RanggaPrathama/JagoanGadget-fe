import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRightIcon, Option } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type NavChildItem,
  type NavGroup as NavGroupProps,
} from "@/types/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

/**
 * Class for a leaf nav item (no children). Solid primary fill when active, so it
 * reads as a filled bar next to group headers.
 */
const navItemClassName =
  "group h-9 w-full justify-start gap-2.5 rounded-lg border border-transparent px-3 text-left text-[0.9rem] font-medium text-sidebar-foreground/88 transition-all duration-200 hover:border-primary/15 hover:bg-primary/8 hover:text-sidebar-foreground data-[active=true]:border-primary/20 data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:shadow-[0_8px_24px_hsl(var(--primary)/0.22)] data-[state=open]:border-primary/20 data-[state=open]:bg-primary/10 data-[state=open]:text-primary group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0";

/**
 * Standalone class for sub-items (children of a group).
 * Deliberately NOT composed from `navItemClassName`: its active fill is a light
 * `bg-primary/20` tint (not solid), and twMerge cannot drop the conflicting
 * `data-[active=true]:bg-primary` rule from the base class — so it must be
 * written out on its own.
 */
const subItemClassName =
  "group h-7.5 w-full justify-start gap-2.5 rounded-lg border border-transparent px-2.5 text-left text-[0.86rem] font-medium text-sidebar-foreground/70 transition-all duration-200 hover:border-primary/15 hover:bg-primary/10 hover:text-sidebar-foreground data-[active=true]:border-primary/20 data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:shadow-none group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0";

/**
 * Class for a group header (has children). Always solid primary fill; `open`
 * and `active` add a border + glow. Children (`SidebarMenuSubButton`) use the
 * lighter `subItemClassName` so the hierarchy is readable.
 */
const groupHeaderClassName =
  "group h-9 w-full justify-start gap-2.5 rounded-lg border border-transparent px-3 text-left text-[0.9rem] font-medium text-sidebar-foreground/88 transition-all duration-200 hover:border-primary/15 hover:bg-primary/8 hover:text-sidebar-foreground data-[state=open]:border-primary/20 data-[state=open]:bg-primary data-[state=open]:text-white data-[active=true]:border-primary/20 data-[active=true]:bg-primary data-[active=true]:text-white group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0";

/** Wraps a nav icon so its SVG is always 16px regardless of the icon library. */
const railIconClassName =
  "flex size-4 shrink-0 items-center justify-center [&>svg]:size-4";

/**
 * Renders one sidebar row from a `NavGroup` descriptor.
 *
 * Two variants, chosen by `children.length`:
 *   - `children.length === 0` → a leaf nav item (`SidebarMenuLink`); skipped
 *     when `url` is missing.
 *   - `children.length > 0`   → a group header with its children below. When the
 *     sidebar is collapsed (icon-only), the group becomes a right-side dropdown
 *     so the title + children stay reachable.
 */
export function NavGroup({
  title,
  url,
  children,
  icon: groupIcon,
  badge,
}: NavGroupProps) {
  const { state, isMobile } = useSidebar();
  const href = useLocation({ select: (location) => location.href });
  const isLeaf = children.length === 0;
  const isCollapsed = state === "collapsed" && !isMobile;
  const hasActiveItem = isLeaf
    ? checkIsActive(href, { title, url: url as string })
    : children.some((child) => checkIsActive(href, child));
  const Icon = groupIcon ?? Option;

  // Controlled collapse state. Within a route the user's manual toggle wins;
  // on navigation the state is reset so the group follows the new route
  // (`open = hasActiveItem`) — closing automatically when the active child
  // leaves. The reset happens during render (React's derived-state pattern),
  // guarded so it runs only when the route actually changes.
  const routeKey = href.split("?")[0];
  const [prevRoute, setPrevRoute] = useState(routeKey);
  const [open, setOpen] = useState(hasActiveItem);
  const [userToggled, setUserToggled] = useState(false);

  if (prevRoute !== routeKey) {
    setPrevRoute(routeKey);
    setUserToggled(false);
    setOpen(hasActiveItem);
  }

  const openResolved = userToggled ? open : hasActiveItem;
  const handleOpenChange = (next: boolean) => {
    setUserToggled(true);
    setOpen(next);
  };

  if (isLeaf) {
    if (!url) return null;
    return (
      <SidebarGroup className="gap-1.5 px-1.5 py-0.5 group-data-[collapsible=icon]:px-0.5 group-data-[collapsible=icon]:py-0.5">
        <SidebarMenu className="gap-1 pl-0.5 pr-0 pb-0 group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:pl-0 group-data-[collapsible=icon]:pr-0 group-data-[collapsible=icon]:pb-0">
          <SidebarMenuLink
            item={{ title, url, icon: groupIcon, badge }}
            href={href}
          />
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  if (isCollapsed) {
    return (
      <SidebarGroup className="gap-1.5 px-1.5 py-0.5 group-data-[collapsible=icon]:px-0.5 group-data-[collapsible=icon]:py-0.5">
        <SidebarMenu className="gap-1 pl-0.5 pr-0 pb-0 group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:pl-0 group-data-[collapsible=icon]:pr-0 group-data-[collapsible=icon]:pb-0">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip={title}
                  isActive={hasActiveItem}
                  className={cn(navItemClassName, "px-0")}
                >
                  <span className={railIconClassName}>
                    <Icon />
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" sideOffset={4}>
                <DropdownMenuLabel>
                  {title} {badge ? `(${badge})` : ""}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {children.map((child) => (
                  <DropdownMenuItem key={`${child.title}-${child.url}`} asChild>
                    <Link
                      to={child.url}
                      preload={false}
                      className={checkIsActive(href, child) ? "bg-primary" : ""}
                    >
                      {child.icon && <child.icon />}
                      <span className="max-w-52 text-wrap">{child.title}</span>
                      {child.badge && (
                        <span className="ms-auto text-xs">{child.badge}</span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible
      open={openResolved}
      onOpenChange={handleOpenChange}
      className="group/sidebar-section"
    >
      <SidebarGroup className="gap-1.5 px-1.5 py-0.5 group-data-[collapsible=icon]:px-0.5 group-data-[collapsible=icon]:py-0.5">
        <div className="relative flex items-center">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={groupHeaderClassName}
              data-active={hasActiveItem}
            >
              <span className={railIconClassName}>
                <Icon className="text-sidebar-foreground/72 group-data-[state=open]:text-white group-data-[active=true]:text-white" />
              </span>
              <span className="truncate tracking-[0.01em] group-data-[state=open]:text-white group-data-[active=true]:text-white group-data-[collapsible=icon]:hidden">
                {title}
              </span>
              <ChevronRightIcon className="ms-auto size-4 shrink-0 text-sidebar-foreground/55 transition-transform duration-200 group-data-[state=open]:rotate-90 group-data-[state=open]:text-white group-data-[active=true]:text-white group-data-[collapsible=icon]:hidden" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-0.5 group-data-[collapsible=icon]:pt-0">
          <SidebarGroupContent>
            <SidebarMenuSub className="ms-2.5 gap-1 py-1.5 group-data-[collapsible=icon]:hidden">
              {children.map((child) => (
                <SidebarMenuSubItem key={child.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={checkIsActive(href, child)}
                    className={cn(subItemClassName, "[&>svg]:text-current")}
                  >
                    <Link to={child.url} preload={false}>
                      {child.icon && <child.icon />}
                      <span>{child.title}</span>
                      {child.badge && <NavBadge>{child.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

/** Small primary-colored pill on a nav item (e.g. a count or status label). */
function NavBadge({ children }: { children: ReactNode }) {
  return (
    <Badge className="rounded-full border-primary/15 bg-primary/12 px-1.5 py-0 text-[10px] text-primary shadow-none">
      {children}
    </Badge>
  );
}

/** Renders a leaf nav item as a plain route link. */
function SidebarMenuLink({ item, href }: { item: NavChildItem; href: string }) {
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon ?? Option;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
        className={navItemClassName}
      >
        <Link
          to={item.url}
          preload={false}
          onClick={() => setOpenMobile(false)}
        >
          <Icon className="data-[active=true]:text-primary-foreground" />
          <span className="group-data-[collapsible=icon]:hidden">
            {item.title}
          </span>
          {item.badge && (
            <span className="group-data-[collapsible=icon]:hidden">
              <NavBadge>{item.badge}</NavBadge>
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/**
 * Determines whether a nav row matches the current route.
 * - Exact match on `href` and on the query-stripped `href`.
 * - Prefix match (`/admin/setup/menu/create` matches `/admin/setup/menu/`),
 *   skipped for root `/admin` so it does not match every admin sub-route.
 */
function checkIsActive(href: string, item: NavChildItem) {
  const isRootAdmin = item.url === "/admin";

  return (
    href === item.url ||
    href.split("?")[0] === item.url ||
    (!isRootAdmin && !!item.url && href.startsWith(item.url + "/"))
  );
}
