import { WIDGETS } from '../sections/widgets'
import { PALETTES, FONTS } from './design'

/* ------------------------------------------------------------------ *
 *  Built-in templates — har category ke 50.
 *
 *  Ek template = structure (kaunse section, kis order me)
 *              + variant set (har section ka kaunsa layout)
 *              + theme (palette, font, corners, spacing, width)
 *
 *  Har category ke apne structures hain, aur har pass me variants
 *  shift hote hain — isliye do template kabhi ek jaise nahi lagte.
 * ------------------------------------------------------------------ */

/* =================== B2B / BUSINESS =================== */
const BUSINESS = [
  { name: 'Meridian', tags: ['Corporate', 'Clean'], s: [
    ['header', 3], ['hero', 11], ['logocloud', 1], ['about', 0], ['services', 0], ['stats', 1], ['work', 1], ['testimonials', 0], ['contact', 0], ['footer', 0]] },
  { name: 'Atlas Group', tags: ['Corporate', 'Trust'], s: [
    ['header', 3], ['hero', 3], ['stats', 0], ['services', 2], ['feature', 0], ['process', 1], ['team', 0], ['cta', 0], ['map', 0], ['footer', 0]] },
  { name: 'Onyx Consulting', tags: ['Consulting'], s: [
    ['header', 0], ['hero', 10], ['marquee', 1], ['about', 0], ['process', 0], ['bigstats', 1], ['testimonials', 1], ['faq', 1], ['contact', 0], ['footer', 3]] },
  { name: 'Monolith', tags: ['Agency', 'Editorial'], s: [
    ['header', 2], ['hero', 7], ['marquee', 0], ['about', 2], ['work', 0], ['bigstats', 0], ['process', 0], ['testimonials', 3], ['contact', 1], ['footer', 2]] },
  { name: 'Prism Studio', tags: ['Agency', 'Portfolio'], s: [
    ['header', 4], ['hero', 6], ['logocloud', 0], ['work', 1], ['services', 4], ['bigstats', 1], ['team', 0], ['cta', 1], ['footer', 1]] },
  { name: 'Aperture', tags: ['Portfolio', 'Dark'], s: [
    ['header', 1], ['hero', 4], ['gallery', 1], ['work', 0], ['about', 3], ['process', 1], ['testimonials', 2], ['contact', 2], ['footer', 2]] },
  { name: 'Boutique', tags: ['Store', 'Product'], s: [
    ['header', 1], ['hero', 5], ['marquee', 0], ['products', 0], ['about', 1], ['gallery', 0], ['testimonials', 0], ['newsletter', 0], ['footer', 1]] },
  { name: 'Forge Works', tags: ['Manufacturing'], s: [
    ['header', 3], ['hero', 9], ['about', 0], ['products', 1], ['bigstats', 0], ['process', 1], ['logocloud', 1], ['contact', 0], ['map', 0], ['footer', 0]] },
  { name: 'Lumen Retail', tags: ['Product', 'Bold'], s: [
    ['header', 0], ['hero', 6], ['products', 0], ['bento', 1], ['work', 1], ['testimonials', 3], ['cta', 2], ['footer', 1]] },
  { name: 'Cascade Local', tags: ['Local', 'Service'], s: [
    ['header', 3], ['hero', 0], ['services', 0], ['bigstats', 1], ['info', 1], ['testimonials', 0], ['contact', 2], ['map', 1], ['footer', 3]] },
  { name: 'Ironclad Legal', tags: ['Law', 'Formal'], s: [
    ['header', 2], ['hero', 4], ['about', 2], ['services', 2], ['info', 0], ['team', 0], ['faq', 1], ['contact', 0], ['footer', 0]] },
  { name: 'Northwind Logistics', tags: ['Logistics'], s: [
    ['header', 3], ['hero', 9], ['bigstats', 0], ['services', 1], ['process', 0], ['chart', 0], ['logocloud', 1], ['contact', 2], ['map', 0], ['footer', 2]] },
  { name: 'Vantage Finance', tags: ['Finance', 'Trust'], s: [
    ['announce', 0], ['header', 5], ['hero', 10], ['logocloud', 0], ['chart', 0], ['feature', 0], ['bigstats', 1], ['faq', 0], ['cta', 0], ['footer', 0]] },
  { name: 'Copper Interiors', tags: ['Interior', 'Visual'], s: [
    ['header', 1], ['hero', 5], ['gallery', 0], ['about', 0], ['work', 1], ['process', 1], ['testimonials', 0], ['contact', 1], ['footer', 1]] },
  { name: 'Summit Realty', tags: ['Real Estate'], s: [
    ['header', 3], ['hero', 0], ['products', 0], ['bigstats', 1], ['info', 2], ['gallery', 0], ['testimonials', 0], ['contact', 0], ['map', 0], ['footer', 0]] },
  { name: 'Pulse Healthcare', tags: ['Healthcare'], s: [
    ['header', 3], ['hero', 9], ['info', 2], ['services', 1], ['process', 1], ['team', 0], ['faq', 0], ['contact', 0], ['map', 1], ['footer', 0]] },
  { name: 'Anvil Construction', tags: ['Construction'], s: [
    ['header', 0], ['hero', 3], ['bigstats', 0], ['work', 1], ['services', 2], ['process', 0], ['gallery', 1], ['cta', 0], ['contact', 2], ['footer', 3]] },
]

