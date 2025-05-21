import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { userId, items } = await request.json()
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Data order tidak lengkap' }, { status: 400 })
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price, // Add the price field as required by your schema
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const userId = Number(request.nextUrl.searchParams.get('userId'))
  if (!userId) {
    return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}