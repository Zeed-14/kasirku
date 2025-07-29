// File: src/components/ProductCard.jsx

import React, { useState, useRef, useEffect } from 'react';
import { DotsVerticalIcon, PencilIcon, TrashIcon } from './icons';

export const ProductCard = ({ product, onAddToCart, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleCardClick = () => {
    if (isOutOfStock) return;
    onAddToCart(product);
  };

  const handleMenuToggle = (e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); };
  const handleEdit = (e) => { e.stopPropagation(); onEdit(product); setIsMenuOpen(false); };
  const handleDelete = (e) => { e.stopPropagation(); onDelete(product.id); setIsMenuOpen(false); };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-200 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
      onClick={handleCardClick}
    >
      <div className="relative w-full h-32 bg-gray-200">
        <img src={product.image_url || `https://placehold.co/150x150/E2E8F0/4A5568?text=${product.name.charAt(0)}`} alt={product.name} className="w-full h-full object-cover" />
        <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded-full ${isLowStock ? 'bg-red-500' : 'bg-gray-800 bg-opacity-70'}`}>
          Stok: {product.stock}
        </div>
        <div className="absolute top-2 right-2" ref={menuRef}>
          <button onClick={handleMenuToggle} className="p-1 bg-black bg-opacity-40 rounded-full text-white hover:bg-opacity-60"><DotsVerticalIcon className="h-5 w-5" /></button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10">
              <ul className="py-1">
                <li><button onClick={handleEdit} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><PencilIcon className="h-4 w-4 mr-2" /> Edit</button></li>
                <li><button onClick={handleDelete} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"><TrashIcon className="h-4 w-4 mr-2" /> Hapus</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-blue-600 font-bold mt-1">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}</p>
      </div>
    </div>
  );
};
