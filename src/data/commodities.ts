import type { Commodity, CommodityPoint, MarketVenue, PriceRange, RegionPrice } from '../types'
import { mulberry32 } from '../lib/utils'

interface Seed {
  id: string
  name: string
  enName: string
  category: Commodity['category']
  base: number
  unit: string
  contract: string
  seed: number
  drift: number
  volatility: number
  market: string
  province: string
}

const SEEDS: Seed[] = [
  {
    id: 'corn',
    name: '玉米',
    enName: 'CORN',
    category: '粮食',
    base: 2385,
    unit: '元/吨',
    contract: '二等黄玉米 · 容重 ≥ 690g/L',
    seed: 1001,
    drift: 0.012,
    volatility: 0.006,
    market: '郑州粮食批发市场',
    province: '河南省',
  },
  {
    id: 'wheat',
    name: '小麦',
    enName: 'WHEAT',
    category: '粮食',
    base: 2680,
    unit: '元/吨',
    contract: '国标三等白小麦',
    seed: 1002,
    drift: 0.008,
    volatility: 0.005,
    market: '郑州粮食批发市场',
    province: '河南省',
  },
  {
    id: 'rice',
    name: '水稻',
    enName: 'RICE',
    category: '粮食',
    base: 2820,
    unit: '元/吨',
    contract: '粳稻三等 · 出米率 ≥ 65%',
    seed: 1003,
    drift: -0.004,
    volatility: 0.004,
    market: '哈尔滨粮食批发市场',
    province: '黑龙江省',
  },
  {
    id: 'soybean',
    name: '大豆',
    enName: 'SOYBEAN',
    category: '油料',
    base: 4760,
    unit: '元/吨',
    contract: '国产非转基因黄大豆',
    seed: 1004,
    drift: 0.02,
    volatility: 0.009,
    market: '大连北方粮食交易市场',
    province: '辽宁省',
  },
  {
    id: 'cotton',
    name: '棉花',
    enName: 'COTTON',
    category: '经济作物',
    base: 15240,
    unit: '元/吨',
    contract: '3128B 级锯齿棉',
    seed: 1005,
    drift: 0.015,
    volatility: 0.011,
    market: '新疆棉花交易市场',
    province: '新疆维吾尔自治区',
  },
  {
    id: 'peanut',
    name: '花生',
    enName: 'PEANUT',
    category: '油料',
    base: 8640,
    unit: '元/吨',
    contract: '通货花生仁',
    seed: 1006,
    drift: -0.01,
    volatility: 0.013,
    market: '山东临沂粮油批发市场',
    province: '山东省',
  },
  {
    id: 'rapeseed',
    name: '油菜籽',
    enName: 'RAPESEED',
    category: '油料',
    base: 5900,
    unit: '元/吨',
    contract: '含油率 ≥ 38%',
    seed: 1007,
    drift: 0.006,
    volatility: 0.008,
    market: '武汉白沙洲农副产品市场',
    province: '湖北省',
  },
  {
    id: 'sugar',
    name: '白糖',
    enName: 'SUGAR',
    category: '糖料',
    base: 6150,
    unit: '元/吨',
    contract: '一级白砂糖',
    seed: 1008,
    drift: -0.006,
    volatility: 0.007,
    market: '广西南宁糖业批发市场',
    province: '广西壮族自治区',
  },
]

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 生成 400 天确定性价格序列（演示数据） */
function buildHistory(seed: Seed): CommodityPoint[] {
  const rand = mulberry32(seed.seed)
  const days = 400
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const points: CommodityPoint[] = []
  let price = seed.base * (1 - seed.drift * 0.9)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const t = (days - i) / days
    const seasonal = Math.sin(t * Math.PI * 2.4 + (seed.seed % 7)) * seed.volatility * 0.9
    const shock = (rand() - 0.5) * seed.volatility * 1.6
    price = price * (1 + seed.drift / days * 2.2 + seasonal / days * 8 + shock / 4)
    const weekday = d.getDay()
    const volumeBase = 12000 + (seed.seed % 9) * 4200
    const volume = Math.round(volumeBase * (weekday === 0 || weekday === 6 ? 0.42 : 1) * (0.75 + rand() * 0.6))
    points.push({
      date: toISO(d),
      price: Number(price.toFixed(2)),
      volume,
    })
  }
  return points
}

const RANGE_DAYS: Record<PriceRange, number> = { '1m': 30, '3m': 90, '6m': 180, '1y': 365 }

const HISTORY_MAP = new Map(SEEDS.map((s) => [s.id, buildHistory(s)]))

