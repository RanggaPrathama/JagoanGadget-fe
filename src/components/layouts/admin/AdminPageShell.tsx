import { cn } from '@/lib/utils'
import { Header } from '@/components/layouts/admin/Header'
import { HeaderClock } from '@/components/layouts/admin/HeaderClock'
import { Main } from '@/components/layouts/admin/Main'
import { TopNav, type BreadcrumbLinkItem } from '@/components/layouts/admin/TopNav'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'

type AdminPageShellProps = {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbLinkItem[]
  headerContent?: React.ReactNode
  headerActions?: React.ReactNode
  fixed?: boolean
  fluid?: boolean
  mainClassName?: string
  notificationCount?: number
}

export function AdminPageShell({
  children,
  breadcrumbs,
  headerContent,
  headerActions,
  fixed,
  fluid,
  mainClassName,
  notificationCount = 0,
}: AdminPageShellProps) {
  return (
    <>
      <Header fixed>
        {breadcrumbs?.length ? (
          <TopNav items={breadcrumbs} className='me-auto' />
        ) : (
          <div className='me-auto' />
        )}
        {headerContent}
        <div className='flex items-center gap-2 sm:gap-3'>
          <Button
            size='icon'
            variant='outline'
            className='relative size-10 rounded-full border-border/70 bg-background/70 shadow-none'
          >
            <Bell />
            {notificationCount > 0 ? (
              <span className='absolute -end-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground'>
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            ) : null}
            <span className='sr-only'>Notifications</span>
          </Button>
          <ThemeSwitch compact />
          <HeaderClock />
          {headerActions}
        </div>
      </Header>

      <Main fixed={fixed} fluid={fluid} className={cn('flex flex-col gap-8 pt-8', mainClassName)}>
        {children}
      </Main>
    </>
  )
}
