import { PrismaClient, Product } from '@prisma/client'
import { notFound } from 'next/navigation'

const prisma = new PrismaClient()

interface ProductDetailProps {
  params: {
    id: string
  }
}

export default async function ProductDetail({ params }: ProductDetailProps) {
  const id = Number(params.id)

  if (isNaN(id)) {
    notFound()
  }

  const product: Product | null = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.name} className="w-full max-h-96 object-cover mb-6 rounded" />
      )}
      <p className="mb-4">{product.description}</p>
      <p className="text-xl font-semibold mb-2">Harga: Rp {product.price}</p>
      <p className="mb-4">Stok: {product.stock}</p>
      {/* Tambahkan tombol atau fitur lain seperti tambah ke keranjang jika mau */}
    </div>
  )
}
