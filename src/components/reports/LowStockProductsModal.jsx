import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export const LowStockProductsModal = ({ isOpen, onClose }) => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLowStockProducts = async () => {
      setIsLoading(true);
      // Ambil produk yang stoknya antara 1 dan 5 (inklusif)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 5)
        .gt('stock', 0)
        .order('stock', { ascending: true });

      if (error) {
        toast.error('Gagal memuat daftar produk stok menipis.');
      } else {
        setLowStockProducts(data);
      }
      setIsLoading(false);
    };

    fetchLowStockProducts();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold p-6 bg-gray-50 border-b flex-shrink-0">Produk Stok Menipis</h2>
        <div className="flex-grow p-4 overflow-y-auto">
          {isLoading ? (
            <p>Memuat...</p>
          ) : lowStockProducts.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {lowStockProducts.map(product => (
                <li key={product.id} className="py-3 flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full text-sm">
                    Sisa {product.stock}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">Tidak ada produk dengan stok menipis.</p>
          )}
        </div>
        <div className="flex justify-end p-4 border-t bg-gray-50">
          <button onClick={onClose} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg">Tutup</button>
        </div>
      </div>
    </div>
  );
};
