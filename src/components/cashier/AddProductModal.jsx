import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UploadIcon, PackageIcon, RupiahIcon, CategoryIcon, StockIcon, BarcodeIcon } from '../icons';

const categories = ['Kopi', 'Non-Kopi', 'Makanan Ringan', 'Makanan Berat', 'Kue & Roti', 'Lain-lain'];

export const AddProductModal = ({ isOpen, onClose, onSave, initialBarcode = '' }) => {
  const [productData, setProductData] = useState({ name: '', price: '', category: categories[0], barcode: '', stock: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setProductData({ name: '', price: '', category: categories[0], barcode: initialBarcode, stock: '0' });
      setImageFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, initialBarcode]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevData => ({ ...prevData, [name]: value }));
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
    if (productData.name && productData.price && productData.category) {
      onSave(productData, imageFile);
      onClose();
    } else {
      toast.error("Nama, Harga, dan Kategori tidak boleh kosong!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 animate-fade-in">
      {/* --- PERBAIKAN UTAMA PADA STRUKTUR LAYOUT --- */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
        <h2 className="text-xl font-bold p-6 bg-gray-50 border-b flex-shrink-0">Tambah Produk Baru</h2>
        
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          {/* Area Konten yang Bisa Scroll */}
          <div className="p-6 overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {previewUrl ? (<img src={previewUrl} alt="Pratinjau" className="mx-auto h-24 w-24 object-cover rounded-md" />) : (<UploadIcon className="mx-auto h-12 w-12 text-gray-400" />)}
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Unggah file</span>
                      <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <p className="pl-1">atau seret dan lepas</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 10MB</p>
                </div>
              </div>
            </div>

            <div className="relative mb-4"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><PackageIcon className="h-5 w-5 text-gray-400" /></span><input type="text" name="name" placeholder="Nama Produk" value={productData.name} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required autoFocus /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><RupiahIcon className="h-5 w-5 text-gray-400" /></span><input type="number" name="price" placeholder="Harga" value={productData.price} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><StockIcon className="h-5 w-5 text-gray-400" /></span><input type="number" name="stock" placeholder="Stok" value={productData.stock} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required /></div>
            </div>
            <div className="relative mb-4"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><CategoryIcon className="h-5 w-5 text-gray-400" /></span><select name="category" value={productData.category} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md">{categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
            <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><BarcodeIcon className="h-5 w-5 text-gray-400" /></span><input type="text" name="barcode" placeholder="Barcode (opsional)" value={productData.barcode} onChange={handleInputChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md bg-gray-50" readOnly={!!initialBarcode} /></div>
          </div>
          
          {/* Footer Form (Tidak bisa scroll) */}
          <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t flex-shrink-0">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-5 hover:bg-gray-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 px-5 hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
