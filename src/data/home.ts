import {
  ScanSearch,
  Handshake,
  Tractor,
  ShoppingBasket,
  TrendingUp,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import { IMG } from './images'

export interface ServiceModule {
  id: string
  index: string
  title: string
  en: string
  desc: string
  bullets: string[]
  to: string
  cta: string
  icon: LucideIcon
  image: string
  tone: 'dark' | 'light' | 'sand'
  size: 'lg' | 'md'
}

export const SERVICE_MODULES: ServiceModule[] = [
  {
    id: 'ai',
    index: '01',
    title: '病虫害智能识别',
    en: 'AI DIAGNOSIS',
    desc: '上传一张叶片照片，30 秒获得疑似病虫害判断、风险等级与分阶段防控方案。',
    bullets: ['图片识别 + 作物选择', '农业/物理/生物/化学四类方案', '14 类病虫害知识库'],
    to: '/disease',
    cta: '开始识别',
    icon: ScanSearch,
    image: IMG.leafTexture,
    tone: 'dark',
    size: 'lg',
  },
  {
    id: 'trade',
    index: '02',
    title: '农产品产销对接',
    en: 'TRADE MATCHING',
    desc: '供应与采购双向发布，按品种、数量、区域、价格与交期智能匹配。',
    bullets: ['供应大厅 / 采购大厅', '智能供需匹配度', '线上询价与联系'],
    to: '/market',
    cta: '进入大厅',
    icon: Handshake,
    image: IMG.marketProduce,
    tone: 'light',
    size: 'md',
  },
  {
    id: 'machine',
    index: '03',
    title: '农机共享服务',
    en: 'MACHINERY SHARING',
    desc: '拖拉机、收割机、植保无人机就近调度，在线预约作业并按亩计价。',
    bullets: ['按区域与档期筛选', '在线预约生成订单', '作业完成可评价'],
    to: '/machinery',
    cta: '找农机',
    icon: Tractor,
    image: IMG.fieldAerial,
    tone: 'light',
    size: 'md',
  },
  {
    id: 'shop',
    index: '04',
    title: '农资采购商城',
    en: 'AGRI SUPPLY STORE',
    desc: '种子、化肥、农药、农膜与设备，规格参数透明，支持购物车与订单管理。',
    bullets: ['7 大品类 · 持证供应商', '规格与库存实时可见', '模拟下单全流程'],
    to: '/shop',
    cta: '去采购',
    icon: ShoppingBasket,
    image: IMG.seedlings,
    tone: 'sand',
    size: 'md',
  },
  {
    id: 'price',
    index: '05',
    title: '大宗作物行情',
    en: 'MARKET INTELLIGENCE',
    desc: '8 大品种价格走势、区域价差与市场排行，支持多周期切换查看。',
    bullets: ['日/周/月线切换', '近三月至近一年区间', '区域价格对比'],
    to: '/prices',
    cta: '看行情',
    icon: TrendingUp,
    image: IMG.wheatGrains,
    tone: 'dark',
    size: 'md',
  },
  {
    id: 'tech',
    index: '06',
    title: '农业技术服务',
    en: 'TECH SERVICE',
    desc: '政策解读、种植技术、市场分析与科技动态，形成可检索的农业知识库。',
    bullets: ['6 大资讯栏目', '关键词搜索与收藏', '热门与推荐阅读'],
    to: '/news',
    cta: '读资讯',
    icon: GraduationCap,
    image: IMG.wheatPeople,
    tone: 'light',
    size: 'md',
  },
]

export interface PlatformStat {
  id: string
  label: string
  value: number
  unit: string
  suffix?: string
  delta: string
  spark: number[]
}

export const PLATFORM_STATS: PlatformStat[] = [
  {
    id: 'farmers',
    label: '平台服务农户',
    value: 128600,
    unit: '户',
    delta: '近 30 天 +2,140',
    spark: [42, 48, 45, 52, 58, 55, 63, 68, 66, 74, 79, 86],
  },
  {
    id: 'enterprises',
    label: '入驻农业企业',
    value: 3842,
    unit: '家',
    delta: '近 30 天 +86',
    spark: [24, 26, 25, 29, 31, 34, 33, 38, 41, 44, 46, 52],
  },
  {
    id: 'listings',
    label: '农产品供需信息',
    value: 26480,
    unit: '条',
    delta: '近 7 天 +1,260',
    spark: [30, 36, 40, 38, 45, 49, 54, 52, 58, 63, 61, 70],
  },
  {
    id: 'machinery',
    label: '农机服务资源',
    value: 5270,
    unit: '台/套',
    delta: '近 30 天 +182',
    spark: [20, 22, 26, 25, 28, 32, 31, 35, 37, 36, 41, 45],
  },
  {
    id: 'products',
    label: '农资商品数量',
    value: 12860,
    unit: '款',
    delta: '近 30 天 +340',
    spark: [35, 38, 42, 40, 46, 44, 52, 55, 53, 61, 64, 69],
  },
  {
    id: 'orders',
    label: '累计成交订单',
    value: 84300,
    unit: '笔',
    delta: '近 30 天 +4,860',
    spark: [28, 31, 36, 39, 37, 44, 48, 52, 57, 55, 62, 68],
  },
]

export const STATS_NOTE =
  '说明：以上为平台演示环境中的示例统计数据，用于展示产品形态，并非真实运营实时数据。'
