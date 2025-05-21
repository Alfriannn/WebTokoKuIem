'use client'
import { Home, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCart, removeFromCart, clearCart, updateCartQty } from '@/utils/cart'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

async function saveCartToDB(userId: number, cart: any[]) {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items: cart }),
  })
}

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState<{ id: number } | null>(null);
  const [cartKey, setCartKey] = useState('cart');
  const router = useRouter();

  // Sync user & cartKey setiap kali halaman di-mount atau user berubah
  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem('user') : null;
    const userObj = userStr ? JSON.parse(userStr) : null;
    setUser(userObj);
    setCartKey(userObj ? `cart_${userObj.id}` : 'cart');
  }, []);

  // Sync cart setiap cartKey berubah
  useEffect(() => {
    setCart(getCart(cartKey));

    // Sync jika ada perubahan localStorage dari tab lain
    const handleStorage = () => setCart(getCart(cartKey));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [cartKey]);

  const handleRemove = (id: number) => {
    removeFromCart(id, cartKey);
    setCart(getCart(cartKey));
  };

  const handleClear = () => {
    clearCart(cartKey);
    setCart([]);
    router.refresh();
  };

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        items: cart,
        total
      })
    });
    if (res.ok) {
      clearCart(cartKey);
      setCart([]);
      alert('Checkout berhasil!');
      router.push('/account');
    }
  };

  const handleQtyChange = (productId: number, newQty: number) => {
    if (newQty < 1) return;
    updateCartQty(productId, newQty, cartKey);
    setCart(getCart(cartKey));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 flex flex-col items-center py-12">
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl border border-blue-200">
        {/* Decorative elements */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500 opacity-10 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-8">
            <ShoppingCart size={28} className="text-blue-600 mr-3" />
            <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">Keranjang Belanja</h1>
          </div>
          
          {cart.length === 0 ? (
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <ShoppingCart size={48} className="text-blue-400" />
              </div>
              <div className="text-gray-600 font-medium">Keranjang Anda masih kosong.</div>
              <Link href="/">
                <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center mx-auto">
                  <Home size={18} className="mr-2" />
                  Lanjutkan Belanja
                </button>
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-blue-100">
                {cart.map(item => (
                  <li key={item.productId} className="py-5 transform transition-all hover:bg-blue-50 hover:scale-[1.01] rounded-lg px-3">
                    <div className="flex items-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-lg overflow-hidden border-2 border-blue-200 flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="ml-5 flex-1">
                        <div className="font-bold text-gray-800 text-lg">{item.name}</div>
                        <div className="text-blue-600 font-semibold mt-1">Rp {item.price.toLocaleString('id-ID')}</div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3">
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="text-red-500 hover:text-red-700 flex items-center"
                          aria-label="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                        
                        <div className="flex items-center bg-blue-50 rounded-lg border border-blue-200 p-1">
                          <button
                            onClick={() => handleQtyChange(item.productId, item.qty - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-blue-100 text-blue-700"
                            aria-label="Kurangi"
                          >
                            <Minus size={16} />
                          </button>
                          
                          <span className="w-10 text-center font-medium text-gray-800">{item.qty}</span>
                          
                          <button
                            onClick={() => handleQtyChange(item.productId, item.qty + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-blue-100 text-blue-700"
                            aria-label="Tambah"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 border-t-2 border-blue-100 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-lg font-bold text-gray-800">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold text-blue-700">Total</span>
                    <span className="text-xl font-bold text-blue-700">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleClear}
                    className="px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold flex items-center justify-center transition-all"
                  >
                    <Trash2 size={18} className="mr-2" />
                    Kosongkan
                  </button>
                  
                  <button
                    onClick={handleCheckout}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all"
                  >
                    Checkout
                  </button>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Link href="/">
                    <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                      <Home size={18} className="mr-2" />
                      Kembali ke Beranda
                    </button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}