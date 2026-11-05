import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { AlertCircle, Minus, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
  counter,
}: {
  label?: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
  counter?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={htmlFor} className="text-[13px] font-medium text-forest">
            {label}
            {required && <span className="ml-1 text-[#B4452F]">*</span>}
          </label>
          {counter && <span className="font-mono text-[11px] text-muted">{counter}</span>}
        </div>
      )}
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-[12px] text-[#B4452F]">
          <AlertCircle size={12} /> {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({
  error,
  className,
  ...rest
}: { error?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('field', error && 'field-error', className)} {...rest} />
}

export function Textarea({
  error,
  className,
  ...rest
}: { error?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('field min-h-[96px] resize-y leading-relaxed', error && 'field-error', className)} {...rest} />
}

export function Select({
  error,
  className,
  children,
  ...rest
}: { error?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'field appearance-none pr-9',
          error && 'field-error',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function Checkbox({
  label,
  checked,
  onChange,
  description,
}: {
  label: ReactNode
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-ink">
      <span
        className={cn(
          'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition',
          checked ? 'border-moss bg-moss text-white' : 'border-line bg-white',
        )}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2L4.8 8.5L9.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {label}
        {description && <span className="mt-0.5 block text-[12px] text-muted">{description}</span>}
      </span>
    </label>
  )
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 9999,
  size = 'md',
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  return (
    <div className="inline-flex items-center rounded-[10px] border border-line bg-white">
      <button
        type="button"
        aria-label="减少数量"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center text-forest transition hover:bg-sand/60 disabled:opacity-35',
          dim,
        )}
      >
        <Minus size={14} />
      </button>
      <input
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value.replace(/[^\d]/g, ''))
          onChange(Number.isFinite(next) && next > 0 ? Math.min(max, next) : min)
        }}
        className="num w-12 border-x border-line bg-transparent py-1.5 text-center text-[13px] outline-none"
        aria-label="数量"
      />
      <button
        type="button"
        aria-label="增加数量"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          'flex items-center justify-center text-forest transition hover:bg-sand/60 disabled:opacity-35',
          dim,
        )}
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
