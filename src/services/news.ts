import type { NewsArticle, NewsCategory, Paginated } from '../types'
import { NEWS } from '../data/news'
import { mockRequest } from './client'
import { paginate } from './listings'

export interface NewsQuery {
  category?: NewsCategory | 'all'
  keyword?: string
  sort?: 'latest' | 'hot'
  page?: number
  pageSize?: number
}

export function filterNews(query: NewsQuery): NewsArticle[] {
  const { category = 'all', keyword = '', sort = 'latest' } = query
  const k = keyword.trim()
  return NEWS.filter((n) => {
    if (category !== 'all' && n.category !== category) return false
    if (k && ![n.title, n.summary, ...n.tags].join(' ').includes(k)) return false
    return true
  }).sort((a, b) => {
    if (sort === 'hot') return b.views - a.views
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
}

export async function fetchNews(query: NewsQuery): Promise<Paginated<NewsArticle>> {
  return mockRequest('农业资讯', () => paginate(filterNews(query), query.page ?? 1, query.pageSize ?? 6))
}

export async function fetchArticleById(id: string) {
  return mockRequest(`资讯详情 ${id}`, () => {
    const found = NEWS.find((n) => n.id === id)
    if (!found) throw new Error('文章不存在或已下线')
    return found
  })
}

export async function fetchHotNews(limit = 5) {
  return mockRequest('热门文章', () =>
    [...NEWS].sort((a, b) => b.views - a.views).slice(0, limit),
  )
}

export async function fetchRecommended(article: NewsArticle, limit = 3) {
  return mockRequest('推荐阅读', () =>
    NEWS.filter((n) => n.id !== article.id)
      .sort((a, b) => (a.category === article.category ? -1 : 1) - (b.category === article.category ? -1 : 1))
      .slice(0, limit),
  )
}