/* =================== EDUCATION =================== */
const EDUCATION = [
  { name: 'Campus One', tags: ['Institute'], s: [
    ['header', 3], ['hero', 0], ['stats', 0], ['services', 0], ['about', 0], ['process', 1], ['team', 0], ['faq', 0], ['contact', 0], ['map', 0], ['footer', 0]] },
  { name: 'Scholar', tags: ['Courses'], s: [
    ['announce', 1], ['header', 4], ['hero', 10], ['logocloud', 0], ['info', 2], ['services', 0], ['pricing', 0], ['testimonials', 0], ['faq', 0], ['newsletter', 1], ['footer', 1]] },
  { name: 'Academy Pro', tags: ['Academy', 'Modern'], s: [
    ['header', 5], ['hero', 11], ['bigstats', 1], ['bento', 0], ['services', 2], ['feature', 1], ['team', 1], ['testimonials', 0], ['contact', 1], ['footer', 2]] },
  { name: 'Research Lab', tags: ['Research'], s: [
    ['header', 2], ['hero', 7], ['about', 3], ['chart', 0], ['process', 0], ['info', 0], ['team', 1], ['faq', 1], ['contact', 1], ['footer', 2]] },
  { name: 'Bright Kids', tags: ['School', 'Playful'], s: [
    ['header', 1], ['hero', 5], ['info', 2], ['gallery', 0], ['services', 0], ['team', 0], ['testimonials', 0], ['contact', 0], ['map', 1], ['footer', 1]] },
  { name: 'Skill Forge', tags: ['Training', 'Bootcamp'], s: [
    ['announce', 0], ['header', 4], ['hero', 8], ['marquee', 0], ['services', 1], ['process', 0], ['bigstats', 0], ['pricing', 0], ['testimonials', 2], ['faq', 0], ['cta', 1], ['footer', 2]] },
  { name: 'Vidya Coaching', tags: ['Coaching', 'Local'], s: [
    ['header', 3], ['hero', 0], ['stats', 0], ['services', 0], ['info', 1], ['testimonials', 0], ['faq', 0], ['contact', 0], ['map', 0], ['footer', 3]] },
  { name: 'Uni Portal', tags: ['University'], s: [
    ['header', 2], ['hero', 4], ['bigstats', 1], ['about', 2], ['services', 2], ['work', 1], ['team', 1], ['gallery', 1], ['faq', 1], ['contact', 1], ['footer', 0]] },
  { name: 'Online Class', tags: ['E-learning'], s: [
    ['header', 5], ['hero', 11], ['logocloud', 1], ['feature', 0], ['services', 0], ['chart', 2], ['pricing', 1], ['testimonials', 0], ['newsletter', 1], ['footer', 2]] },
  { name: 'Prep Master', tags: ['Test Prep'], s: [
    ['header', 0], ['hero', 1], ['bigstats', 0], ['info', 0], ['services', 4], ['process', 1], ['testimonials', 3], ['pricing', 0], ['faq', 1], ['contact', 2], ['footer', 1]] },
  { name: 'Art School', tags: ['Creative', 'Visual'], s: [
    ['header', 1], ['hero', 7], ['gallery', 1], ['about', 2], ['work', 0], ['team', 1], ['process', 0], ['contact', 1], ['footer', 2]] },
  { name: 'Tech Institute', tags: ['Technical'], s: [
    ['header', 4], ['hero', 6], ['bento', 0], ['services', 3], ['chart', 0], ['bigstats', 1], ['team', 0], ['faq', 0], ['cta', 1], ['footer', 2]] },
  { name: 'Language Hub', tags: ['Language'], s: [
    ['announce', 1], ['header', 3], ['hero', 1], ['marquee', 1], ['info', 2], ['services', 0], ['testimonials', 0], ['pricing', 1], ['newsletter', 0], ['footer', 1]] },
  { name: 'Sports Academy', tags: ['Sports'], s: [
    ['header', 2], ['hero', 3], ['bigstats', 0], ['gallery', 0], ['services', 2], ['team', 1], ['process', 1], ['contact', 0], ['map', 0], ['footer', 3]] },
  { name: 'Kids Play', tags: ['Preschool'], s: [
    ['header', 1], ['hero', 5], ['about', 1], ['info', 2], ['gallery', 0], ['team', 0], ['faq', 0], ['contact', 2], ['map', 1], ['footer', 1]] },
  { name: 'Career Guide', tags: ['Counselling'], s: [
    ['header', 0], ['hero', 9], ['process', 0], ['services', 0], ['bigstats', 1], ['testimonials', 0], ['faq', 1], ['contact', 0], ['footer', 0]] },
  { name: 'Library Commons', tags: ['Library', 'Calm'], s: [
    ['header', 2], ['hero', 7], ['about', 2], ['info', 0], ['gallery', 1], ['faq', 1], ['contact', 1], ['map', 1], ['footer', 2]] },
]

