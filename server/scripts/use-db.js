import fs from 'node:fs'
import mongoose from 'mongoose'

/* ------------------------------------------------------------------ *
 * Database switch karne ki ek command.
 *
 *   npm run use:atlas "mongodb+srv://user:pass@cluster0.xxx.mongodb.net/peddino"
 *   npm run use:local
 *   npm run use:files
 *
 * Ye .env update karta hai aur turant connection test bhi karta hai,
 * taaki galat string ho to abhi pata chal jaye.
 * ------------------------------------------------------------------ */

const arg = process.argv[2] || ''
const LOCAL = 'mongodb://127.0.0.1:27017/genwebai'

let uri
let label

if (arg === 'local') {
  uri = LOCAL
  label = 'Local MongoDB'
} else if (arg === 'files' || arg === 'none') {
  uri = ''
  label = 'Local files (koi database nahi)'
} else if (arg.startsWith('mongodb')) {
  uri = arg.trim()
  label = uri.startsWith('mongodb+srv') ? 'MongoDB Atlas (cloud)' : 'MongoDB'
} else {
  console.error(`
  Kaise use karein:

    npm run use:atlas "mongodb+srv://user:pass@cluster0.xxx.mongodb.net/peddino"
    npm run use:local      (laptop wala MongoDB)
    npm run use:files      (koi database nahi, sirf files)
`)
  process.exit(1)
}

/* ---------- pehle connection check karo ---------- */
if (uri) {
  process.stdout.write(`\n  Connect kar raha hoon: ${label} ... `)
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 })
    const dbName = mongoose.connection.name
    await mongoose.disconnect()
    console.log('✓ juda\n')
    console.log(`  database: ${dbName}`)
  } catch (e) {
    console.log('✗ fail\n')
    console.error(`  Error: ${e.message}\n`)
    const m = e.message.toLowerCase()
    if (m.includes('auth')) {
      console.error('  → Password galat lag raha hai.')
      console.error('    Atlas > Database Access > user pe Edit > Edit Password > naya banao')
      console.error('    Dhyan: password me @ # / : ? na ho\n')
    } else if (m.includes('timed out') || m.includes('etimeout') || m.includes('querysrv')) {
      console.error('  → Atlas tak pahunch nahi raha.')
      console.error('    Atlas > Network Access > Add IP Address > ALLOW ACCESS FROM ANYWHERE')
      console.error('    (status Active hone tak 1-2 min lagte hain)\n')
    } else if (m.includes('econnrefused')) {
      console.error('  → Local MongoDB chal hi nahi raha. Alag terminal me: npm run mongo\n')
    }
    console.error('  .env nahi badla — pehle ye theek karo.\n')
    process.exit(1)
  }
}

/* ---------- ab .env update karo ---------- */
const path = '.env'
let env = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : ''

if (/^MONGODB_URI=.*$/m.test(env)) {
  env = env.replace(/^MONGODB_URI=.*$/m, `MONGODB_URI=${uri}`)
} else {
  env += `\nMONGODB_URI=${uri}\n`
}
fs.writeFileSync(path, env)

console.log(`\n  ✓ .env update ho gaya — ab ${label} use hoga`)
console.log('    Server apne aap restart hoga (nodemon .env dekhta hai)')
console.log('    Check: http://localhost:4000/api/health\n')
