import { useBuilder } from '../src/store/useBuilder.js'

/* ------------------------------------------------------------------ *
 * Client <-> Server sync ka test.
 * Store ke wahi functions chalते hain jo builder me chalte hain:
 * initServer -> chooseTemplate -> createProject -> edit -> autosave
 * -> phir naye store me openProject karke check ki sab wapas mila.
 *
 *   npm run test:sync      (server chalu hona chahiye)
 * ------------------------------------------------------------------ */

const fails = []
const ok = (c, label, extra = '') => {
  if (!c) fails.push(label + (extra ? ` — ${extra}` : ''))
  console.log(`${c ? 'OK   ' : 'FAIL '} ${label}${extra && !c ? '  (' + extra + ')' : ''}`)
}
const S = () => useBuilder.getState()
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/* localStorage node me nahi hota — chhota sa nakli bana do */
const mem = new Map()
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
  clear: () => mem.clear(),
}

const BIZ = {
  name: 'Pedinno AI', slogan: 'Intelligence accelerated',
  about: 'We build AI-powered business products.',
  services: ['Workflow Automation', 'Document Extraction'],
  phone: '+91 98765 43210', email: 'hello@pedinno.com', city: 'Jaipur',
}

/* ---------------- 1. server se judo ---------------- */
console.log('--- 1. SERVER CONNECT ---')
const boot = await S().initServer()
ok(boot.serverUp, 'server mil gaya', 'server chalu hai? npm run dev')
if (!boot.serverUp) {
  console.log('\nServer band hai — test aage nahi ja sakta.')
  process.exit(1)
}
ok(S().serverUp === true, 'store me serverUp true hai')

/* ---------------- 2. project banao ---------------- */
console.log('\n--- 2. PROJECT BANAO ---')
S().setBusiness(BIZ)
S().chooseTemplate('tpl-2')
ok(!!S().site, 'template load hua')

await wait(1200)                       // createProject ko chalne do
ok(!!S().projectId, 'server pe project ban gaya', String(S().projectId))
const id = S().projectId

/* ---------------- 3. edit + autosave ---------------- */
console.log('\n--- 3. EDIT + AUTOSAVE ---')
S().addPage('About')
S().addPage('Contact')
const page = S().site.pages[0]
S().setPage(page.id)
const blockId = S().addBlock('services')
S().setProp(blockId, 'title', 'Cloud me save hua title')
S().setPropPath(blockId, ['items', 0, 'image'], '/uploads/test-image.webp')

ok(S().syncState === 'saving' || S().syncState === 'saved', 'autosave chalu hua', S().syncState)

await wait(3000)                       // debounce (1.5s) + request
ok(S().syncState === 'saved', 'save ho gaya', `${S().syncState} ${S().syncError}`)
ok(!!S().lastSavedAt, 'save ka time mila')

/* ---------------- 4. naye store me wapas kholo ---------------- */
console.log('\n--- 4. WAPAS LOAD ---')
// sab bhool jao — jaise browser band karke dobara khola
S().reset()
ok(!S().site, 'reset ke baad site khali')

await S().openProject(id)
ok(S().projectId === id, 'wahi project khula')
ok(S().business.name === 'Pedinno AI', 'business info wapas mili')
ok(S().site.pages.length === 3, '3 pages wapas mile', String(S().site.pages.length))

const b = S().site.pages[0].blocks.find((x) => x.id === blockId)
ok(!!b, 'jo section add kiya tha wo mila')
ok(b?.props.title === 'Cloud me save hua title', 'edit kiya hua title wapas mila', b?.props.title)
ok(b?.props.items?.[0]?.image === '/uploads/test-image.webp', 'image ka URL wapas mila')

/* ---------------- 5. image URL bhaari nahi hai ---------------- */
console.log('\n--- 5. SIZE CHECK ---')
const size = JSON.stringify(S().site).length
ok(size < 200 * 1024, 'site JSON chhota hai (URL use ho raha hai, base64 nahi)', `${Math.round(size / 1024)} KB`)

/* ---------------- 6. list me dikhta hai ---------------- */
console.log('\n--- 6. PROJECT LIST ---')
const list = await S().listProjects()
ok(Array.isArray(list) && list.length > 0, 'projects list mili', String(list.length))
ok(list.some((p) => p.id === id), 'hamara project list me hai')
const mine = list.find((p) => p.id === id)
ok(mine?.pages === 3, 'list me page count sahi', String(mine?.pages))

/* ---------------- result ---------------- */
console.log('\n================ RESULT ================')
if (fails.length) {
  console.log(`${fails.length} FAILURES:`)
  fails.forEach((f) => console.log('  x ' + f))
} else {
  console.log('SAB PASS — client se project bana, cloud me save hua, aur wapas poora load ho gaya')
}
process.exit(fails.length ? 1 : 0)
