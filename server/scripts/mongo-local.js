import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

/* ------------------------------------------------------------------ *
 * Local MongoDB chalata hai — na koi account, na internet, na API key.
 *
 * mongod ka binary pehle se laptop pe hai (mongodb-memory-server ne
 * download kiya tha). Yahan use ek permanent data folder ke saath
 * chalate hain, taaki data band karne pe bhi bacha rahe.
 *
 *   npm run mongo        (alag terminal me)
 *   npm run dev:all      (mongo + server ek saath)
 * ------------------------------------------------------------------ */

const PORT = process.env.MONGO_PORT || 27017
const DATA_DIR = path.join(process.cwd(), 'data', 'mongodb')

/** mongod.exe dhoondo — pehle system me, phir cache me */
function findMongod() {
  const candidates = [
    // mongodb-memory-server ka cache
    path.join(os.homedir(), '.cache', 'mongodb-binaries'),
    path.join(process.cwd(), 'node_modules', '.cache', 'mongodb-memory-server'),
    // agar user ne khud MongoDB install kiya ho
    'C:/Program Files/MongoDB/Server/8.0/bin',
    'C:/Program Files/MongoDB/Server/7.0/bin',
    '/usr/bin',
    '/usr/local/bin',
  ]

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue
    const hit = fs.readdirSync(dir).find((f) => /^mongod(-|\.exe$|$)/.test(f))
    if (hit) return path.join(dir, hit)
  }
  return null
}

const mongod = findMongod()

if (!mongod) {
  console.error('\n  ✗ mongod binary nahi mila.')
  console.error('    Ek baar ye chalao:  npm i -D mongodb-memory-server')
  console.error('    (wo binary download kar lega, phir ye script use kar legi)\n')
  process.exit(1)
}

fs.mkdirSync(DATA_DIR, { recursive: true })

console.log('\n  MongoDB (local)')
console.log('  binary :', mongod)
console.log('  data   :', DATA_DIR)
console.log('  url    : mongodb://127.0.0.1:' + PORT + '/genwebai\n')

const child = spawn(
  mongod,
  ['--dbpath', DATA_DIR, '--port', String(PORT), '--bind_ip', '127.0.0.1'],
  { stdio: ['ignore', 'pipe', 'pipe'] }
)

// mongod ka log bahut zyada hota hai — sirf kaam ki lines dikhao
child.stdout.on('data', (buf) => {
  for (const line of String(buf).split('\n')) {
    if (!line.trim()) continue
    try {
      const j = JSON.parse(line)
      if (j.c === 'NETWORK' && /Waiting for connections/.test(j.msg)) {
        console.log(`  ✓ MongoDB ready — port ${PORT}\n`)
      } else if (j.s === 'E' || j.s === 'F') {
        console.error('  ✗', j.msg, j.attr ? JSON.stringify(j.attr) : '')
      }
    } catch {
      /* non-json line — ignore */
    }
  }
})
child.stderr.on('data', (b) => process.stderr.write(b))

child.on('exit', (code) => {
  console.log(`\n  MongoDB band ho gaya (code ${code})`)
  process.exit(code ?? 0)
})

// Ctrl+C pe saaf band karo
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { child.kill(); process.exit(0) })
}
