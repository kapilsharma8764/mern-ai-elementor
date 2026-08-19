import React from 'react'
import { parseHTML } from 'linkedom'
import { TEMPLATES } from '../src/data/templates.js'
import { makeBlock, resolveTheme } from '../src/store/useBuilder.js'
import { personaliseSite } from '../src/store/personalise.js'
import { siteToHtml } from '../src/utils/exportSite.jsx'

const biz = {
  name: 'Pedinno AI', logo: 'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E', logoStyle: { mode: 'logoName', shape: 'rounded', size: 'md', position: 'left' },
  title: '', slogan: 'Intelligence accelerated', about: 'We build AI-powered business products for teams.',
  established: '2019', type: 'technology', subType: 'Product', industry: 'AI & Automation',
  services: ['Workflow Automation', 'Document Extraction'], products: ['Interview Analysis'], highlights: ['24x7 support'],
  phone: '+91 98765 43210', whatsapp: '+91 98765 43210', email: 'hello@pedinno.com',
  address: 'Plot 12', city: 'Jaipur', timing: '10-7', country: 'India',
  altPhone: '', altEmail: '', state: '', pincode: '', mapEmbed: '', workingDays: '',
  facebook: '', instagram: '', linkedin: '', twitter: '', youtube: '', website: '',
  metaDescription: '', keywords: '', regNumber: '', copyright: '', owner: '', audience: '',
}

const tpl = TEMPLATES[0]
const blocks = tpl.blocks.map((b) => makeBlock(b.type, b.variant))
const header = blocks.find((b) => b.type === 'header')
const footer = blocks.find((b) => b.type === 'footer')
const body = blocks.filter((b) => b !== header && b !== footer)
const pages = [
  { id: 'p1', name: 'Home', slug: '/', blocks: body },
  { id: 'p2', name: 'About', slug: '/about', blocks: [makeBlock('about'), makeBlock('team')] },
  { id: 'p3', name: 'Contact', slug: '/contact', blocks: [makeBlock('contact'), makeBlock('map')] },
]
const site = personaliseSite({ header: header || makeBlock('header'), footer: footer || makeBlock('footer'), pages }, biz)
site.header.props.links = [
  ...site.header.props.links,
  { label: 'About page', link: { kind: 'page', target: 'p2' } },
  { label: 'Contact page', link: { kind: 'page', target: 'p3' } },
]
const html = siteToHtml({ site, theme: resolveTheme(tpl.theme), business: biz })
const { document } = parseHTML(html)

const checks = {
  'doctype + html':      /^<!doctype html>/i.test(html),
  'title present':       !!document.querySelector('title')?.textContent,
  'favicon':             !!document.querySelector('link[rel="icon"]'),
  'google fonts':        !!document.querySelector('link[href*="fonts.googleapis"]'),
  'json-ld':             !!document.querySelector('script[type="application/ld+json"]'),
  'all 3 pages inside':  document.querySelectorAll('.wb-page').length === 3,
  'only 1 page visible': Array.from(document.querySelectorAll('.wb-page')).filter((p) => !p.hasAttribute('hidden')).length === 1,
  'page router script':  /querySelectorAll\('\.wb-page'\)/.test(html),
  'page nav bar':        !!document.querySelector('.exported-nav'),
  'page links rewritten': !!document.querySelector('a[href="about.html"]'),
  'container queries':   /container-type:inline-size/.test(html),
  'anchors resolve':     Array.from(document.querySelectorAll('.wb-page:not([hidden]) a[href^="#"]')).every((a) => document.getElementById(a.getAttribute('href').slice(1))),
  'no react artifacts':  !/data-reactroot|__html/.test(html),
}
let bad = 0
Object.entries(checks).forEach(([k, v]) => { if (!v) bad++; console.log((v ? 'OK   ' : 'FAIL ') + k) })
console.log(`\nsize: ${(html.length / 1024).toFixed(1)} KB`)
console.log(bad ? `FAILURES: ${bad}` : 'BROWSER PREVIEW HTML IS VALID')
