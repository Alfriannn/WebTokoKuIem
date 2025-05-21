"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Star, ChevronLeft } from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  featured?: boolean;
};

type CartItem = Product & { quantity: number };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notif, setNotif] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState("all");

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) setCart(JSON.parse(cartData));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat produk");
        setLoading(false);
      });
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id);
      if (exist) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    setNotif(`"${product.name}" ditambahkan ke keranjang!`);
    setTimeout(() => setNotif(null), 1500);
  };

  const filteredProducts = 
    filterActive === "all" ? products :
    filterActive === "inStock" ? products.filter(p => p.stock > 0) :
    filterActive === "discount" ? products.filter(p => p.price < 100000) :
    products;

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header dan Navigation */}
        <div className="relative mb-12">
          <div className="absolute top-0 right-0">
            <Link href="/cart">
              <button className="relative bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-full shadow-lg transition transform hover:scale-105">
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
          <h1 className="text-5xl font-extrabold mb-4 text-center text-blue-800 tracking-tight">
            <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              Katalog Produk
            </span>
          </h1>
          <p className="text-center text-blue-600 max-w-lg mx-auto mb-8">
            Temukan produk berkualitas tinggi dengan harga terbaik untuk kebutuhan Anda
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-blue-100 rounded-lg p-1 shadow-md">
            <button 
              onClick={() => setFilterActive("all")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterActive === "all" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-blue-700 hover:bg-blue-200"
              }`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilterActive("inStock")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterActive === "inStock" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-blue-700 hover:bg-blue-200"
              }`}
            >
              Tersedia
            </button>
            <button 
              onClick={() => setFilterActive("discount")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterActive === "discount" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-blue-700 hover:bg-blue-200"
              }`}
            >
              Diskon
            </button>
          </div>
        </div>

        {/* Notifikasi */}
        {notif && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 transition-opacity duration-300 animate-bounce">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              {notif}
            </div>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-600 font-medium">Memuat produk...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-16 text-red-500 bg-red-50 rounded-xl border border-red-200 max-w-lg mx-auto">
            <div className="text-xl font-bold mb-2">😞 Oops!</div>
            {error}
          </div>
        )}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-16 text-blue-500 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-xl font-bold mb-2">Tidak ada produk yang ditemukan</div>
                <p>Silakan coba filter lain atau kembali lagi nanti</p>
              </div>
            )}
            
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 flex flex-col border border-blue-100"
              >
                <div className="relative h-56 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden group">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium">{product.name.charAt(0)}</span>
                    </div>
                  )}
                  {product.price < 100000 && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-yellow-400 text-xs font-bold px-4 py-1 rounded-full shadow-md text-blue-900 flex items-center gap-1">
                        <Star size={14} fill="currentColor" />
                        DISKON!
                      </div>
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow-md text-white">
                        UNGGULAN
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-lg font-bold mb-1 text-blue-800 truncate hover:text-blue-600 transition">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 mb-4 flex-1 text-sm line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-blue-700">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        product.stock > 10
                          ? "bg-green-100 text-green-700"
                          : product.stock > 0
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {product.stock > 10
                        ? `Stok: ${product.stock}`
                        : product.stock > 0
                        ? `Tersisa: ${product.stock}`
                        : "Stok Habis"}
                    </span>
                  </div>
                  
                  <button
                    className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition shadow-md ${
                      product.stock === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white hover:scale-105"
                    }`}
                    onClick={() => product.stock > 0 && addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart size={18} />
                    {product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer Navigation */}
        <div className="mt-16 text-center">
          <Link href="/">
            <button className="px-6 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition font-medium shadow-lg inline-flex items-center gap-2 hover:scale-105 transform">
              <ChevronLeft size={20} />
              Kembali ke Beranda
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}