import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { AddProductModal } from '../components/AddProductModal';
import { EditProductModal } from '../components/EditProductModal';
import { PaymentModal } from '../components/PaymentModal';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { DiscountModal } from '../components/DiscountModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { ShoppingCartIcon, PlusIcon, SearchIcon, BarcodeIcon, FilterIcon } from '../components/icons';
import { supabase } from '../supabaseClient';

const PRODUCTS_PER_PAGE = 12;

export const CashierPage = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [lastTransaction, setLastTransaction] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;
    let query = supabase.from('products').select('*', { count: 'exact' });
    if (selectedCategory !== 'Semua') { query = query.eq('category', selectedCategory); }
    if (stockFilter === 'Menipis') { query = query.lte('stock', 5).gt('stock', 0); } 
    else if (stockFilter === 'Habis') { query = query.eq('stock', 0); }
    if (searchQuery) { query = query.ilike('name', `%${searchQuery}%`); }
    query = query.order('created_at', { ascending: false }).range(from, to);
    const { data, error, count } = await query;
    if (error) { toast.error('Gagal memuat produk.'); } else { setProducts(data); setTotalProducts(count); }
    setIsLoading(false);
  }, [currentPage, selectedCategory, stockFilter, searchQuery]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setCurrentPage(1); }, [selectedCategory, stockFilter, searchQuery]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const discountAmount = useMemo(() => { if (!discount) return 0; if (discount.type === 'persen') { return (subtotal * discount.value) / 100; } return Math.min(discount.value, subtotal); }, [discount, subtotal]);
  const finalPrice = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);
  const handleAddToCart = (product) => { const itemInCart = cartItems.find(i => i.id === product.id); const currentQtyInCart = itemInCart ? itemInCart.quantity : 0; if (currentQtyInCart >= product.stock) { toast.error(`Stok ${product.name} tidak mencukupi!`); return; } setCartItems(prev => { const itemInCart = prev.find(i => i.id === product.id); if (itemInCart) { return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i); } else { return [...prev, { ...product, quantity: 1 }]; } }); toast.success(`"${product.name}" ditambahkan.`); };
  const handleUpdateQuantity = (productId, newQuantity) => { const product = products.find(p => p.id === productId) || cartItems.find(p => p.id === productId); if (product && newQuantity > product.stock) { toast.error(`Stok ${product.name} hanya tersisa ${product.stock}!`); return; } if (newQuantity <= 0) { setCartItems(prev => prev.filter(i => i.id !== productId)); } else { setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: newQuantity } : i)); } };
  const handleConfirmPayment = async (amountPaid) => { const toastId = toast.loading('Memproses transaksi...'); const transactionPayload = { subtotal, items: cartItems, discount_type: discount?.type, discount_value: discount?.value, discount_amount: discountAmount, final_price: finalPrice }; const { data: newTransaction, error } = await supabase.from('transactions').insert(transactionPayload).select().single(); if (error) { toast.error('Gagal menyimpan transaksi!', { id: toastId }); return; } const itemsToDecrement = cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })); const { error: stockError } = await supabase.rpc('decrement_stock', { items_in_cart: itemsToDecrement }); if (stockError) { toast.error('Transaksi berhasil, tapi GAGAL update stok!', { duration: 5000 }); } else { toast.success('Transaksi berhasil & stok diperbarui!', { id: toastId }); } setLastTransaction({ ...newTransaction, amountPaid: parseFloat(amountPaid), change: parseFloat(amountPaid) - finalPrice }); setIsReceiptModalOpen(true); fetchProducts(); };
  const handleApplyDiscount = (discountData) => { setDiscount(discountData); toast.success('Diskon berhasil diterapkan!'); };
  const handleCloseReceipt = () => { setIsReceiptModalOpen(false); setLastTransaction(null); setCartItems([]); setDiscount(null); };
  const handleShowEditModal = (product) => { setProductToEdit(product); setIsEditModalOpen(true); };
  const handleUpdateProduct = async (updatedProduct) => { const toastId = toast.loading('Memperbarui produk...'); const { data, error } = await supabase.from('products').update({ name: updatedProduct.name, price: updatedProduct.price, category: updatedProduct.category, barcode: updatedProduct.barcode, stock: updatedProduct.stock }).eq('id', updatedProduct.id).select().single(); if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } else { setProducts(prev => prev.map(p => (p.id === data.id ? data : p))); toast.success('Produk berhasil diperbarui!', { id: toastId }); } };
  const handleDeleteProduct = (productId) => { setProductToDeleteId(productId); setIsConfirmModalOpen(true); };
  const confirmDelete = async () => { const toastId = toast.loading('Menghapus produk...'); const { error } = await supabase.from('products').delete().eq('id', productToDeleteId); if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } else { setProducts(prev => prev.filter(p => p.id !== productToDeleteId)); toast.success('Produk berhasil dihapus!', { id: toastId }); } setIsConfirmModalOpen(false); setProductToDeleteId(null); };
  const handleSaveProduct = async (productData, imageFile) => { const toastId = toast.loading('Menyimpan produk...'); try { let imageUrl = null; if (imageFile) { const fileName = `${Date.now()}_${imageFile.name}`; const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile); if (uploadError) throw uploadError; const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName); imageUrl = urlData.publicUrl; } const finalProductData = { name: productData.name, price: parseFloat(productData.price), category: productData.category, barcode: productData.barcode, image_url: imageUrl, stock: productData.stock }; const { data, error: insertError } = await supabase.from('products').insert([finalProductData]).select(); if (insertError) throw insertError; if (data) { setProducts(prev => [data[0], ...prev]); setNewProductBarcode(''); toast.success('Produk berhasil disimpan!', { id: toastId }); } } catch (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } };
  const handleScanSuccess = async (scannedBarcode) => { setIsScannerOpen(false); const { data: existingProduct, error } = await supabase.from('products').select('*').eq('barcode', scannedBarcode).single(); if (error && error.code !== 'PGRST116') { toast.error("Gagal mencari barcode."); return; } if (existingProduct) { handleAddToCart(existingProduct); } else { setNewProductBarcode(scannedBarcode); setIsAddProductModalOpen(true); toast('Barcode tidak ditemukan.'); } };
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const categories = useMemo(() => ['Semua', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  return (
    <>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
          <div><div className="bg-white p-3 rounded-lg shadow-sm mb-4"><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-grow"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span><input type="text" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm"/></div><div className="flex items-center gap-2"><button onClick={() => setIsScannerOpen(true)} className="flex-grow flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-green-700"><BarcodeIcon className="h-5 w-5" /><span>Scan</span></button><button onClick={() => { setNewProductBarcode(''); setIsAddProductModalOpen(true); }} className="flex-grow flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700"><PlusIcon className="h-5 w-5" /><span>Tambah</span></button></div></div><div className="border-t my-3"></div><div className="flex items-center gap-3"><FilterIcon className="h-5 w-5 text-gray-500" /><span className="text-sm font-semibold text-gray-600">Filter Stok:</span>{['Semua', 'Menipis', 'Habis'].map(filter => (<button key={filter} onClick={() => setStockFilter(filter)} className={`px-3 py-1 text-sm rounded-full ${stockFilter === filter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{filter}</button>))}</div></div><div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">{categories.map(category => (<button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{category}</button>))}</div></div>
          <div className="flex-grow overflow-y-auto pb-4">{isLoading ? <div className="text-center text-gray-500 py-10">Memuat produk...</div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{products.length > 0 ? products.map(p => (<ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} onEdit={handleShowEditModal} onDelete={handleDeleteProduct}/>)) : <div className="col-span-full text-center text-gray-500 py-10"><p>Produk tidak ditemukan.</p></div>}</div>}{totalPages > 1 && (<div className="flex justify-center items-center mt-6 gap-4"><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50">Sebelumnya</button><span className="font-semibold">{currentPage} / {totalPages}</span><button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50">Berikutnya</button></div>)}</div>
        </div>
        <div id="desktop-cart-target" className="hidden md:block md:col-span-1"><Cart items={cartItems} onUpdateQuantity={handleUpdateQuantity} onPay={() => setIsPaymentModalOpen(true)} subtotal={subtotal} discountAmount={discountAmount} finalPrice={finalPrice} onAddDiscount={() => setIsDiscountModalOpen(true)} onRemoveDiscount={() => setDiscount(null)} discount={discount} /></div>
      </div>
      <div id="mobile-cart-target" className="md:hidden fixed bottom-20 right-4 z-20"><button onClick={() => setIsCartOpen(true)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform"><ShoppingCartIcon className="h-7 w-7" />{totalItems > 0 && ( <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"> {totalItems} </span> )}</button></div>
      {isCartOpen && (<div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end" onClick={() => setIsCartOpen(false)}><div className="bg-gray-50 w-full rounded-t-2xl p-1 h-[85%] animate-slide-up" onClick={e => e.stopPropagation()}><div className="p-4 bg-white rounded-t-2xl h-full"><Cart items={cartItems} onUpdateQuantity={handleUpdateQuantity} onClose={() => setIsCartOpen(false)} onPay={() => { setIsCartOpen(false); setIsPaymentModalOpen(true); }} subtotal={subtotal} discountAmount={discountAmount} finalPrice={finalPrice} onAddDiscount={() => { setIsCartOpen(false); setIsDiscountModalOpen(true); }} onRemoveDiscount={() => setDiscount(null)} discount={discount} /></div></div></div>)}
      <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onSave={handleSaveProduct} initialBarcode={newProductBarcode} />
      <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateProduct} product={productToEdit} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} totalPrice={finalPrice} onConfirmPayment={handleConfirmPayment} />
      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />
      <ReceiptModal isOpen={isReceiptModalOpen} onClose={handleCloseReceipt} transactionDetails={lastTransaction} />
      <DiscountModal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} onApplyDiscount={handleApplyDiscount} />
      <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title="Hapus Produk" message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan." />
    </>
  );
};