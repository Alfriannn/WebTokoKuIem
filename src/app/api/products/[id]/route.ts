import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.product.findMany()
    return NextResponse.json(products)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, description, price, stock, imageUrl, featured } = data

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const priceNum = Number(price)
    const stockNum = Number(stock)

    if (isNaN(priceNum) || isNaN(stockNum)) {
      return NextResponse.json({ error: 'Price and stock must be numbers' }, { status: 400 })
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: priceNum,
        stock: stockNum,
        imageUrl: imageUrl || '',
        featured: !!featured, // <-- penting!
      },
    })

    return NextResponse.json(newProduct)
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const body = await req.json()
    const { name, description, price, stock, imageUrl, featured } = body

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        imageUrl,
        featured: !!featured, // <-- penting!
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
