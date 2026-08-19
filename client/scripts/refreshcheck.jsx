import { useBuilder } from '../src/store/useBuilder.js'

/* Refresh pe project wapas aata hai? — teeno haalat me check */
const fails = []
const ok = (c, l, e = '') => { if (!c) fails.push(l + (e ? ` — ${e}` : '')); console.log(`${c ? 'OK   ' : 'FAIL '} ${l}${e && !c ? '  (' + e + ')' : ''}`) }
const S = () => useBuilder.getState()
const wait = (ms) => new Promise(r => setTimeout(r, ms))

/* nakli localStorage — browser jaisa */
let store = {}
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v) },
  removeItem: k => { delete store[k] },
  clear: () => { store = {} },
}
/** "browser band karke dobara khola" — store me data rehta hai, memory saaf */
const refresh = async () => { useBuilder.setState({ ...useBuilder.getInitialState?.() || {}, step: 'landing', site: null, projectId: null, business: {} }); return S().initServer() }

const BIZ = { name: 'Pedinno AI', services: ['Workflow Automation'], phone: '+91 1', email: 'a@b.c' }

console.log('--- 1. WEBSITE BANAO ---')
await S().initServer()
S().setBusiness(BIZ)
S().chooseTemplate('tpl-3')
S().addPage('About')
await wait(3000)
const id = S().projectId
ok(!!S().site, 'website bani')
ok(!!id, 'server pe project bana')
ok(S().step === 'builder', 'builder me hain')
const pagesBefore = S().site.pages.length

console.log('\n--- 2. REFRESH (server chalu) ---')
await refresh()
ok(S().step === 'builder', 'refresh ke baad builder me hi hain, landing pe nahi', S().step)
ok(S().site?.pages?.length === pagesBefore, 'saare pages wapas mile', String(S().site?.pages?.length))
ok(S().business.name === 'Pedinno AI', 'business info wapas mili')
ok(S().projectId === id, 'wahi project id')

console.log('\n--- 3. REFRESH (server band) ---')
const realFetch = globalThis.fetch
globalThis.fetch = () => Promise.reject(new Error('Failed to fetch'))
await refresh()
ok(S().step === 'builder', 'server band hone par bhi builder me hain', S().step)
ok(S().site?.pages?.length === pagesBefore, 'local se poora project mila', String(S().site?.pages?.length))
ok(S().serverUp === false, 'offline pata hai')
ok(S().syncState === 'offline', 'badge offline dikhayega', S().syncState)
globalThis.fetch = realFetch

console.log('\n--- 4. REFRESH (project server pe delete ho gaya) ---')
await S().initServer()
await useBuilder.getState().listProjects()
const gone = 'aaaaaaaaaaaaaaaaaaaaaaaa'
store['wb.project.v1'] = JSON.stringify({ ...JSON.parse(store['wb.project.v1']), projectId: gone })
await refresh()
ok(S().step === 'builder', 'galat id hone par bhi kaam nahi khoya', S().step)
ok(!!S().site, 'local se site wapas mili')

console.log('\n--- 5. NAYA USER (kuch nahi bana) ---')
store = {}
await refresh()
ok(S().step === 'landing', 'naye user ko landing page dikhta hai', S().step)

console.log('\n================ RESULT ================')
console.log(fails.length ? `${fails.length} FAILURES:\n  x ` + fails.join('\n  x ') : 'SAB PASS — refresh pe kaam kabhi nahi khota')
process.exit(fails.length ? 1 : 0)
