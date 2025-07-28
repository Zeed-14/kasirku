import React from 'react';

// Komponen ini bertanggung jawab untuk menampilkan satu produk
// Menerima 'product' sebagai data dan 'onAddToCart' sebagai fungsi yang dipanggil saat diklik
export const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 active:scale-95"
      onClick={() => onAddToCart(product)}
    >
      <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
        {/* Placeholder untuk gambar produk */}
        <img 
            src={product.imageUrl || `https://placehold.co/150x150/E2E8F0/4A5568?text=${product.name.charAt(0)}`} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/150x150/E2E8F0/4A5568?text=${product.name.charAt(0)}`; }}
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-blue-600 font-bold mt-1">
          {/* Format harga ke dalam format Rupiah */}
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
        </p>
      </div>
    </div>
  );
};