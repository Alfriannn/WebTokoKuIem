'use client'

import { ShoppingCart, Star, TrendingUp, Menu, X, Search, User, ShoppingBag } from 'lucide-react'
import { addToCart } from '@/utils/cart'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

type Product = {
  id: string | number
  name: string
  price: number
  imageUrl?: string
  rating?: number
}

export default function LandingPage() {
  const [fadeIn, setFadeIn] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notif, setNotif] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    setFadeIn(true)
  }, [])

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data))
  }, [])

  // Handler untuk tambah ke keranjang
  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      imageUrl: product.imageUrl
    }, cartKey); // <-- tambahkan cartKey di sini!
    setNotif(`"${product.name}" berhasil ditambahkan ke keranjang!`)
    setTimeout(() => setNotif(null), 2000)

    // Simpan ke database
    if (user) {
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
      saveCartToDB(user.id, cart)
    }
  }

  // Ambil user dari localStorage
  const userStr = typeof window !== "undefined" ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const cartKey = user ? `cart_${user.id}` : 'cart';

  // Update cart count saat halaman dimuat & setiap notif muncul (produk ditambah)
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      setCartCount(totalQty);
    };

    updateCartCount();

    // Update jika ada perubahan localStorage dari tab lain
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  useEffect(() => {
    // Update count setiap notif muncul (produk baru ditambah)
    if (notif) {
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      setCartCount(totalQty);
    }
  }, [notif]);

  useEffect(() => {
    if (user) {
      fetch(`/api/cart?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.items) {
            localStorage.setItem(cartKey, JSON.stringify(data.items.map(item => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.price,
              qty: item.qty,
              imageUrl: item.product.imageUrl
            }))))
          }
        })
    }
  }, [user])

  return (
    <main className={`min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-blue-600">TokoKu</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">Beranda</Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">Produk</Link>
              <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium">Kategori</Link>
              <Link href="/promo" className="text-gray-700 hover:text-blue-600 font-medium">Promo</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">Tentang Kami</Link>
            </div>

            {/* Search, User, Cart Icons */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="h-5 w-5 text-gray-700" />
              </button>
              <Link href="/account">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <User className="h-5 w-5 text-gray-700" />
                </button>
              </Link>
              <Link href="/cart">
                <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full relative">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 px-2 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <Link href="/" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Beranda</Link>
                <Link href="/products" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Produk</Link>
                <Link href="/categories" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Kategori</Link>
                <Link href="/promo" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Promo</Link>
                <Link href="/about" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Tentang Kami</Link>
                
                <div className="flex space-x-4 border-t border-gray-200 pt-3 px-3">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Search className="h-5 w-5 text-gray-700" />
                  </button>
                  <Link href="/account">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <User className="h-5 w-5 text-gray-700" />
                    </button>
                  </Link>
                  <Link href="/cart">
                    <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full relative">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - adjusted for navbar */}
      <div className="relative h-screen flex flex-col justify-center items-center text-center px-4 pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-blue-900 opacity-5"></div>
        </div>
        
        <div className="z-10 max-w-4xl mx-auto">
          <div className="animate-bounce inline-block p-2 mb-6 bg-yellow-400 text-gray-900 rounded-full font-medium text-sm">
            Diskon 30% untuk 100 pembeli pertama!
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Selamat Datang di TokoKu
          </h1>
          
          <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto text-gray-700">
            Temukan produk Iem terbaik dengan harga terbaik di TokoKu. 
            Belanja mudah, cepat, dan aman dengan jaminan kualitas terbaik.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/products">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                <ShoppingCart size={20} />
                Lihat Produk
              </button>
            </Link>
            
            <Link href="/promo">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-full border-2 border-blue-600 hover:bg-blue-50 transition transform hover:scale-105 flex items-center justify-center gap-2">
                <TrendingUp size={20} />
                Promo Spesial
              </button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-8 animate-bounce">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
      
      {/* Produk Unggulan */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Produk Unggulan Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105"
              >
                <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={product.imageUrl || "/api/placeholder/400/320"} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full text-gray-900">
                    TERLARIS
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{product.name}</h3>
                  <div className="flex items-center mb-4">
                    {[...Array(product.rating || 5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex items-center justify-center"
                      aria-label="Tambah ke Keranjang"
                    >
                      <ShoppingCart size={22} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/products">
              <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Lihat Semua Produk
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">Apa Kata Pelanggan Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-800 mb-4">
                "Produk berkualitas tinggi dan pengiriman cepat. Sangat puas dengan layanan TokoKu!"
              </p>
              <p className="font-bold text-gray-900">Ahmad S.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-800 mb-4">
                "Harga terjangkau dengan kualitas yang sangat baik. Akan berbelanja lagi di TokoKu!"
              </p>
              <p className="font-bold text-gray-900">Siti R.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-800 mb-4">
                "Pelayanan ramah dan respon cepat. TokoKu adalah pilihan tepat untuk belanja online!"
              </p>
              <p className="font-bold text-gray-900">Budi W.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section (New) */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-black">Mengapa Harus TokoKu?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 inline-flex mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Pengiriman Cepat</h3>
              <p className="text-gray-700">Pesanan Anda akan sampai dalam waktu 1-3 hari kerja</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 inline-flex mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Produk Berkualitas</h3>
              <p className="text-gray-700">Produk asli dengan kualitas terjamin</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 inline-flex mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Harga Bersaing</h3>
              <p className="text-gray-700">Dapatkan harga terbaik untuk setiap produk</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 inline-flex mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Layanan 24/7</h3>
              <p className="text-gray-700">Dukungan pelanggan siap membantu kapanpun</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Bersiaplah untuk Pengalaman Belanja Terbaik</h2>
          <p className="text-lg mb-8">
            Daftar sekarang dan dapatkan kupon diskon 10% untuk pembelian pertama Anda
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition transform hover:scale-105 font-bold">
                Daftar Sekarang
              </button>
            </Link>
            
            <Link href="/products">
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-blue-700 transition transform hover:scale-105">
                Mulai Belanja
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <ShoppingBag className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-2xl font-bold text-white">TokoKu</span>
            </div>
            <p className="mb-4">Belanja nyaman, harga teman</p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                </svg>
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"></path>
                </svg>
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Produk</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Elektronik</a></li>
              <li><a href="#" className="hover:text-white transition">Fashion</a></li>
              <li><a href="#" className="hover:text-white transition">Kesehatan</a></li>
              <li><a href="#" className="hover:text-white transition">Rumah Tangga</a></li>
              <li><a href="#" className="hover:text-white transition">Olahraga</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-4">TokoKu</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition">Karir</a></li>
              <li><a href="#" className="hover:text-white transition">Berita</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Mitra</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Bantuan</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Kontak</a></li>
              <li><a href="#" className="hover:text-white transition">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white transition">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Status Pesanan</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          &copy; {new Date().getFullYear()} TokoKu. Semua hak dilindungi.
        </div>
      </footer>

      {/* Notifikasi */}
      {notif && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-fade-in">
          {notif}
        </div>
      )}
    </main>
  )
}

// Tambahkan di src/app/page.tsx atau utils/cart.ts
async function saveCartToDB(userId: number, cart: any[]) {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items: cart }),
  })
}