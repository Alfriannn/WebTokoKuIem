import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Buat order baru (checkout)
export async function POST(request: NextRequest) {
  const { userId, items, total, paymentMethod } = await request.json()
  if (!userId || !Array.isArray(items) || !total) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  // Buat order
  const order = await prisma.order.create({
    data: {
      userId,
      total,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.qty,
          price: item.price
        }))
      }
    },
    include: { items: true }
  })

  // Kurangi stok produk dengan pengecekan stok
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product || product.stock < item.qty) {
      return NextResponse.json({ error: 'Stok tidak cukup untuk produk: ' + (product?.name || item.productId) }, { status: 400 })
    }
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.qty } }
    })
  }

  return NextResponse.json({ success: true, order })
}

// Ambil semua order (untuk admin)
export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(orders)
}
