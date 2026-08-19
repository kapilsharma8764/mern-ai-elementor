import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseHTML } from 'linkedom'
import { TEMPLATES } from '../src/data/templates.js'
import { makeBlock, resolveTheme } from '../src/store/useBuilder.js'
import { personaliseSite } from '../src/store/personalise.js'
import { BlockView } from '../src/sections/Renderer.jsx'
import { hrefFor, guessLink } from '../src/sections/links.jsx'
import { pageToHtml } from '../src/utils/exportSite.jsx'

const biz = {
  name: 'Pedinno AI', logo: '', logoStyle: { mode: 'logoName', shape: 'rounded', size: 'md', position: 'left' },
  title: '', slogan: 'Intelligence accelerated', about: 'We build AI-powered business products.',
  established: '2019', type: 'technology', subType: 'Product', industry: 'AI & Automation',
  services: ['Workflow Automation', 'Document Extraction'], products: ['Interview Analysis'], highlights: ['24x7 support'],
  phone: '+91 98765 43210', whatsapp: '+91 98765 43210', email: 'hello@pedinno.com',
  address: 'Plot 12', city: 'Jaipur', timing: '10-7', country: 'India',
  altPhone: '', altEmail: '', state: '', pincode: '', mapEmbed: '', workingDays: '',
  facebook: '', instagram: '', linkedin: '', twitter: '', youtube: '', website: '',
  metaDescription: '', keywords: '', regNumber: '', copyright: '', owner: '', audience: '',
}

let deadLinks = [], brokenAnchors = [], noLinks = [], checked = 0

for (const tpl of TEMPLATES) {
  const blocks = tpl.blocks.map((b) => makeBlock(b.type, b.variant))
  const header = blocks.find((b) => b.type === 'header')
  const footer = blocks.find((b) => b.type === 'footer')
  const body = blocks.filter((b) => b !== header && b !== footer)
  const page = { id: 'p', name: 'Home', slug: '/', blocks: body }
  const site = personaliseSite({ header: header || makeBlock('header'), footer: footer || makeBlock('footer'), pages: [page] }, biz)
  const theme = resolveTheme(tpl.theme)
  checked++

  // 1. har menu link ka href banna chahiye
  for (const l of site.header.props.links || []) {
    if (!hrefFor(l.link, biz)) deadLinks.push(`${tpl.no} ${tpl.name}: "${l.label}"`)
  }
  if (!hrefFor(site.header.props.ctaLink, biz)) deadLinks.push(`${tpl.no} ${tpl.name}: CTA button`)

  // 2. exported HTML me har #anchor ka target maujood ho
  const html = pageToHtml({ site, theme, business: biz, page: site.pages[0], allPages: [site.pages[0]] })
  const { document } = parseHTML(html)
  const anchors = Array.from(document.querySelectorAll('a[href^="#"]'))
  if (!anchors.length) noLinks.push(`${tpl.no} ${tpl.name}`)
  for (const a of anchors) {
    const id = a.getAttribute('href').slice(1)
    if (!document.getElementById(id)) brokenAnchors.push(`${tpl.no} ${tpl.name}: #${id}`)
  }
}

// guessLink sanity
const guesses = [
  ['Home', 'section'], ['About', 'section'], ['Services', 'section'], ['Contact', 'section'],
  ['Call now', 'tel'], ['WhatsApp us', 'wa'], ['Email us', 'mail'], ['Get a Quote', 'section'],
]
const badGuess = guesses.filter(([label, kind]) => guessLink(label).kind !== kind)

console.log(`templates checked : ${checked}`)
console.log(`dead menu links   : ${deadLinks.length}`)
console.log(`broken #anchors   : ${brokenAnchors.length}`)
console.log(`no links at all   : ${noLinks.length}`)
console.log(`guessLink wrong   : ${badGuess.length}`)
if (deadLinks.length) { console.log('\ndead:'); deadLinks.slice(0, 8).forEach((m) => console.log('  ' + m)) }
if (brokenAnchors.length) { console.log('\nbroken anchors:'); brokenAnchors.slice(0, 8).forEach((m) => console.log('  ' + m)) }
if (noLinks.length) { console.log('\nno links:'); noLinks.slice(0, 8).forEach((m) => console.log('  ' + m)) }
if (badGuess.length) { console.log('\nbad guesses:'); badGuess.forEach(([l, k]) => console.log(`  ${l} -> expected ${k}, got ${guessLink(l).kind}`)) }
if (!deadLinks.length && !brokenAnchors.length && !noLinks.length && !badGuess.length) console.log('\nALL LINKS WORK')
