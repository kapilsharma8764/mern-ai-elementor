import { TEMPLATES } from '../src/data/templates.js'

/* ------------------------------------------------------------------ *
 * Client ke 61 built-in templates ko database me bhej deta hai.
 * Ek baar chalao — phir gallery DB se templates uthayegi.
 *
 *   npm run seed:templates
 * ------------------------------------------------------------------ */

const API = process.env.VITE_API_URL || 'http://localhost:4000'

console.log(`\n  ${TEMPLATES.length} templates bhej raha hoon -> ${API}\n`)

try {
  const res = await fetch(`${API}/api/templates/seed/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templates: TEMPLATES }),
  })
  const data = await res.json()

  if (!res.ok) {
    console.error('  ✗ fail:', data.error || res.status)
    process.exit(1)
  }

  console.log(`  ✓ naye add hue : ${data.added}`)
  console.log(`  ✓ update hue   : ${data.updated}`)
  console.log(`  ✓ ab DB me     : ${data.total} templates\n`)
  console.log('  Ab gallery database se templates uthayegi.')
  console.log('  Naya template add karna ho to: POST /api/templates\n')
} catch (e) {
  console.error('\n  ✗ Server se baat nahi ho payi:', e.message)
  console.error('    Server chalu hai? npm run dev\n')
  process.exit(1)
}
