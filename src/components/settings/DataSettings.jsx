import React from 'react';

export const DataSettings = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Manajemen Data</h2>
      <div className="space-y-4">
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
          <h3 className="font-bold text-yellow-800">Ekspor Data</h3>
          <p className="text-sm text-yellow-700">Fitur untuk mengunduh semua data produk dan transaksi dalam format CSV/Excel. (Segera Hadir)</p>
        </div>
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="font-bold text-red-800">Hapus Semua Data</h3>
          <p className="text-sm text-red-700">Fitur berbahaya untuk menghapus semua data transaksi atau produk. (Segera Hadir)</p>
        </div>
      </div>
    </div>
  );
};
