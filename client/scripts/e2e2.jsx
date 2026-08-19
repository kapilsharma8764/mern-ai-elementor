import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseHTML } from 'linkedom'
import { useBuilder, resolveTheme } from '../src/store/useBuilder.js'
import { WIDGETS } from '../src/sections/widgets.jsx'
import { BlockView } from '../src/sections/Renderer.jsx'
import { siteToHtml, fileNameFor } from '../src/utils/exportSite.jsx'
import { resolveDrop, applyDrop } from '../src/components/builder/dnd.js'
import { usedFields } from '../src/sections/usedFields.js'
import { TEMPLATES } from '../src/data/templates.js'
import { pathGet } from '../src/utils/propPath.js'

/* ------------------------------------------------------------------ *
 * Asli template se poori website: har widget, drag & drop, aur browser
 * preview me "About pe click -> About page khule" — sab verify.
 * ------------------------------------------------------------------ */

const fails = []
const ok = (c, label, extra = '') => {
  if (!c) fails.push(label + (extra ? ` — ${extra}` : ''))
  console.log(`${c ? 'OK   ' : 'FAIL '} ${label}${extra && !c ? '  (' + extra + ')' : ''}`)
}
const S = () => useBuilder.getState()
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const BIZ = {
  name: 'Pedinno AI', logo: PNG, logoStyle: { mode: 'logoName', shape: 'rounded', size: 'md', position: 'left' },
  title: 'AI Product Solutions', slogan: 'Intelligence accelerated',
  about: 'We build AI-powered business products using LLM technology and intelligent automation.',
  established: '2019', type: 'technology', subType: 'Product', industry: 'AI & Automation',
  services: ['Workflow Automation', 'Document Extraction', 'Marketing Automation'],
  products: ['Interview Analysis', 'Data Studio'], highlights: ['24x7 support', 'ISO certified'],
  phone: '+91 98765 43210', whatsapp: '+91 98765 43210', email: 'hello@pedinno.com',
  address: 'Plot 12, Tech Park', city: 'Jaipur', timing: '10:00 AM - 7:00 PM', country: 'India',
  altPhone: '', altEmail: '', state: 'Rajasthan', pincode: '302001', mapEmbed: '', workingDays: 'Mon - Sat',
  facebook: 'https://facebook.com/pedinno', instagram: '', linkedin: 'https://linkedin.com/company/pedinno',
  twitter: '', youtube: '', website: '', metaDescription: '', keywords: '', regNumber: '',
  copyright: '', owner: '', audience: 'Enterprises',
}

/* ---------------- 1. asli template se site ---------------- */
console.log('--- 1. ASLI TEMPLATE ---')
const tpl = TEMPLATES.find((t) => t.name === 'Clarity') || TEMPLATES[1]
S().setBusiness(BIZ)
S().chooseTemplate(tpl.id)
ok(!!S().site, `template "${tpl.name}" load hua`)
const homeBlocks = S().site.pages[0].blocks.length
ok(homeBlocks >= 5, 'home page me sections aaye', `${homeBlocks} sections`)

/* ---------------- 2. pages ---------------- */
console.log('\n--- 2. PAGES ---')
;['About', 'Services', 'Contact'].forEach((n) => S().addPage(n))
ok(S().site.pages.length === 4, '4 pages bane', `${S().site.pages.length}`)
const [home, about, services, contact] = S().site.pages

/* ---------------- 3. drag & drop ---------------- */
console.log('\n--- 3. DRAG & DROP ---')
S().setPage(home.id)
const idsBefore = S().currentPage().blocks.map((b) => b.id)

// (a) palette se widget ko beech me drop
const dropMid = resolveDrop('new:gallery', idsBefore[2], idsBefore)
ok(dropMid && dropMid.type === 'add' && dropMid.index === 2, 'palette drop -> sahi index pe insert', JSON.stringify(dropMid))
applyDrop(dropMid, { addBlock: S().addBlock, moveBlock: S().moveBlock })
ok(S().currentPage().blocks[2].type === 'gallery', 'gallery position 2 pe aayi',
  S().currentPage().blocks[2]?.type)

