import type { Listing, ListingType, MatchScore, Paginated, ProduceCategory } from '../types'
import { SEED_LISTINGS } from '../data/listings'
import { PRODUCE_CATEGORY_LABEL } from '../lib/constants'
import { mockRequest } from './client'

export type SortKey = 'latest' | 'price-asc' | 'price-desc' | 'hot'

export interface ListingQuery {
  type?: ListingType | 'all'
  category?: ProduceCategory | 'all'
  region?: string
  keyword?: string
  minPrice?: number
  maxPrice?: number
  sort?: SortKey
  page?: number
  pageSize?: number
}

export function allListings(extra: Listing[] = []): Listing[] {
  return [...extra, ...SEED_LISTINGS]
}

function matchesKeyword(listing: Listing, keyword: string) {
  const k = keyword.trim().toLowerCase()
  if (!k) return true
  return [listing.title, listing.description, listing.company, listing.region, listing.quality ?? '']
    .join(' ')
    .toLowerCase()
    .includes(k)
}

function matchesRegion(listing: Listing, region?: string) {
  if (!region || region === '全国') return true
  return listing.region.startsWith(region)
}

export function filterListings(pool: Listing[], query: ListingQuery): Listing[] {
  const { type = 'all', category = 'all', region, keyword = '', minPrice, maxPrice, sort = 'latest' } = query
  const filtered = pool.filter((l) => {
    if (l.status !== 'active') return false
    if (type !== 'all' && l.type !== type) return false
    if (category !== 'all' && l.category !== category) return false
    if (!matchesRegion(l, region)) return false
    if (!matchesKeyword(l, keyword)) return false
    if (typeof minPrice === 'number' && l.price < minPrice) return false
    if (typeof maxPrice === 'number' && l.price > maxPrice) return false
    return true
  })

  return filtered.sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    if (sort === 'hot') return b.views - a.views
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function paginate<T>(items: T[], page = 1, pageSize = 6): Paginated<T> {
  const total = items.length
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), total, page, pageSize }
}

export async function fetchListings(query: ListingQuery, extra: Listing[] = []) {
  return mockRequest('供需信息', () => {
    const filtered = filterListings(allListings(extra), query)
    return paginate(filtered, query.page ?? 1, query.pageSize ?? 6)
  })
}

export async function fetchListingById(id: string, extra: Listing[] = []) {
  return mockRequest(`供需详情 ${id}`, () => {
    const found = allListings(extra).find((l) => l.id === id)
    if (!found) throw new Error('信息不存在或已下架')
    return found
  })
}

export async function fetchRelatedListings(listing: Listing, extra: Listing[] = [], limit = 3) {
  return mockRequest('相关供需', () =>
    allListings(extra)
      .filter((l) => l.id !== listing.id && l.status === 'active' && l.category === listing.category)
      .slice(0, limit),
  )
}

/* ----------------------------- 智能匹配 ----------------------------- */

export interface MatchCriteria {
  /** 期望找到的对方类型：我要找供应（采购视角）→ 'supply' */
  targetType: ListingType
  keyword: string
  category: ProduceCategory | 'all'
  quantity: number
  unit: string
  priceMin: number
  priceMax: number
  region: string
  deliveryDays: number
}

function regionScore(candidateRegion: string, target: string) {
  if (!target || target === '全国') return { score: 12, reason: '全国范围匹配，可跨区域调运' }
  if (candidateRegion.startsWith(target)) return { score: 20, reason: `同属${target}，物流成本低` }
  return { score: 5, reason: '跨区域货源，需评估运费与时效' }
}

function keywordScore(listing: Listing, keyword: string, category: ProduceCategory | 'all') {
  const k = keyword.trim()
  if (k && (listing.title.includes(k) || listing.description.includes(k))) {
    return { score: 35, reason: `品种关键词「${k}」命中` }
  }
  if (category !== 'all' && listing.category === category) {
    return { score: 22, reason: `同属${PRODUCE_CATEGORY_LABEL[category]}品类` }
  }
  if (!k && category === 'all') return { score: 18, reason: '品类范围开放，可进一步沟通' }
  return { score: 4, reason: '品种关联度较低' }
}

function priceScore(listing: Listing, min: number, max: number) {
  const low = listing.price
  const high = listing.priceMax ?? listing.price
  if (!min && !max) return { score: 12, reason: '未限定价格，可议价' }
  const overlap = Math.min(high, max || Number.POSITIVE_INFINITY) - Math.max(low, min || 0)
  if (overlap >= 0) return { score: 20, reason: `报价 ${low}${max ? `–${high}` : ''} 落在目标区间内` }
  const distance = Math.abs(Math.min(low, max || low) - (max || low)) / Math.max(high, 1)
  const score = Math.max(2, Math.round(20 - distance * 40))
  return { score, reason: '价格区间接近，存在议价空间' }
}

function quantityScore(listing: Listing, need: number) {
  if (!need) return { score: 9, reason: '数量可分批协商' }
  if (listing.quantity >= need) return { score: 15, reason: `可供 ${listing.quantity}${listing.unit}，满足需求量` }
  const ratio = listing.quantity / need
  return {
    score: Math.max(3, Math.round(ratio * 15)),
    reason: `可供 ${listing.quantity}${listing.unit}，约为需求的 ${Math.round(ratio * 100)}%`,
  }
}

function deliveryScore(listing: Listing, days: number) {
  const text = listing.deliveryTime ?? ''
  if (!days) return { score: 7, reason: '交期可协商' }
  const num = Number((text.match(/(\d+)\s*天/) ?? [])[1] ?? 0)
  if (text.includes('现货') || (num && num <= days)) return { score: 10, reason: `交期「${text}」满足要求` }
  if (num) return { score: 4, reason: `交期「${text}」，略晚于预期` }
  return { score: 6, reason: '交期待确认' }
}

export function scoreListing(candidate: Listing, criteria: MatchCriteria): MatchScore {
  const parts = [
    keywordScore(candidate, criteria.keyword, criteria.category),
    regionScore(candidate.region, criteria.region),
    priceScore(candidate, criteria.priceMin, criteria.priceMax),
    quantityScore(candidate, criteria.quantity),
    deliveryScore(candidate, criteria.deliveryDays),
  ]
  const score = Math.min(99, parts.reduce((sum, p) => sum + p.score, 0))
  return {
    listing: candidate,
    score,
    reasons: parts.filter((p) => p.score >= 6).map((p) => p.reason),
  }
}

export async function fetchMatches(criteria: MatchCriteria, pool: Listing[] = SEED_LISTINGS) {
  return mockRequest(
    '智能匹配',
    () =>
      pool
        .filter((l) => l.status === 'active' && l.type === criteria.targetType)
        .map((l) => scoreListing(l, criteria))
        .sort((a, b) => b.score - a.score),
    { latency: [500, 900] },
  )
}
