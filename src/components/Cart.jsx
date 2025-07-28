import React from 'react';

// Komponen untuk menampilkan isi keranjang belanja
// PERUBAHAN 1: Tambahkan 'onPay' di daftar props yang diterima
export const Cart = ({ items, onUpdateQuantity, onRemoveItem, onClose, onPay }) => {
  // Menghitung total harga dari semua item di keranjang
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-lg font-bold">Keranjang</h2>
        {/* Tombol tutup ini hanya akan muncul di mobile */}
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">Keranjang masih kosong</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map(item => (
              <li key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-blue-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}</p>
                </div>
                <div className="flex items-center">
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded-full font-bold active:bg-gray-300">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded-full font-bold active:bg-gray-300">+</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center font-bold">
          <span>Total</span>
          <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPrice)}</span>
        </div>
        {/* PERUBAHAN 2: Gunakan fungsi 'onPay' saat tombol diklik */}
        <button 
          onClick={onPay}
          className="w-full bg-blue-600 text-white rounded-lg py-3 mt-4 font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 active:bg-blue-800"
          disabled={items.length === 0}
        >
          Bayar
        </button>
      </div>
    </div>
  );
};
