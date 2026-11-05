import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Reveal } from './Reveal'

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="面包屑" className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted">
      <Link to="/" className="transition hover:text-forest">
        首页
      </Link>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          <ChevronRight size={11} className="opacity-50" />
          {item.to ? (
            <Link to={item.to} className="transition hover:text-forest">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
  action,
  meta,
  tone = 'cream',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  breadcrumb?: { label: string; to?: string }[]
  action?: ReactNode
  meta?: ReactNode
  tone?: 'cream' | 'forest' | 'sand'
  className?: string
}) {
  const isDark = tone === 'forest'
  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-line/70',
        tone === 'cream' && 'bg-cream',
        tone === 'sand' && 'bg-sand/60',
        isDark && 'border-transparent bg-forest text-cream',
        className,
      )}
    >
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 bg-grid opacity-[0.5]', isDark && 'opacity-[0.12]')}
        style={{ maskImage: 'radial-gradient(120% 90% at 100% 0%, black 0%, transparent 70%)' }}
      />
      <div className="shell relative py-10 lg:py-14">
        {breadcrumb && <div className={cn('mb-6', isDark && '[&_*]:text-cream/50 [&_a:hover]:text-cream')}><Breadcrumb items={breadcrumb} /></div>}
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          <Reveal className="max-w-2xl">
            {eyebrow && (
              <p className={cn('eyebrow mb-3', isDark && 'text-cream/50')}>{eyebrow}</p>
            )}
            <h1
              className={cn(
                'text-display-sm font-semibold',
                isDark ? 'text-cream' : 'text-forest',
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  'mt-4 max-w-xl text-[13.5px] leading-relaxed',
                  isDark ? 'text-cream/65' : 'text-muted',
                )}
              >
                {description}
              </p>
            )}
            {meta && <div className="mt-5">{meta}</div>}
          </Reveal>
          {action && <Reveal delay={120} className="shrink-0 lg:pt-7">{action}</Reveal>}
        </div>
      </div>
    </section>
  )
}

export function SectionHeader({
  index,
  title,
  description,
  action,
  tone = 'dark',
  className,
  align = 'left',
}: {
  index?: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  tone?: 'dark' | 'light'
  className?: string
  align?: 'left' | 'center'
}) {
  const isLight = tone === 'light'
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {index && (
          <p className={cn('eyebrow mb-2.5', isLight && 'text-cream/45')}>
            <span className={cn('mr-2 inline-block h-px w-6 align-middle', isLight ? 'bg-cream/30' : 'bg-moss/40')} />
            {index}
          </p>
        )}
        <h2 className={cn('text-section font-semibold', isLight ? 'text-cream' : 'text-forest')}>{title}</h2>
        {description && (
          <p className={cn('mt-3 text-[13px] leading-relaxed', isLight ? 'text-cream/55' : 'text-muted')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className={cn('shrink-0', align === 'center' && 'mx-auto')}>{action}</div>}
    </div>
  )
}

export function Panel({
  children,
  className,
  title,
  subtitle,
  action,
  padded = true,
}: {
  children: ReactNode
  className?: string
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  padded?: boolean
}) {
  return (
    <section className={cn('overflow-hidden rounded-panel border border-line bg-white shadow-card', className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-5 py-4">
          <div>
            {title && <h3 className="text-[15px] font-semibold text-forest">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[12px] text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn(padded && 'p-5')}>{children}</div>
    </section>
  )
}
