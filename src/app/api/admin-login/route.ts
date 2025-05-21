import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Akun admin tidak ditemukan' }, { status: 401 })
  }

  // Bandingkan langsung (plain text)
  if (user.password !== password) {
    return NextResponse.json({ error: 'Password salah' }, { status: 401 })
  }

  return NextResponse.json({ success: true, admin: { id: user.id, name: user.name, email: user.email } })
}