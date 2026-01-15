const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, '..', 'Entities')
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
let ok = true
for (const file of files) {
  const p = path.join(dir, file)
  try {
    const content = fs.readFileSync(p, 'utf8')
    JSON.parse(content)
    console.log(`${file}: OK`)
  } catch (e) {
    ok = false
    console.error(`${file}: ERROR - ${e.message}`)
  }
}
process.exit(ok ? 0 : 1)
