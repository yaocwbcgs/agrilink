/* 图片资源集中管理（演示环境使用本地化图片，生产可替换为 CDN 地址） */
export const IMG = {
  heroField: '/images/hero-field.jpg',
  fieldAerial: '/images/field-aerial.jpg',
  fieldRows: '/images/field-rows.jpg',
  plantingHands: '/images/planting-hands.jpg',
  wheatGrains: '/images/wheat-grains.jpg',
  wheatPeople: '/images/wheat-people.jpg',
  marketProduce: '/images/market-produce.jpg',
  harvestGreens: '/images/harvest-greens.jpg',
  produceShelves: '/images/produce-shelves.jpg',
  seedlings: '/images/seedlings.jpg',
  soil: '/images/soil.jpg',
  youngCrop: '/images/young-crop.jpg',
  apples: '/images/apples.jpg',
  tomatoes: '/images/tomatoes.jpg',
  gardenBeds: '/images/garden-beds.jpg',
  cornPlants: '/images/corn-plants.jpg',
  leafTexture: '/images/leaf-texture.jpg',
} as const

export const PRODUCE_IMAGES = [
  IMG.wheatGrains,
  IMG.cornPlants,
  IMG.marketProduce,
  IMG.apples,
  IMG.tomatoes,
  IMG.seedlings,
  IMG.harvestGreens,
  IMG.soil,
  IMG.produceShelves,
  IMG.youngCrop,
]
