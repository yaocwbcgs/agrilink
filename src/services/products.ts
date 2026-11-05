import type { Paginated, Product, ProductCategory } from '../types'
import { PRODUCTS } from '../data/products'
import { mockRequest } from './client'
import { paginate } from './listings'

export interface ProductQuery {
  category?: ProductCategory | 'all'
  keyword?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'latest' | 'price-asc' | 'price-desc' | 'sales'
  inStock?: boolean
  page?: number
  pageSize?: number
}

export function filterProducts(query: ProductQuery): Product[] {
  const { category = 'all', keyword = '', minPrice, maxPrice, sort = 'sales', inStock } = query
  const k = keyword.trim()
  return PRODUCTS.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (inStock && p.stock <= 0) return false
    if (typeof minPrice === 'number' && p.price < minPrice) return false
    if (typeof maxPrice === 'number' && p.price > maxPrice) return false
    if (k && ![p.name, p.supplier, p.spec, ...p.tags].join(' ').includes(k)) return false
    return true
  }).sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    if (sort === 'latest') return b.id.localeCompare(a.id)
    return b.sales - a.sales
  })
}

export async function fetchProducts(query: ProductQuery): Promise<Paginated<Product>> {
  return mockRequest('农资商品', () => paginate(filterProducts(query), query.page ?? 1, query.pageSize ?? 8))
}

export async function fetchProductById(id: string) {
  return mockRequest(`商品详情 ${id}`, () => {
    const found = PRODUCTS.find((p) => p.id === id)
    if (!found) throw new Error('商品不存在或已下架')
    return found
  })
}

export async function fetchRelatedProducts(id: string, limit = 4) {
  return mockRequest('相关商品', () => {
    const current = PRODUCTS.find((p) => p.id === id)
    if (!current) return []
    return PRODUCTS.filter((p) => p.id !== id && p.category === current.category).slice(0, limit)
  })
}

export function cartTotals(
  items: { productId: string; qty: number; spec: string }[],
  map: Map<string, Product>,
) {
  let count = 0
  let amount = 0
  items.forEach((item) => {
    const product = map.get(item.productId)
    if (!product) return
    count += item.qty
    amount += product.price * item.qty
  })
  const freight = amount === 0 || amount >= 500 ? 0 : 18
  return { count, amount, freight, payable: amount + freight }
}
