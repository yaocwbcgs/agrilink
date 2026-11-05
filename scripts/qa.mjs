// 全站巡检：逐路由截图 + 控制台错误 + 横向溢出检查
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const base = process.env.BASE_URL || 'http://localhost:5180'
const W = Number(process.env.W || 1440)
const H = Number(process.env.H || 950)
const tag = process.env.TAG || 'd'

const routes = [
  ['/', 'home'],
  ['/disease', 'disease'],
  ['/disease/library', 'library'],
  ['/disease/library/dis-wheat-stripe-rust', 'disease-detail'],
  ['/market', 'market'],
  ['/market/ls-1001', 'listing'],
  ['/market/publish', 'publish'],
  ['/market/match', 'match'],
  ['/machinery', 'machinery'],
  ['/machinery/mc-01', 'machinery-detail'],
  ['/shop', 'shop'],
  ['/shop/pd-01', 'product'],
  ['/cart', 'cart'],
  ['/checkout', 'checkout'],
  ['/prices', 'prices'],
  ['/prices/corn', 'price-detail'],
  ['/news', 'news'],
  ['/news/nw-01', 'news-detail'],
  ['/search?q=%E7%8E%89%E7%B1%B3', 'search'],
  ['/login', 'login'],
  ['/register', 'register'],
  ['/not-exist-page', '404'],
]

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: W, height: H } })
const report = []
let currentErrors = []
page.on('console', (m) => {
  if (m.type() === 'error') currentErrors.push(m.text().slice(0, 160))
})
page.on('pageerror', (e) => currentErrors.push('PAGEERROR ' + e.message.slice(0, 160)))

fs.mkdirSync('.shots/qa', { recursive: true })

async function visit(path, name) {
  currentErrors = []
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(1100)
  const metrics = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
    h: document.body.scrollHeight,
    text: document.body.innerText.slice(0, 90).replace(/\s+/g, ' '),
  }))
  await page.screenshot({ path: `.shots/qa/${tag}-${name}.png` })
  report.push({
    path,
    name,
    overflow: metrics.sw > metrics.cw + 1,
    scrollW: metrics.sw,
    clientW: metrics.cw,
    height: metrics.h,
    errors: [...new Set(currentErrors)].slice(0, 3),
    head: metrics.text,
  })
}

for (const [path, name] of routes) await visit(path, name)

// 登录后访问个人中心
await page.goto(base + '/login', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.getByText('一键填入演示账号').click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: /登录 \/ 注册/ }).click()
await page.waitForTimeout(900)

const userRoutes = [
  ['/user', 'user'],
  ['/user/listings', 'user-listings'],
  ['/user/bookings', 'user-bookings'],
  ['/user/orders', 'user-orders'],
  ['/user/favorites', 'user-favorites'],
  ['/user/inquiries', 'user-inquiries'],
  ['/user/notifications', 'user-notifications'],
  ['/user/addresses', 'user-addresses'],
  ['/user/profile', 'user-profile'],
  ['/user/settings', 'user-settings'],
]
for (const [path, name] of userRoutes) await visit(path, name)

console.log(JSON.stringify(report, null, 1))
await browser.close()
