import React, { useState, useEffect } from 'react';

const categories = ['Kopi', 'Non-Kopi', 'Makanan Ringan', 'Makanan Berat', 'Kue & Roti', 'Lain-lain'];

export const EditProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [productData, setProductData] = useState({ name: '', price: '', category: '', barcode: '' });

  useEffect(() => {
    // Isi form dengan data produk yang akan diedit saat modal dibuka
    if (product) {
      setProductData({
        name: product.name || '',
        price: product.price || '',
        category: product.category || categories[0],
        barcode: product.barcode || '',
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
    onSave({ ...product, ...productData, price: parseFloat(productData.price) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-bold mb-4">Edit Produk</h2>
        <form onSubmit={handleSubmit}>
          {/* Form ini tidak termasuk upload gambar untuk menyederhanakan */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input type="text" name="name" value={productData.name} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
            <input type="number" name="price" value={productData.price} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select name="category" value={productData.category} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm">
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
            <input type="text" name="barcode" value={productData.barcode} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