/* =================== TECHNOLOGY / SAAS =================== */
const TECHNOLOGY = [
  { name: 'Clarity', tags: ['SaaS', 'Gradient'], s: [
    ['announce', 0], ['header', 5], ['hero', 10], ['logocloud', 0], ['feature', 0], ['bento', 0], ['feature', 1], ['pricing', 0], ['faq', 0], ['cta', 1], ['footer', 2]] },
  { name: 'Nimbus', tags: ['SaaS', 'Mockup'], s: [
    ['header', 5], ['hero', 11], ['logocloud', 1], ['feature', 0], ['chart', 2], ['bento', 0], ['testimonials', 0], ['pricing', 0], ['cta', 1], ['footer', 2]] },
  { name: 'Cobalt', tags: ['SaaS', 'Bento'], s: [
    ['announce', 1], ['header', 5], ['hero', 8], ['marquee', 1], ['bento', 1], ['feature', 1], ['process', 0], ['testimonials', 0], ['newsletter', 1], ['footer', 0]] },
  { name: 'Helio', tags: ['AI', 'Dashboard'], s: [
    ['header', 5], ['hero', 9], ['logocloud', 0], ['bigstats', 0], ['feature', 0], ['chart', 0], ['bento', 0], ['faq', 1], ['contact', 2], ['footer', 2]] },
  { name: 'Quartz', tags: ['Startup', 'Mesh'], s: [
    ['announce', 0], ['header', 4], ['hero', 6], ['logocloud', 0], ['info', 0], ['feature', 1], ['chart', 1], ['pricing', 0], ['cta', 1], ['footer', 2]] },
  { name: 'Halcyon', tags: ['Portfolio', 'Minimal'], s: [
    ['header', 1], ['hero', 7], ['work', 0], ['about', 2], ['feature', 0], ['bigstats', 0], ['process', 0], ['contact', 1], ['footer', 2]] },
  { name: 'Circuit', tags: ['Hardware', 'IoT'], s: [
    ['header', 3], ['hero', 3], ['bigstats', 1], ['products', 0], ['feature', 0], ['chart', 2], ['logocloud', 1], ['faq', 0], ['contact', 0], ['footer', 0]] },
  { name: 'Vertex Cloud', tags: ['Infra', 'Enterprise'], s: [
    ['announce', 0], ['header', 5], ['hero', 9], ['logocloud', 0], ['bento', 0], ['chart', 2], ['feature', 1], ['pricing', 1], ['faq', 1], ['cta', 0], ['footer', 2]] },
  { name: 'Pixel Labs', tags: ['Dev Studio'], s: [
    ['header', 4], ['hero', 6], ['marquee', 0], ['work', 0], ['services', 3], ['process', 0], ['team', 1], ['testimonials', 3], ['contact', 1], ['footer', 2]] },
  { name: 'Datum', tags: ['Analytics'], s: [
    ['header', 5], ['hero', 11], ['bigstats', 0], ['chart', 0], ['feature', 0], ['bento', 1], ['testimonials', 0], ['pricing', 0], ['cta', 1], ['footer', 2]] },
  { name: 'Signal App', tags: ['Mobile App'], s: [
    ['announce', 1], ['header', 4], ['hero', 1], ['logocloud', 0], ['gallery', 0], ['bento', 0], ['info', 2], ['pricing', 1], ['faq', 0], ['cta', 2], ['footer', 1]] },
  { name: 'Cipher Security', tags: ['Security'], s: [
    ['header', 2], ['hero', 9], ['bigstats', 0], ['feature', 0], ['services', 3], ['chart', 2], ['faq', 1], ['contact', 2], ['footer', 2]] },
  { name: 'Loop Automation', tags: ['Automation'], s: [
    ['header', 5], ['hero', 8], ['marquee', 1], ['process', 0], ['bento', 0], ['feature', 1], ['chart', 0], ['pricing', 0], ['cta', 1], ['footer', 0]] },
  { name: 'Nova Fintech', tags: ['Fintech'], s: [
    ['announce', 0], ['header', 5], ['hero', 10], ['logocloud', 1], ['feature', 0], ['bigstats', 1], ['chart', 0], ['testimonials', 0], ['faq', 0], ['cta', 0], ['footer', 2]] },
  { name: 'Beacon IT', tags: ['IT Services'], s: [
    ['header', 3], ['hero', 0], ['services', 0], ['bigstats', 1], ['process', 1], ['logocloud', 1], ['testimonials', 0], ['contact', 0], ['map', 0], ['footer', 0]] },
  { name: 'Orbit Devtools', tags: ['Developer'], s: [
    ['header', 4], ['hero', 7], ['bento', 1], ['feature', 1], ['chart', 2], ['work', 0], ['faq', 1], ['newsletter', 1], ['footer', 2]] },
  { name: 'Flux Media', tags: ['Media', 'Bold'], s: [
    ['header', 1], ['hero', 4], ['marquee', 0], ['work', 1], ['gallery', 1], ['bigstats', 0], ['testimonials', 2], ['cta', 2], ['footer', 1]] },
]

