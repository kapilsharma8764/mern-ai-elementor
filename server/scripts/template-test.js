/* Templates API ka test — admin add/edit/hide sab chalta hai? */
const BASE = 'http://localhost:4000/api'
const fails = []
const ok = (c, l, e = '') => { if (!c) fails.push(l + (e ? ` — ${e}` : '')); console.log(`${c ? 'OK   ' : 'FAIL '} ${l}${e && !c ? '  (' + e + ')' : ''}`) }
const call = async (p, o = {}) => {
  const r = await fetch(BASE + p, { method: o.method || 'GET', headers: { 'Content-Type': 'application/json' }, body: o.body ? JSON.stringify(o.body) : undefined })
  return { status: r.status, data: await r.json().catch(() => ({})) }
}

console.log('--- TEMPLATES API ---')
const list = await call('/templates')
ok(list.status === 200 && list.data.length > 0, 'templates DB se aa rahe hain', String(list.data.length))
ok(list.data[0].blocks?.length > 0, 'template me blocks hain')
ok(!!list.data[0].theme?.palette, 'template me theme hai')

const cats = await call('/templates/categories')
ok(cats.data.includes('Business'), 'categories mili', JSON.stringify(cats.data))

console.log('\n--- ADMIN: naya template ---')
const made = await call('/templates', { method: 'POST', body: {
  key: 'tpl-test-xyz', name: 'Test Template', category: 'Business',
  theme: { palette: 'ocean', font: 'inter', radius: 'md', density: 'normal', container: 'normal', headingScale: 1 },
  blocks: [{ type: 'header', variant: 'classic' }, { type: 'hero', variant: 'split' }, { type: 'footer', variant: 'simple' }],
}})
ok(made.status === 201, 'naya template bana (code chhue bina)', String(made.status))
ok((await call('/templates')).data.some(t => t.key === 'tpl-test-xyz'), 'list me dikh raha hai')

console.log('\n--- ADMIN: rename + hide ---')
const ren = await call('/templates/tpl-test-xyz', { method: 'PATCH', body: { name: 'Naya Naam' } })
ok(ren.data.name === 'Naya Naam', 'rename hua', ren.data.name)
await call('/templates/tpl-test-xyz', { method: 'PATCH', body: { active: false } })
ok(!(await call('/templates')).data.some(t => t.key === 'tpl-test-xyz'), 'hide karne pe gallery se hat gaya')

console.log('\n--- CLEANUP ---')
ok((await call('/templates/tpl-test-xyz', { method: 'DELETE' })).data.deleted, 'delete hua')

console.log('\n================ RESULT ================')
console.log(fails.length ? `${fails.length} FAILURES:\n  ` + fails.join('\n  ') : 'SAB PASS — templates DB se, admin add/rename/hide/delete sab chalta hai')
process.exit(fails.length ? 1 : 0)
