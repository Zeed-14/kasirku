import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// Impor komponen-komponen yang dibutuhkan
import { ConfirmModal } from '../common/ConfirmModal';
import { AddProductModal } from '../management/AddProductModal';
import { EditProductModal } from '../management/EditProductModal';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon } from '../icons';

const PRODUCTS_PER_PAGE = 10;

export const ProductManagementTable = () => {
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

  // --- STATE UNTUK AKSI MASSAL ---
  const [selectedProducts, setSelectedProducts] = useState([]);

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
    setSelectedProducts([]); // Reset pilihan saat filter berubah
  }, [searchQuery, sortBy]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // --- FUNGSI-FUNGSI UNTUK AKSI MASSAL ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedProducts(prev => [...prev, id]);
    } else {
      setSelectedProducts(prev => prev.filter(productId => productId !== id));
    }
  };

  const confirmBulkDelete = async () => {
    const toastId = toast.loading(`Menghapus ${selectedProducts.length} produk...`);
    const { error } = await supabase.from('products').delete().in('id', selectedProducts);
    if (error) {
      toast.error(`Gagal: ${error.message}`, { id: toastId });
    } else {
      toast.success('Produk terpilih berhasil dihapus!', { id: toastId });
      setSelectedProducts([]);
      fetchProducts();
    }
    setIsConfirmModalOpen(false);
  };

  const handleSaveProduct = async (productData, imageFile) => { /* ... (kode sama) ... */ };
  const handleUpdateProduct = async (updatedProduct) => { /* ... (kode sama) ... */ };
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
      
      {selectedProducts.length > 0 && (
        <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg mb-4 flex justify-between items-center">
          <span>{selectedProducts.length} produk terpilih</span>
          <button onClick={() => setIsConfirmModalOpen(true)} className="flex items-center gap-2 bg-red-500 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-red-600">
            <TrashIcon className="h-4 w-4" /> Hapus Terpilih
          </button>
        </div>
      )}

      <div className="flex-grow overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 min-w-[600px]">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="p-4">
                  <input type="checkbox" className="rounded"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-3">Nama Produk</th>
                <th scope="col" className="px-6 py-3">Kategori</th>
                <th scope="col" className="px-6 py-3">Harga</th>
                <th scope="col" className="px-6 py-3 text-center">Stok</th>
                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-10">Memuat data produk...</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="w-4 p-4">
                      <input type="checkbox" className="rounded"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectOne(e, product.id)}
                      />
                    </td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</th>
                    <td className="px-6 py-4">{product.categories?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-center">{product.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleShowEditModal(product)} className="text-blue-600 hover:text-blue-800" aria-label="Edit"><PencilIcon className="h-5 w-5"/></button>
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
      <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmBulkDelete} title="Hapus Produk Terpilih" message={`Apakah Anda yakin ingin menghapus ${selectedProducts.length} produk yang dipilih?`} />
    </div>
  );
};