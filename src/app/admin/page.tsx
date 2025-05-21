'use client'

import React, { useEffect, useState, useRef } from "react";
import {
  Trash2,
  PenSquare,
  Plus,
  X,
  ShoppingBag,
  Package,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Save,
  Search,
  Upload,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  featured: boolean;
}

export default function AdminPage() {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      router.replace("/loginadmin");
    }
  }, [router, isLoggingOut]);

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    featured: false,
  });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isUploading, setIsUploading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    fetch('/api/order')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Error fetching orders:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.match("image.*")) {
        showNotification("Hanya file gambar yang diizinkan", "error");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Ukuran gambar maksimal 5MB", "error");
        return;
      }

      setProductImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || "",
      featured: product.featured || false,
    });

    if (product.imageUrl) {
      setImagePreview(product.imageUrl);
    } else {
      setImagePreview(null);
    }

    setProductImage(null);
    setIsFormVisible(true);

    document
      .getElementById("productForm")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = form.imageUrl;

      if (productImage) {
        try {
          imageUrl = await uploadImage(productImage);
        } catch (error) {
          showNotification("Gagal mengupload gambar", "error");
          return;
        }
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: parseInt(form.price.replace(/[.,]/g, "")),
        stock: parseInt(form.stock),
        imageUrl,
        featured: form.featured,
      };

      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (editingProduct) {
          setProducts(products.map((p) => (p.id === data.id ? data : p)));
          setEditingProduct(null);
          showNotification(editingProduct.name + " berhasil diupdate");
        } else {
          setProducts([...products, data]);
          showNotification(data.name + " berhasil ditambahkan");
        }
        resetForm();
      } else {
        throw new Error("Gagal menyimpan produk");
      }
    } catch (error) {
      showNotification("Gagal menyimpan produk", "error");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm("Yakin ingin hapus produk ini?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        showNotification(name + " berhasil dihapus");
      } else {
        throw new Error("Gagal hapus produk");
      }
    } catch (error) {
      showNotification("Gagal menghapus produk", "error");
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Yakin ingin menghapus pesanan ini?")) return;
    try {
      const res = await fetch(`/api/order/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(orders.filter((order) => order.id !== orderId));
        showNotification("Pesanan berhasil dihapus");
      } else {
        showNotification("Gagal menghapus pesanan", "error");
      }
    } catch {
      showNotification("Gagal menghapus pesanan", "error");
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
      featured: false,
    });
    setProductImage(null);
    setImagePreview(null);
    setIsFormVisible(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    const notification = document.getElementById("notification");
    if (notification) {
      notification.textContent = message;
      notification.className = `fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white opacity-100 transition-opacity duration-300 flex items-center gap-3`;

      setTimeout(() => {
        notification.className = notification.className.replace(
          "opacity-100",
          "opacity-0"
        );
      }, 3000);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedProducts = () => {
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "price") {
        comparison = a.price - b.price;
      } else if (sortField === "stock") {
        comparison = a.stock - b.stock;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const removeImage = () => {
    setProductImage(null);
    setImagePreview(null);
    setForm({ ...form, imageUrl: "" });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );
  const lowStockProducts = products.filter((p) => p.stock < 10).length;

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-white flex items-center tracking-tight drop-shadow">
            <ShoppingBag className="mr-3 text-blue-200" size={32} />
            Dashboard Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">Admin</span>
            <img src="/avatar-admin.jpeg" alt="Admin" className="w-10 h-10 rounded-full border-2 border-white shadow" />
            <button
              onClick={() => {
                localStorage.removeItem("admin");
                setIsLoggingOut(true);
              }}
              className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 font-semibold shadow transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 flex items-center hover:scale-105 transition">
            <Package className="h-12 w-12 text-white mr-4" />
            <div>
              <p className="text-sm text-blue-100">Total Produk</p>
              <p className="text-3xl font-bold text-white">{totalProducts}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl shadow-lg p-6 flex items-center hover:scale-105 transition">
            <DollarSign className="h-12 w-12 text-white mr-4" />
            <div>
              <p className="text-sm text-indigo-100">Total Inventory</p>
              <p className="text-3xl font-bold text-white">Rp {totalValue.toLocaleString("id-ID")}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl shadow-lg p-6 flex items-center hover:scale-105 transition">
            <Layers className="h-12 w-12 text-white mr-4" />
            <div>
              <p className="text-sm text-pink-100">Stok Menipis</p>
              <p className="text-3xl font-bold text-white">{lowStockProducts}</p>
            </div>
          </div>
        </div>

        {/* Product Form */}
        {isFormVisible && (
          <div
            id="productForm"
            className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden border border-blue-200"
          >
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              <button
                onClick={resetForm}
                className="text-white hover:bg-blue-700 rounded-full p-1"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-4 md:col-span-1">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Nama Produk
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShoppingBag size={16} className="text-blue-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-blue-800 bg-blue-50"
                      placeholder="Nama Produk"
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Gambar Produk
                  </label>
                  <div className="mt-1 flex flex-col items-center">
                    {imagePreview ? (
                      <div className="relative mb-3 w-full">
                        <div className="aspect-w-1 aspect-h-1 w-full rounded-lg bg-blue-100 overflow-hidden border border-blue-200">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="object-cover w-full h-48"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-blue-50 border border-blue-200"
                            title="Hapus gambar"
                          >
                            <X size={16} className="text-blue-700" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 bg-blue-50"
                      >
                        <Upload className="h-10 w-10 text-blue-400" />
                        <p className="mt-2 text-sm text-blue-600">
                          Klik untuk upload gambar
                        </p>
                        <p className="text-xs text-blue-500">
                          JPG, PNG, GIF (Maks. 5MB)
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {!imagePreview && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Upload size={16} className="mr-2" />
                        Pilih Gambar
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Harga (Rp)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-blue-400" />
                      </div>
                      <input
                        type="text"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-blue-800 bg-blue-50"
                        placeholder="Harga (contoh: 150000 atau 150.000)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Stok
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Layers size={16} className="text-blue-400" />
                      </div>
                      <input
                        type="number"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-blue-800 bg-blue-50"
                        placeholder="Stok"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="inline-flex items-center mt-2">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm({ ...form, featured: e.target.checked })
                      }
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-blue-700">
                      Jadikan Produk Unggulan
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-4 md:col-span-1">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={6}
                    className="block w-full px-3 py-3 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-blue-800 bg-blue-50"
                    placeholder="Deskripsi detail produk"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Batal
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                  >
                    {isUploading ? (
                      <>
                        <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        {editingProduct ? "Update Produk" : "Simpan Produk"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Search and Sort Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-72 mb-4 md:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-blue-400" />
              </div>
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 text-blue-800 bg-blue-50"
              />
            </div>

            <div className="flex space-x-2">
              <div className="text-sm text-blue-600 flex items-center">
                Urutkan berdasarkan:
              </div>
              <button
                onClick={() => handleSort("name")}
                className={`px-3 py-1 rounded-md text-sm ${
                  sortField === "name"
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-white text-blue-700 hover:bg-blue-50 border border-blue-200"
                }`}
              >
                Nama{" "}
                {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSort("price")}
                className={`px-3 py-1 rounded-md text-sm ${
                  sortField === "price"
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-white text-blue-700 hover:bg-blue-50 border border-blue-200"
                }`}
              >
                Harga{" "}
                {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSort("stock")}
                className={`px-3 py-1 rounded-md text-sm ${
                  sortField === "stock"
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-white text-blue-700 hover:bg-blue-50 border border-blue-200"
                }`}
              >
                Stok{" "}
                {sortField === "stock" && (sortDirection === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {getSortedProducts().length > 0 ? (
            getSortedProducts().map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition border border-blue-100"
              >
                <div className="p-6 flex">
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-blue-50 border border-blue-200">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-blue-300 mx-auto my-auto" />
                    )}
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-lg font-bold text-blue-900">{p.name}</h3>
                    <p className="text-sm text-blue-600 mt-1">{p.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">Rp {p.price.toLocaleString("id-ID")}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold
                        ${p.stock < 10 ? "bg-red-100 text-red-700" : p.stock < 30 ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-800"}`}>
                        Stok: {p.stock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow p-8 text-center border border-blue-200">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-blue-900">
                Tidak ada produk ditemukan
              </h3>
              <p className="mt-2 text-blue-600">
                {searchTerm
                  ? `Tidak ada produk yang cocok dengan '${searchTerm}'`
                  : "Belum ada produk yang ditambahkan"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Hapus filter pencarian
                </button>
              )}
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="mt-12 bg-white rounded-lg shadow p-6 border border-blue-200">
          <h2 className="text-xl font-bold mb-4 text-blue-900">Daftar Pesanan</h2>
          {orders.length === 0 ? (
            <div className="text-blue-600">Belum ada pesanan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full rounded-xl overflow-hidden shadow">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left p-3 text-blue-800 font-semibold">User</th>
                    <th className="text-left p-3 text-blue-800 font-semibold">Produk</th>
                    <th className="text-left p-3 text-blue-800 font-semibold">Total</th>
                    <th className="text-left p-3 text-blue-800 font-semibold">Metode</th>
                    <th className="text-left p-3 text-blue-800 font-semibold">Tanggal</th>
                    <th className="text-left p-3 text-blue-800 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={order.id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="p-3 text-blue-900">{order.user?.name || order.user?.email}</td>
                      <td className="p-3">
                        <ul>
                          {order.items.map((item: any) => (
                            <li key={item.id} className="text-blue-900 font-medium">
                              {item.product.name} <span className="text-blue-700 font-normal">x {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 font-bold text-blue-700">Rp {order.total.toLocaleString('id-ID')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${order.paymentMethod === "QRIS" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-blue-900">{new Date(order.createdAt).toLocaleString('id-ID')}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition text-xs font-semibold"
                          title="Hapus Pesanan"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Floating Notification */}
      <div
        id="notification"
        className="fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white opacity-0 transition-opacity duration-300 flex items-center gap-3"
      >
        <CheckCircle className="text-white" size={24} />
        <span id="notification-message"></span>
      </div>
    </div>
  );
}