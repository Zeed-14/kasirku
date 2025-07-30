import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';

// Impor dari folder-folder yang sudah dirapikan
import { ProductCard } from '../components/cashier/ProductCard';
import { Cart } from '../components/cashier/Cart';
import { AddProductModal } from '../components/management/AddProductModal';
import { PaymentModal } from '../components/cashier/PaymentModal';
import { BarcodeScannerModal } from '../components/cashier/BarcodeScannerModal';
import { DiscountModal } from '../components/cashier/DiscountModal';
import { ReturnModal } from '../components/cashier/ReturnModal';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { ShoppingCartIcon, SearchIcon, BarcodeIcon, FilterIcon, ReturnIcon } from '../components/icons';
import { supabase } from '../lib/supabaseClient';

const PRODUCTS_PER_PAGE = 12;

export const CashierPage = () => {
  // State untuk data
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  
  // State untuk fungsionalitas UI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  
  // State untuk mengontrol semua modal
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  
  // State untuk membawa data antar komponen/modal
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [lastTransaction, setLastTransaction] = useState(null);
  const [discount, setDiscount] = useState(null);

  // Mengambil daftar kategori yang sudah terurut
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('position', { ascending: true });
      if (!error) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  // Mengambil data produk dengan filter dan paginasi
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;
    let query = supabase.from('products').select('*, categories(name)', { count: 'exact' });
    if (selectedCategory !== 'Semua') { query = query.eq('categories.name', selectedCategory); }
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

  const handleAddToCart = (product) => {
    const itemInCart = cartItems.find(i => i.id === product.id);
    const currentQtyInCart = itemInCart ? itemInCart.quantity : 0;
    if (currentQtyInCart >= product.stock) {
      toast.error(`Stok ${product.name} tidak mencukupi!`);
      return;
    }
    setCartItems(prev => {
      const itemInCart = prev.find(i => i.id === product.id);
      if (itemInCart) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    toast.success(`"${product.name}" ditambahkan.`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId) || cartItems.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast.error(`Stok ${product.name} hanya tersisa ${product.stock}!`);
      return;
    }
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== productId));
    } else {
      setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: newQuantity } : i));
    }
  };

  const handleConfirmPayment = async (amountPaid) => {
    const toastId = toast.loading('Memproses transaksi...');
    const transactionPayload = { subtotal, items: cartItems, discount_type: discount?.type, discount_value: discount?.value, discount_amount: discountAmount, final_price: finalPrice };
    const { data: newTransaction, error } = await supabase.from('transactions').insert(transactionPayload).select().single();
    if (error) {
      toast.error('Gagal menyimpan transaksi!', { id: toastId });
      return;
    }
    const itemsToDecrement = cartItems.map(item => ({ product_id: item.id, quantity: item.quantity }));
    const { error: stockError } = await supabase.rpc('decrement_stock', { items_in_cart: itemsToDecrement });
    if (stockError) {
      toast.error('Transaksi berhasil, tapi GAGAL update stok!', { duration: 5000 });
    } else {
      toast.success('Transaksi berhasil & stok diperbarui!', { id: toastId });
    }
    setLastTransaction({ ...newTransaction, amountPaid: parseFloat(amountPaid), change: parseFloat(amountPaid) - finalPrice });
    setIsReceiptModalOpen(true);
    fetchProducts();
  };
  
  const handleProcessReturn = async (returnData) => {
    const toastId = toast.loading('Memproses retur...');
    const { error: returnError } = await supabase.from('returns').insert([returnData]);
    if (returnError) {
      toast.error(`Gagal menyimpan retur: ${returnError.message}`, { id: toastId });
      return;
    }
    const itemsToIncrement = returnData.returned_items.map(item => ({ product_id: item.product_id, quantity: item.quantity }));
    const { error: stockError } = await supabase.rpc('increment_stock', { items_to_return: itemsToIncrement });
    if (stockError) {
      toast.error('Retur tercatat, tapi GAGAL update stok!', { duration: 5000, id: toastId });
    } else {
      toast.success('Retur berhasil diproses & stok diperbarui!', { id: toastId });
    }
    fetchProducts();
  };

  const handleApplyDiscount = (discountData) => { setDiscount(discountData); toast.success('Diskon berhasil diterapkan!'); };
  const handleCloseReceipt = () => { setIsReceiptModalOpen(false); setLastTransaction(null); setCartItems([]); setDiscount(null); };
  const handleScanSuccess = async (scannedBarcode) => { setIsScannerOpen(false); const { data: existingProduct, error } = await supabase.from('products').select('*, categories(name)').eq('barcode', scannedBarcode).single(); if (error && error.code !== 'PGRST116') { toast.error("Gagal mencari barcode."); return; } if (existingProduct) { handleAddToCart(existingProduct); } else { setNewProductBarcode(scannedBarcode); setIsAddProductModalOpen(true); toast('Barcode tidak ditemukan.'); } };
  const handleSaveProduct = async (productData, imageFile) => { const toastId = toast.loading('Menyimpan produk...'); try { let imageUrl = null; if (imageFile) { const fileName = `${Date.now()}_${imageFile.name}`; const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile); if (uploadError) throw uploadError; const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName); imageUrl = urlData.publicUrl; } const finalProductData = { name: productData.name, price: parseFloat(productData.price), category_id: productData.category_id, barcode: productData.barcode, image_url: imageUrl, stock: productData.stock, is_consignment: productData.is_consignment, cost_price: productData.cost_price, supplier_id: productData.supplier_id }; const { error: insertError } = await supabase.from('products').insert([finalProductData]); if (insertError) throw insertError; toast.success('Produk baru berhasil disimpan!', { id: toastId }); fetchProducts(); } catch (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } };
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
          <div>
            <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span><input type="text" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm"/></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsReturnModalOpen(true)} className="flex-grow flex items-center justify-center gap-2 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-yellow-600"><ReturnIcon className="h-5 w-5" /><span>Retur</span></button>
                  <button onClick={() => setIsScannerOpen(true)} className="flex-grow flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-green-700"><BarcodeIcon className="h-5 w-5" /><span>Scan</span></button>
                </div>
              </div>
              <div className="border-t my-3"></div>
              <div className="flex items-center gap-3"><FilterIcon className="h-5 w-5 text-gray-500" /><span className="text-sm font-semibold text-gray-600">Filter Stok:</span>{['Semua', 'Menipis', 'Habis'].map(filter => (<button key={filter} onClick={() => setStockFilter(filter)} className={`px-3 py-1 text-sm rounded-full ${stockFilter === filter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{filter}</button>))}</div>
            </div>
            <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
              <button onClick={() => setSelectedCategory('Semua')} className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${selectedCategory === 'Semua' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>Semua</button>
              {categories.map(category => (<button key={category.id} onClick={() => setSelectedCategory(category.name)} className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${selectedCategory === category.name ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{category.name}</button>))}
            </div>
          </div>
          <div className="flex-grow overflow-y-auto pb-4">
            {isLoading ? <div className="text-center text-gray-500 py-10">Memuat produk...</div> : 
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.length > 0 ? products.map(p => (<ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)) : <div className="col-span-full text-center text-gray-500 py-10"><p>Produk tidak ditemukan.</p></div>}
              </div>
            }
            {totalPages > 1 && (<div className="flex justify-center items-center mt-6 gap-4"><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50">Sebelumnya</button><span className="font-semibold">{currentPage} / {totalPages}</span><button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50">Berikutnya</button></div>)}
          </div>
        </div>
        <div id="desktop-cart-target" className="hidden md:block md:col-span-1"><Cart items={cartItems} onUpdateQuantity={handleUpdateQuantity} onPay={() => setIsPaymentModalOpen(true)} subtotal={subtotal} discountAmount={discountAmount} finalPrice={finalPrice} onAddDiscount={() => setIsDiscountModalOpen(true)} onRemoveDiscount={() => setDiscount(null)} discount={discount} /></div>
      </div>
      <div id="mobile-cart-target" className="md:hidden fixed bottom-20 right-4 z-20"><button onClick={() => setIsCartOpen(true)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform"><ShoppingCartIcon className="h-7 w-7" />{totalItems > 0 && ( <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"> {totalItems} </span> )}</button></div>
      {isCartOpen && (<div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end" onClick={() => setIsCartOpen(false)}><div className="bg-gray-50 w-full rounded-t-2xl p-1 h-[85%] animate-slide-up" onClick={e => e.stopPropagation()}><div className="p-4 bg-white rounded-t-2xl h-full"><Cart items={cartItems} onUpdateQuantity={handleUpdateQuantity} onClose={() => setIsCartOpen(false)} onPay={() => { setIsCartOpen(false); setIsPaymentModalOpen(true); }} subtotal={subtotal} discountAmount={discountAmount} finalPrice={finalPrice} onAddDiscount={() => { setIsCartOpen(false); setIsDiscountModalOpen(true); }} onRemoveDiscount={() => setDiscount(null)} discount={discount} /></div></div></div>)}
      
      <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onSave={handleSaveProduct} initialBarcode={newProductBarcode} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} totalPrice={finalPrice} onConfirmPayment={handleConfirmPayment} />
      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />
      <ReceiptModal isOpen={isReceiptModalOpen} onClose={handleCloseReceipt} transactionDetails={lastTransaction} />
      <DiscountModal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} onApplyDiscount={handleApplyDiscount} />
      <ReturnModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} onReturnSuccess={handleProcessReturn} />
    </>
  );
};
