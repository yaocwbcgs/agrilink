import type { ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'
import { cn } from '../../lib/utils'

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
  y = 16,
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li'
  y?: number
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <Tag
      ref={ref as never}
      className={cn(
        'transition-all duration-[750ms] ease-smooth will-change-transform',
        inView ? 'translate-y-0 opacity-100' : 'opacity-0',
        className,
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transform: inView ? undefined : `translateY(${y}px)`,
      }}
    >
      {children}
    </Tag>
  )
}
