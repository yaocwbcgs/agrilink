// 关键业务流端到端验证
import { chromium } from 'playwright-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const base = process.env.BASE_URL || 'http://localhost:5180'
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })
const errors = []
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 200)))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('CONSOLE ' + m.text().slice(0, 200))
})

const log = []
const step = async (name, fn) => {
  try {
    await fn()
    log.push({ step: name, ok: true })
  } catch (e) {
    log.push({ step: name, ok: false, error: String(e).slice(0, 220) })
  }
}

// 0. 登录
await step('登录演示账号', async () => {
  await page.goto(base + '/login', { waitUntil: 'networkidle' })
  await page.getByText('一键填入演示账号').click()
  await page.getByRole('button', { name: /登录 \/ 注册/ }).click()
  await page.waitForURL('**/user', { timeout: 8000 })
})

// 1. 病虫害识别
await step('上传图片并识别', async () => {
  await page.goto(base + '/disease', { waitUntil: 'networkidle' })
  await page.setInputFiles('input[type=file]', 'public/images/leaf-texture.jpg')
  await page.waitForTimeout(700)
  await page.getByRole('button', { name: '开始识别' }).click()
  await page.getByText('识别结果与防控方案').waitFor({ timeout: 12000 })
  await page.screenshot({ path: '.shots/flow-disease.png' })
})

await step('切换防控方案页签', async () => {
  await page.getByRole('button', { name: '用药参考' }).click()
  await page.waitForTimeout(400)
  await page.getByText('以下仅为有效成分类别参考').waitFor({ timeout: 4000 })
})

// 2. 发布供需
await step('发布供应信息', async () => {
  await page.goto(base + '/market/publish', { waitUntil: 'networkidle' })
  await page.locator('#title').fill('黑龙江绥化 测试玉米 容重710 可烘干')
  await page.locator('#quality').fill('水分 14%，容重 710g/L')
  await page.locator('#qty').fill('500')
  await page.locator('#price').fill('2300')
  await page.locator('#desc').fill('合作社自有烘干线，可提供质检报告，支持整车发运，欢迎到库看货。')
  await page.getByRole('button', { name: '提交发布' }).click()
  await page.waitForURL('**/user/listings', { timeout: 8000 })
  await page.getByText('测试玉米').first().waitFor({ timeout: 5000 })
  await page.screenshot({ path: '.shots/flow-publish.png' })
})

// 3. 商城下单
await step('加入购物车并下单', async () => {
  await page.goto(base + '/shop/pd-05', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '加入购物车', exact: true }).click()
  await page.goto(base + '/cart', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /去结算/ }).click()
  await page.waitForURL('**/checkout', { timeout: 8000 })
  await page.getByRole('button', { name: '提交订单' }).click()
  await page.getByText('订单已创建（模拟下单）').waitFor({ timeout: 6000 })
  await page.screenshot({ path: '.shots/flow-order.png' })
  await page.getByRole('button', { name: '查看我的订单' }).click()
  await page.waitForURL('**/user/orders', { timeout: 8000 })
})

await step('模拟支付流转', async () => {
  await page.getByRole('button', { name: '模拟支付' }).first().click()
  await page.waitForTimeout(900)
  await page.getByText('待发货').first().waitFor({ timeout: 5000 })
})

// 4. 农机预约
await step('预约农机作业', async () => {
  await page.goto(base + '/machinery/mc-01', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '在线预约作业' }).click()
  await page.waitForTimeout(400)
  await page.locator('#wt').selectOption({ index: 1 })
  await page.locator('#area').fill('220')
  await page.locator('#loc').fill('黑龙江省绥化市北林区东富镇丰禾地块')
  await page.locator('#date').fill('2026-11-20')
  await page.locator('#phone').fill('13800136621')
  await page.screenshot({ path: '.shots/flow-booking-form.png' })
  await page.getByRole('button', { name: '提交预约' }).click()
  await page.waitForTimeout(1200)
  await page.goto(base + '/user/bookings', { waitUntil: 'networkidle' })
  await page.getByText('东方红 LX2404').first().waitFor({ timeout: 5000 })
  await page.screenshot({ path: '.shots/flow-booking.png' })
})

// 5. 搜索
await step('全局搜索', async () => {
  await page.goto(base + '/search?q=' + encodeURIComponent('玉米'), { waitUntil: 'networkidle' })
  await page.getByText(/共找到/).waitFor({ timeout: 6000 })
})

// 6. 收藏持久化
await step('收藏并刷新验证持久化', async () => {
  await page.goto(base + '/market/ls-1001', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '收藏' }).click()
  await page.waitForTimeout(500)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const filled = await page.locator('button[aria-label="取消收藏"]').count()
  if (filled === 0) throw new Error('刷新后收藏状态丢失')
})

console.log(JSON.stringify({ log, errors: [...new Set(errors)].slice(0, 8) }, null, 1))
await browser.close()
