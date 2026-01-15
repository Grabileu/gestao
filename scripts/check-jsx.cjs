const fs = require('fs')
const path = require('path')
const glob = require('glob')
const parser = require('@babel/parser')

const root = path.join(__dirname, '..')
const pattern = `${root.replace(/\\/g, '/')}/**/*.jsx`

const files = glob.sync(pattern, { ignore: ['**/node_modules/**', '**/dist/**'] })
let errors = []
for (const file of files) {
  const rel = path.relative(root, file)
  try {
    const code = fs.readFileSync(file, 'utf8')
    parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'classProperties',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
    })
    console.log(`${rel}: OK`)
  } catch (e) {
    console.error(`${rel}: SYNTAX ERROR -> ${e.message}`)
    errors.push({ file: rel, message: e.message })
  }
}
if (errors.length > 0) {
  console.error(`\nFound ${errors.length} file(s) with syntax errors.`)
  process.exit(1)
} else {
  console.log('\nAll JSX files parsed OK')
  process.exit(0)
}
