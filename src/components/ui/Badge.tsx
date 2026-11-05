import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Tone = 'neutral' | 'green' | 'amber' | 'red' | 'dark' | 'outline' | 'sage'

const tones: Record<Tone, string> = {
  neutral: 'bg-sand/80 text-ink/70 border-line',
  green: 'bg-[#E8F1E9] text-[#2C6450] border-[#C6DCCB]',
  amber: 'bg-[#FBF0DF] text-[#9A6420] border-[#EED6B2]',
  red: 'bg-[#F8E4DF] text-[#A63E28] border-[#EBC4B9]',
  dark: 'bg-forest text-cream border-forest',
  outline: 'bg-transparent text-forest border-forest/25',
  sage: 'bg-sage/15 text-[#3D6250] border-sage/30',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
  icon,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
  icon?: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] text-[11px] font-medium leading-5 tracking-[0.01em]',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted', className)}>{children}</span>
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-full bg-sage', className)} />
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-line/80', className)} />
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-clay/40 bg-clay/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#94601F]',
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-clay" />
      演示数据
    </span>
  )
}
