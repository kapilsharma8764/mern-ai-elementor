import fs from 'node:fs/promises'

/* ------------------------------------------------------------------ *
 * Sites API ka poora test — bina kisi database ke.
 * Server local file storage pe chalta hai, phir har route hit karke
 * check hota hai. MongoDB lagne ke baad bhi yahi test chalega.
 *
 *   npm run test:api
 * ------------------------------------------------------------------ */

const fails = []
const ok = (c, label, extra = '') => {
  if (!c) fails.push(label + (extra ? ` — ${extra}` : ''))
  console.log(`${c ? 'OK   ' : 'FAIL '} ${label}${extra && !c ? '  (' + extra + ')' : ''}`)
}

const PORT = 4111
const BASE = `http://localhost:${PORT}/api`

const call = async (path, opts = {}) => {
  const res = await fetch(BASE + path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', 'x-owner': opts.owner || 'test-user' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

// `--mongo` flag do to local MongoDB pe test, warna local files pe.
// Dono storage ek hi test se guzarte hain — isliye pata rehta hai ki
// switch karne pe behaviour same hai.
const useMongo = process.argv.includes('--mongo')

if (useMongo) {
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/genwebai-test'
  console.log('storage: MongoDB —', process.env.MONGODB_URI, '\n')
} else {
  await fs.rm('data/sites', { recursive: true, force: true }).catch(() => {})
  // khali string set karo — delete karne se .env wapas bhar deta hai
  // (dotenv pehle se set variable ko overwrite nahi karta)
  process.env.MONGODB_URI = ''
  console.log('storage: local files (server/data/sites)\n')
}
process.env.PORT = String(PORT)

if (useMongo) {
  const mongoose = (await import('mongoose')).default
  await mongoose.connect(process.env.MONGODB_URI)
  await mongoose.connection.db.dropDatabase()      // saaf shuruaat
  await mongoose.disconnect()
}

await import('../src/index.js')
// server ke listen hone ka wait
for (let i = 0; i < 40; i++) {
  try { await fetch(`${BASE}/health`); break } catch { await new Promise((r) => setTimeout(r, 250)) }
}

/* ---------------- 1. health ---------------- */
console.log('--- 1. HEALTH ---')
const h = await call('/health')
ok(h.status === 200, 'health 200 deta hai')
ok(h.data.storage === (useMongo ? 'mongo' : 'file'), `${useMongo ? 'MongoDB' : 'local file'} storage chal raha hai`, h.data.storage)

/* ---------------- 2. create ---------------- */
console.log('\n--- 2. PROJECT BANAO ---')
const siteJson = {
  theme: { palette: 'ocean', font: 'inter', radius: 'md' },
  header: { id: 'h1', type: 'header', variant: 'classic', props: { cta: 'Get a quote' } },
  footer: { id: 'f1', type: 'footer', variant: 'simple', props: {} },
  pages: [
    { id: 'p1', name: 'Home', slug: '/', blocks: [{ id: 'b1', type: 'hero', variant: 'split', props: { title: 'Hello' } }] },
    { id: 'p2', name: 'About', slug: '/about', blocks: [] },
  ],
}
const created = await call('/sites', {
  method: 'POST',
  body: { business: { name: 'Pedinno AI', phone: '+91 98765 43210' }, site: siteJson, templateId: 'tpl-1' },
})
ok(created.status === 201, 'create 201 deta hai', JSON.stringify(created.data).slice(0, 80))
const id = created.data.id
ok(!!id, 'project id mili')
ok(created.data.slug === 'pedinno-ai', 'naam se slug bana', created.data.slug)
ok(created.data.site?.pages?.length === 2, 'site JSON waisa hi save hua')

/* ---------------- 3. duplicate slug ---------------- */
console.log('\n--- 3. SLUG TAKRAV ---')
const second = await call('/sites', { method: 'POST', body: { business: { name: 'Pedinno AI' } } })
ok(second.data.slug === 'pedinno-ai-2', 'dusre project ko -2 mila', second.data.slug)

/* ---------------- 4. list ---------------- */
console.log('\n--- 4. LIST ---')
const list = await call('/sites')
ok(list.status === 200 && Array.isArray(list.data), 'list array deta hai')
ok(list.data.length === 2, 'dono projects list me hain', String(list.data.length))
ok(list.data[0].site === undefined, 'list halka hai (poora site nahi bhejta)')
ok(list.data[0].pages === 2 || list.data[1].pages === 2, 'list me page count aata hai')

/* ---------------- 5. get ---------------- */
console.log('\n--- 5. LOAD ---')
const got = await call(`/sites/${id}`)
ok(got.status === 200, 'get 200')
ok(got.data.business.name === 'Pedinno AI', 'business info wapas mili')
ok(got.data.site.pages[0].blocks[0].props.title === 'Hello', 'block props wapas mile')

/* ---------------- 6. autosave ---------------- */
console.log('\n--- 6. AUTOSAVE (PATCH) ---')
const edited = JSON.parse(JSON.stringify(siteJson))
edited.pages[0].blocks[0].props.title = 'Naya title'
edited.pages.push({ id: 'p3', name: 'Contact', slug: '/contact', blocks: [] })
const saved = await call(`/sites/${id}`, { method: 'PATCH', body: { site: edited } })
ok(saved.status === 200 && saved.data.saved, 'patch saved deta hai')
const after = await call(`/sites/${id}`)
ok(after.data.site.pages[0].blocks[0].props.title === 'Naya title', 'edit save hua')
ok(after.data.site.pages.length === 3, 'naya page save hua')

/* ---------------- 7. bada payload (base64 image) ---------------- */
console.log('\n--- 7. BADA PAYLOAD (image) ---')
const bigImage = 'data:image/png;base64,' + 'A'.repeat(2 * 1024 * 1024)   // ~2 MB
const withImg = JSON.parse(JSON.stringify(edited))
withImg.pages[0].blocks[0].props.image = bigImage
const bigSave = await call(`/sites/${id}`, { method: 'PATCH', body: { site: withImg } })
ok(bigSave.status === 200, '2 MB image wala save chala (localStorage me ye fail hota tha)', String(bigSave.status))
const afterBig = await call(`/sites/${id}`)
ok(afterBig.data.site.pages[0].blocks[0].props.image.length === bigImage.length, 'poori image wapas mili')

/* ---------------- 8. slug badlo ---------------- */
console.log('\n--- 8. SLUG BADLO ---')
const slugRes = await call(`/sites/${id}/slug`, { method: 'PUT', body: { slug: 'My Company Site!' } })
ok(slugRes.data.slug === 'my-company-site', 'slug saaf hua', slugRes.data.slug)

/* ---------------- 9. dusre user ka project na dikhe ---------------- */
console.log('\n--- 9. OWNER SEPARATION ---')
const otherList = await call('/sites', { owner: 'koi-aur' })
ok(otherList.data.length === 0, 'dusre user ko mere projects nahi dikhte')
const otherGet = await call(`/sites/${id}`, { owner: 'koi-aur' })
ok(otherGet.status === 404, 'dusra user mera project load nahi kar sakta', String(otherGet.status))

/* ---------------- 10. galat input ---------------- */
console.log('\n--- 10. GALAT INPUT ---')
ok([400, 404].includes((await call('/sites/not-an-id')).status), 'galat id pe 400/404')
ok((await call('/sites/507f1f77bcf86cd799439011')).status === 404, 'na-maujood id pe 404')
ok((await call(`/sites/${id}`, { method: 'PATCH', body: {} })).status === 400, 'khali patch pe 400')
ok((await call('/nahi-hai')).status === 404, 'anjaan route pe 404')

/* ---------------- 11. delete ---------------- */
console.log('\n--- 11. DELETE ---')
ok((await call(`/sites/${id}`, { method: 'DELETE' })).data.deleted, 'delete hua')
ok((await call(`/sites/${id}`)).status === 404, 'delete ke baad nahi milta')

/* ---------------- result ---------------- */
console.log('\n================ RESULT ================')
if (fails.length) {
  console.log(`${fails.length} FAILURES:`)
  fails.forEach((f) => console.log('  x ' + f))
} else {
  console.log('SAB PASS — create, list, load, autosave, bada payload, slug, owner separation, delete')
}

if (useMongo) {
  const mongoose = (await import('mongoose')).default
  await mongoose.disconnect().catch(() => {})
}
process.exit(fails.length ? 1 : 0)
