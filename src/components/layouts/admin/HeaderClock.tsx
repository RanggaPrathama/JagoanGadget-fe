import { useEffect, useState } from 'react'
import { CalendarDays, Clock3 } from 'lucide-react'

type ClockState = {
  dayLabel: string
  timeLabel: string
}

function formatClock(date: Date): ClockState {
  return {
    dayLabel: new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
    }).format(date),
    timeLabel: new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date),
  }
}

export function HeaderClock() {
  const [clock, setClock] = useState<ClockState>(() => formatClock(new Date()))

  useEffect(() => {
    const updateClock = () => setClock(formatClock(new Date()))

    updateClock()
    const interval = window.setInterval(updateClock, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className='hidden h-10 items-center gap-3 rounded-full border border-border/70 bg-background/70 px-4 text-sm md:flex'>
      <div className='flex items-center gap-2 text-muted-foreground'>
        <CalendarDays className='size-4' />
        <span className='capitalize'>{clock.dayLabel}</span>
      </div>
      <div className='h-4 w-px bg-border/70' />
      <div className='flex items-center gap-2 font-medium text-foreground'>
        <Clock3 className='size-4 text-muted-foreground' />
        <span>{clock.timeLabel}</span>
      </div>
    </div>
  )
}
