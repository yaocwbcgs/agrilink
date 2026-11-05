import type { ProductGlyph } from '../../types'
import { Cog, Droplets, Layers3, Package, SprayCan, Sprout, Wrench } from 'lucide-react'
import { cn } from '../../lib/utils'

const GLYPHS = {
  seed: {
    icon: Sprout,
    label: 'SEED',
    bg: 'from-[#E4EDDA] via-[#DCE8CE] to-[#C9DCBB]',
    ink: '#2C5F49',
    shape: 'sack',
  },
  fertilizer: {
    icon: Package,
    label: 'FERTILIZER',
    bg: 'from-[#F5EBD5] via-[#EFE1C6] to-[#E2D0AE]',
    ink: '#7A5A2E',
    shape: 'sack',
  },
  spray: {
    icon: SprayCan,
    label: 'CROP CARE',
    bg: 'from-[#E5EFE6] via-[#D8E7DB] to-[#C4DACB]',
    ink: '#2F6350',
    shape: 'bottle',
  },
  film: {
    icon: Layers3,
    label: 'MULCH FILM',
    bg: 'from-[#F1EDE1] via-[#E9E2D0] to-[#DBD2BC]',
    ink: '#5C6152',
    shape: 'roll',
  },
  equipment: {
    icon: Cog,
    label: 'EQUIPMENT',
    bg: 'from-[#E9EDE4] via-[#DDE3D6] to-[#CBD5C6]',
    ink: '#40564A',
    shape: 'panel',
  },
  irrigation: {
    icon: Droplets,
    label: 'IRRIGATION',
    bg: 'from-[#E4EFF1] via-[#D6E7EA] to-[#BFD8DC]',
    ink: '#2F5E63',
    shape: 'bottle',
  },
  tool: {
    icon: Wrench,
    label: 'TOOLS',
    bg: 'from-[#F3ECDD] via-[#EAE0CB] to-[#DBD0B8]',
    ink: '#6B573C',
    shape: 'panel',
  },
} as const

function PackageShape({ kind, ink }: { kind: string; ink: string }) {
  const fill = ink
  const stroke = ink
  const common = { fill, fillOpacity: 0.1, stroke, strokeWidth: 1.1, strokeOpacity: 0.5 }

  if (kind === 'sack') {
    return (
      <g>
        <path d="M28 34h44l6 66c-9 5-47 5-56 0z" {...common} />
        <path d="M28 34c6-4 40-4 44 0" fill="none" stroke={stroke} strokeOpacity="0.42" strokeWidth="1" />
        <path d="M36 34l3-8h22l3 8" fill={stroke} fillOpacity="0.07" stroke={stroke} strokeOpacity="0.4" strokeWidth="1" />
        <path d="M38 58h24" stroke={stroke} strokeOpacity="0.26" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M40 67h20" stroke={stroke} strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    )
  }
  if (kind === 'bottle') {
    return (
      <g>
        <rect x="34" y="26" width="32" height="10" rx="2" fill={stroke} fillOpacity="0.07" stroke={stroke} strokeOpacity="0.4" strokeWidth="1" />
        <path d="M38 36h24v58a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6z" {...common} />
        <rect x="44" y="52" width="12" height="26" rx="2" fill="none" stroke={stroke} strokeOpacity="0.3" strokeWidth="1" />
      </g>
    )
  }
  if (kind === 'roll') {
    return (
      <g>
        <circle cx="50" cy="52" r="22" {...common} />
        <circle cx="50" cy="52" r="7" fill={stroke} fillOpacity="0.06" stroke={stroke} strokeOpacity="0.3" strokeWidth="1" />
        <path d="M50 74v26h26V74" fill={stroke} fillOpacity="0.07" stroke={stroke} strokeOpacity="0.42" strokeWidth="1" />
      </g>
    )
  }
  return (
    <g>
      <rect x="26" y="32" width="48" height="60" rx="6" {...common} />
      <path d="M26 48h48" stroke={stroke} strokeOpacity="0.3" strokeWidth="1" />
      <rect x="36" y="58" width="28" height="18" rx="3" fill="none" stroke={stroke} strokeOpacity="0.28" strokeWidth="1" />
    </g>
  )
}

/**
 * 农资商品视觉：品牌化「包装 + 图元」组合，
 * 保证列表与详情风格统一（生产环境可替换为商品主图）
 */
export function ProductVisual({
  glyph,
  className,
  size = 'md',
  index,
  showLabel = true,
}: {
  glyph: ProductGlyph
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  index?: string
  showLabel?: boolean
}) {
  const config = GLYPHS[glyph]
  const Icon = config.icon
  const iconSize = { xs: 15, sm: 22, md: 42, lg: 58 }[size]
  const pad = size === 'lg' ? 'inset-3' : size === 'md' ? 'inset-2' : 'inset-1'
  const isLarge = size === 'lg' || size === 'md'

  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden bg-gradient-to-br', config.bg, className)}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(23,61,50,0.16) 1px, transparent 0)',
          backgroundSize: size === 'xs' ? '7px 7px' : '13px 13px',
          opacity: 0.5,
          maskImage: 'radial-gradient(120% 100% at 50% 0%, black 15%, transparent 82%)',
        }}
      />
      <div aria-hidden className={cn('pointer-events-none absolute rounded-[10px] border border-white/50', pad)} />
      <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <circle cx="86" cy="12" r="20" stroke={config.ink} strokeOpacity="0.1" strokeWidth="0.6" fill="none" />
        <circle cx="86" cy="12" r="30" stroke={config.ink} strokeOpacity="0.06" strokeWidth="0.6" fill="none" />
        <path d="M-10 94 C 24 76, 60 106, 112 80" stroke={config.ink} strokeOpacity="0.12" strokeWidth="0.6" fill="none" />
      </svg>

      {size !== 'xs' && (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className={cn('absolute', size === 'lg' ? 'h-[74%] w-[58%]' : size === 'md' ? 'h-[70%] w-[54%]' : 'h-[62%] w-[48%]')}
          style={{ filter: 'drop-shadow(0 6px 10px rgba(23,61,50,0.10))' }}
        >
          <PackageShape kind={config.shape} ink={config.ink} />
        </svg>
      )}

      <div className={cn('relative z-[1] flex flex-col items-center', isLarge ? '' : '')}>
        <Icon size={iconSize} strokeWidth={1.15} style={{ color: config.ink }} />
      </div>

      {isLarge && showLabel && (
        <span
          className={cn(
            'absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-[5px] border border-white/70 bg-white/60 px-2 py-[3px] font-mono uppercase tracking-[0.18em] backdrop-blur-sm',
            size === 'lg' ? 'text-[8.5px]' : 'text-[7.5px]',
          )}
          style={{ color: config.ink }}
        >
          {config.label}
        </span>
      )}

      {showLabel && !isLarge && size !== 'xs' && (
        <span
          className="absolute bottom-1.5 left-2 font-mono text-[7px] uppercase tracking-[0.16em]"
          style={{ color: config.ink, opacity: 0.5 }}
        >
          {config.label}
        </span>
      )}
      {index && (
        <span
          className="num absolute right-3 top-2.5 font-mono text-[9px] tracking-[0.1em]"
          style={{ color: config.ink, opacity: 0.4 }}
        >
          {index}
        </span>
      )}
    </div>
  )
}

export const GLYPH_LABEL = Object.fromEntries(
  Object.entries(GLYPHS).map(([key, val]) => [key, val.label]),
) as Record<ProductGlyph, string>
