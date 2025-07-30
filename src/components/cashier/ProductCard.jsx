import React from 'react';

// Komponen ini sekarang tidak lagi menerima prop onEdit dan onDelete
export const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleCardClick = () => {
    if (isOutOfStock) {
      // Mencegah penambahan ke keranjang jika stok habis
      return;
    }
    onAddToCart(product);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-200 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
      onClick={handleCardClick}
    >
      <div className="relative w-full h-32 bg-gray-200">
        <img 
            src={product.image_url || `https://placehold.co/150x150/E2E8F0/4A5568?text=${product.name.charAt(0)}`} 
            alt={product.name}
            className="w-full h-full object-cover"
        />
        {/* Badge Stok tetap ada */}
        <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded-full ${isLowStock ? 'bg-red-500' : 'bg-gray-800 bg-opacity-70'}`}>
          Stok: {product.stock}
        </div>
        {/* Tombol Tiga Titik dan Menu Dropdown dihapus dari sini */}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-blue-600 font-bold mt-1">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
        </p>
      </div>
    </div>
  );
};
