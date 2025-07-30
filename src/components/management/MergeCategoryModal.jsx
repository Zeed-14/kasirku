import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

export const MergeCategoryModal = ({ isOpen, onClose, onConfirm, categories }) => {
  const [sourceId, setSourceId] = useState('');
  const [destinationId, setDestinationId] = useState('');

  // Saring daftar tujuan agar tidak bisa memilih kategori sumber
  const destinationOptions = useMemo(() => {
    return categories.filter(cat => cat.id !== parseInt(sourceId));
  }, [sourceId, categories]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!sourceId || !destinationId) {
      toast.error('Pilih kedua kategori.');
      return;
    }
    onConfirm(parseInt(sourceId), parseInt(destinationId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Gabungkan Kategori</h3>
          <p className="text-sm text-gray-500 mt-1">Pindahkan semua produk dari satu kategori ke kategori lain, lalu hapus kategori sumber.</p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Gabungkan Dari</label>
              <select id="source" value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">-- Pilih Kategori Sumber --</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Ke Kategori</label>
              <select id="destination" value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" disabled={!sourceId}>
                <option value="">-- Pilih Kategori Tujuan --</option>
                {destinationOptions.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300">Batal</button>
          <button onClick={handleConfirm} className="bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700">Gabungkan</button>
        </div>
      </div>
    </div>
  );
};
