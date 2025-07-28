import React, { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { AddProductModal } from '../components/AddProductModal';
import { ShoppingCartIcon, PlusIcon } from '../components/icons';

// Data awal produk yang akan kita gunakan
// Nantinya ini akan diganti dengan data dari database
const initialProducts = [
  { id: 1, name: 'Kopi Susu Gula Aren', price: 18000, imageUrl: 'https://images.unsplash.com/photo-1579954115545-b72f1b315dd1?q=80&w=1994&auto=format&fit=crop' },
  { id: 2, name: 'Americano', price: 15000, imageUrl: 'https://images.unsplash.com/photo-1511920183353-3c7c95a57424?q=80&w=1887&auto=format&fit=crop' },
  { id: 3, name: 'Croissant Cokelat', price: 22000, imageUrl: 'https://images.unsplash.com/photo-1622397832652-852f4041049c?q=80&w=1887&auto=format&fit=crop' },
  { id: 4, name: 'Red Velvet Latte', price: 25000, imageUrl: 'https://images.unsplash.com/photo-1610412891295-5549d4437c8a?q=80&w=1887&auto=format&fit=crop' },
  { id: 5, name: 'Matcha Latte', price: 25000, imageUrl: 'https://images.unsplash.com/photo-1558160074-57d345592265?q=80&w=1887&auto=format&fit=crop' },
  { id: 6, name: 'Cinnamon Roll', price: 23000, imageUrl: 'https://images.unsplash.com/photo-1607478909473-79a4214b3a1a?q=80&w=1887&auto=format&fit=crop' },
];

// =====================================================================
// KOMPONEN HALAMAN KASIR
// =====================================================================
export const CashierPage = () => {
  const [products, setProducts] = useState(initialProducts);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Fungsi untuk menambah produk ke keranjang
  const handleAddToCart = (product) => {
    setCartItems(prevItems => {
      const itemInCart = prevItems.find(item => item.id === product.id);
      if (itemInCart) {
        // Jika produk sudah ada di keranjang, tambah jumlahnya
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Jika produk belum ada, tambahkan ke keranjang dengan jumlah 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Fungsi untuk mengubah jumlah item di keranjang (tambah/kurang)
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      // Jika jumlah menjadi 0 atau kurang, hapus item dari keranjang
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Fungsi untuk menyimpan produk baru dari modal
  const handleSaveProduct = (newProductData) => {
    const newProduct = {
      ...newProductData,
      id: Date.now(), // Gunakan timestamp sebagai ID unik untuk sementara
    };
    // Tambahkan produk baru ke daftar produk yang sudah ada
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  };

  // Menghitung total item untuk notifikasi di tombol keranjang
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Kolom Kiri: Daftar Produk */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Daftar Produk</h2>
            <button 
              onClick={() => setIsAddProductModalOpen(true)} 
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors active:bg-blue-800"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Tambah Produk</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        </div>

        {/* Kolom Kanan (Hanya Tampil di Desktop) */}
        <div className="hidden md:block md:col-span-1">
          <Cart 
            items={cartItems} 
            onUpdateQuantity={handleUpdateQuantity} 
          />
        </div>
      </div>

      {/* Tombol Keranjang Melayang (Hanya Tampil di Mobile) */}
      <div className="md:hidden fixed bottom-20 right-4 z-20">
         <button 
           onClick={() => setIsCartOpen(true)} 
           className="bg-blue-600 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform"
         >
           <ShoppingCartIcon className="h-7 w-7" />
           {totalItems > 0 && ( 
             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"> 
               {totalItems} 
             </span> 
           )}
         </button>
      </div>

      {/* Overlay Keranjang (Hanya Tampil di Mobile saat isCartOpen true) */}
      {isCartOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end" 
          onClick={() => setIsCartOpen(false)}
        >
          <div 
            className="bg-gray-50 w-full rounded-t-2xl p-1 h-[85%] animate-slide-up" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-white rounded-t-2xl h-full">
              <Cart 
                items={cartItems} 
                onUpdateQuantity={handleUpdateQuantity} 
                onClose={() => setIsCartOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Render Modal Tambah Produk */}
      <AddProductModal 
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </>
  );
};


// =====================================================================
// KOMPONEN HALAMAN LAINNYA (SEBAGAI PLACEHOLDER)
// =====================================================================
export const HomePage = () => <div className="p-4 text-center text-gray-700">Selamat Datang di Halaman Beranda!</div>;
export const ReportPage = () => <div className="p-4 text-center text-gray-700">Halaman Laporan akan kita bangun di sini.</div>;
export const ManagementPage = () => <div className="p-4 text-center text-gray-700">Halaman Manajemen akan kita bangun di sini.</div>;
export const SettingsPage = () => <div className="p-4 text-center text-gray-700">Halaman Pengaturan akan kita bangun di sini.</div>;