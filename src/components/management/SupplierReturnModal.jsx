import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { SearchIcon, PlusIcon, TrashIcon } from '../icons';

export const SupplierReturnModal = ({ isOpen, onClose, onReturnSuccess }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [itemsToReturn, setItemsToReturn] = useState([]); // Array of { ...product, return_quantity: number }
  const [notes, setNotes] = useState('');
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Ambil data suplier dan produk saat modal dibuka
    const fetchData = async () => {
      const { data: supplierData } = await supabase.from('suppliers').select('*');
      const { data: productData } = await supabase.from('products').select('*').order('name');
      setSuppliers(supplierData || []);
      setProducts(productData || []);
    };
    fetchData();
  }, [isOpen]);

  const resetState = () => {
    setSelectedSupplierId('');
    setItemsToReturn([]);
    setNotes('');
    setIsProductSelectorOpen(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const addProductToReturn = (product) => {
    // Cek apakah produk sudah ada di daftar
    if (itemsToReturn.find(item => item.id === product.id)) {
      toast.error('Produk sudah ada di daftar retur.');
      return;
    }
    // Tambahkan produk dengan kuantitas retur awal 1
    setItemsToReturn(prev => [...prev, { ...product, return_quantity: 1 }]);
    setIsProductSelectorOpen(false);
  };

  const updateReturnQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    // Hanya update jika kuantitas valid dan tidak melebihi stok
    if (qty > 0) {
      setItemsToReturn(prev => prev.map(item => 
        item.id === productId ? { ...item, return_quantity: Math.min(qty, item.stock) } : item
      ));
    }
  };

  const removeItem = (productId) => {
    setItemsToReturn(prev => prev.filter(item => item.id !== productId));
  };
  
  const handleSubmitReturn = () => {
    if (!selectedSupplierId) {
      toast.error('Silakan pilih suplier.');
      return;
    }
    if (itemsToReturn.length === 0) {
      toast.error('Tambahkan minimal satu produk untuk diretur.');
      return;
    }

    const returnPayload = {
      p_supplier_id: parseInt(selectedSupplierId, 10),
      p_returned_items: itemsToReturn.map(item => ({ product_id: item.id, quantity: item.return_quantity })),
      p_total_items: itemsToReturn.reduce((sum, item) => sum + item.return_quantity, 0),
      p_notes: notes,
    };
    
    onReturnSuccess(returnPayload);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl animate-scale-in flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold p-6 bg-gray-50 border-b flex-shrink-0">Buat Retur ke Suplier</h2>
        
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="mb-4">
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">Pilih Suplier</label>
            <select name="supplier" value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
              <option value="">-- Pilih Suplier --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Produk yang Diretur</label>
            <div className="mt-1 border rounded-md p-2 min-h-[150px]">
              {itemsToReturn.length === 0 ? (
                <p className="text-center text-gray-400 p-4">Belum ada produk</p>
              ) : (
                itemsToReturn.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border-b">
                    <span>{item.name}</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={item.return_quantity} onChange={(e) => updateReturnQuantity(item.id, e.target.value)} className="w-16 p-1 border rounded-md text-center" max={item.stock} />
                      <button onClick={() => removeItem(item.id)} className="text-red-500"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button type="button" onClick={() => setIsProductSelectorOpen(true)} className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"><PlusIcon className="h-4 w-4"/> Tambah Produk</button>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Catatan (Alasan Retur)</label>
            <textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className="w-full p-2 border border-gray-300 rounded-md"></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t flex-shrink-0">
          <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-5 hover:bg-gray-300">Batal</button>
          <button onClick={handleSubmitReturn} className="bg-blue-600 text-white rounded-lg py-2 px-5 hover:bg-blue-700">Proses Retur</button>
        </div>
      </div>
      
      {/* Modal Pemilih Produk */}
      {isProductSelectorOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md flex flex-col max-h-[70vh]">
            <h3 className="p-4 font-bold border-b">Pilih Produk</h3>
            <div className="p-4 overflow-y-auto">
              {products.map(p => (
                <div key={p.id} onClick={() => addProductToReturn(p)} className="p-2 hover:bg-gray-100 cursor-pointer rounded-md">
                  {p.name} <span className="text-xs text-gray-500">(Stok: {p.stock})</span>
                </div>
              ))}
            </div>
            <div className="p-2 border-t flex justify-end">
              <button onClick={() => setIsProductSelectorOpen(false)} className="bg-gray-200 text-gray-800 rounded-lg py-1 px-3">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
