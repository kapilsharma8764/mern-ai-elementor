/* ------------------------------------------------------------------ *
 * Template select hote hi business info ko har section ke sahi format
 * me daalta hai. Jo info nahi di gayi uske liye baaki details se
 * sensible copy bana leta hai — placeholder text kahin nahi bachta.
 * ------------------------------------------------------------------ */

import { guessLink, sectionAnchor, resolveAgainstPage } from '../sections/links'

const clone = (o) => JSON.parse(JSON.stringify(o))
const list = (a) => (Array.isArray(a) ? a.filter(Boolean) : [])
const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)

const TYPE_LABEL = { education: 'Education', business: 'Business', technology: 'Technology' }

/** business object se saara reusable text ek jagah */
export function buildCopy(biz) {
  const name = (biz.name || '').trim() || 'Your Company'
  const services = list(biz.services)
  const products = list(biz.products)
  const highlights = list(biz.highlights)
  const city = (biz.city || '').trim()
  const where = city ? ` in ${city}` : ''
  const what = services[0] || products[0] || biz.industry || TYPE_LABEL[biz.type] || 'quality work'
  const years = biz.established ? Math.max(1, new Date().getFullYear() - Number(biz.established)) : null

  const tagline = (biz.slogan || '').trim()
  const about = (biz.about || '').trim()

  return {
    name, city, where, what, services, products, highlights, years,
    tagline, about,
    industry: (biz.industry || '').trim(),
    typeLabel: TYPE_LABEL[biz.type] || '',
    focus: biz.subType || '',

    headline: (biz.title || '').trim() || tagline || `${name}${where}`,
    subline: about || tagline || `${name} delivers ${what.toLowerCase()}${where} — done properly, on time.`,
    eyebrow: biz.industry || biz.subType || TYPE_LABEL[biz.type] || 'Welcome',

    ctaPrimary: 'Get a quote',
    ctaSecondary: biz.phone ? `Call ${biz.phone}` : 'Learn more',

    aboutTitle: tagline || `About ${name}`,
    aboutBody: about || `${name} has been delivering ${what.toLowerCase()}${where}${years ? ` for over ${years} years` : ''}. We keep the process simple, the pricing transparent and the quality consistent.`,

    /** ek service/product ka description */
    describe: (title) => `${cap(String(title))} handled end to end by the ${name} team — clear scope, fixed timeline, no surprises.`,
  }
}

/** default items ko user ke items se replace karo, baaki fields preserve karke */
function fillItems(existing, titles, make) {
  const old = Array.isArray(existing) ? existing : []
  return titles.map((title, i) => ({ ...(old[i] || {}), ...make(title, i) }))
}

const ICONS = ['◆', '◈', '◇', '❖', '⬢', '⬡']

