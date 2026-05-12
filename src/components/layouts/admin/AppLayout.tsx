import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/LayoutProvider'
import { SearchProvider } from '@/context/SearchProvider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layouts/admin/AppSidebar'
import { SkipToMain } from '@/components/SkipToMain'
// 1. Import TooltipProvider dari shadcn
import { TooltipProvider } from '@/components/ui/tooltip' 

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  
  return (
    <SearchProvider>
      <LayoutProvider>
        <TooltipProvider delayDuration={0}> 
          <SidebarProvider defaultOpen={defaultOpen}>
            <SkipToMain />
            <AppSidebar />
            <SidebarInset
              className={cn(
                '@container/content',
                'has-data-[layout=fixed]:h-svh',
                'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
              )}
            >
              {children ?? <Outlet />}
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}