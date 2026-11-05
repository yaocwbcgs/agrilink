// 全站链接可达性体检：爬取所有路由收集内部链接，逐一访问校验
// 校验点：1) 链接目标不能落到 404 页；2) 页面不能出现未捕获异常/白屏
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const base = process.env.BASE_URL || 'http://127.0.0.1:5180'

const routes = [
  '/', '/disease', '/disease/library', '/disease/library/dis-wheat-stripe-rust',
  '/market', '/market/ls-1001', '/market/publish', '/market/match',
  '/machinery', '/machinery/mc-01', '/shop', '/shop/pd-01', '/cart', '/checkout',
  '/prices', '/prices/corn', '/news', '/news/nw-01',
  '/search?q=%E7%8E%89%E7%B1%B3', '/login', '/register', '/not-exist-page',
]

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 160)))

const links = new Set()

// 收集内部链接
for (const r of routes) {
  await page.goto(base + r, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(600)
  const found = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .map((a) => a.getAttribute('href') || '')
      .filter((h) => h.startsWith('/')),
  )
  found.forEach((f) => links.add(f.split('#')[0]))
}

console.log(`收集到内部链接 ${links.size} 个，开始逐一校验…\n`)

// 校验每个链接
const broken = []
const notFoundPage = []
for (const l of [...links].sort()) {
  pageErrors.length = 0
  const resp = await page.goto(base + l, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(700)
  const info = await page.evaluate(() => ({
    text: document.body.innerText.slice(0, 400),
    len: document.body.innerText.length,
  }))
  // 用 404 页的唯一文案判定，避免机型编号（如 LX2404）含 "404" 造成误报
  const is404 = /这一页没有找到|Error\s*404/.test(info.text)
  const blank = info.len < 80
  const err = pageErrors.length > 0
  if (is404 || blank || err) {
    const why = is404 ? '落到404页' : blank ? '空白页' : '运行时异常:' + pageErrors[0]
    broken.push({ link: l, why, status: resp?.status() })
  }
}

// 校验不存在的 ID 是否优雅降级
const invalidIds = [
  '/market/ls-9999', '/shop/pd-9999', '/machinery/mc-9999',
  '/news/nw-9999', '/prices/xxx-not-exist', '/disease/library/dis-not-exist',
]
for (const l of invalidIds) {
  await page.goto(base + l, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(700)
  const txt = await page.evaluate(() => document.body.innerText)
  const graceful = /不存在|未找到|没有找到|无该|失效|返回|404/i.test(txt)
  if (!graceful) {
    notFoundPage.push({ link: l, note: '未优雅降级', snippet: txt.slice(0, 120).replace(/\s+/g, ' ') })
  } else {
    console.log(`✓ ${l} → 优雅降级`)
  }
}

console.log('\n=== 链接校验结果 ===')
console.log(`检查链接数: ${links.size}`)
console.log(`异常链接: ${broken.length}`)
broken.forEach((b) => console.log('  ✗', b.link, '—', b.why))
console.log(`异常 ID 降级问题: ${notFoundPage.length}`)
notFoundPage.forEach((b) => console.log('  ✗', b.link, '—', b.note, '|', b.snippet))

fs.writeFileSync('.shots/link-report.json', JSON.stringify({ checked: links.size, broken, notFoundPage }, null, 1))
await browser.close()
