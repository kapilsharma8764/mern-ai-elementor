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
app.use((req, res) => res.status(404).json({ error: `Route nahi mila: ${req.method} ${req.originalUrl}` }))

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
