import React, { useState } from 'react';

// Daftar kategori yang bisa dipilih
const categories = ['Kopi', 'Non-Kopi', 'Makanan Ringan', 'Makanan Berat', 'Kue & Roti', 'Lain-lain'];

export const AddProductModal = ({ isOpen, onClose, onSave }) => {
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    imageUrl: '',
    category: categories[0], // Nilai default
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (productData.name && productData.price && productData.category) {
      onSave({
        ...productData,
        price: parseFloat(productData.price)
      });
      setProductData({ name: '', price: '', imageUrl: '', category: categories[0] });
      onClose();
    } else {
      alert("Nama, Harga, dan Kategori tidak boleh kosong!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-bold mb-4">Tambah Produk Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input type="text" name="name" id="name" value={productData.name} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
            <input type="number" name="price" id="price" value={productData.price} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          {/* --- INPUT KATEGORI BARU --- */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select name="category" id="category" value={productData.category} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">URL Gambar (Opsional)</label>
            <input type="text" name="imageUrl" id="imageUrl" value={productData.imageUrl} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
