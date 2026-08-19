import { Router } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

/* ------------------------------------------------------------------ *
 * Image upload.
 *
 * Pehle images base64 me poore site JSON ke andar jaati thi — 37% badi
 * ho jaati thi aur browser ki 5MB limit pe sab save fail ho jata tha.
 *
 * Ab: file server pe jaati hai, JSON me sirf chhota sa URL rehta hai.
 *   base64 (2 MB text)  ->  "/uploads/a1b2c3.webp"  (25 characters)
 * ------------------------------------------------------------------ */

const router = Router()

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
await fs.mkdir(UPLOAD_DIR, { recursive: true })

const MAX_MB = 10

const upload = multer({
  storage: multer.memoryStorage(),          // sharp ko buffer chahiye
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif|svg\+xml|avif)$/.test(file.mimetype)) {
      return cb(new Error('Sirf image file chalegi (JPG, PNG, WEBP, GIF, SVG)'))
    }
    cb(null, true)
  },
})

/** POST /api/upload — ek image */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Koi file nahi mili' })

    const id = crypto.randomBytes(8).toString('hex')
    const isSvg = req.file.mimetype === 'image/svg+xml'
    const isGif = req.file.mimetype === 'image/gif'

    // SVG aur GIF ko waise hi rakho (sharp animation/vector kharab kar deta hai)
    if (isSvg || isGif) {
      const ext = isSvg ? 'svg' : 'gif'
      const name = `${id}.${ext}`
      await fs.writeFile(path.join(UPLOAD_DIR, name), req.file.buffer)
      return res.json({
        url: `/uploads/${name}`,
        size: req.file.size,
        originalName: req.file.originalname,
      })
    }

    // baaki sab -> webp (bahut chhoti file, quality wahi)
    const name = `${id}.webp`
    const dest = path.join(UPLOAD_DIR, name)

    const image = sharp(req.file.buffer, { failOn: 'none' })
    const meta = await image.metadata()

    await image
      // website ke liye 2000px se badi image ki zaroorat nahi
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(dest)

    const { size } = await fs.stat(dest)

    res.json({
      url: `/uploads/${name}`,
      size,                                   // nayi size
      originalSize: req.file.size,            // purani size
      saved: Math.max(0, req.file.size - size),
      width: Math.min(meta.width || 0, 2000),
      height: Math.min(meta.height || 0, 2000),
      originalName: req.file.originalname,
    })
  } catch (e) { next(e) }
})

/** DELETE /api/upload/:name — image hatao */
router.delete('/:name', async (req, res, next) => {
  try {
    const name = path.basename(req.params.name)      // path traversal se bachao
    await fs.unlink(path.join(UPLOAD_DIR, name))
    res.json({ deleted: true, name })
  } catch (e) {
    if (e.code === 'ENOENT') return res.status(404).json({ error: 'File nahi mili' })
    next(e)
  }
})

/** multer ke apne errors ko saaf message me badlo */
router.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `Image ${MAX_MB} MB se choti honi chahiye` })
  }
  if (err?.message?.includes('Sirf image')) {
    return res.status(415).json({ error: err.message })
  }
  next(err)
})

export default router