// (b) canvas ke end me drop
const ids2 = S().currentPage().blocks.map((b) => b.id)
const dropEnd = resolveDrop('new:faq', 'canvas-end', ids2)
ok(dropEnd && dropEnd.index === ids2.length, 'canvas-end drop -> end me add', JSON.stringify(dropEnd))
applyDrop(dropEnd, { addBlock: S().addBlock, moveBlock: S().moveBlock })
ok(S().currentPage().blocks.at(-1).type === 'faq', 'faq end me aayi')

// (c) section reorder
const ids3 = S().currentPage().blocks.map((b) => b.id)
const firstType = S().currentPage().blocks[0].type
const move = resolveDrop(ids3[0], ids3[3], ids3)
ok(move && move.type === 'move' && move.from === 0 && move.to === 3, 'reorder resolve hua', JSON.stringify(move))
applyDrop(move, { addBlock: S().addBlock, moveBlock: S().moveBlock })
ok(S().currentPage().blocks[3].type === firstType, 'section 0 -> 3 move hua')

// (d) galat drops crash na karein
ok(resolveDrop('new:hero', null, ids3) === null, 'over ke bina drop ignore hua')
ok(resolveDrop('unknown-id', ids3[0], ids3) === null, 'anjaan block ka drop ignore hua')
ok(resolveDrop(ids3[0], ids3[0], ids3) === null, 'khud pe drop ignore hua')

/* ---------------- 4. har widget add + edit + render ---------------- */
console.log('\n--- 4. HAR WIDGET ---')
const types = Object.keys(WIDGETS).filter((k) => k !== 'header' && k !== 'footer')
const theme = resolveTheme(S().site.theme)
const widgetIssues = []

for (const type of types) {
  S().setPage(about.id)
  const id = S().addBlock(type)
  const w = WIDGETS[type]

  for (const variant of Object.keys(w.variants)) {
    S().setVariant(id, variant)
    const used = usedFields(type, variant)

    // har text field edit karke dekho ki render me aaya
    for (const f of w.schema || []) {
      if (f.type !== 'text' && f.type !== 'textarea') continue
      if (!used.has(f.key)) continue
      const val = `EDIT_${type}_${f.key}`
      S().setProp(id, f.key, val)
      const html = renderToStaticMarkup(<BlockView block={S().getBlock(id)} theme={theme} business={S().business} />)
      if (!html.includes(val)) widgetIssues.push(`${type}.${variant} -> ${f.key} edit render me nahi aaya`)
    }

    // image field: jis variant me dikhni chahiye wahan dikhe
    for (const f of w.schema || []) {
      if (f.type === 'image' && used.has(f.key)) {
        S().setProp(id, f.key, PNG)
        const html = renderToStaticMarkup(<BlockView block={S().getBlock(id)} theme={theme} business={S().business} />)
        if (!html.includes(PNG)) widgetIssues.push(`${type}.${variant} -> ${f.key} image render me nahi aayi`)
      }
      if (f.type === 'list') {
        const sub = (f.fields || []).find((x) => x.type === 'image')
        if (sub && used.has(`${f.key}.${sub.key}`)) {
          S().setPropPath(id, [f.key, 0, sub.key], PNG)
          const html = renderToStaticMarkup(<BlockView block={S().getBlock(id)} theme={theme} business={S().business} />)
          if (!html.includes(PNG)) widgetIssues.push(`${type}.${variant} -> ${f.key}[0].${sub.key} image render me nahi aayi`)
        }
      }
    }
  }
  S().removeBlock(id)
}
ok(widgetIssues.length === 0, `saare ${types.length} widgets ke har variant me edit + image chala`,
  widgetIssues.slice(0, 5).join(' | '))

/* ---------------- 5. har page me content ---------------- */
console.log('\n--- 5. PAGES ME CONTENT ---')
const fill = (pageId, list) => {
  S().setPage(pageId)
  S().currentPage().blocks.forEach((b) => S().removeBlock(b.id))
  list.forEach((t) => S().addBlock(t))
}
fill(about.id, ['hero', 'about', 'bigstats', 'team', 'process'])
fill(services.id, ['hero', 'services', 'feature', 'pricing', 'faq'])
fill(contact.id, ['hero', 'contact', 'map'])
ok(S().site.pages.every((p) => p.blocks.length > 0), 'har page pe sections hain',
  S().site.pages.map((p) => `${p.name}:${p.blocks.length}`).join(' '))

