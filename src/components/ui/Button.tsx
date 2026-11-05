import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'dark' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-forest text-cream hover:bg-forest-950 border border-forest shadow-[0_10px_24px_-16px_rgba(23,61,50,0.9)]',
  secondary: 'bg-white text-forest border border-line hover:border-moss/60 hover:bg-sand/40',
  ghost: 'bg-transparent text-forest border border-transparent hover:bg-forest/[0.06]',
  accent: 'bg-clay text-[#43290C] border border-clay hover:bg-[#DE8F3C]',
  dark: 'bg-white/10 text-cream border border-white/25 backdrop-blur hover:bg-white/20',
  outline: 'bg-transparent text-cream border border-white/35 hover:bg-white/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-lg gap-1.5',
  md: 'h-11 px-5 text-[14px] rounded-[10px] gap-2',
  lg: 'h-[52px] px-6 text-[15px] rounded-xl gap-2.5',
}

interface BaseProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  className?: string
  children?: ReactNode
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  iconLeft,
  iconRight,
  className,
  children,
  block,
  disabled,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'group/btn inline-flex select-none items-center justify-center font-medium tracking-[0.01em] transition-all duration-300 ease-smooth',
        'active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  )
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  className,
  children,
  block,
}: BaseProps & { to: string }) {
  return (
    <Link
      to={to}
      className={cn(
        'group/btn inline-flex select-none items-center justify-center font-medium tracking-[0.01em] transition-all duration-300 ease-smooth',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
    >
      {iconLeft}
      {children}
      {iconRight}
    </Link>
  )
}

export function ArrowLink({
  to,
  children,
  className,
  tone = 'forest',
}: {
  to: string
  children: ReactNode
  className?: string
  tone?: 'forest' | 'cream' | 'muted'
}) {
  const color =
    tone === 'cream' ? 'text-cream/80 hover:text-cream' : tone === 'muted' ? 'text-muted hover:text-forest' : 'text-forest'
  return (
    <Link
      to={to}
      className={cn(
        'group/arrow inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.02em] transition-colors',
        color,
        className,
      )}
    >
      <span className="link-underline">{children}</span>
      <ArrowRight
        size={15}
        className="transition-transform duration-300 ease-smooth group-hover/arrow:translate-x-1"
      />
    </Link>
  )
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-forest transition-all duration-300',
        'hover:border-moss/50 hover:bg-sand/50 active:scale-95',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
