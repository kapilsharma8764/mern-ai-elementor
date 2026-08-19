import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { WIDGETS } from '../src/sections/widgets.jsx'
import { BlockView } from '../src/sections/Renderer.jsx'
import { resolveTheme, makeBlock } from '../src/store/useBuilder.js'

const theme = resolveTheme({ palette:'ocean', font:'inter', radius:'md', density:'normal', container:'normal', headingScale:1 })
const biz = { name:'Acme', logo:'', logoStyle:{mode:'logoName',shape:'rounded',size:'md',position:'left'} }
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='

// har widget ke har variant me: schema me image field hai par variant use karta hai?
let shown = 0, hidden = []
for (const [type, w] of Object.entries(WIDGETS)) {
  const imgFields = []
  for (const f of w.schema || []) {
    if (f.type === 'image') imgFields.push([f.key, 'top'])
    if (f.type === 'list') for (const sf of f.fields || []) if (sf.type === 'image') imgFields.push([f.key + '[].' + sf.key, 'list'])
  }
  if (!imgFields.length) continue

  for (const variant of Object.keys(w.variants)) {
    const block = makeBlock(type, variant)
    // saare image props bhar do
    for (const f of w.schema || []) {
      if (f.type === 'image') block.props[f.key] = PNG
      if (f.type === 'list' && Array.isArray(block.props[f.key])) {
        const sub = (f.fields || []).filter(x => x.type === 'image')
        if (sub.length) block.props[f.key] = block.props[f.key].map(it => ({ ...it, ...Object.fromEntries(sub.map(x => [x.key, PNG])) }))
      }
    }
    const html = renderToStaticMarkup(<BlockView block={block} theme={theme} business={biz} />)
    const has = html.includes(PNG)
    if (has) shown++
    else hidden.push(`${type}.${variant}  (fields: ${imgFields.map(f=>f[0]).join(', ')})`)
  }
}
console.log(`variants jinme image dikhti hai : ${shown}`)
console.log(`variants jinme image NAHI dikhti: ${hidden.length}`)
if (hidden.length) { console.log('\nimage field hai par render nahi hota:'); hidden.forEach(h => console.log('  ' + h)) }
