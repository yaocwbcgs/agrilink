/* ------------------------------------------------------------------
 * 耘链 AGRI LINK — 领域类型定义
 * 所有业务实体集中在此，便于后续替换为后端 DTO / OpenAPI 生成类型
 * ------------------------------------------------------------------ */

export type UserRole =
  | 'farmer'
  | 'coop'
  | 'enterprise'
  | 'supplier'
  | 'machinery'
  | 'buyer'
  | 'admin'

export interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  region: string
  company?: string
  avatarColor: string
  verified: boolean
  verifiedType?: '个人实名' | '企业认证' | '合作社认证'
  bio?: string
  joinedAt: string
}

export interface Address {
  id: string
  name: string
  phone: string
  region: string
  detail: string
  isDefault: boolean
}

/* ----------------------------- 病虫害识别 ----------------------------- */

export type CropKey =
  | 'wheat'
  | 'corn'
  | 'rice'
  | 'soybean'
  | 'fruit'
  | 'vegetable'
  | 'other'

export type PestKind = 'disease' | 'pest'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface ControlPlan {
  agricultural: string[]
  physical: string[]
  biological: string[]
  chemical: string[]
  prevention: string[]
  followUp: string[]
}

export interface PesticideRef {
  name: string
  activeIngredient: string
  target: string
  note: string
}

export interface Disease {
  id: string
  name: string
  alias?: string
  crop: CropKey
  kind: PestKind
  pathogen: string
  severity: RiskLevel
  yieldLoss: string
  season: string
  image: string
  symptoms: string[]
  causes: string[]
  spread: string[]
  plan: ControlPlan
  pesticides: PesticideRef[]
  tags: string[]
  viewCount: number
}

export interface RecognitionResult {
  taskId: string
  crop: CropKey
  cropLabel: string
  diseaseId: string
  diseaseName: string
  kind: PestKind
  confidence: number
  severity: RiskLevel
  symptoms: string[]
  causes: string[]
  spread: string[]
  plan: ControlPlan
  pesticides: PesticideRef[]
  /** 是否来自真实模型。当前演示环境恒为 true（模拟） */
  simulated: true
  provider: string
  modelVersion: string
  elapsedMs: number
  createdAt: string
  imagePreview: string
}

/* ----------------------------- 产销对接 ----------------------------- */

export type ListingType = 'supply' | 'demand'
export type ListingStatus = 'active' | 'offline' | 'pending' | 'rejected'
export type ProduceCategory =
  | 'grain'
  | 'cash'
  | 'fruit'
  | 'vegetable'
  | 'livestock'
  | 'other'

export interface Listing {
  id: string
  type: ListingType
  title: string
  category: ProduceCategory
  quantity: number
  unit: string
  price: number
  priceMax?: number
  region: string
  quality?: string
  deliveryTime?: string
  company: string
  contact: string
  contactName: string
  description: string
  image: string
  createdAt: string
  status: ListingStatus
  views: number
  ownerId: string
  spec?: string
  /** 演示数据标记 */
  seeded?: boolean
}

export interface MatchScore {
  listing: Listing
  score: number
  reasons: string[]
}

export interface Inquiry {
  id: string
  listingId: string
  listingTitle: string
  sellerName: string
  quantity: number
  unit: string
  offerPrice: number
  message: string
  contact: string
  createdAt: string
  status: 'waiting' | 'replied' | 'closed'
  reply?: string
}

/* ----------------------------- 农机服务 ----------------------------- */

export type MachineryCategory =
  | 'tractor'
  | 'harvester'
  | 'seeder'
  | 'drone'
  | 'rotary'
  | 'transplanter'
  | 'dryer'
  | 'other'

export type TradeMode = 'rent' | 'sale' | 'service'

export interface Machinery {
  id: string
  name: string
  category: MachineryCategory
  brand: string
  model: string
  owner: string
  ownerType: '合作社' | '服务公司' | '家庭农场' | '个人机手'
  region: string
  cover: string
  modes: TradeMode[]
  price: number
  priceUnit: string
  salePrice?: number
  available: boolean
  availableFrom: string
  availableTo: string
  rating: number
  reviewCount: number
  orders: number
  year: number
  power: string
  specs: { label: string; value: string }[]
  services: string[]
  description: string
  verified: boolean
}

export type BookingStatus = 'pending' | 'confirmed' | 'serving' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  machineryId: string
  machineryName: string
  cover: string
  workType: string
  area: number
  location: string
  date: string
  phone: string
  remark?: string
  amount: number
  status: BookingStatus
  createdAt: string
  rating?: number
  review?: string
}

/* ----------------------------- 农资商城 ----------------------------- */

export type ProductCategory =
  | 'seed'
  | 'fertilizer'
  | 'pesticide'
  | 'film'
  | 'equipment'
  | 'irrigation'
  | 'tool'

export type ProductGlyph =
  | 'seed'
  | 'fertilizer'
  | 'spray'
  | 'film'
  | 'equipment'
  | 'irrigation'
  | 'tool'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  glyph: ProductGlyph
  price: number
  originalPrice?: number
  unit: string
  spec: string
  specs: string[]
  supplier: string
  supplierType: string
  stock: number
  sales: number
  rating: number
  params: { label: string; value: string }[]
  intro: string
  scope: string[]
  tags: string[]
  registration?: string
}

export interface CartItem {
  productId: string
  qty: number
  spec: string
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  glyph: ProductGlyph
  price: number
  qty: number
  spec: string
  unit: string
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  freight: number
  address: Address
  status: OrderStatus
  createdAt: string
  remark?: string
  simulated: true
  paidAt?: string
}

/* ----------------------------- 行情 ----------------------------- */

export interface CommodityPoint {
  date: string
  price: number
  volume: number
}

export interface Commodity {
  id: string
  name: string
  enName: string
  category: '粮食' | '油料' | '经济作物' | '糖料'
  unit: string
  price: number
  change: number
  changePct: number
  open: number
  high: number
  low: number
  prevClose: number
  market: string
  province: string
  updatedAt: string
  spark: number[]
  contract: string
}

export interface MarketVenue {
  id: string
  name: string
  province: string
  city: string
  type: string
}

export type PriceRange = '1m' | '3m' | '6m' | '1y'

export interface RegionPrice {
  region: string
  price: number
  changePct: number
}

/* ----------------------------- 资讯 ----------------------------- */

export type NewsCategory =
  | 'policy'
  | 'tech'
  | 'pest'
  | 'market'
  | 'machine'
  | 'science'

export interface NewsBlock {
  type: 'p' | 'h2' | 'quote' | 'list'
  text?: string
  items?: string[]
}

export interface NewsArticle {
  id: string
  title: string
  category: NewsCategory
  cover: string
  summary: string
  blocks: NewsBlock[]
  author: string
  source: string
  publishedAt: string
  views: number
  readMinutes: number
  tags: string[]
  featured?: boolean
}

/* ----------------------------- 通用 ----------------------------- */

export type FavoriteType = 'listing' | 'machinery' | 'product' | 'article'

export interface FavoriteRef {
  type: FavoriteType
  id: string
  title: string
  subtitle: string
  meta: string
  image?: string
  addedAt: string
}

export interface AppNotification {
  id: string
  title: string
  body: string
  kind: 'system' | 'order' | 'trade' | 'booking' | 'account'
  createdAt: string
  read: boolean
  link?: string
}

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'info'
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
