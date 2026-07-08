import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { crc32 } from 'node:zlib'

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcInput = Buffer.concat([typeBuf, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput) >>> 0, 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function makeSolidPng(size, [r, g, b]) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type: RGB
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const rowSize = size * 3
  const raw = Buffer.alloc((rowSize + 1) * size)
  for (let y = 0; y < size; y++) {
    const rowStart = y * (rowSize + 1)
    raw[rowStart] = 0 // no filter
    for (let x = 0; x < size; x++) {
      const inRing = (() => {
        const cx = size / 2
        const cy = size / 2
        const dx = x - cx
        const dy = y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        return dist < size * 0.36
      })()
      const px = rowStart + 1 + x * 3
      if (inRing) {
        raw[px] = 250
        raw[px + 1] = 204
        raw[px + 2] = 21
      } else {
        raw[px] = r
        raw[px + 1] = g
        raw[px + 2] = b
      }
    }
  }

  const idat = deflateSync(raw)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
  return png
}

writeFileSync('public/pwa-192x192.png', makeSolidPng(192, [17, 24, 39]))
writeFileSync('public/pwa-512x512.png', makeSolidPng(512, [17, 24, 39]))
console.log('Generated placeholder PWA icons.')
