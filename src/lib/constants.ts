import type {
  BookingStatus,
  CropKey,
  ListingStatus,
  MachineryCategory,
  NewsCategory,
  OrderStatus,
  ProduceCategory,
  ProductCategory,
  TradeMode,
  UserRole,
} from '../types'

export const BRAND = {
  name: '耘链',
  en: 'AGRI LINK',
  slogan: '让农业更智慧，让产业链更高效',
  phone: '400-820-6688',
  email: 'service@agrilink.cn',
  address: '浙江省杭州市西湖区云栖小镇 3 号楼',
  icp: '浙ICP备2026008866号-1（演示）',
}

export const CROP_OPTIONS: { value: CropKey; label: string }[] = [
  { value: 'wheat', label: '小麦' },
  { value: 'corn', label: '玉米' },
  { value: 'rice', label: '水稻' },
  { value: 'soybean', label: '大豆' },
  { value: 'fruit', label: '果树' },
  { value: 'vegetable', label: '蔬菜' },
  { value: 'other', label: '其他作物' },
]

export const CROP_LABEL: Record<CropKey, string> = {
  wheat: '小麦',
  corn: '玉米',
  rice: '水稻',
  soybean: '大豆',
  fruit: '果树',
  vegetable: '蔬菜',
  other: '其他作物',
}

export const PRODUCE_CATEGORY_LABEL: Record<ProduceCategory, string> = {
  grain: '粮食作物',
  cash: '经济作物',
  fruit: '水果',
  vegetable: '蔬菜',
  livestock: '畜禽产品',
  other: '其他农产品',
}

export const PRODUCE_CATEGORY_OPTIONS = Object.entries(PRODUCE_CATEGORY_LABEL).map(
  ([value, label]) => ({ value: value as ProduceCategory, label }),
)

export const MACHINERY_LABEL: Record<MachineryCategory, string> = {
  tractor: '拖拉机',
  harvester: '联合收割机',
  seeder: '播种机',
  drone: '植保无人机',
  rotary: '旋耕机',
  transplanter: '插秧机',
  dryer: '烘干机',
  other: '其他农机',
}

export const MACHINERY_OPTIONS = Object.entries(MACHINERY_LABEL).map(([value, label]) => ({
  value: value as MachineryCategory,
  label,
}))

export const TRADE_MODE_LABEL: Record<TradeMode, string> = {
  rent: '出租',
  sale: '出售',
  service: '作业服务',
}

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = {
  seed: '种子种苗',
  fertilizer: '化肥肥料',
  pesticide: '农药植保',
  film: '农膜地膜',
  equipment: '农业设备',
  irrigation: '灌溉设施',
  tool: '农业工具',
}

export const PRODUCT_CATEGORY_OPTIONS = Object.entries(PRODUCT_CATEGORY_LABEL).map(
  ([value, label]) => ({ value: value as ProductCategory, label }),
)

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  policy: '农业政策',
  tech: '种植技术',
  pest: '病虫害防治',
  market: '市场分析',
  machine: '农机技术',
  science: '科技动态',
}

export const NEWS_CATEGORY_OPTIONS = Object.entries(NEWS_CATEGORY_LABEL).map(
  ([value, label]) => ({ value: value as NewsCategory, label }),
)

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  farmer: '普通农户',
  coop: '农业合作社',
  enterprise: '农业企业',
  supplier: '农资商家',
  machinery: '农机服务商',
  buyer: '农产品采购商',
  admin: '平台管理员',
}

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  active: '已上架',
  offline: '已下架',
  pending: '审核中',
  rejected: '未通过',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消',
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  serving: '作业中',
  completed: '已完成',
  cancelled: '已取消',
}

export const RISK_LABEL = {
  low: '轻度',
  medium: '中度',
  high: '重度',
} as const

export const RISK_CHIP = {
  low: 'bg-[#E8F1E9] text-[#2C6450] border-[#C6DCCB]',
  medium: 'bg-[#FBF0DF] text-[#9A6420] border-[#EED6B2]',
  high: 'bg-[#F8E4DF] text-[#A63E28] border-[#EBC4B9]',
} as const

export const REGIONS = [
  '全国',
  '黑龙江省',
  '吉林省',
  '辽宁省',
  '内蒙古自治区',
  '河北省',
  '河南省',
  '山东省',
  '山西省',
  '陕西省',
  '江苏省',
  '安徽省',
  '浙江省',
  '江西省',
  '湖北省',
  '湖南省',
  '四川省',
  '云南省',
  '贵州省',
  '广东省',
  '广西壮族自治区',
  '福建省',
  '新疆维吾尔自治区',
  '甘肃省',
  '宁夏回族自治区',
]

export const REGION_CITIES: Record<string, string[]> = {
  黑龙江省: ['哈尔滨市', '齐齐哈尔市', '佳木斯市', '绥化市', '黑河市'],
  吉林省: ['长春市', '吉林市', '四平市', '松原市', '白城市'],
  辽宁省: ['沈阳市', '大连市', '铁岭市', '锦州市', '朝阳市'],
  内蒙古自治区: ['呼和浩特市', '通辽市', '赤峰市', '巴彦淖尔市', '呼伦贝尔市'],
  河北省: ['石家庄市', '保定市', '邯郸市', '邢台市', '沧州市'],
  河南省: ['郑州市', '开封市', '周口市', '商丘市', '南阳市', '新乡市'],
  山东省: ['济南市', '潍坊市', '临沂市', '菏泽市', '德州市', '烟台市'],
  山西省: ['太原市', '运城市', '临汾市', '晋中市'],
  陕西省: ['西安市', '咸阳市', '渭南市', '榆林市'],
  江苏省: ['南京市', '徐州市', '盐城市', '淮安市', '南通市'],
  安徽省: ['合肥市', '阜阳市', '宿州市', '亳州市', '蚌埠市'],
  浙江省: ['杭州市', '宁波市', '嘉兴市', '湖州市', '金华市'],
  江西省: ['南昌市', '九江市', '上饶市', '吉安市'],
  湖北省: ['武汉市', '襄阳市', '荆州市', '黄冈市'],
  湖南省: ['长沙市', '岳阳市', '常德市', '衡阳市'],
  四川省: ['成都市', '绵阳市', '德阳市', '南充市', '宜宾市'],
  云南省: ['昆明市', '曲靖市', '大理州', '红河州'],
  贵州省: ['贵阳市', '遵义市', '毕节市'],
  广东省: ['广州市', '湛江市', '茂名市', '韶关市'],
  广西壮族自治区: ['南宁市', '桂林市', '玉林市', '崇左市'],
  福建省: ['福州市', '漳州市', '南平市', '三明市'],
  新疆维吾尔自治区: ['乌鲁木齐市', '昌吉州', '阿克苏地区', '伊犁州'],
  甘肃省: ['兰州市', '张掖市', '酒泉市', '定西市'],
  宁夏回族自治区: ['银川市', '吴忠市', '固原市'],
}

export const SORT_OPTIONS = [
  { value: 'latest', label: '最新发布' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'hot', label: '热度优先' },
]
