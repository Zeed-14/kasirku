import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

import { ConfirmModal } from '../components/common/ConfirmModal';
import { AddProductModal } from '../components/cashier/AddProductModal';
import { EditProductModal } from '../components/cashier/EditProductModal';
import { PackageIcon, TruckIcon, CategoryIcon, PlusIcon, PencilIcon, TrashIcon, SearchIcon } from '../components/icons';

const PRODUCTS_PER_PAGE = 10;

// Komponen Internal untuk Tabel Manajemen Produk
const ProductManagementTable = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDeleteId, setProductToDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;
    const [sortColumn, sortDirection] = sortBy.split('-');
    const isAscending = sortDirection === 'asc';
    let query = supabase.from('products').select('*, categories(name)', { count: 'exact' });
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }
    query = query.order(sortColumn, { ascending: isAscending }).range(from, to);
    const { data, error, count } = await query;
    if (error) {
      toast.error('Gagal memuat produk.');
    } else {
      setProducts(data);
      setTotalProducts(count);
    }
    setIsLoading(false);
  }, [searchQuery, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const handleSaveProduct = async (productData, imageFile) => { const toastId = toast.loading('Menyimpan produk...'); try { let imageUrl = null; if (imageFile) { const fileName = `${Date.now()}_${imageFile.name}`; const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile); if (uploadError) throw uploadError; const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName); imageUrl = urlData.publicUrl; } const { data: categoryData } = await supabase.from('categories').select('id').eq('name', productData.category).single(); if (!categoryData) throw new Error("Kategori tidak ditemukan."); const finalProductData = { name: productData.name, price: parseFloat(productData.price), category_id: categoryData.id, barcode: productData.barcode, image_url: imageUrl, stock: productData.stock }; const { error: insertError } = await supabase.from('products').insert([finalProductData]); if (insertError) throw insertError; toast.success('Produk berhasil disimpan!', { id: toastId }); fetchProducts(); } catch (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } };
  const handleUpdateProduct = async (updatedProduct) => { const toastId = toast.loading('Memperbarui produk...'); try { const { data: categoryData } = await supabase.from('categories').select('id').eq('name', updatedProduct.category).single(); if (!categoryData) throw new Error("Kategori tidak ditemukan."); const { error } = await supabase.from('products').update({ name: updatedProduct.name, price: updatedProduct.price, category_id: categoryData.id, barcode: updatedProduct.barcode, stock: updatedProduct.stock }).eq('id', updatedProduct.id); if (error) throw error; toast.success('Produk berhasil diperbarui!', { id: toastId }); fetchProducts(); } catch (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } };
  const handleDeleteProduct = (productId) => { setProductToDeleteId(productId); setIsConfirmModalOpen(true); };
  const confirmDelete = async () => { const toastId = toast.loading('Menghapus produk...'); const { error } = await supabase.from('products').delete().eq('id', productToDeleteId); if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } else { toast.success('Produk berhasil dihapus!', { id: toastId }); fetchProducts(); } setIsConfirmModalOpen(false); setProductToDeleteId(null); };
  const handleShowEditModal = (product) => { setProductToEdit(product); setIsEditModalOpen(true); };
  const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="relative flex-grow w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span>
          <input type="text" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm"/>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg shadow-sm">
            <option value="created_at-desc">Terbaru</option>
            <option value="name-asc">Nama (A-Z)</option>
            <option value="name-desc">Nama (Z-A)</option>
            <option value="price-desc">Harga (Termahal)</option>
            <option value="price-asc">Harga (Termurah)</option>
            <option value="stock-desc">Stok (Terbanyak)</option>
            <option value="stock-asc">Stok (Tersedikit)</option>
          </select>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700">
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 min-w-[600px]">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3">Nama Produk</th>
                <th scope="col" className="px-6 py-3">Kategori</th>
                <th scope="col" className="px-6 py-3">Harga</th>
                <th scope="col" className="px-6 py-3 text-center">Stok</th>
                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-10">Memuat data produk...</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</th>
                    <td className="px-6 py-4">{product.categories?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-center">{product.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleShowEditModal(product)} className="text-blue-600 hover:text-blue-800" aria-label="Edit"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800" aria-label="Hapus"><TrashIcon className="h-5 w-5"/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t mt-4">
        <span className="text-sm text-gray-700">
          Menampilkan <span className="font-semibold">{Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, totalProducts)}</span> - <span className="font-semibold">{Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)}</span> dari <span className="font-semibold">{totalProducts}</span> produk
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50">Sebelumnya</button>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50">Berikutnya</button>
          </div>
        )}
      </div>
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveProduct} />
      <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateProduct} product={productToEdit} />
      <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title="Hapus Produk" message="Apakah Anda yakin ingin menghapus produk ini?" />
    </div>
  );
};

export const ManagementPage = () => {
  const [activeTab, setActiveTab] = useState('produk');
  const tabs = [
    { id: 'produk', name: 'Produk', icon: <PackageIcon className="h-5 w-5 mr-2" /> },
    { id: 'suplier', name: 'Suplier', icon: <TruckIcon className="h-5 w-5 mr-2" /> },
    { id: 'kategori', name: 'Kategori', icon: <CategoryIcon className="h-5 w-5 mr-2" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'produk': return <ProductManagementTable />;
      case 'suplier': return <div className="text-center p-10 bg-white rounded-lg shadow-sm">Fitur Manajemen Suplier Segera Hadir.</div>;
      case 'kategori': return <div className="text-center p-10 bg-white rounded-lg shadow-sm">Fitur Manajemen Kategori Segera Hadir.</div>;
      default: return null;
    }
  };

  return (
    // --- PERBAIKAN UTAMA: Struktur flexbox untuk scrolling ---
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4 flex-shrink-0">Manajemen</h1>
      <div className="mb-4 border-b border-gray-200 flex-shrink-0">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
