import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseHTML } from 'linkedom'
import { TEMPLATES } from '../src/data/templates.js'
import { makeBlock, resolveTheme } from '../src/store/useBuilder.js'
import { personaliseSite } from '../src/store/personalise.js'
import { BlockView } from '../src/sections/Renderer.jsx'

const biz = {
  name: 'Pedinno AI', logo: '', logoStyle: { mode: 'logoName', shape: 'rounded', size: 'md', position: 'left' },
  title: '', slogan: 'Intelligence accelerated', about: 'We build AI-powered business products for teams.',
  established: '2019', type: 'technology', subType: 'Product', industry: 'AI & Automation',
  services: ['Workflow Automation', 'Document Extraction'], products: ['Interview Analysis'], highlights: ['24x7 support'],
  phone: '+91 98765 43210', whatsapp: '+91 98765 43210', email: 'hello@pedinno.com',
  address: 'Plot 12', city: 'Jaipur', timing: '10-7', country: 'India',
  altPhone: '', altEmail: '', state: '', pincode: '', mapEmbed: '', workingDays: '',
  facebook: '', instagram: '', linkedin: '', twitter: '', youtube: '', website: '',
  metaDescription: '', keywords: '', regNumber: '', copyright: '', owner: '', audience: '',
}

const style = (el) => el.getAttribute('style') || ''
const num = (s, prop) => {
  const m = new RegExp(prop + ':\\s*([\\d.]+)px').exec(s)
  return m ? parseFloat(m[1]) : null
}

const issues = { ovalMedia: [], hugeRadius: [], rigidGrid: [], fixedHuge: [], noWrapText: [] }
let templates = 0, elements = 0

for (const tpl of TEMPLATES) {
  const blocks = tpl.blocks.map((b) => makeBlock(b.type, b.variant))
  const header = blocks.find((b) => b.type === 'header')
  const footer = blocks.find((b) => b.type === 'footer')
  const body = blocks.filter((b) => b !== header && b !== footer)
  const site = personaliseSite(
    { header: header || makeBlock('header'), footer: footer || makeBlock('footer'), pages: [{ id: 'p', name: 'Home', slug: '/', blocks: body }] },
    biz
  )
  const theme = resolveTheme(tpl.theme)
  const html = renderToStaticMarkup(
    <div>{[site.header, ...site.pages[0].blocks, site.footer].map((b) => <BlockView key={b.id} block={b} theme={theme} business={biz} />)}</div>
  )
  const { document } = parseHTML(`<html><body>${html}</body></html>`)
  templates++

  for (const el of Array.from(document.querySelectorAll('*'))) {
    const st = style(el)
    if (!st) continue
    elements++

    const radius = num(st, 'border-radius')
    const hasAspect = /aspect-ratio/.test(st)
    const isMedia = el.tagName === 'IMG' || el.hasAttribute('data-bind') || hasAspect
    if (el.hasAttribute('data-avatar')) continue   // round avatars jaan-boojh kar gol hain

    // 1. image/media pill radius se oval ban jata hai
    if (isMedia && radius !== null && radius > 40 && !/999/.test(st.match(/border-radius:\s*999px/) ? '999' : '')) {
      issues.ovalMedia.push(`${tpl.no} ${tpl.name}`)
    }
    if (isMedia && /border-radius:\s*999px/.test(st) && !/width:\s*(3[0-9]|[1-9][0-9])px/.test(st)) {
      // gol avatar chalta hai (chhota), badi image nahi
      const w = num(st, 'width')
      if (w === null || w > 120) issues.ovalMedia.push(`${tpl.no} ${tpl.name} (${el.tagName})`)
    }

    // 2. bade panels pe bhi 999px radius galat lagta hai
    if (!isMedia && /border-radius:\s*999px/.test(st) && /padding:\s*(2[0-9]|[3-9][0-9])px/.test(st)) {
      issues.hugeRadius.push(`${tpl.no} ${tpl.name}`)
    }

    // 3. 3+ column grid bina minmax/auto-fit ke chhoti screen pe tootta hai
    const gtc = /grid-template-columns:\s*([^;]+)/.exec(st)
    if (gtc) {
      const v = gtc[1]
      const cols = (v.match(/fr/g) || []).length
      if (cols >= 3 && !/auto-fit|auto-fill|minmax/.test(v)) issues.rigidGrid.push(`${tpl.no} ${tpl.name}: ${v.trim()}`)
    }

    // 4. bahut bada fixed font-size (fluid hona chahiye)
    const fs = num(st, 'font-size')
    if (fs !== null && fs > 48) issues.fixedHuge.push(`${tpl.no} ${tpl.name}: ${fs}px`)
  }
}

const uniq = (a) => Array.from(new Set(a))
const report = (key, label) => {
  const list = uniq(issues[key])
  console.log(`${label.padEnd(26)}: ${list.length}`)
  return list
}

console.log(`templates rendered        : ${templates}`)
console.log(`styled elements checked   : ${elements}\n`)
const a = report('ovalMedia', 'oval / pill images')
const b = report('hugeRadius', 'pill radius on panels')
const c = report('rigidGrid', 'non-responsive grids')
const d = report('fixedHuge', 'fixed huge font sizes')

const all = [a, b, c, d]
all.forEach((list, i) => {
  if (list.length) {
    console.log('\n' + ['oval media', 'pill panels', 'rigid grids', 'huge fonts'][i] + ':')
    list.slice(0, 6).forEach((m) => console.log('  ' + m))
  }
})
if (!all.some((l) => l.length)) console.log('\nALL TEMPLATES DESIGN-CLEAN')
