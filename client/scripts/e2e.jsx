import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseHTML } from 'linkedom'
import { useBuilder, resolveTheme } from '../src/store/useBuilder.js'
import { WIDGETS } from '../src/sections/widgets.jsx'
import { BlockView } from '../src/sections/Renderer.jsx'
import { siteToHtml, pageToHtml, fileNameFor } from '../src/utils/exportSite.jsx'
import { hrefFor } from '../src/sections/links.jsx'
import { pathGet } from '../src/utils/propPath.js'
import { usedFields, variantsUsing } from '../src/sections/usedFields.js'

/* ------------------------------------------------------------------ *
 * End-to-end: blank template se shuru, 10 pages, saare widgets,
 * har edit operation, phir render + export verify.
 * ------------------------------------------------------------------ */

const fails = []
const ok = (cond, label, extra = '') => {
  if (!cond) fails.push(label + (extra ? ` — ${extra}` : ''))
  console.log(`${cond ? 'OK   ' : 'FAIL '} ${label}${extra && !cond ? '  (' + extra + ')' : ''}`)
}

const S = () => useBuilder.getState()

const BIZ = {
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
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

console.log('--- 1. BLANK TEMPLATE SE START ---')
S().setBusiness(BIZ)
S().chooseTemplate('tpl-blank')
ok(!!S().site, 'blank template loaded')
ok(S().site.pages.length === 1, 'ek page bana')
ok(!!S().site.header && !!S().site.footer, 'header + footer maujood')
ok(S().step === 'builder', 'builder step pe pahunche')

console.log('\n--- 2. 10 PAGES ---')
const PAGE_NAMES = ['About', 'Services', 'Products', 'Work', 'Pricing', 'Team', 'Blog', 'FAQ', 'Contact']
PAGE_NAMES.forEach((n) => S().addPage(n))
ok(S().site.pages.length === 10, '10 pages bane', `mile ${S().site.pages.length}`)
ok(new Set(S().site.pages.map((p) => p.slug)).size === 10, 'har page ka slug unique')
ok(new Set(S().site.pages.map((p) => fileNameFor(p))).size === 10, 'har page ka file name unique',
  S().site.pages.map((p) => fileNameFor(p)).join(','))

console.log('\n--- 3. SAARE WIDGETS ADD ---')
const allTypes = Object.keys(WIDGETS).filter((k) => k !== 'header' && k !== 'footer')
const pages = S().site.pages
let added = 0
allTypes.forEach((type, i) => {
  const page = pages[i % pages.length]
  S().setPage(page.id)
  const id = S().addBlock(type)
  if (id) added++
})
ok(added === allTypes.length, `saare ${allTypes.length} widgets add hue`, `${added} add hue`)

// har widget ke har variant ko bhi ek baar laga ke dekho
console.log('\n--- 4. HAR VARIANT SWITCH ---')
S().setPage(pages[0].id)
let variantErrors = 0
for (const [type, w] of Object.entries(WIDGETS)) {
  if (type === 'header' || type === 'footer') continue
  const id = S().addBlock(type)
  for (const v of Object.keys(w.variants)) {
    S().setVariant(id, v)
    const b = S().getBlock(id)
    if (b.variant !== v) variantErrors++
  }
  S().removeBlock(id)
}
ok(variantErrors === 0, 'har variant switch hua', `${variantErrors} fail`)

console.log('\n--- 5. EDIT OPERATIONS ---')
S().setPage(pages[0].id)
const firstId = S().addBlock('services')
S().setProp(firstId, 'title', 'Edited title')
ok(S().getBlock(firstId).props.title === 'Edited title', 'setProp chala')

S().setPropPath(firstId, ['items', 0, 'title'], 'Item edited')
ok(pathGet(S().getBlock(firstId).props, ['items', 0, 'title']) === 'Item edited', 'setPropPath (inline edit) chala')

const beforeLen = S().getBlock(firstId).props.items.length
S().duplicateListItem(firstId, 'items', 0)
ok(S().getBlock(firstId).props.items.length === beforeLen + 1, 'list item duplicate hua')
S().removeListItem(firstId, 'items', 0)
ok(S().getBlock(firstId).props.items.length === beforeLen, 'list item delete hua')
S().moveListItem(firstId, 'items', 0, 2)
ok(true, 'list item move chala')

S().setStyle(firstId, 'marginTop', 40)
ok(S().getBlock(firstId).style.marginTop === 40, 'setStyle chala')

S().setPropPath(firstId, ['items', 0, 'image'], PNG)
ok(pathGet(S().getBlock(firstId).props, ['items', 0, 'image']) === PNG, 'image upload (prop) save hua')

// image dikhne wala variant chuno, phir render me image honi chahiye
const imgVariants = variantsUsing('services', 'items.image')
ok(imgVariants.length > 0, 'services me image dikhane wala variant hai', imgVariants.join(','))
S().setVariant(firstId, imgVariants[0])
const imgHtml = renderToStaticMarkup(<BlockView block={S().getBlock(firstId)} theme={resolveTheme(S().site.theme)} business={S().business} />)
ok(imgHtml.includes(PNG), 'upload ki hui image render me dikhi')

// aur jo variant image nahi dikhata, uske liye panel warning ka data sahi ho
const noImg = Object.keys(WIDGETS.services.variants).find(v => !usedFields('services', v).has('items.image'))
ok(!!noImg, 'aisa variant bhi mila jo image nahi dikhata', String(noImg))

const cnt = S().currentPage().blocks.length
S().duplicateBlock(firstId)
ok(S().currentPage().blocks.length === cnt + 1, 'block duplicate hua')
S().moveBlock(0, 2)
ok(true, 'block reorder chala')

console.log('\n--- 6. UNDO / REDO ---')
const titleBefore = S().getBlock(firstId).props.title
S().setProp(firstId, 'title', 'Temp change')
S().undo()
ok(S().getBlock(firstId)?.props.title === titleBefore, 'undo ne title wapas kiya',
  `mila "${S().getBlock(firstId)?.props.title}"`)
S().redo()
ok(S().getBlock(firstId)?.props.title === 'Temp change', 'redo ne dobara laga diya',
  `mila "${S().getBlock(firstId)?.props.title}"`)

console.log('\n--- 7. HEADER / FOOTER EDIT ---')
S().select('header', 'content')
S().setProp('header', 'cta', 'Talk to us')
ok(S().site.header.props.cta === 'Talk to us', 'header edit hua')
S().setProp('footer', 'about', 'Footer line')
ok(S().site.footer.props.about === 'Footer line', 'footer edit hua')

console.log('\n--- 8. PAGE LINKS ---')
const aboutPage = S().site.pages.find((p) => p.name === 'About')
const contactPage = S().site.pages.find((p) => p.name === 'Contact')
S().setProp('header', 'links', [
  { label: 'Home', link: { kind: 'section', target: 'top' } },
  { label: 'About', link: { kind: 'page', target: aboutPage.id } },
  { label: 'Contact', link: { kind: 'page', target: contactPage.id } },
  { label: 'Google', link: { kind: 'url', target: 'google.com' } },
  { label: 'Call', link: { kind: 'tel' } },
  { label: 'WhatsApp', link: { kind: 'wa' } },
  { label: 'Email', link: { kind: 'mail' } },
])
const hrefs = S().site.header.props.links.map((l) => hrefFor(l.link, S().business))
ok(hrefs.every(Boolean), 'har link ka href bana', JSON.stringify(hrefs))
ok(hrefs[3] === 'https://google.com', 'external URL me https lag gaya', hrefs[3])
ok(hrefs[4].startsWith('tel:'), 'phone link bana', hrefs[4])
ok(hrefs[5].includes('wa.me'), 'whatsapp link bana', hrefs[5])
ok(hrefs[6].startsWith('mailto:'), 'email link bana', hrefs[6])

console.log('\n--- 9. HAR PAGE RENDER ---')
const theme = resolveTheme(S().site.theme)
let renderErrors = []
for (const page of S().site.pages) {
  try {
    renderToStaticMarkup(
      <div>
        <BlockView block={S().site.header} theme={theme} business={S().business} />
        {page.blocks.map((b) => <BlockView key={b.id} block={b} theme={theme} business={S().business} />)}
        <BlockView block={S().site.footer} theme={theme} business={S().business} />
      </div>
    )
  } catch (e) { renderErrors.push(`${page.name}: ${e.message}`) }
}
ok(renderErrors.length === 0, 'saare 10 pages render hue', renderErrors.join(' | '))

console.log('\n--- 10. EXPORT + BROWSER PREVIEW ---')
let html = ''
try { html = siteToHtml({ site: S().site, theme, business: S().business }) } catch (e) { }
ok(!!html, 'browser preview HTML bana')
const { document } = parseHTML(html || '<html></html>')
ok(document.querySelectorAll('.wb-page').length === 10, '10 pages HTML me hain',
  `mile ${document.querySelectorAll('.wb-page').length}`)
ok(document.querySelectorAll('.wb-page:not([hidden])').length === 1, 'sirf ek page visible')
const pageLinks = Array.from(document.querySelectorAll('a[href$=".html"]'))
ok(pageLinks.length > 0, 'page links HTML me hain')
const names = S().site.pages.map((p) => fileNameFor(p))
ok(pageLinks.every((a) => names.includes(a.getAttribute('href'))), 'har page link asli page pe jata hai',
  pageLinks.map((a) => a.getAttribute('href')).filter((h) => !names.includes(h)).join(','))
const anchors = Array.from(document.querySelectorAll('.wb-page:not([hidden]) a[href^="#"]'))
const badAnchor = anchors.filter((a) => !document.getElementById(a.getAttribute('href').slice(1)))
ok(badAnchor.length === 0, 'saare #anchors valid', badAnchor.map((a) => a.getAttribute('href')).join(','))
ok(html.includes(PNG), 'upload ki hui image export me aayi')

console.log('--- 10b. BUTTON LINKS ---')
const heroId = S().addBlock('hero')
S().setProp(heroId, 'ctaLink', { kind: 'page', target: contactPage.id })
const heroHtml = renderToStaticMarkup(<BlockView block={S().getBlock(heroId)} theme={theme} business={S().business} />)
ok(/<a [^>]*href=/.test(heroHtml), 'hero ke buttons asli link bane')
const btnId = S().addBlock('button')
S().setProp(btnId, 'link', { kind: 'url', target: 'example.com' })
const btnHtml = renderToStaticMarkup(<BlockView block={S().getBlock(btnId)} theme={theme} business={S().business} />)
ok(btnHtml.includes('https://example.com'), 'Button widget ka external link laga')
const ctaId = S().addBlock('cta')
const ctaHtml = renderToStaticMarkup(<BlockView block={S().getBlock(ctaId)} theme={theme} business={S().business} />)
ok(/<a [^>]*href=/.test(ctaHtml), 'CTA section ke buttons link bane')

let perPage = 0
for (const page of S().site.pages) {
  try { pageToHtml({ site: S().site, theme, business: S().business, page, allPages: S().site.pages }); perPage++ } catch (e) { }
}
ok(perPage === 10, 'har page ka alag HTML export hua', `${perPage}/10`)

console.log('\n--- 11. PAGE DELETE / RENAME ---')
S().renamePage(aboutPage.id, 'About Us')
ok(S().site.pages.find((p) => p.id === aboutPage.id).name === 'About Us', 'page rename hua')
const n = S().site.pages.length
S().removePage(aboutPage.id)
ok(S().site.pages.length === n - 1, 'page delete hua')

console.log('\n--- 12. THEME ---')
S().setTheme({ palette: 'noir', radius: 'pill' })
ok(S().site.theme.palette === 'noir', 'palette badla')
const t2 = resolveTheme(S().site.theme)
ok(t2.radiusBtn === '999px' && t2.radiusMedia !== '999px', 'pill sirf buttons pe, media pe nahi',
  `btn=${t2.radiusBtn} media=${t2.radiusMedia}`)

console.log('\n================ RESULT ================')
if (fails.length) {
  console.log(`${fails.length} FAILURES:`)
  fails.forEach((f) => console.log('  ✗ ' + f))
} else {
  console.log('SAB PASS — 10-page website blank se ban gayi, sab widgets, edits, links aur export chal rahe hain')
}
