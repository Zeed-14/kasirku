import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { PackageIcon, RupiahIcon, CategoryIcon, StockIcon, BarcodeIcon, TruckIcon } from '../icons';

export const EditProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [productData, setProductData] = useState({ name: '', price: '', category_id: '', barcode: '', stock: '', is_consignment: false, cost_price: '', supplier_id: '' });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (!product) return;
    
    const fetchData = async () => {
      const { data: catData } = await supabase.from('categories').select('*');
      const { data: supData } = await supabase.from('suppliers').select('*');
      setCategories(catData || []);
      setSuppliers(supData || []);
      
      setProductData({
        name: product.name || '',
        price: product.price || '',
        category_id: product.category_id || (catData[0]?.id || ''),
        barcode: product.barcode || '',
        stock: product.stock || '0',
        is_consignment: product.is_consignment || false,
        cost_price: product.cost_price || '0',
        supplier_id: product.supplier_id || '',
      });
    };

    fetchData();
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...product, ...productData });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold p-6 bg-gray-50 border-b flex-shrink-0">Edit Produk</h2>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto">
            {/* ... (Input Nama, Harga, Stok, Kategori, Barcode tetap sama) ... */}
            <div className="relative mb-4"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><PackageIcon className="h-5 w-5 text-gray-400" /></span><input type="text" name="name" placeholder="Nama Produk" value={productData.name} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required autoFocus /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><RupiahIcon className="h-5 w-5 text-gray-400" /></span><input type="number" name="price" placeholder="Harga Jual" value={productData.price} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required /></div><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><StockIcon className="h-5 w-5 text-gray-400" /></span><input type="number" name="stock" placeholder="Stok" value={productData.stock} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required /></div></div>
            <div className="relative mb-4"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><CategoryIcon className="h-5 w-5 text-gray-400" /></span><select name="category_id" value={productData.category_id} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md">{categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>
            <div className="relative mb-4"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><BarcodeIcon className="h-5 w-5 text-gray-400" /></span><input type="text" name="barcode" placeholder="Barcode (opsional)" value={productData.barcode} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" /></div>

            <div className="border-t pt-4 mt-4">
              <div className="relative flex items-start">
                <div className="flex items-center h-5"><input id="is_consignment_edit" name="is_consignment" type="checkbox" checked={productData.is_consignment} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/></div>
                <div className="ml-3 text-sm"><label htmlFor="is_consignment_edit" className="font-medium text-gray-700">Barang Titipan (Konsinyasi)</label></div>
              </div>
              {productData.is_consignment && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><TruckIcon className="h-5 w-5 text-gray-400" /></span><select name="supplier_id" value={productData.supplier_id} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md"><option value="">-- Pilih Suplier --</option>{suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}</select></div>
                  <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><RupiahIcon className="h-5 w-5 text-gray-400" /></span><input type="number" name="cost_price" placeholder="Harga Modal / Pokok" value={productData.cost_price} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" /></div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t flex-shrink-0">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-5 hover:bg-gray-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 px-5 hover:bg-blue-700">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
