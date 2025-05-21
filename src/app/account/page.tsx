'use client'
import { Home, User, Mail, LogOut, ShoppingBag, Clock, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AccountPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter()
  
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.replace('/login')
      return
    }
    setUser(JSON.parse(userStr))
  }, [router])

  useEffect(() => {
    if (user) {
      fetch(`/api/orders?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(data));
    }
  }, [user])
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <div className="text-lg text-blue-700 font-medium">Memuat data akun...</div>
        </div>
      </div>
    )
  }
  
  const handleLogout = () => {
    localStorage.removeItem('user')
    router.replace('/login')
  }
  
  // Avatar placeholder with user's initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-200">
          {/* Header with User info */}
          <div className="bg-blue-600 text-white p-6 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mt-32 -mr-32 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full -mb-16 -ml-16 opacity-20"></div>
            
            <div className="relative z-10 flex items-center">
              <div className="w-20 h-20 rounded-full bg-blue-400 flex items-center justify-center text-white text-3xl font-bold border-4 border-white">
                {getInitials(user.name)}
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-blue-100 flex items-center mt-1">
                  <Mail size={16} className="mr-2" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-blue-50 border-b border-blue-200">
            <div className="flex">
              <button 
                className={`px-6 py-4 font-medium flex items-center ${activeTab === 'profile' ? 'bg-white text-blue-700 border-t-2 border-blue-600' : 'text-blue-600 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} className="mr-2" />
                Profil
              </button>
              <button 
                className={`px-6 py-4 font-medium flex items-center ${activeTab === 'orders' ? 'bg-white text-blue-700 border-t-2 border-blue-600' : 'text-blue-600 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingBag size={18} className="mr-2" />
                Pesanan
              </button>
              <button 
                className={`px-6 py-4 font-medium flex items-center ${activeTab === 'wishlist' ? 'bg-white text-blue-700 border-t-2 border-blue-600' : 'text-blue-600 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={18} className="mr-2" />
                Wishlist
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                    <User size={20} className="mr-2" />
                    Informasi Pribadi
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-blue-600 font-medium mb-1">Nama Lengkap</div>
                      <div className="bg-white rounded-lg border border-blue-200 p-3 font-semibold text-gray-800">
                        {user.name}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-blue-600 font-medium mb-1">Email</div>
                      <div className="bg-white rounded-lg border border-blue-200 p-3 font-semibold text-gray-800">
                        {user.email}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-blue-600 font-medium mb-1">Tanggal Bergabung</div>
                      <div className="bg-white rounded-lg border border-blue-200 p-3 font-semibold text-gray-800 flex items-center">
                        <Clock size={16} className="mr-2 text-blue-500" />
                        {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                      Edit Profil
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h2 className="text-xl font-bold text-blue-800 mb-4">Keamanan Akun</h2>
                  <button className="bg-white border border-blue-300 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50 transition font-medium">
                    Ganti Password
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <ShoppingBag size={20} className="mr-2" />
                  Riwayat Pesanan
                </h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-blue-300 mb-4" />
                    <h3 className="text-xl font-bold text-blue-800 mb-2">Belum Ada Pesanan</h3>
                    <p className="text-blue-600 mb-6">Anda belum melakukan pembelian apapun</p>
                    <Link href="/products">
                      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                        Mulai Berbelanja
                      </button>
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {orders.map(order => (
                      <li key={order.id} className="bg-white rounded-lg shadow p-4 border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-blue-700">Order #{order.id}</span>
                          <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                        <ul className="mb-2">
                          {order.items.map((item: any) => (
                            <li key={item.id} className="flex justify-between text-gray-700">
                              <span>{item.product.name} x {item.quantity}</span>
                              <span>Rp {item.price.toLocaleString('id-ID')}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-blue-700">Rp {order.total.toLocaleString('id-ID')}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {activeTab === 'wishlist' && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center py-12">
                <Heart size={48} className="mx-auto text-blue-300 mb-4" />
                <h3 className="text-xl font-bold text-blue-800 mb-2">Wishlist Kosong</h3>
                <p className="text-blue-600 mb-6">Anda belum menambahkan produk ke wishlist</p>
                <Link href="/products">
                  <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                    Jelajahi Produk
                  </button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Footer actions */}
          <div className="px-8 pb-8 flex gap-4">
            <Link href="/" className="flex-1">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
              >
                <Home size={20} />
                Beranda
              </button>
            </Link>
            
            <button
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}