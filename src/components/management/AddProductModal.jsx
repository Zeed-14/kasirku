import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { UploadIcon, PackageIcon, RupiahIcon, CategoryIcon, StockIcon, BarcodeIcon, TruckIcon } from '../icons';

export const AddProductModal = ({ isOpen, onClose, onSave, initialBarcode = '' }) => {
  const [productData, setProductData] = useState({ name: '', price: '', category_id: '', barcode: '', stock: '0', is_consignment: false, cost_price: '0', supplier_id: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    // Ambil data kategori dan suplier untuk dropdown
    const fetchData = async () => {
      const { data: catData } = await supabase.from('categories').select('*');
      const { data: supData } = await supabase.from('suppliers').select('*');
      setCategories(catData || []);
      setSuppliers(supData || []);
      if (catData?.length > 0) {
        setProductData(prev => ({ ...prev, category_id: catData[0].id }));
      }
    };

    fetchData();
    setProductData({ name: '', price: '', category_id: categories[0]?.id || '', barcode: initialBarcode, stock: '0', is_consignment: false, cost_price: '0', supplier_id: '' });
    setImageFile(null);
    setPreviewUrl(null);
  }, [isOpen, initialBarcode]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productData.name || !productData.price || !productData.category_id) {
      toast.error("Nama, Harga, dan Kategori wajib diisi!");
      return;
    }
    if (productData.is_consignment && !productData.supplier_id) {
      toast.error("Barang titipan harus memiliki suplier.");
      return;
    }
    onSave(productData, imageFile);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold p-6 bg-gray-50 border-b flex-shrink-0">Tambah Produk Baru</h2>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto">
            {/* ... (Input Gambar, Nama, Harga, Stok, Kategori, Barcode tetap sama) ... */}
            <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label><div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"><div className="space-y-1 text-center">{previewUrl ? (<img src={previewUrl} alt="Pratinjau" className="mx-auto h-24 w-24 object-cover rounded-md" />) : (<UploadIcon className="mx-auto h-12 w-12 text-gray-400" />)}<div className="flex text-sm text-gray-600"><label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"><span>Unggah file</span><input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} /></label><p className="pl-1">atau seret dan lepas</p></div><p className="text-xs text-gray-500">PNG, JPG, GIF hingga 10MB</p></div></div></div>
            <div className="relative mb-4"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><PackageIcon className="h-5 w-5 text-gray-400" /></span><input type="text" name="name" placeholder="Nama Produk" value={productData.name} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required autoFocus /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><RupiahIcon className="h-5 w-5 text-gray-400" /></span><input type="number" name="price" placeholder="Harga Jual" value={productData.price} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required /></div><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><StockIcon className="h-5 w-5 text-gray-400" /></span><input type="number" name="stock" placeholder="Stok" value={productData.stock} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required /></div></div>
            <div className="relative mb-4"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><CategoryIcon className="h-5 w-5 text-gray-400" /></span><select name="category_id" value={productData.category_id} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md">{categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>
            <div className="relative mb-4"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><BarcodeIcon className="h-5 w-5 text-gray-400" /></span><input type="text" name="barcode" placeholder="Barcode (opsional)" value={productData.barcode} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md bg-gray-50" readOnly={!!initialBarcode} /></div>
            
            {/* --- INPUT BARU UNTUK BARANG TITIPAN --- */}
            <div className="border-t pt-4 mt-4">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input id="is_consignment" name="is_consignment" type="checkbox" checked={productData.is_consignment} onChange={handleInputChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="is_consignment" className="font-medium text-gray-700">Barang Titipan (Konsinyasi)</label>
                  <p className="text-gray-500">Aktifkan jika produk ini adalah barang titipan dari suplier.</p>
                </div>
              </div>

              {productData.is_consignment && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><TruckIcon className="h-5 w-5 text-gray-400" /></span>
                    <select name="supplier_id" value={productData.supplier_id} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md">
                      <option value="">-- Pilih Suplier --</option>
                      {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                    </select>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><RupiahIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="number" name="cost_price" placeholder="Harga Modal / Pokok" value={productData.cost_price} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t flex-shrink-0">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-5 hover:bg-gray-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 px-5 hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
