import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseHTML } from 'linkedom'
import { TEMPLATES } from '../src/data/templates.js'
import { makeBlock, resolveTheme } from '../src/store/useBuilder.js'
import { personaliseSite } from '../src/store/personalise.js'
import { BlockView } from '../src/sections/Renderer.jsx'

/* ------------------------------------------------------------------ *
 * Responsive audit — har template mobile (420) aur tablet (834) pe
 * theek dikhega ya nahi.
 *
 * Browser ke bina naap nahi sakte, isliye CSS ke un patterns ko pakadte
 * hain jo chhoti screen pe tootte hain:
 *   - fixed px width jo mobile se chaudi ho
 *   - grid jisme fixed columns hain (minmax/auto-fit ke bina)
 *   - flex item ka basis mobile se bada
 *   - white-space: nowrap lambe text pe
 *   - fixed font-size jo mobile pe bahut bada ho
 * ------------------------------------------------------------------ */

const MOBILE = 420
const TABLET = 834

const biz = {
  name: 'Pedinno AI', logo: '', logoStyle: { mode: 'logoName', shape: 'rounded', size: 'md', position: 'left' },
  slogan: 'Intelligence accelerated', about: 'We build AI-powered business products for growing teams.',
  established: '2019', type: 'technology', subType: 'Product', industry: 'AI & Automation',
  services: ['Workflow Automation', 'Document Extraction', 'Marketing Automation'],
  products: ['Interview Analysis'], highlights: ['24x7 support', 'ISO certified'],
  phone: '+91 98765 43210', whatsapp: '+91 98765 43210', email: 'hello@pedinno.com',
  address: 'Plot 12, Tech Park', city: 'Jaipur', timing: '10-7', country: 'India',
  altPhone: '', altEmail: '', state: '', pincode: '', mapEmbed: '', workingDays: '',
  facebook: '', instagram: '', linkedin: '', twitter: '', youtube: '', website: '',
  metaDescription: '', keywords: '', regNumber: '', copyright: '', owner: '', audience: '',
}

const num = (s, prop) => {
  const m = new RegExp('(?:^|;|\\s)' + prop + ':\\s*([\\d.]+)px').exec(s)
  return m ? parseFloat(m[1]) : null
}

const issues = {}
const add = (k, msg) => { (issues[k] ||= []).push(msg) }
let templates = 0, elements = 0

for (const tpl of TEMPLATES) {
  const blocks = tpl.blocks.map((b) => makeBlock(b.type, b.variant))
  const h = blocks.find((b) => b.type === 'header')
  const f = blocks.find((b) => b.type === 'footer')
  const site = personaliseSite(
    { header: h, footer: f, pages: [{ id: 'p', name: 'Home', slug: '/', blocks: blocks.filter((b) => b !== h && b !== f) }] },
    biz
  )
  const theme = resolveTheme(tpl.theme)
  const html = renderToStaticMarkup(
    <div>{[site.header, ...site.pages[0].blocks, site.footer].map((b) => (
      <BlockView key={b.id} block={b} theme={theme} business={biz} />
    ))}</div>
  )
  const { document } = parseHTML(`<html><body>${html}</body></html>`)
  templates++
  const tag = `#${tpl.no} ${tpl.name}`

  for (const el of Array.from(document.querySelectorAll('*'))) {
    const st = el.getAttribute('style') || ''
    if (!st) continue
    elements++

    /* 1. fixed width jo mobile se chaudi ho */
    const w = num(st, 'width')
    const minW = num(st, 'min-width')
    if (w !== null && w > MOBILE && !/max-width|%/.test(st)) add('fixedWide', `${tag} width:${w}px`)
    if (minW !== null && minW > MOBILE) add('minWide', `${tag} min-width:${minW}px`)

    /* 2. grid columns jo mobile pe nahi tootenge */
    const gtc = /grid-template-columns:\s*([^;]+)/.exec(st)
    if (gtc) {
      const v = gtc[1]
      const cols = (v.match(/fr/g) || []).length + (v.match(/\d+px/g) || []).length
      const responsive = /auto-fit|auto-fill|minmax/.test(v)
      // Global container-query (index.css + export CSS) 720px se neeche har
      // inline grid ko 1 column kar deti hai — isliye ye ab problem nahi.
      if (cols >= 3 && !responsive) add('rigidGrid', `${tag} ${v.trim().slice(0, 50)}`)
      // minmax ho par min bada ho to bhi mobile pe overflow
      const mm = /minmax\(\s*(?:min\([^)]*\)|([\d.]+)px)/.exec(v)
      if (mm && mm[1] && parseFloat(mm[1]) > MOBILE - 48) add('bigMinmax', `${tag} minmax(${mm[1]}px…)`)
    }

    /* 3. flex-basis mobile se bada */
    const fb = /flex:\s*[\d.]+\s+[\d.]+\s+([\d.]+)px/.exec(st)
    if (fb && parseFloat(fb[1]) > MOBILE - 48) add('bigBasis', `${tag} flex-basis ${fb[1]}px`)

    /* 4. nowrap lambe text pe (marquee ko chhod ke) */
    if (/white-space:\s*nowrap/.test(st)) {
      const text = (el.textContent || '').trim()
      const isMarquee = /animation/.test(st) || /animation/.test(el.parentElement?.getAttribute('style') || '')
      if (text.length > 40 && !isMarquee) add('nowrap', `${tag} "${text.slice(0, 30)}…"`)
    }

    /* 5. fixed bada font (fluid hona chahiye) */
    const fs = num(st, 'font-size')
    if (fs !== null && fs > 40) add('bigFont', `${tag} ${fs}px`)

    /* 6. bahut bada fixed padding mobile pe jagah kha jayega */
    // clamp() wala padding chhoti screen pe khud kam ho jata hai
    const pad = /padding:\s*([\d.]+)px/.exec(st)
    if (pad && parseFloat(pad[1]) > 64 && !/clamp\(/.test(st)) add('bigPad', `${tag} padding ${pad[1]}px`)
  }
}

const uniq = (a) => Array.from(new Set(a))
const report = (k, label) => {
  const l = uniq(issues[k] || [])
  console.log(`${label.padEnd(30)}: ${l.length}`)
  return l
}

console.log(`templates checked : ${templates}`)
console.log(`elements checked  : ${elements}`)
console.log(`mobile width      : ${MOBILE}px | tablet: ${TABLET}px\n`)

const keys = [
  ['fixedWide', 'fixed width > mobile'],
  ['minWide', 'min-width > mobile'],
  ['rigidGrid', 'grid jo mobile pe nahi tootega'],
  ['bigMinmax', 'minmax ka min bahut bada'],
  ['bigBasis', 'flex-basis > mobile'],
  ['nowrap', 'nowrap lamba text'],
  ['bigFont', 'fixed bada font'],
  ['bigPad', 'bahut bada padding'],
]
const lists = keys.map(([k, label]) => [k, report(k, label)])

lists.forEach(([k, l]) => {
  if (l.length) {
    console.log(`\n${k}:`)
    l.slice(0, 6).forEach((m) => console.log('  ' + m))
    if (l.length > 6) console.log(`  … aur ${l.length - 6}`)
  }
})

const total = lists.reduce((a, [, l]) => a + l.length, 0)
console.log(total ? `\n${total} responsive problem` : '\nALL TEMPLATES MOBILE + TABLET READY')
