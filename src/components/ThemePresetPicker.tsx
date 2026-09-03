import { Check, Palette } from 'lucide-react'
import { useTheme } from '@/context/ThemeProvider'
import {
  THEME_PRESETS,
  THEME_PRESET_LABELS,
  THEME_PRESET_PRIMARY_COLORS,
  type ThemePreset,
} from '@/lib/theme'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/utils/cn'

type ThemePresetPickerProps = {
  className?: string
}

export function ThemePresetPicker({ className }: ThemePresetPickerProps) {
  const { themePreset, setThemePreset } = useTheme()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className={cn('size-9 rounded-full', className)}
          aria-label='Select theme preset'
        >
          <Palette className='size-4 text-primary' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-auto p-3'>
        <p className='mb-2 text-xs font-medium text-muted-foreground'>
          Theme Preset
        </p>
        <div className='grid grid-cols-4 gap-2'>
          {THEME_PRESETS.map((preset) => {
            const isActive = themePreset === preset
            return (
              <button
                key={preset}
                onClick={() => setThemePreset(preset as ThemePreset)}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors',
                  'hover:bg-muted',
                  isActive && 'bg-muted'
                )}
                aria-label={THEME_PRESET_LABELS[preset]}
              >
                <span className='relative size-7'>
                  <span
                    className={cn(
                      'absolute inset-0 rounded-full border-2 transition-colors',
                      isActive
                        ? 'border-primary'
                        : 'border-border group-hover:border-foreground/30'
                    )}
                    style={{
                      backgroundColor: THEME_PRESET_PRIMARY_COLORS[preset],
                    }}
                  />
                  {isActive ? (
                    <span className='absolute inset-0 flex items-center justify-center'>
                      <Check className='size-3.5 text-primary-foreground drop-shadow-sm' />
                    </span>
                  ) : null}
                </span>
                <span className='text-[10px] leading-tight text-muted-foreground'>
                  {THEME_PRESET_LABELS[preset]}
                </span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
