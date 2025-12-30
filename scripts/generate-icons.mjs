import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const svgContent = readFileSync(join(publicDir, 'favicon.svg'), 'utf8')

const sizes = [192, 512]

for (const size of sizes) {
  const png = await sharp(Buffer.from(svgContent))
    .resize(size, size)
    .png()
    .toBuffer()

  writeFileSync(join(publicDir, `icon-${size}.png`), png)
  console.log(`Created icon-${size}.png`)
}

console.log('Done!')
