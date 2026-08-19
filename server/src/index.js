import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB, dbState } from './db.js'
import { storageInfo } from './storage/index.js'
import sitesRouter from './routes/sites.js'
import uploadRouter from './routes/upload.js'
import templatesRouter from './routes/templates.js'

const app = express()
const PORT = process.env.PORT || 4000

/* ---------------- middleware ---------------- */
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }))

// site JSON bada hota hai (base64 images ke saath 10MB tak ja sakta hai)
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))
app.use(morgan('dev'))

/* ---------------- routes ---------------- */

/**
 * Server ka homepage.
 * Ye ek API server hai, website nahi — isliye yahan status aur saare
 * endpoints dikhate hain. Warna `/` kholne pe "Route nahi mila" aata
 * tha aur lagta tha kuch toot gaya.
 */
app.get('/', (req, res) => {
  const db = dbState()
  const s = storageInfo()
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5175'
  const dot = (ok) => (ok ? '#22c55e' : '#f59e0b')

  res.type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Pedinno API</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box} body{margin:0;background:#061229;color:#e9f1ff;
    font:15px/1.6 ui-sans-serif,system-ui,'Segoe UI',sans-serif;padding:40px 20px}
  .wrap{max-width:760px;margin:0 auto}
  h1{font-size:26px;margin:0 0 6px;letter-spacing:-.02em}
  .sub{color:#8ba6cf;margin:0 0 28px;font-size:14px}
  .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
    border-radius:14px;padding:20px;margin-bottom:16px}
  .row{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:14px}
  .dot{width:9px;height:9px;border-radius:99px;flex:none}
  .k{color:#8ba6cf;min-width:120px}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#8ba6cf;margin:0 0 12px}
  a{color:#7fc3ff;text-decoration:none} a:hover{text-decoration:underline}
  code{background:rgba(255,255,255,.07);padding:2px 7px;border-radius:5px;font-size:13px}
  .m{display:inline-block;min-width:52px;font-weight:700;font-size:11px;
    padding:2px 7px;border-radius:5px;margin-right:8px;text-align:center}
  .get{background:rgba(34,197,94,.18);color:#86efac}
  .post{background:rgba(15,126,240,.2);color:#7fc3ff}
  .patch{background:rgba(245,158,11,.18);color:#fcd34d}
  .del{background:rgba(244,63,94,.18);color:#fda4af}
  .ep{padding:5px 0;font-size:13.5px}
  .big{display:block;background:linear-gradient(100deg,#0f7ef0,#00c6ff);color:#fff;
    padding:15px;border-radius:12px;text-align:center;font-weight:700;margin-bottom:22px}
</style></head><body><div class="wrap">

<h1>Pedinno Builder — API Server</h1>
<p class="sub">Ye API server hai. Website banane ke liye client kholo.</p>

<a class="big" href="${clientUrl}">🌐 Website Builder kholo — ${clientUrl}</a>

<div class="card">
  <h2>Status</h2>
  <div class="row"><span class="dot" style="background:#22c55e"></span><span class="k">Server</span> chal raha hai — port ${PORT}</div>
  <div class="row"><span class="dot" style="background:${dot(s.kind === 'mongo')}"></span><span class="k">Storage</span> ${s.detail}</div>
  <div class="row"><span class="dot" style="background:${dot(db.connected)}"></span><span class="k">MongoDB</span> ${db.connected ? 'connected' : 'nahi juda — local files use ho rahi hain'}</div>
</div>

<div class="card">
  <h2>Endpoints</h2>
  <div class="ep"><span class="m get">GET</span><a href="/api/health">/api/health</a> — server + DB status</div>
  <div class="ep"><span class="m get">GET</span><a href="/api/templates">/api/templates</a> — saare templates</div>
  <div class="ep"><span class="m get">GET</span><a href="/api/templates/categories">/api/templates/categories</a></div>
  <div class="ep"><span class="m get">GET</span><a href="/api/sites">/api/sites</a> — mere projects</div>
  <div class="ep"><span class="m post">POST</span><code>/api/sites</code> — naya project</div>
  <div class="ep"><span class="m patch">PATCH</span><code>/api/sites/:id</code> — autosave</div>
  <div class="ep"><span class="m del">DEL</span><code>/api/sites/:id</code></div>
  <div class="ep"><span class="m post">POST</span><code>/api/upload</code> — image upload</div>
  <div class="ep"><span class="m post">POST</span><code>/api/templates</code> — naya template (admin)</div>
</div>

</div></body></html>`)
})

app.get('/api/health', (req, res) => {
  const db = dbState()
  const s = storageInfo()
  res.json({
    ok: true,
    server: 'up',
    storage: s.kind,            // 'file' ya 'mongo'
    storageDetail: s.detail,
    db: db.connected ? 'connected' : 'not connected',
    dbNote: db.connected ? undefined : 'MongoDB nahi hai — local files use ho rahi hain',
    time: new Date().toISOString(),
  })
})

app.use('/api/sites', sitesRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/templates', templatesRouter)

// upload ki hui images — /uploads/abc.webp se milengi
app.use('/uploads', express.static('uploads', { maxAge: '30d', immutable: true }))

/* ---------------- 404 + error handler ---------------- */
app.use((req, res) =>
  res.status(404).json({
    error: `Route nahi mila: ${req.method} ${req.originalUrl}`,
    hint: 'Ye API server hai. Website ke liye client kholo, aur saare endpoints dekhne ke liye / kholo.',
    client: process.env.CLIENT_URL || 'http://localhost:5175',
    endpoints: ['/api/health', '/api/sites', '/api/templates', '/api/upload'],
  })
)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err.message)
  const code = err.status || (err.name === 'ValidationError' ? 400 : 500)
  res.status(code).json({ error: err.message || 'Server error' })
})

/* ---------------- start ---------------- */
async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`\n  ✓ Server chal raha hai:  http://localhost:${PORT}`)
    console.log(`    health check:          http://localhost:${PORT}/api/health\n`)
  })
}

start()

export default app