export const COMMODITIES: Commodity[] = SEEDS.map((s) => {
  const history = HISTORY_MAP.get(s.id) ?? []
  const recent = history.slice(-1)[0]
  const prev = history.slice(-2)[0]
  const price = recent?.price ?? s.base
  const prevClose = prev?.price ?? s.base
  const change = Number((price - prevClose).toFixed(2))
  const changePct = Number(((change / prevClose) * 100).toFixed(2))
  const window = history.slice(-20)
  const high = Math.max(...window.map((p) => p.price))
  const low = Math.min(...window.map((p) => p.price))
  return {
    id: s.id,
    name: s.name,
    enName: s.enName,
    category: s.category,
    unit: s.unit,
    price,
    change,
    changePct,
    open: prevClose,
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    prevClose,
    market: s.market,
    province: s.province,
    updatedAt: `${recent?.date ?? toISO(new Date())} 15:00`,
    spark: history.slice(-24).map((p) => p.price),
    contract: s.contract,
  }
})

export const COMMODITY_MAP = new Map(COMMODITIES.map((c) => [c.id, c]))

export interface SeriesPoint {
  label: string
  date: string
  price: number
  volume: number
}

/** 按时间范围聚合，周线/月线自动降采样 */
export function getSeries(id: string, range: PriceRange): SeriesPoint[] {
  const full = HISTORY_MAP.get(id) ?? []
  const days = RANGE_DAYS[range]
  const slice = full.slice(-days)
  const step = range === '1y' ? 7 : range === '6m' ? 3 : 1
  const out: SeriesPoint[] = []
  for (let i = 0; i < slice.length; i += step) {
    const chunk = slice.slice(i, i + step)
    const avg = chunk.reduce((sum, p) => sum + p.price, 0) / chunk.length
    out.push({
      label: chunk[0].date.slice(5),
      date: chunk[0].date,
      price: Number(avg.toFixed(2)),
      volume: chunk.reduce((sum, p) => sum + p.volume, 0),
    })
  }
  return out
}

export function getMultiSeries(ids: string[], range: PriceRange) {
  const days = RANGE_DAYS[range]
  const step = range === '1y' ? 7 : range === '6m' ? 3 : 1
  const base = getSeries(ids[0], range)
  return base.map((point, idx) => {
    const row: Record<string, string | number> = { label: point.label }
    ids.forEach((id) => {
      const s = getSeries(id, range)
      row[id] = s[idx]?.price ?? 0
    })
    return row
  }).slice(0, Math.ceil(days / step))
}

export const MARKETS: MarketVenue[] = [
  { id: 'm1', name: '郑州粮食批发市场', province: '河南省', city: '郑州市', type: '国家级粮食批发市场' },
  { id: 'm2', name: '大连北方粮食交易市场', province: '辽宁省', city: '大连市', type: '港口集散市场' },
  { id: 'm3', name: '哈尔滨粮食批发市场', province: '黑龙江省', city: '哈尔滨市', type: '产区批发市场' },
  { id: 'm4', name: '山东临沂粮油批发市场', province: '山东省', city: '临沂市', type: '区域批发市场' },
  { id: 'm5', name: '武汉白沙洲农副产品市场', province: '湖北省', city: '武汉市', type: '销区批发市场' },
  { id: 'm6', name: '新疆棉花交易市场', province: '新疆维吾尔自治区', city: '乌鲁木齐市', type: '专业品种市场' },
  { id: 'm7', name: '广西南宁糖业批发市场', province: '广西壮族自治区', city: '南宁市', type: '专业品种市场' },
  { id: 'm8', name: '广州江南果菜批发市场', province: '广东省', city: '广州市', type: '销区批发市场' },
]

const REGION_POOL: Record<string, string[]> = {
  corn: ['黑龙江', '吉林', '山东', '河南', '河北'],
  wheat: ['河南', '山东', '河北', '安徽', '江苏'],
  rice: ['黑龙江', '江苏', '江西', '湖南', '湖北'],
  soybean: ['黑龙江', '内蒙古', '辽宁', '安徽', '河南'],
  cotton: ['新疆', '山东', '河北', '湖北', '安徽'],
  peanut: ['山东', '河南', '河北', '辽宁', '广东'],
  rapeseed: ['湖北', '四川', '湖南', '江苏', '安徽'],
  sugar: ['广西', '云南', '广东', '新疆', '内蒙古'],
}

export function getRegionPrices(id: string): RegionPrice[] {
  const commodity = COMMODITY_MAP.get(id)
  if (!commodity) return []
  const regions = REGION_POOL[id] ?? ['华北', '华东', '华中', '华南', '西南']
  const rand = mulberry32(commodity.price * 13 + id.length)
  return regions.map((region, i) => {
    const offset = (i - 2) * 0.012 + (rand() - 0.5) * 0.01
    return {
      region: `${region}`,
      price: Number((commodity.price * (1 + offset)).toFixed(0)),
      changePct: Number(((rand() - 0.45) * 3.2).toFixed(2)),
    }
  }).sort((a, b) => b.price - a.price)
}

export const DATA_SOURCE_NOTE =
  '演示数据：由平台按固定随机种子生成，用于展示产品能力，不构成真实行情或交易建议。生产环境请接入交易所或授权行情数据源。'
