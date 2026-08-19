import fs from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { WIDGETS } from '../src/sections/widgets.jsx'
import { paletteById, fontById, RADIUS, DENSITY, CONTAINERS } from '../src/data/design.js'

/* ------------------------------------------------------------------ *
 * Har variant actually kaun se fields render karta hai — ye Node pe
 * ek baar nikaal ke JSON me likh dete hain.
 *
 * Isse browser me React ka server-renderer bhejne ki zaroorat nahi
 * rehti (bundle chhota) aur Inspector ke render ke andar dusra render
 * nahi chalta (crash ki jad).
 *
 * Chalane ka tarika:  npm run gen:fields   (build se pehle apne aap chalta hai)
 * ------------------------------------------------------------------ */

const TOKEN = (key) => `@@wb-${key}@@`

const pal = paletteById('ocean')
const font = fontById('inter')
const THEME = {
  ...pal,
  headingFont: font.heading,
  bodyFont: font.body,
  radius: RADIUS.md,
  radiusBtn: RADIUS.md,
  radiusMedia: RADIUS.md,
  density: DENSITY.normal,
  container: CONTAINERS.normal,
  headingScale: 1,
}
const BIZ = {
  name: 'Sample Co', logo: '', logoStyle: { mode: 'logoName', shape: 'rounded', size: 'md', position: 'left' },
  phone: '', whatsapp: '', email: '', address: '', city: '', timing: '', workingDays: '',
}

function sentinelProps(widget) {
  const props = JSON.parse(JSON.stringify(widget.defaults || {}))
  for (const f of widget.schema || []) {
    if (['text', 'textarea', 'image'].includes(f.type)) {
      props[f.key] = TOKEN(f.key)
    } else if (f.type === 'list') {
      const base = Array.isArray(props[f.key]) && props[f.key].length ? props[f.key] : [{}, {}]
      props[f.key] = base.map((item) => {
        const next = { ...item }
        for (const sf of f.fields || []) {
          if (['text', 'textarea', 'image'].includes(sf.type)) next[sf.key] = TOKEN(`${f.key}.${sf.key}`)
        }
        return next
      })
    }
  }
  return props
}

const out = {}
let variants = 0

for (const [type, widget] of Object.entries(WIDGETS)) {
  for (const [variant, v] of Object.entries(widget.variants)) {
    variants++
    const keys = new Set()
    let html = ''
    let failed = false
    try {
      html = renderToStaticMarkup(v.render({ p: sentinelProps(widget), t: THEME, biz: BIZ, nav: undefined }))
    } catch (e) {
      failed = true
      console.warn(`  ! ${type}.${variant} render fail — saare fields dikhaye jayenge (${e.message})`)
    }

    for (const f of widget.schema || []) {
      if (failed) { keys.add(f.key); continue }
      if (['text', 'textarea', 'image'].includes(f.type)) {
        if (html.includes(TOKEN(f.key))) keys.add(f.key)
      } else if (f.type === 'list') {
        let any = false
        for (const sf of f.fields || []) {
          if (['text', 'textarea', 'image'].includes(sf.type)) {
            if (html.includes(TOKEN(`${f.key}.${sf.key}`))) { keys.add(`${f.key}.${sf.key}`); any = true }
          } else {
            keys.add(`${f.key}.${sf.key}`)
            any = true
          }
        }
        if (any || !(f.fields || []).length) keys.add(f.key)
      } else {
        keys.add(f.key)     // select / number / toggle / link — layout knobs, hamesha dikhao
      }
    }
    out[`${type}:${variant}`] = Array.from(keys)
  }
}

const dest = path.join(process.cwd(), 'src/sections/usedFields.generated.json')
fs.writeFileSync(dest, JSON.stringify(out, null, 0) + '\n')

const fields = Object.values(out).reduce((a, l) => a + l.length, 0)
console.log(`usedFields map bana: ${variants} variants, ${fields} fields`)
console.log(`-> ${path.relative(process.cwd(), dest)} (${(fs.statSync(dest).size / 1024).toFixed(1)} KB)`)
