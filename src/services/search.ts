import type { Disease, Listing, Machinery, NewsArticle, Product } from '../types'
import { SEED_LISTINGS } from '../data/listings'
import { MACHINERY } from '../data/machinery'
import { PRODUCTS } from '../data/products'
import { DISEASES } from '../data/diseases'
import { NEWS } from '../data/news'
import { mockRequest } from './client'

export interface SearchGroup<T> {
  key: string
  label: string
  total: number
  items: T[]
}

export interface GlobalSearchResult {
  keyword: string
  total: number
  listings: SearchGroup<Listing>
  products: SearchGroup<Product>
  machinery: SearchGroup<Machinery>
  diseases: SearchGroup<Disease>
  news: SearchGroup<NewsArticle>
}

export const HOT_KEYWORDS = ['玉米', '条锈病', '植保无人机', '有机肥', '苹果', '稻瘟病', '烘干机', '小麦']

function hit(text: string, k: string) {
  return text.toLowerCase().includes(k)
}

export async function globalSearch(keyword: string, limit = 4): Promise<GlobalSearchResult> {
  return mockRequest(
    '全局搜索',
    () => {
      const k = keyword.trim().toLowerCase()
      if (!k) {
        return {
          keyword,
          total: 0,
          listings: { key: 'listings', label: '供需信息', total: 0, items: [] },
          products: { key: 'products', label: '农资商品', total: 0, items: [] },
          machinery: { key: 'machinery', label: '农机服务', total: 0, items: [] },
          diseases: { key: 'diseases', label: '病虫害知识', total: 0, items: [] },
          news: { key: 'news', label: '农业资讯', total: 0, items: [] },
        }
      }

      const listings = SEED_LISTINGS.filter((l) =>
        hit(`${l.title} ${l.description} ${l.company} ${l.region}`, k),
      )
      const products = PRODUCTS.filter((p) =>
        hit(`${p.name} ${p.supplier} ${p.tags.join(' ')} ${p.spec}`, k),
      )
      const machinery = MACHINERY.filter((m) =>
        hit(`${m.name} ${m.brand} ${m.region} ${m.services.join(' ')}`, k),
      )
      const diseases = DISEASES.filter((d) =>
        hit(`${d.name} ${d.alias ?? ''} ${d.tags.join(' ')} ${d.symptoms.join(' ')}`, k),
      )
      const news = NEWS.filter((n) => hit(`${n.title} ${n.summary} ${n.tags.join(' ')}`, k))

      return {
        keyword,
        total: listings.length + products.length + machinery.length + diseases.length + news.length,
        listings: { key: 'listings', label: '供需信息', total: listings.length, items: listings.slice(0, limit) },
        products: { key: 'products', label: '农资商品', total: products.length, items: products.slice(0, limit) },
        machinery: { key: 'machinery', label: '农机服务', total: machinery.length, items: machinery.slice(0, limit) },
        diseases: { key: 'diseases', label: '病虫害知识', total: diseases.length, items: diseases.slice(0, limit) },
        news: { key: 'news', label: '农业资讯', total: news.length, items: news.slice(0, limit) },
      }
    },
    { latency: [220, 420] },
  )
}

export function suggestions(keyword: string, limit = 6): string[] {
  const k = keyword.trim()
  if (!k) return []
  const pool = [
    ...SEED_LISTINGS.map((l) => l.title.split(' ').slice(0, 2).join(' ')),
    ...PRODUCTS.map((p) => p.name),
    ...MACHINERY.map((m) => m.brand),
    ...DISEASES.map((d) => d.name),
    ...NEWS.map((n) => n.title.slice(0, 12)),
  ]
  return Array.from(new Set(pool.filter((s) => s.includes(k)))).slice(0, limit)
}
