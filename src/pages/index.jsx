import React, { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { AddProductModal } from '../components/AddProductModal';
import { PaymentModal } from '../components/PaymentModal';
import { ShoppingCartIcon, PlusIcon, SearchIcon } from '../components/icons';
import { supabase } from '../supabaseClient';

export const CashierPage = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua'); // State baru untuk kategori

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) console.error('Error fetching products:', error);
      else setProducts(data);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const handleSaveProduct = async (newProductData) => {
    try {
      const { data, error } = await supabase.from('products').insert([newProductData]).select();
      if (error) throw error;
      if (data) setProducts(prev => [data[0], ...prev]);
    } catch (error) { console.error("Gagal menyimpan produk: ", error); }
  };

  const handleConfirmPayment = async () => {
    if (cartItems.length === 0) return;
    const transactionData = { total_price: totalPrice, items: cartItems.map(item => ({ product_id: item.id, name: item.name, price: item.price, quantity: item.quantity })) };
    const { error } = await supabase.from('transactions').insert([transactionData]);
    if (error) { alert('Gagal menyimpan transaksi!'); } else { alert('Transaksi berhasil!'); setCartItems([]); }
  };

  const handleAddToCart = (product) => { setCartItems(prev => { const itemInCart = prev.find(i => i.id === product.id); if (itemInCart) { return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i); } else { return [...prev, { ...product, quantity: 1 }]; } }); };
  const handleUpdateQuantity = (productId, newQuantity) => { if (newQuantity <= 0) { setCartItems(prev => prev.filter(i => i.id !== productId)); } else { setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: newQuantity } : i)); } };
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Ambil daftar kategori unik dari produk
  const categories = useMemo(() => ['Semua', ...new Set(products.map(p => p.category))], [products]);

  // Logika filter yang diperbarui
  const filteredProducts = products
    .filter(p => selectedCategory === 'Semua' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <div className="md:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-800 self-start sm:self-center">Daftar Produk</h2>
            <div className="relative w-full sm:w-auto">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span>
              <input type="text" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          {/* --- BAGIAN FILTER KATEGORI --- */}
          <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex justify-end mb-4">
            <button onClick={() => setIsAddProductModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 active:bg-blue-800"><PlusIcon className="h-5 w-5" /><span>Tambah Produk</span></button>
          </div>
          
          {isLoading ? <div className="text-center text-gray-500 py-10">Memuat produk...</div> : 
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.length > 0 ? filteredProducts.map(p => (<ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)) : <div className="col-span-full text-center text-gray-500 py-10"><p>Produk tidak ditemukan.</p></div>}
            </div>
          }
        </div>
        <div className="hidden md:block md:col-span-1">
          <Cart items={cartItems} onUpdateQuantity={handleUpdateQuantity} onPay={() => setIsPaymentModalOpen(true)} />
        </div>
      </div>
      
      {/* Modal dan Overlay lainnya */}
      <div className="md:hidden fixed bottom-20 right-4 z-20">
         <button onClick={() => setIsCartOpen(true)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform"><ShoppingCartIcon className="h-7 w-7" />{totalItems > 0 && ( <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"> {totalItems} </span> )}</button>
      </div>
      {isCartOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end" onClick={() => setIsCartOpen(false)}>
          <div className="bg-gray-50 w-full rounded-t-2xl p-1 h-[85%] animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-white rounded-t-2xl h-full">
              <Cart items={cartItems} onUpdateQuantity={handleUpdateQuantity} onClose={() => setIsCartOpen(false)} onPay={() => { setIsCartOpen(false); setIsPaymentModalOpen(true); }} />
            </div>
          </div>
        </div>
      )}
      <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onSave={handleSaveProduct} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} totalPrice={totalPrice} onConfirmPayment={handleConfirmPayment} />
    </>
  );
};

// Halaman lain tetap sama
export const HomePage = () => <div className="p-4 text-center text-gray-700">Selamat Datang di Halaman Beranda!</div>;
export const ReportPage = () => <div className="p-4 text-center text-gray-700">Halaman Laporan akan kita bangun di sini.</div>;
export const ManagementPage = () => <div className="p-4 text-center text-gray-700">Halaman Manajemen akan kita bangun di sini.</div>;
export const SettingsPage = () => <div className="p-4 text-center text-gray-700">Halaman Pengaturan akan kita bangun di sini.</div>;