/* ---------------- 6. header links -> pages ---------------- */
console.log('\n--- 6. HEADER LINKS ---')
S().setProp('header', 'links', [
  { label: 'Home', link: { kind: 'page', target: home.id } },
  { label: 'About', link: { kind: 'page', target: about.id } },
  { label: 'Services', link: { kind: 'page', target: services.id } },
  { label: 'Contact', link: { kind: 'page', target: contact.id } },
])
ok(S().site.header.props.links.length === 4, 'header me 4 links set hue')

/* ---------------- 7. BROWSER PREVIEW — asli click test ---------------- */
console.log('\n--- 7. BROWSER PREVIEW ME NAVIGATION ---')
const html = siteToHtml({ site: S().site, theme, business: S().business })
const { document, window } = parseHTML(html)
globalThis.document = document
globalThis.window = window
if (typeof window.scrollTo !== 'function') window.scrollTo = () => {}

ok(document.querySelectorAll('.wb-page').length === 4, '4 pages HTML me hain')

// router script nikaal ke chalao — bilkul waise jaise browser chalata hai
const scripts = Array.from(document.querySelectorAll('script')).filter((s) => !s.getAttribute('type'))
const routerSrc = scripts.map((s) => s.textContent).join('\n')
ok(/wb-page/.test(routerSrc), 'router script HTML me hai')
try {
  // eslint-disable-next-line no-new-func
  new Function('document', 'window', routerSrc)(document, window)
  ok(true, 'router script bina error chala')
} catch (e) {
  ok(false, 'router script chala', e.message)
}

const aboutFile = fileNameFor(about)
const aboutLink = document.querySelector(`.wb-page:not([hidden]) a[href="${aboutFile}"]`)
ok(!!aboutLink, `header me About ka link mila (${aboutFile})`)

const pageEl = (p) => document.querySelector(`.wb-page[data-page="${fileNameFor(p)}"]`)
ok(!pageEl(home).hasAttribute('hidden'), 'shuru me Home visible hai')
ok(pageEl(about).hasAttribute('hidden'), 'shuru me About chhupa hai')

if (aboutLink) {
  const ev = new window.Event('click', { bubbles: true, cancelable: true })
  aboutLink.dispatchEvent(ev)
  ok(!pageEl(about).hasAttribute('hidden'), 'About pe click -> About page khul gaya')
  ok(pageEl(home).hasAttribute('hidden'), 'About pe click -> Home chhup gaya')
  ok(ev.defaultPrevented, 'click ne default navigation roka (blob URL toota nahi)')

  // wapas Home
  const homeLink = document.querySelector(`.wb-page:not([hidden]) a[href="${fileNameFor(home)}"]`)
  if (homeLink) {
    homeLink.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }))
    ok(!pageEl(home).hasAttribute('hidden'), 'Home pe click -> wapas Home aaya')
  } else ok(false, 'About page pe Home ka link mila')
}

// har page ke andar header ka link maujood ho
const missingNav = S().site.pages.filter((p) => {
  const el = pageEl(p)
  return !el || !el.querySelector(`a[href="${aboutFile}"]`)
})
ok(missingNav.length === 0, 'har page pe About link maujood', missingNav.map((p) => p.name).join(','))

/* ---------------- 8. content check ---------------- */
console.log('\n--- 8. CONTENT ---')
ok(html.includes('Pedinno AI'), 'company name site me hai')
ok(html.includes('Workflow Automation'), 'services site me hain')
ok(html.includes('hello@pedinno.com') || html.includes('98765'), 'contact details site me hain')
ok(html.includes(PNG), 'logo/image site me hai')
ok(!html.includes('We build things that grow your business'), 'koi stock text nahi bacha')

console.log('\n================ RESULT ================')
if (fails.length) {
  console.log(`${fails.length} FAILURES:`)
  fails.forEach((f) => console.log('  x ' + f))
} else {
  console.log('SAB PASS — template se poori 4-page website, drag & drop, har widget edit, aur browser me page navigation chal rahi hai')
}
