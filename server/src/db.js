import mongoose from 'mongoose'

/* ------------------------------------------------------------------ *
 * MongoDB connection.
 * Agar MONGODB_URI nahi mila ya connect nahi hua, to server phir bhi
 * chalta hai — sirf DB wale routes 503 dete hain. Isse frontend develop
 * karte waqt server band nahi hota.
 * ------------------------------------------------------------------ */

let state = { connected: false, error: null }

export const dbState = () => state

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    state = { connected: false, error: 'MONGODB_URI set nahi hai (.env dekho)' }
    console.warn('\n  ⚠  MongoDB URI nahi mila — server chalega par data save nahi hoga.')
    console.warn('     server/.env banao aur MONGODB_URI daalo (server/.env.example dekho)\n')
    return false
  }

  mongoose.connection.on('connected', () => {
    state = { connected: true, error: null }
    console.log('  ✓ MongoDB connected')
  })
  mongoose.connection.on('error', (err) => {
    state = { connected: false, error: err.message }
    console.error('  ✗ MongoDB error:', err.message)
  })
  mongoose.connection.on('disconnected', () => {
    state = { connected: false, error: 'disconnected' }
    console.warn('  ⚠ MongoDB disconnected')
  })

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      // site JSON bada ho sakta hai — buffering band, warna requests atak jaati hain
      bufferCommands: false,
    })
    return true
  } catch (err) {
    state = { connected: false, error: err.message }
    console.error('\n  ✗ MongoDB connect nahi hua:', err.message)
    console.error('     Server chal raha hai, par /api/sites kaam nahi karega.\n')
    return false
  }
}

/** DB chahiye wale routes ke liye guard */
export function requireDB(req, res, next) {
  if (!state.connected) {
    return res.status(503).json({
      error: 'Database connected nahi hai',
      detail: state.error || 'MONGODB_URI check karo',
    })
  }
  next()
}
