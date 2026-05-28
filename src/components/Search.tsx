import { SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
// import { useSearch } from '@/context/search-provider'
import { Button } from './ui/button'

export function Search({
  className = '',
  iconOnly = false,
  placeholder = 'Search',
  ...props
}: React.ComponentProps<'button'> & {
  iconOnly?: boolean
  placeholder?: string
}) {
//   const { setOpen } = useSearch()
  return (
    <Button
      {...props}
      variant='outline'
      className={cn(
        'group relative h-8 w-full justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none transition-colors hover:bg-accent',
        iconOnly &&
          'size-10 justify-center rounded-2xl px-0',
        className
      )}
      aria-keyshortcuts='Meta+K Control+K'
      // onClick={() => setOpen(true)}
    >
      <SearchIcon
        aria-hidden='true'
        className={cn(
          'absolute inset-s-1.5 top-1/2 -translate-y-1/2',
          iconOnly && 'static translate-y-0'
        )}
        size={16}
      />
      {!iconOnly && <span className='ms-4'>{placeholder}</span>}
      {!iconOnly && (
        <kbd className='pointer-events-none absolute inset-e-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none group-hover:bg-accent sm:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      )}
    </Button>
  )
}
