import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('image') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const timestamp = Date.now()
  const ext = file.name.split('.').pop()
  const fileName = `product_${timestamp}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  // Pastikan folder uploads ada
  await fs.mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, fileName)
  await fs.writeFile(filePath, buffer)

  // URL publik (pastikan folder public/uploads bisa diakses)
  const imageUrl = `/uploads/${fileName}`

  return NextResponse.json({ imageUrl })
}