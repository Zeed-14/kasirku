import React from 'react';

export const Header = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      {/* Bagian kiri: Logo dan Nama Aplikasi */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
          P
        </div>
        <span className="text-lg font-semibold text-gray-800">POS-Ku</span>
      </div>
      
      {/* Bagian kanan: Avatar Pengguna */}
      <div className="w-10 h-10 bg-gray-300 rounded-full">
        <img 
          src="https://placehold.co/40x40/E2E8F0/4A5568?text=U" 
          alt="Avatar Pengguna"
          className="rounded-full"
          // Fallback jika gambar gagal dimuat
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/E2E8F0/4A5568?text=U'; }}
        />
      </div>
    </header>
  );
};
