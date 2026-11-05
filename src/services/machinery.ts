import type { Machinery, MachineryCategory, Paginated, TradeMode } from '../types'
import { MACHINERY, MACHINERY_REVIEWS } from '../data/machinery'
import { mockRequest } from './client'
import { paginate } from './listings'

export interface MachineryQuery {
  category?: MachineryCategory | 'all'
  region?: string
  minPrice?: number
  maxPrice?: number
  mode?: TradeMode | 'all'
  onlyAvailable?: boolean
  sort?: 'latest' | 'price-asc' | 'price-desc' | 'rating'
  page?: number
  pageSize?: number
}

export function filterMachinery(query: MachineryQuery): Machinery[] {
  const {
    category = 'all',
    region,
    minPrice,
    maxPrice,
    mode = 'all',
    onlyAvailable,
    sort = 'latest',
  } = query
  return MACHINERY.filter((m) => {
    if (category !== 'all' && m.category !== category) return false
    if (region && region !== '全国' && !m.region.startsWith(region)) return false
    if (mode !== 'all' && !m.modes.includes(mode)) return false
    if (onlyAvailable && !m.available) return false
    if (typeof minPrice === 'number' && m.price < minPrice) return false
    if (typeof maxPrice === 'number' && m.price > maxPrice) return false
    return true
  }).sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    if (sort === 'rating') return b.rating - a.rating
    return b.orders - a.orders
  })
}

export async function fetchMachinery(query: MachineryQuery): Promise<Paginated<Machinery>> {
  return mockRequest('农机资源', () => paginate(filterMachinery(query), query.page ?? 1, query.pageSize ?? 9))
}

export async function fetchMachineryById(id: string) {
  return mockRequest(`农机详情 ${id}`, () => {
    const found = MACHINERY.find((m) => m.id === id)
    if (!found) throw new Error('农机资源不存在或已下架')
    return found
  })
}

export async function fetchMachineryReviews(id: string) {
  return mockRequest('作业评价', () => MACHINERY_REVIEWS.filter((r) => r.machineryId === id))
}

export async function fetchSimilarMachinery(id: string, limit = 3) {
  return mockRequest('相似农机', () =>
    MACHINERY.filter((m) => m.id !== id).slice(0, limit),
  )
}
