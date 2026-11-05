import type { PriceRange } from '../types'
import { COMMODITIES, COMMODITY_MAP, getRegionPrices, getSeries } from '../data/commodities'
import { mockRequest } from './client'

export async function fetchCommoditySeries(id: string, range: PriceRange) {
  return mockRequest('行情走势', () => getSeries(id, range), { latency: [320, 720], failRate: 0.02 })
}

export async function fetchCommodity(id: string) {
  return mockRequest('品种行情', () => {
    const found = COMMODITY_MAP.get(id)
    if (!found) throw new Error('品种不存在')
    return found
  })
}

export async function fetchRegionPrices(id: string) {
  return mockRequest('区域价格', () => getRegionPrices(id))
}

export async function fetchMarketRanking() {
  return mockRequest('市场价格排行', () => [...COMMODITIES].sort((a, b) => b.changePct - a.changePct))
}

/** 首页行情条需要同步数据，避免首屏闪烁 */
export function getMarketSnapshot() {
  return COMMODITIES
}
