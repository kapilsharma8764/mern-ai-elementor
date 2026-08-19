import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TEMPLATES } from '../src/data/templates.js'
import { WIDGETS } from '../src/sections/widgets.jsx'
import { BlockView } from '../src/sections/Renderer.jsx'
import { resolveTheme, makeBlock } from '../src/store/useBuilder.js'
import { personaliseSite } from '../src/store/personalise.js'

const biz = {
  name: 'Pedinno AI',
  logo: '',
  logoStyle: { mode: 'logoName', shape: 'rounded', size: 'md', position: 'left' },
  title: '', slogan: 'Intelligence accelerated for every business',
  about: 'Pedinno builds AI-powered business products using LLM technology, intelligent automation, OCR and analytics.',
  established: '2019', type: 'technology', subType: 'Product', industry: 'AI & Automation',
  services: ['Workflow Automation', 'Document Extraction', 'Marketing Automation'],
  products: ['Interview Analysis', 'Data Studio'],
  highlights: ['24x7 support', 'ISO certified', 'On-time delivery'],
  phone: '+91 98765 43210', whatsapp: '+91 98765 43210', email: 'hello@pedinno.com',
  address: 'Plot 12, Tech Park', city: 'Jaipur', timing: '10:00 AM - 7:00 PM',
  facebook: 'https://facebook.com/pedinno', linkedin: 'https://linkedin.com/company/pedinno',
  altPhone: '', altEmail: '', state: '', pincode: '', country: 'India', mapEmbed: '', workingDays: '',
  instagram: '', twitter: '', youtube: '', website: '', metaDescription: '', keywords: '', regNumber: '', copyright: '',
  owner: '', audience: '',
}

// stock copy jo personalise ke baad nahi bachni chahiye
const STOCK = [
  'We build things that grow your business',
  'A short line about what you do',
  'Built on trust, delivered with care',
  'Tell your story here',
  'Services built around your goals',
  'Everything you need, under one roof.',
  'Products people actually love',
  'Ready to start your project?',
  'Send us an enquiry',
]

let leaks = [], missing = [], checked = 0

for (const tpl of TEMPLATES) {
  const blocks = tpl.blocks.map((b) => makeBlock(b.type, b.variant))
  const header = blocks.find((b) => b.type === 'header')
  const footer = blocks.find((b) => b.type === 'footer')
  const body = blocks.filter((b) => b !== header && b !== footer)
  const page = { id: 'p', name: 'Home', slug: '/', blocks: body }
  const raw = { header: header || makeBlock('header'), footer: footer || makeBlock('footer'), pages: [page], theme: tpl.theme }
  const site = personaliseSite(raw, biz)
  const theme = resolveTheme(tpl.theme)

  const html = renderToStaticMarkup(
    <div>
      <BlockView block={site.header} theme={theme} business={biz} />
      {site.pages[0].blocks.map((b) => <BlockView key={b.id} block={b} theme={theme} business={biz} />)}
      <BlockView block={site.footer} theme={theme} business={biz} />
    </div>
  )
  checked++

  for (const s of STOCK) if (html.includes(s)) leaks.push(`${tpl.no} ${tpl.name}: "${s.slice(0, 40)}"`)
  if (!html.includes('Pedinno AI')) missing.push(`${tpl.no} ${tpl.name}: company name`)
  // jis template me services widget hai usme user ki services honi chahiye
  const hasServices = tpl.blocks.some((b) => b.type === 'services')
  if (hasServices && !html.includes('Workflow Automation')) missing.push(`${tpl.no} ${tpl.name}: services`)
  const hasProducts = tpl.blocks.some((b) => b.type === 'products')
  if (hasProducts && !html.includes('Interview Analysis')) missing.push(`${tpl.no} ${tpl.name}: products`)
  const hasContact = tpl.blocks.some((b) => b.type === 'contact')
  if (hasContact && !html.includes('hello@pedinno.com') && !html.includes('98765')) missing.push(`${tpl.no} ${tpl.name}: contact details`)
}

console.log(`templates checked : ${checked}`)
console.log(`stock-copy leaks  : ${leaks.length}`)
console.log(`missing info      : ${missing.length}`)
if (leaks.length) { console.log('\nleaks (first 10):'); leaks.slice(0, 10).forEach((m) => console.log('  ' + m)) }
if (missing.length) { console.log('\nmissing (first 10):'); missing.slice(0, 10).forEach((m) => console.log('  ' + m)) }
if (!leaks.length && !missing.length) console.log('\nALL TEMPLATES PERSONALISED CORRECTLY')
