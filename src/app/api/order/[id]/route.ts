// filepath: src/app/api/order/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const orderId = Number(params.id)
  if (!orderId) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 })

  await prisma.orderItem.deleteMany({ where: { orderId } })
  await prisma.order.delete({ where: { id: orderId } })

  return NextResponse.json({ success: true })
}