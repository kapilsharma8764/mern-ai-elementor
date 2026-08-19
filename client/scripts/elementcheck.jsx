import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseHTML } from 'linkedom'
import { WIDGETS } from '../src/sections/widgets.jsx'
import { BlockView } from '../src/sections/Renderer.jsx'
import { resolveTheme, makeBlock } from '../src/store/useBuilder.js'
import { resolvePath, nodeForPath } from '../src/components/builder/ElementEdit.jsx'
import { pathGet, pathKey, stringPaths } from '../src/utils/propPath.js'

const theme = resolveTheme({ palette:'ocean', font:'inter', radius:'md', density:'normal', container:'normal', headingScale:1 })
const biz = { name:'Pedinno AI', logo:'', email:'a@b.com', phone:'+91 1', logoStyle:{mode:'logoName',shape:'rounded',size:'md',position:'left'} }

let total = 0, resolved = 0, roundtrip = 0, notRendered = 0, misses = []

for (const [type, w] of Object.entries(WIDGETS)) {
  for (const variant of Object.keys(w.variants)) {
    const block = makeBlock(type, variant)
    const html = renderToStaticMarkup(<BlockView block={block} theme={theme} business={biz} />)
    const { document } = parseHTML(`<html><body><div id="f">${html}</div></body></html>`)
    global.document = document
    const frame = document.getElementById('f')

    // har text prop ke liye: node milta hai? aur us node se wapas wahi path?
    for (const path of stringPaths(block.props)) {
      const val = pathGet(block.props, path)
      if (typeof val !== 'string' || !val.trim()) continue
      if (/^https?:|^data:/.test(val)) continue          // image/url props (defaults me khali hote hain)
      if (path.some((seg) => /link/i.test(String(seg)))) continue  // link targets — text nahi, href hai
      if (!html.includes(val.trim().slice(0, 40))) { notRendered++; continue }  // ye variant isko render hi nahi karta
      total++
      const node = nodeForPath(frame, block.props, path)
      if (!node) { misses.push(`${type}.${variant} -> ${pathKey(path)} (no node)`); continue }
      resolved++
      const back = resolvePath(frame, node, block.props)
      if (back && pathKey(back) === pathKey(path)) roundtrip++
      else misses.push(`${type}.${variant} -> ${pathKey(path)} != ${back ? pathKey(back) : 'null'}`)
    }
  }
}
// ---- image slots ----
let imgTotal = 0, imgOk = 0, imgMiss = []
for (const [type, w] of Object.entries(WIDGETS)) {
  for (const variant of Object.keys(w.variants)) {
    const block = makeBlock(type, variant)
    const html = renderToStaticMarkup(<BlockView block={block} theme={theme} business={biz} />)
    const { document } = parseHTML(`<html><body><div id="f">${html}</div></body></html>`)
    global.document = document
    const frame = document.getElementById('f')
    for (const el of Array.from(frame.querySelectorAll('[data-bind]'))) {
      imgTotal++
      const expect = el.getAttribute('data-bind')
      const back = resolvePath(frame, el, block.props)   // click on the slot
      const node = nodeForPath(frame, block.props, JSON.parse(expect))
      if (back && JSON.stringify(back) === expect && node === el) imgOk++
      else imgMiss.push(`${type}.${variant} ${expect} -> ${back ? JSON.stringify(back) : 'null'}${node === el ? '' : ' (node mismatch)'}`)
    }
  }
}

const pct = (n) => ((n / total) * 100).toFixed(1) + '%'
console.log(`rendered text props: ${total}   (is variant me render nahi hue: ${notRendered})`)
console.log(`node mila          : ${resolved} (${pct(resolved)})`)
console.log(`click->path sahi   : ${roundtrip} (${pct(roundtrip)})`)
console.log(`image slots        : ${imgOk}/${imgTotal}${imgTotal ? '  ' + ((imgOk / imgTotal) * 100).toFixed(1) + '%' : ''}`)
if (imgMiss.length) { console.log('\nimage misses:'); imgMiss.slice(0, 8).forEach(m => console.log('  ' + m)) }
if (misses.length) { console.log('\ntext misses (first 8):'); misses.slice(0, 8).forEach(m => console.log('  ' + m)) }
