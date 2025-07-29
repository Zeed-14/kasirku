import React, { useState, useEffect } from 'react';

const categories = ['Kopi', 'Non-Kopi', 'Makanan Ringan', 'Makanan Berat', 'Kue & Roti', 'Lain-lain'];

export const AddProductModal = ({ isOpen, onClose, onSave, initialBarcode = '' }) => {
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    category: categories[0],
    barcode: '',
  });
  // State baru untuk menampung file gambar yang dipilih
  const [imageFile, setImageFile] = useState(null);
  // State baru untuk URL pratinjau gambar
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setProductData({
        name: '',
        price: '',
        category: categories[0],
        barcode: initialBarcode,
      });
      // Reset state gambar saat modal dibuka
      setImageFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, initialBarcode]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevData => ({ ...prevData, [name]: value }));
  };

  // Fungsi untuk menangani saat pengguna memilih file gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Buat URL sementara untuk pratinjau
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (productData.name && productData.price && productData.category) {
      // Kirim data produk DAN file gambar ke fungsi onSave
      onSave(productData, imageFile);
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
          {/* --- Input Gambar Baru --- */}
          <div className="mb-4">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
            {previewUrl && <img src={previewUrl} alt="Pratinjau" className="w-32 h-32 object-cover rounded-md mb-2" />}
            <input type="file" name="image" id="image" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>
          <div className="mb-4">
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
            <input type="text" name="barcode" value={productData.barcode} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm bg-gray-100" readOnly={!!initialBarcode} />
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input type="text" name="name" value={productData.name} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm" required autoFocus />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
            <input type="number" name="price" value={productData.price} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select name="category" value={productData.category} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm">
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
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
