// File: src/components/Cart.jsx

import React from 'react';
import { TrashIcon, TagIcon } from '../icons';

export const Cart = ({ items, onUpdateQuantity, onClose, onPay, subtotal, discountAmount, finalPrice, onAddDiscount, onRemoveDiscount, discount }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-lg font-bold">Keranjang</h2>
        {onClose && (<button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>)}
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        {items.length === 0 ? (<p className="text-gray-500 text-center mt-8">Keranjang masih kosong</p>) : (
          <ul className="divide-y divide-gray-200">{items.map(item => (
            <li key={item.id} className="py-3 flex items-center justify-between">
              <div className="flex-grow"><p className="font-semibold text-sm">{item.name}</p><p className="text-xs text-blue-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}</p></div>
              <div className="flex items-center gap-2"><button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 bg-gray-200 rounded-md font-bold flex items-center justify-center text-lg active:bg-gray-300">-</button><span className="w-8 text-center font-semibold">{item.quantity}</span><button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 bg-gray-200 rounded-md font-bold flex items-center justify-center text-lg active:bg-gray-300">+</button></div>
              <button onClick={() => onUpdateQuantity(item.id, 0)} className="ml-3 text-gray-400 hover:text-red-500" aria-label="Hapus item"><TrashIcon className="h-5 w-5" /></button>
            </li>
          ))}</ul>
        )}
      </div>
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between text-sm mb-1"><p>Subtotal</p><p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal)}</p></div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-red-600 mb-1">
            <p>Diskon ({discount.type === 'persen' ? `${discount.value}%` : `Rp`})</p>
            <p>- {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(discountAmount)}</p>
          </div>
        )}
        <div className="flex justify-between items-center font-bold text-lg mt-2"><p>Total</p><p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(finalPrice)}</p></div>
        {!discount ? (
          <button onClick={onAddDiscount} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg py-2 mt-4 font-bold hover:bg-blue-50 transition-colors"><TagIcon className="h-5 w-5" /> Tambah Diskon</button>
        ) : (
          <button onClick={onRemoveDiscount} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-red-400 text-red-600 rounded-lg py-2 mt-4 font-bold hover:bg-red-50 transition-colors"><TrashIcon className="h-5 w-5" /> Hapus Diskon</button>
        )}
        <button onClick={onPay} className="w-full bg-blue-600 text-white rounded-lg py-3 mt-4 font-bold hover:bg-blue-700 disabled:bg-gray-400" disabled={items.length === 0}>Bayar</button>
      </div>
    </div>
  );
};
