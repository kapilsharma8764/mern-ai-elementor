import { TEMPLATES } from '../src/data/templates.js'
const sig = t => t.blocks.map(b => b.type+':'+b.variant).join('|')
console.log('templates:', TEMPLATES.length, '| unique layouts:', new Set(TEMPLATES.map(sig)).size, '| unique names:', new Set(TEMPLATES.map(t=>t.name)).size)
console.log('unique theme combos:', new Set(TEMPLATES.map(t=>JSON.stringify(t.theme))).size)
console.log('palettes:', new Set(TEMPLATES.map(t=>t.theme.palette)).size, '| fonts:', new Set(TEMPLATES.map(t=>t.theme.font)).size)
console.log('by category:', TEMPLATES.reduce((a,t)=>((a[t.category]=(a[t.category]||0)+1),a),{}))
const widgets = new Set(TEMPLATES.flatMap(t=>t.blocks.map(b=>b.type)))
console.log('widgets used:', widgets.size)
