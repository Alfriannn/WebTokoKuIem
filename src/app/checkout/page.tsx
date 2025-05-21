'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([])
  const [user, setUser] = useState<{ id: number, name: string, email: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    setUser(user)
    const cartKey = user ? `cart_${user.id}` : 'cart'
    setCart(JSON.parse(localStorage.getItem(cartKey) || '[]'))
  }, [])

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        items: cart,
        total
      })
    })
    if (res.ok) {
      // Kosongkan cart setelah checkout
      localStorage.removeItem(`cart_${user.id}`)
      setCart([]) // <-- tambahkan ini!
      // Trigger event storage agar tab lain juga sync
      window.dispatchEvent(new Event('storage'))
      alert('Checkout berhasil!')
      router.push('/account')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        {cart.length === 0 ? (
          <div>Keranjang kosong.</div>
        ) : (
          <>
            <ul className="mb-6">
              {cart.map(item => (
                <li key={item.productId} className="mb-2 flex justify-between">
                  <span>{item.name} x {item.qty}</span>
                  <span>Rp {item.price.toLocaleString('id-ID')}</span>
                </li>
              ))}
            </ul>
            <div className="font-bold mb-6">
              Total: Rp {cart.reduce((sum, item) => sum + item.price * item.qty, 0).toLocaleString('id-ID')}
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition"
            >
              Konfirmasi & Pesan
            </button>
          </>
        )}
      </div>
    </main>
  )
}