/** ek block ko business info se bharo */
export function personaliseBlock(block, c, biz) {
  const p = block.props
  const set = (k, v) => { if (v) p[k] = v }

  switch (block.type) {
    case 'header': {
      set('cta', biz.phone ? 'Get a quote' : p.cta)
      const labels = [
        'Home',
        'About',
        ...(c.services.length ? ['Services'] : []),
        ...(c.products.length ? ['Products'] : []),
        'Contact',
      ]
      p.links = labels.map((label) => ({ label, link: guessLink(label) }))
      p.ctaLink = { kind: 'section', target: sectionAnchor('contact') }
      break
    }

    case 'hero':
      set('eyebrow', c.eyebrow)
      set('title', c.headline)
      set('sub', c.subline)
      set('cta', c.ctaPrimary)
      set('cta2', c.ctaSecondary)
      if (c.services.length) p.slides = c.services.slice(0, 4).map((title) => ({ title }))
      else if (c.highlights.length) p.slides = c.highlights.slice(0, 4).map((title) => ({ title }))
      break

    case 'announce':
      set('text', c.tagline || `${c.name} — ${c.what}`)
      set('linkText', biz.phone ? `Call ${biz.phone}` : 'Get in touch')
      p.ctaLink = { kind: 'section', target: sectionAnchor('contact') }
      break

    case 'logocloud':
      set('title', `Trusted by teams${c.where || ' across India'}`)
      break

    case 'feature': {
      const src = c.highlights.length ? c.highlights : c.services
      set('eyebrow', c.industry || 'Platform')
      set('title', c.services[0] ? `${c.services[0]}, done properly` : `Built around how ${c.name} works`)
      set('body', c.tagline || c.aboutBody)
      if (src.length) p.points = src.map((label) => ({ label }))
      set('cta', c.ctaPrimary)
      break
    }

    case 'marquee':
      set('text', (c.services.length ? c.services : c.highlights).slice(0, 4).join('  ·  ') || c.tagline || `${c.name}${c.where}`)
      break

    case 'about':
      set('eyebrow', 'About us')
      set('title', c.aboutTitle)
      set('body', c.aboutBody)
      if (c.years) set('years', String(c.years))
      if (c.highlights.length) p.points = c.highlights.map((label) => ({ label }))
      break

    case 'services':
      set('eyebrow', c.focus === 'Services' ? 'Our services' : 'What we do')
      set('title', `Services${c.where ? ` ${c.where.trim()}` : ''}`.trim() === 'Services' ? 'What we do best' : `Our services${c.where}`)
      set('sub', c.tagline)
      if (c.services.length) {
        p.items = fillItems(p.items, c.services, (title, i) => ({ title, text: c.describe(title), icon: ICONS[i % ICONS.length] }))
        p.columns = c.services.length <= 2 ? 2 : c.services.length === 4 ? 4 : 3
      }
      break

    case 'products':
      set('eyebrow', 'Our products')
      set('title', `Products by ${c.name}`)
      if (c.products.length) {
        p.items = fillItems(p.items, c.products, (title) => ({ title, text: c.describe(title), price: '', tag: '' }))
        p.columns = c.products.length <= 2 ? 2 : 3
      }
      break

    case 'bento': {
      const src = c.highlights.length ? c.highlights : c.services
      set('eyebrow', 'Why choose us')
      set('title', `Why teams pick ${c.name}`)
      if (src.length) p.items = fillItems(p.items, src, (title) => ({ title, text: c.describe(title) }))
      break
    }

    case 'work': {
      const src = c.products.length ? c.products : c.services
      set('eyebrow', 'Selected work')
      set('title', c.products.length ? 'Our products' : 'What we deliver')
      if (src.length) {
        const year = new Date().getFullYear()
        p.items = fillItems(p.items, src, (title, i) => ({ title, tag: c.industry || c.typeLabel || 'Project', year: String(year - (i % 3)) }))
      }
      break
    }

    case 'process':
      set('eyebrow', 'How we work')
      set('title', `Working with ${c.name}`)
      break

    case 'info':
      set('eyebrow', 'Why us')
      set('title', `What makes ${c.name} different`)
      if (c.highlights.length) p.items = fillItems(p.items, c.highlights, (title) => ({ title, text: c.describe(title) }))
      break

    case 'bigstats':
      if (c.years) {
        p.items = [
          { value: `${c.years}+`, label: 'Years in business' },
          { value: c.services.length ? `${c.services.length}` : '24/7', label: c.services.length ? 'Services offered' : 'Support' },
          { value: '100%', label: 'Client focus' },
        ]
      }
      break

    case 'stats':
      if (c.years) p.items = [{ value: `${c.years}+`, label: 'Years in business' }, ...(p.items || []).slice(1)]
      break

    case 'chart':
      set('eyebrow', 'Our growth')
      set('title', `${c.name} year on year`)
      set('body', c.tagline || c.aboutBody.slice(0, 160))
      break

    case 'testimonials':
      set('title', `What ${c.city || 'our'} clients say`)
      break

    case 'team':
      set('title', `The ${c.name} team`)
      break

    case 'faq':
      set('title', `${c.name} — questions answered`)
      break

    case 'gallery':
      set('title', `${c.name} in pictures`)
      break

    case 'pricing':
      set('title', `${c.name} pricing`)
      break

    case 'cta':
      set('title', `Ready to work with ${c.name}?`)
      set('sub', biz.phone ? `Call ${biz.phone} or send an enquiry — we reply the same day.` : 'Send an enquiry and we will reply the same day.')
      set('button', c.ctaPrimary)
      set('button2', c.ctaSecondary)
      break

    case 'contact':
      set('eyebrow', 'Contact')
      set('title', `Contact ${c.name}`)
      set('sub', `Fill the form and the ${c.name} team will get back to you${biz.timing ? ` during ${biz.timing}` : ' within one business day'}.`)
      break

    case 'map':
      set('title', c.city ? `Find us in ${c.city}` : 'Find us')
      break

    case 'newsletter':
      set('title', `Updates from ${c.name}`)
      break

    case 'logos':
      set('title', `Trusted by teams${c.where || ' across India'}`)
      break

    case 'footer':
      set('about', c.about || c.tagline || c.aboutBody.slice(0, 140))
      set('copyright', biz.copyright)
      p.cols = [
        c.services.length ? { title: 'Services', links: c.services.slice(0, 5).join('\n') } : null,
        c.products.length ? { title: 'Products', links: c.products.slice(0, 5).join('\n') } : null,
        { title: 'Company', links: ['About', c.services.length ? 'Services' : null, 'Contact'].filter(Boolean).join('\n') },
      ].filter(Boolean)
      break

    default:
      break
  }
}

/** poore site ko business info se bharo */
export function personaliseSite(site, biz) {
  const s = clone(site)
  const c = buildCopy(biz)
  const all = [s.header, s.footer, ...s.pages.flatMap((pg) => pg.blocks)]
  all.forEach((b) => personaliseBlock(b, c, biz))

  // jo section page pe hai hi nahi, uske har link ko sahi jagah bhej do
  const present = s.pages[0].blocks.map((b) => b.type)
  all.forEach((b) => fixLinks(b.props, present))
  return s
}

/** props me jitne bhi link objects hain, sabko page ke hisaab se resolve karo */
function fixLinks(node, present) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) return node.forEach((v) => fixLinks(v, present))
  Object.entries(node).forEach(([k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof v.kind === 'string') {
      node[k] = resolveAgainstPage(v, present)
    } else {
      fixLinks(v, present)
    }
  })
}
