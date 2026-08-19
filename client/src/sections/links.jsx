import React from 'react'

/* ------------------------------------------------------------------ *
 * Link system — menu/footer/button links ko asli destination deta hai.
 * kind: 'section' | 'page' | 'url' | 'tel' | 'wa' | 'mail' | 'none'
 * ------------------------------------------------------------------ */

export const LINK_KINDS = [
  { id: 'page', label: 'Website ka doosra page' },
  { id: 'section', label: 'Isi page me neeche le jao' },
  { id: 'tel', label: 'Phone call lagao' },
  { id: 'wa', label: 'WhatsApp kholo' },
  { id: 'mail', label: 'Email bhejo' },
  { id: 'url', label: 'Koi doosri website' },
  { id: 'none', label: 'Kahin nahi (sirf dikhega)' },
]

/** section anchor id — har block type ka fixed id, taki links kaam karein */
export const sectionAnchor = (type) => `s-${type}`

const digits = (v = '') => String(v).replace(/[^\d+]/g, '').replace(/^\+?/, '')

/** ek link object se asli href */
export function hrefFor(link = {}, biz = {}) {
  const { kind, target } = link
  switch (kind) {
    case 'section': return target ? `#${target}` : null
    case 'page': return target ? target : null
    case 'url': return target ? (/^https?:|^\/|^#/.test(target) ? target : `https://${target}`) : null
    case 'tel': return biz.phone ? `tel:${digits(biz.phone)}` : null
    case 'wa': return biz.whatsapp || biz.phone ? `https://wa.me/${digits(biz.whatsapp || biz.phone)}` : null
    case 'mail': return biz.email ? `mailto:${biz.email}` : null
    case 'none': default: return null
  }
}

/**
 * Anchor jo har jagah sahi behave kare:
 *  - builder canvas: navigation block (overlay pehle hi clicks rok leta hai)
 *  - preview: smooth scroll / page switch
 *  - export: normal <a href>
 */
export function A({ link, biz, style, children, onNavigate }) {
  const href = hrefFor(link, biz)
  const base = { color: 'inherit', textDecoration: 'none', cursor: href ? 'pointer' : 'default', ...style }
  if (!href) return <span style={base}>{children}</span>

  const external = /^https?:/.test(href)
  return (
    <a
      href={href}
      style={base}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(e) => {
        if (!onNavigate) return
        const handled = onNavigate(link, href, e)
        if (handled) e.preventDefault()
      }}
    >
      {children}
    </a>
  )
}

/** label dekh ke sensible default link — personalise ise use karta hai */
export function guessLink(label, availableTypes = [], pages = []) {
  const l = String(label).toLowerCase().trim()

  const page = pages.find((p) => p.name.toLowerCase() === l)
  if (page) return { kind: 'page', target: page.file }

  if (/^home$/.test(l)) return { kind: 'section', target: 'top' }
  if (/about/.test(l)) return { kind: 'section', target: sectionAnchor('about') }
  if (/service/.test(l)) return { kind: 'section', target: sectionAnchor('services') }
  if (/product/.test(l)) return { kind: 'section', target: sectionAnchor('products') }
  if (/work|portfolio|project/.test(l)) return { kind: 'section', target: sectionAnchor('work') }
  if (/price|plan/.test(l)) return { kind: 'section', target: sectionAnchor('pricing') }
  if (/team/.test(l)) return { kind: 'section', target: sectionAnchor('team') }
  if (/gallery/.test(l)) return { kind: 'section', target: sectionAnchor('gallery') }
  if (/faq|question/.test(l)) return { kind: 'section', target: sectionAnchor('faq') }
  if (/blog|news/.test(l)) return { kind: 'section', target: sectionAnchor('info') }
  if (/contact|enquir|reach/.test(l)) return { kind: 'section', target: sectionAnchor('contact') }
  if (/call|phone/.test(l)) return { kind: 'tel' }
  if (/whatsapp/.test(l)) return { kind: 'wa' }
  if (/mail|email/.test(l)) return { kind: 'mail' }
  if (/quote|started|demo|book|enquiry/.test(l)) return { kind: 'section', target: sectionAnchor('contact') }

  return { kind: 'none' }
}

/** jo section page pe maujood nahi, uska link contact/top pe fallback ho jaye */
export function resolveAgainstPage(link, presentTypes) {
  if (link?.kind !== 'section' || !link.target || link.target === 'top') return link
  const type = String(link.target).replace(/^s-/, '')
  if (presentTypes.includes(type)) return link
  if (presentTypes.includes('contact')) return { kind: 'section', target: sectionAnchor('contact') }
  return { kind: 'section', target: 'top' }
}
