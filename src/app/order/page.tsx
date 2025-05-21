'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type CartItem = {
  id: number
  name: string
  description: string
  price: number
  stock: number
  imageUrl?: string
  quantity: number
}

export default function OrderPage() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const cartData = localStorage.getItem('cart')
    if (cartData) setCart(JSON.parse(cartData))
  }, [])

  // Update localStorage setiap cart berubah
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const updateQuantity = (id: number, qty: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(item.stock, qty)) }
          : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">Keranjang Belanja</h1>
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            Keranjang kosong.<br />
            <Link href="/products" className="text-blue-600 underline">Belanja sekarang</Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <table className="w-full mb-6">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Produk</th>
                  <th className="py-2">Harga</th>
                  <th className="py-2">Jumlah</th>
                  <th className="py-2">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 flex items-center gap-3">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      )}
                      <span>{item.name}</span>
                    </td>
                    <td className="py-2">Rp {item.price.toLocaleString('id-ID')}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={1}
                        max={item.stock}
                        value={item.quantity}
                        onChange={e => updateQuantity(item.id, Number(e.target.value))}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="py-2 font-semibold">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:underline"
              >
                Kosongkan Keranjang
              </button>
              <div className="text-xl font-bold text-blue-700">
                Total: Rp {total.toLocaleString('id-ID')}
              </div>
            </div>
            <button
              className="w-full py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
              disabled={cart.length === 0}
              onClick={() => alert('Checkout belum diimplementasikan')}
            >
              Checkout
            </button>
          </div>
        )}
        <div className="mt-8 text-center">
          <Link href="/products">
            <button className="px-6 py-3 bg-gray-200 text-blue-700 rounded hover:bg-gray-300 transition">
              &larr; Kembali ke Produk
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}