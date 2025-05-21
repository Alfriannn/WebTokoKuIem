import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Ambil cart user
export async function GET(request: NextRequest) {
  const userId = Number(request.nextUrl.searchParams.get('userId'))
  if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  })
  return NextResponse.json(cart)
}

// Simpan/update cart user
export async function POST(request: NextRequest) {
  const { userId, items } = await request.json()
  if (!userId || !Array.isArray(items)) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })

  // Upsert cart
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId }
  })

  // Hapus semua item lama
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  // Tambah item baru
  for (const item of items) {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: item.productId,
        qty: item.qty
      }
    })
  }

  return NextResponse.json({ success: true })
}