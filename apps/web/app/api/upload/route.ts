import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED = [
  'figure-female.jpg',
  'figure-female.png',
  'figure-male.jpg',
  'figure-male.png',
  'japanese-walk-female-sprite.jpg',
  'japanese-walk-female-sprite.png',
  'taichi-female-sprite.jpg',
  'taichi-female-sprite.png',
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file     = formData.get('file')     as File   | null
    const filename = formData.get('filename') as string | null

    if (!file || !filename) {
      return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 })
    }

    // Safety: only allow the specific filenames we expect
    if (!ALLOWED.includes(filename)) {
      return NextResponse.json({ error: `Filename "${filename}" is not permitted` }, { status: 400 })
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const dir = path.join(process.cwd(), 'public', 'images')
    await mkdir(dir, { recursive: true })

    const dest = path.join(dir, filename)
    await writeFile(dest, buffer)

    return NextResponse.json({ success: true, path: `/images/${filename}`, sizeKB: Math.round(buffer.length / 1024) })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
