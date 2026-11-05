import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * 扩展 tailwind-merge 的字体尺寸分组。
 * 自定义字号（display / display-sm / section）默认会被误判为文字颜色，
 * 与 text-forest 等颜色类合并时被移除，这里显式声明避免冲突。
 */
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['2xs', 'display', 'display-sm', 'section'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs))
}

/* ----------------------------- 数字与货币 ----------------------------- */

export function fmtNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function fmtPrice(value: number, digits?: number) {
  const d = digits ?? (Number.isInteger(value) ? 0 : 1)
  return fmtNumber(value, d)
}

export function fmtCompact(value: number) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}亿`
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}万`
  return fmtNumber(value)
}

export function signed(value: number, digits = 0) {
  return `${value > 0 ? '+' : ''}${fmtNumber(value, digits)}`
}

export function pct(value: number, digits = 2) {
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`
}

/** 中国市场习惯：涨红跌绿 */
export function priceTone(value: number) {
  if (value > 0) return 'text-[#B4452F]'
  if (value < 0) return 'text-[#2C7A5B]'
  return 'text-muted'
}

export function priceBgTone(value: number) {
  if (value > 0) return 'bg-[#FBEDE8] text-[#B4452F] border-[#F0D3C9]'
  if (value < 0) return 'bg-[#E7F2EC] text-[#2C7A5B] border-[#C8DED3]'
  return 'bg-sand text-muted border-line'
}

/* ----------------------------- 时间 ----------------------------- */

const pad = (n: number) => String(n).padStart(2, '0')

export function fmtDate(input: string | Date, withTime = false) {
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return '—'
  const base = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return withTime ? `${base} ${pad(d.getHours())}:${pad(d.getMinutes())}` : base
}

export function fmtDateTimeShort(input: string) {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function relTime(input: string) {
  const d = new Date(input).getTime()
  const diff = Date.now() - d
  const min = 60 * 1000
  if (diff < min) return '刚刚'
  if (diff < 60 * min) return `${Math.floor(diff / min)} 分钟前`
  if (diff < 24 * 60 * min) return `${Math.floor(diff / (60 * min))} 小时前`
  if (diff < 7 * 24 * 60 * min) return `${Math.floor(diff / (24 * 60 * min))} 天前`
  return fmtDate(input)
}

export function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

/* ----------------------------- 通用 ----------------------------- */

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

export function hashString(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** 确定性伪随机：同一 seed 每次生成相同序列，保证演示数据稳定 */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

/* ----------------------------- 表单校验 ----------------------------- */

export const isPhone = (v: string) => /^1[3-9]\d{9}$/.test(v.trim())
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
export const isPositive = (v: string | number) => Number(v) > 0 && Number.isFinite(Number(v))
export const isPrice = (v: string | number) => Number(v) >= 0 && Number.isFinite(Number(v))
export const minLength = (v: string, n: number) => v.trim().length >= n

export interface FieldError {
  [key: string]: string
}

/* ----------------------------- 文件 ----------------------------- */

export const IMAGE_ACCEPT = ['image/jpeg', 'image/png', 'image/webp']
export const IMAGE_MAX_MB = 8

export function validateImage(file: File): string | null {
  if (!IMAGE_ACCEPT.includes(file.type)) return '仅支持 JPG / PNG / WEBP 格式'
  if (file.size > IMAGE_MAX_MB * 1024 * 1024) return `图片大小不能超过 ${IMAGE_MAX_MB}MB`
  return null
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

/* ----------------------------- 图表 ----------------------------- */

export function buildSparkline(seed: number, base: number, points = 24, volatility = 0.012) {
  const rand = mulberry32(seed)
  const arr: number[] = []
  let v = base * 0.97
  for (let i = 0; i < points; i++) {
    v = v * (1 + (rand() - 0.48) * volatility * 2)
    arr.push(Number(v.toFixed(2)))
  }
  return arr
}
