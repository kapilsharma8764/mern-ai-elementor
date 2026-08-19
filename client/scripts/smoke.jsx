import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TEMPLATES } from '../src/data/templates.js'
import { WIDGETS } from '../src/sections/widgets.jsx'
import { BlockView } from '../src/sections/Renderer.jsx'
import { resolveTheme } from '../src/store/useBuilder.js'

const biz = { name: 'Acme Co', email: 'a@b.com', phone: '+91 1', address: 'X', timing: 'Mon', logo: '' }
const mk = (type, variant) => ({ id: 't', type, variant, props: JSON.parse(JSON.stringify(WIDGETS[type].defaults || {})), style: { marginTop:0,marginBottom:0,paddingY:0,align:'inherit',bg:'',fg:'',maxWidth:0,hidden:false,fontScale:1 } })

let errors = 0
// every widget x every variant
for (const [type, w] of Object.entries(WIDGETS)) {
  for (const v of Object.keys(w.variants)) {
    try { renderToStaticMarkup(<BlockView block={mk(type, v)} theme={resolveTheme({palette:'indigo',font:'inter',radius:'md',density:'normal',container:'normal',headingScale:1})} business={biz} />) }
    catch (e) { errors++; console.log('WIDGET FAIL', type, v, e.message) }
  }
}
// every template
for (const t of TEMPLATES) {
  try {
    const theme = resolveTheme(t.theme)
    t.blocks.forEach(b => renderToStaticMarkup(<BlockView block={mk(b.type, b.variant)} theme={theme} business={biz} />))
  } catch (e) { errors++; console.log('TPL FAIL', t.no, t.name, e.message) }
}
console.log('templates:', TEMPLATES.length, 'unique names:', new Set(TEMPLATES.map(t=>t.name)).size)
console.log('widgets:', Object.keys(WIDGETS).length, 'variants:', Object.values(WIDGETS).reduce((a,w)=>a+Object.keys(w.variants).length,0))
console.log(errors ? `FAILURES: ${errors}` : 'ALL OK')
