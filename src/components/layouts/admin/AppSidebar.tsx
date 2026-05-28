import { useLayout } from '@/context/LayoutProvider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Search } from '@/components/Search'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './NavGroup'
import { NavUser } from './NavUser'
import { TeamSwitcher } from './TeamSwitcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === 'collapsed' && !isMobile

  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
      className='border-sidebar-border/60 bg-sidebar'
    >
      <SidebarHeader className='gap-3 px-2 pt-2'>
        <TeamSwitcher teams={sidebarData.teams} />
        <Search
          iconOnly={isCollapsed}
          placeholder='Search menu...'
          className='h-11 w-full rounded-2xl border-sidebar-border/60 bg-sidebar-accent/35 px-3 text-sidebar-foreground shadow-none hover:bg-sidebar-accent/55'
        />
        <SidebarSeparator className='mx-0 bg-sidebar-border/60' />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent className='sidebar-scroll px-2 pb-2'>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className='px-2 pb-2'>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
