import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { AddProductModal } from '../components/AddProductModal';
import { EditProductModal } from '../components/EditProductModal';
import { PaymentModal } from '../components/PaymentModal';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { DiscountModal } from '../components/DiscountModal';
import { ShoppingCartIcon, PlusIcon, SearchIcon, BarcodeIcon } from '../components/icons';
import { supabase } from '../supabaseClient';

// =====================================================================
// KOMPONEN HALAMAN KASIR
// =====================================================================
export const CashierPage = () => {
  // State untuk data
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk fungsionalitas UI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  // State untuk mengontrol semua modal
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  
  // State untuk membawa data antar komponen/modal
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [lastTransaction, setLastTransaction] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [discount, setDiscount] = useState(null);

  // Mengambil data produk dari Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        toast.error('Gagal memuat produk.');
      } else {
        setProducts(data);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  // Kalkulasi harga dengan diskon
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const discountAmount = useMemo(() => {
    if (!discount) return 0;
    if (discount.type === 'persen') {
      return (subtotal * discount.value) / 100;
    }
    return Math.min(discount.value, subtotal);
  }, [discount, subtotal]);
  const finalPrice = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  // Fungsi untuk menerapkan diskon
  const handleApplyDiscount = (discountData) => {
    setDiscount(discountData);
    toast.success('Diskon berhasil diterapkan!');
  };

  // Fungsi untuk menyelesaikan pembayaran
  const handleConfirmPayment = async (amountPaid) => {
    if (cartItems.length === 0) return;
    const toastId = toast.loading('Memproses transaksi...');
    const transactionPayload = {
      subtotal: subtotal,
      items: cartItems.map(item => ({ product_id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      discount_type: discount?.type,
      discount_value: discount?.value,
      discount_amount: discountAmount,
      final_price: finalPrice,
    };
    const { data: newTransaction, error } = await supabase.from('transactions').insert(transactionPayload).select().single();
    if (error) {
      toast.error('Gagal menyimpan transaksi!', { id: toastId });
      console.error("Gagal menyimpan transaksi:", error);
    } else {
      setLastTransaction({ ...newTransaction, amountPaid: parseFloat(amountPaid), change: parseFloat(amountPaid) - finalPrice });
      setIsReceiptModalOpen(true);
      toast.success('Transaksi berhasil!', { id: toastId });
    }
  };

  // Fungsi untuk menutup struk dan mereset
  const handleCloseReceipt = () => {
    setIsReceiptModalOpen(false);
    setLastTransaction(null);
    setCartItems([]);
    setDiscount(null);
  };

  // Fungsi manajemen produk (Edit, Hapus)
  const handleShowEditModal = (product) => { setProductToEdit(product); setIsEditModalOpen(true); };
  const handleUpdateProduct = async (updatedProduct) => { const toastId = toast.loading('Memperbarui produk...'); const { data, error } = await supabase.from('products').update({ name: updatedProduct.name, price: updatedProduct.price, category: updatedProduct.category, barcode: updatedProduct.barcode, }).eq('id', updatedProduct.id).select().single(); if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } else { setProducts(prev => prev.map(p => (p.id === data.id ? data : p))); toast.success('Produk berhasil diperbarui!', { id: toastId }); } };
  const handleDeleteProduct = async (productId) => { if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) { const toastId = toast.loading('Menghapus produk...'); const { error } = await supabase.from('products').delete().eq('id', productId); if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } else { setProducts(prev => prev.filter(p => p.id !== productId)); toast.success('Produk berhasil dihapus!', { id: toastId }); } } };
  
  // Fungsi-fungsi lain (Add to Cart, Save Product, Scan, Update Quantity)
  const handleAddToCart = (product) => { setCartItems(prev => { const itemInCart = prev.find(i => i.id === product.id); if (itemInCart) { return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i); } else { return [...prev, { ...product, quantity: 1 }]; } }); const cartIconDesktop = document.getElementById('desktop-cart-target'); const cartIconMobile = document.getElementById('mobile-cart-target'); [cartIconDesktop, cartIconMobile].forEach(icon => { if (icon) { icon.classList.remove('animate-shake'); void icon.offsetWidth; icon.classList.add('animate-shake'); } }); toast.success( (t) => ( <div className="flex items-center"> <img className="h-10 w-10 rounded-full object-cover mr-3" src={product.image_url || `https://placehold.co/40x40/E2E8F0/4A5568?text=${product.name.charAt(0)}`} alt={product.name} /> <span className="text-white">{`"${product.name}" ditambahkan`}</span> </div> ), { icon: '🛒', position: 'top-center', style: { background: '#2563EB', color: '#fff', }, } ); };
  const handleSaveProduct = async (productData, imageFile) => { const toastId = toast.loading('Menyimpan produk...'); try { let imageUrl = null; if (imageFile) { const fileName = `${Date.now()}_${imageFile.name}`; const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile); if (uploadError) throw uploadError; const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName); imageUrl = urlData.publicUrl; } const finalProductData = { name: productData.name, price: parseFloat(productData.price), category: productData.category, barcode: productData.barcode, image_url: imageUrl }; const { data, error: insertError } = await supabase.from('products').insert([finalProductData]).select(); if (insertError) throw insertError; if (data) { setProducts(prev => [data[0], ...prev]); setNewProductBarcode(''); toast.success('Produk berhasil disimpan!', { id: toastId }); } } catch (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } };
  const handleScanSuccess = async (scannedBarcode) => { setIsScannerOpen(false); const { data: existingProduct, error } = await supabase.from('products').select('*').eq('barcode', scannedBarcode).single(); if (error && error.code !== 'PGRST116') { toast.error("Gagal mencari barcode."); return; } if (existingProduct) { handleAddToCart(existingProduct); } else { setNewProductBarcode(scannedBarcode); setIsAddProductModalOpen(true); toast('Barcode tidak ditemukan, silakan tambah produk baru.'); } };
  const handleUpdateQuantity = (productId, newQuantity) => { if (newQuantity <= 0) { setCartItems(prev => prev.filter(i => i.id !== productId)); } else { setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: newQuantity } : i)); } };
  
  // Kalkulasi turunan lain
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const categories = useMemo(() => ['Semua', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const filteredProducts = products.filter(p => selectedCategory === 'Semua' || p.category === selectedCategory).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
          <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(category => (<button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{category}</button>))}
          </div>
          <div className="flex justify-end mb-4 gap-3">
            <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-green-700 active:bg-green-800"><BarcodeIcon className="h-5 w-5" /><span>Scan</span></button>
            <button onClick={() => { setNewProductBarcode(''); setIsAddProductModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 active:bg-blue-800"><PlusIcon className="h-5 w-5" /><span>Tambah</span></button>
          </div>
          {isLoading ? <div className="text-center text-gray-500 py-10">Memuat produk...</div> : 
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.length > 0 ? filteredProducts.map(p => (<ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} onEdit={handleShowEditModal} onDelete={handleDeleteProduct}/>)) : <div className="col-span-full text-center text-gray-500 py-10"><p>Produk tidak ditemukan.</p></div>}
            </div>
          }
        </div>
        <div id="desktop-cart-target" className="hidden md:block md:col-span-1">
          <Cart items={cartItems} onUpdateQuantity={handleUpdateQuantity} onPay={() => setIsPaymentModalOpen(true)} subtotal={subtotal} discountAmount={discountAmount} finalPrice={finalPrice} onAddDiscount={() => setIsDiscountModalOpen(true)} onRemoveDiscount={() => setDiscount(null)} discount={discount} />
        </div>
      </div>
      <div id="mobile-cart-target" className="md:hidden fixed bottom-20 right-4 z-20">
        <button onClick={() => setIsCartOpen(true)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform"><ShoppingCartIcon className="h-7 w-7" />{totalItems > 0 && ( <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"> {totalItems} </span> )}</button>
      </div>
      {isCartOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end" onClick={() => setIsCartOpen(false)}>
          <div className="bg-gray-50 w-full rounded-t-2xl p-1 h-[85%] animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-white rounded-t-2xl h-full">
              <Cart items={cartItems} onUpdateQuantity={handleUpdateQuantity} onClose={() => setIsCartOpen(false)} onPay={() => { setIsCartOpen(false); setIsPaymentModalOpen(true); }} subtotal={subtotal} discountAmount={discountAmount} finalPrice={finalPrice} onAddDiscount={() => { setIsCartOpen(false); setIsDiscountModalOpen(true); }} onRemoveDiscount={() => setDiscount(null)} discount={discount} />
            </div>
          </div>
        </div>
      )}
      <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onSave={handleSaveProduct} initialBarcode={newProductBarcode} />
      <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateProduct} product={productToEdit} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} totalPrice={finalPrice} onConfirmPayment={handleConfirmPayment} />
      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />
      <ReceiptModal isOpen={isReceiptModalOpen} onClose={handleCloseReceipt} transactionDetails={lastTransaction} />
      <DiscountModal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} onApplyDiscount={handleApplyDiscount} />
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
