import React, { useState, useEffect } from 'react';
import { PackageIcon, RupiahIcon, CategoryIcon, StockIcon, BarcodeIcon } from './icons';

const categories = ['Kopi', 'Non-Kopi', 'Makanan Ringan', 'Makanan Berat', 'Kue & Roti', 'Lain-lain'];

export const EditProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [productData, setProductData] = useState({ name: '', price: '', category: '', barcode: '', stock: '' });

  useEffect(() => {
    if (product) {
      setProductData({
        name: product.name || '',
        price: product.price || '',
        category: product.category || categories[0],
        barcode: product.barcode || '',
        stock: product.stock || '0',
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...product, ...productData, price: parseFloat(productData.price), stock: parseInt(productData.stock, 10) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in overflow-hidden">
        <h2 className="text-xl font-bold p-6 bg-gray-50 border-b">Edit Produk</h2>
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Kita sederhanakan form edit tanpa upload gambar ulang untuk saat ini */}
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PackageIcon className="h-5 w-5 text-gray-400" /></span>
              <input type="text" name="name" placeholder="Nama Produk" value={productData.name} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required autoFocus />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><RupiahIcon className="h-5 w-5 text-gray-400" /></span>
                <input type="number" name="price" placeholder="Harga" value={productData.price} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><StockIcon className="h-5 w-5 text-gray-400" /></span>
                <input type="number" name="stock" placeholder="Stok" value={productData.stock} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" required />
              </div>
            </div>

            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><CategoryIcon className="h-5 w-5 text-gray-400" /></span>
              <select name="category" value={productData.category} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md">
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><BarcodeIcon className="h-5 w-5 text-gray-400" /></span>
              <input type="text" name="barcode" placeholder="Barcode (opsional)" value={productData.barcode} onChange={handleChange} className="w-full pl-10 p-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-5 hover:bg-gray-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 px-5 hover:bg-blue-700">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