const CATEGORIES = [
  { name: 'Business', structures: BUSINESS, count: 50 },
  { name: 'Education', structures: EDUCATION, count: 50 },
  { name: 'Technology', structures: TECHNOLOGY, count: 50 },
]

/* ---------------- theme knobs ---------------- */
const RADII = ['none', 'sm', 'md', 'lg', 'pill']
const DENSITIES = ['compact', 'normal', 'normal', 'roomy']
const CONTAINERS = ['narrow', 'normal', 'normal', 'wide']
const SCALES = [1, 0.92, 1.08, 0.96, 1.04]
const SUFFIX = ['', ' Pro', ' Noir', ' Light', ' Bold']

const variantKeys = (type) => Object.keys(WIDGETS[type]?.variants || { plain: 1 })
const pick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length]

/**
 * Har pass me variants shift hote hain — isliye ek hi structure ke do
 * template alag layout dikhate hain. Prime numbers isliye taaki pattern
 * na banne paye.
 */
function buildTemplate(struct, pass, index, category) {
  const blocks = struct.s.map(([type, vi], bi) => {
    const keys = variantKeys(type)
    const shift = pass * (1 + (bi % 3)) + (bi % 2 ? pass * 2 : 0)
    return { type, variant: keys[(vi + shift) % keys.length] }
  })

  return {
    id: `tpl-${index + 1}`,
    no: index + 1,
    name: `${struct.name}${SUFFIX[pass] || ` ${pass + 1}`}`,
    category,
    tags: struct.tags || [],
    theme: {
      palette: pick(PALETTES, index * 7 + pass * 5).id,
      font: pick(FONTS, index * 4 + pass * 3).id,
      radius: pick(RADII, index + pass * 2),
      density: pick(DENSITIES, index + pass),
      container: pick(CONTAINERS, index * 2 + pass),
      headingScale: pick(SCALES, index + pass * 2),
      // har template ke gradient/image placeholders alag dikhein
      imageSeed: (index * 3 + pass * 7) % 6,
    },
    blocks,
  }
}

/** khali canvas — sirf header + hero + footer */
export const BLANK_TEMPLATE = {
  id: 'tpl-blank',
  no: 0,
  name: 'Blank',
  category: 'Blank',
  tags: ['Start from scratch'],
  blank: true,
  theme: { palette: 'ink', font: 'inter', radius: 'md', density: 'normal', container: 'normal', headingScale: 1 },
  blocks: [
    { type: 'header', variant: 'classic' },
    { type: 'hero', variant: 'split' },
    { type: 'footer', variant: 'simple' },
  ],
}

export const TEMPLATES = (() => {
  const out = [BLANK_TEMPLATE]
  let index = 0

  for (const { name: category, structures, count } of CATEGORIES) {
    const passes = Math.ceil(count / structures.length)
    let made = 0
    for (let pass = 0; pass < passes && made < count; pass++) {
      for (let i = 0; i < structures.length && made < count; i++) {
        out.push(buildTemplate(structures[i], pass, index, category))
        index++
        made++
      }
    }
  }
  return out
})()

export const TEMPLATE_CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map((t) => t.category)))]

export const templateById = (id) => TEMPLATES.find((t) => t.id === id)
