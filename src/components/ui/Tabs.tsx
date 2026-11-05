import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface TabItem {
  value: string
  label: ReactNode
  count?: number
  icon?: ReactNode
}

export function Tabs({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
}: {
  items: TabItem[]
  value: string
  onChange: (v: string) => void
  variant?: 'underline' | 'pill' | 'boxed'
  className?: string
}) {
  if (variant === 'pill') {
    return (
      <div className={cn('inline-flex flex-wrap items-center gap-1 rounded-full border border-line bg-white p-1', className)}>
        {items.map((item) => {
          const active = item.value === value
          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] transition-all duration-300',
                active ? 'bg-forest text-cream shadow-sm' : 'text-ink/70 hover:bg-sand/60 hover:text-forest',
              )}
            >
              {item.icon}
              {item.label}
              {typeof item.count === 'number' && (
                <span className={cn('num text-[11px]', active ? 'text-cream/70' : 'text-muted')}>{item.count}</span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'boxed') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {items.map((item) => {
          const active = item.value === value
          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={cn(
                'inline-flex items-center gap-2 rounded-[10px] border px-3.5 py-2 text-[13px] transition-all duration-300',
                active
                  ? 'border-forest bg-forest text-cream'
                  : 'border-line bg-white text-ink/75 hover:border-moss/50 hover:text-forest',
              )}
            >
              {item.icon}
              {item.label}
              {typeof item.count === 'number' && <span className="num text-[11px] opacity-70">{item.count}</span>}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('flex gap-6 overflow-x-auto border-b border-line/80 hide-scrollbar', className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative -mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 pb-3 pt-1 text-[14px] transition-colors',
              active
                ? 'border-forest font-medium text-forest'
                : 'border-transparent text-ink/60 hover:text-forest',
            )}
          >
            {item.icon}
            {item.label}
            {typeof item.count === 'number' && (
              <span className={cn('num rounded-full px-1.5 py-0.5 text-[10px]', active ? 'bg-forest/10 text-forest' : 'bg-sand text-muted')}>
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-lg bg-sand/70 p-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-[7px] font-medium transition-all duration-300',
            size === 'sm' ? 'px-2.5 py-1 text-[11.5px]' : 'px-3 py-1.5 text-[12.5px]',
            value === opt.value ? 'bg-white text-forest shadow-sm' : 'text-muted hover:text-forest',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
