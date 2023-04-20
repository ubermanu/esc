import fs from 'node:fs'
import { compile } from './compiler.ts'

const filename = process.argv[2]

if (!filename) {
  console.error('Please provide a filename')
  process.exit(1)
}

compile(fs.readFileSync(filename).toString())
