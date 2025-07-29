import React, { useState } from 'react';

export const DiscountModal = ({ isOpen, onClose, onApplyDiscount }) => {
  const [type, setType] = useState('persen'); // 'persen' atau 'rupiah'
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onApplyDiscount({ type, value: numericValue });
      onClose();
    } else {
      alert('Nilai diskon tidak valid.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
        <h2 className="text-xl font-bold mb-4">Tambah Diskon</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Diskon</label>
          <div className="flex gap-4">
            <button onClick={() => setType('persen')} className={`w-full py-2 rounded-md ${type === 'persen' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Persen (%)</button>
            <button onClick={() => setType('rupiah')} className={`w-full py-2 rounded-md ${type === 'rupiah' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Rupiah (Rp)</button>
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">Nilai Diskon</label>
          <input
            type="number"
            name="value"
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full text-lg p-2 border-gray-300 rounded-md shadow-sm"
            placeholder={type === 'persen' ? 'Contoh: 10' : 'Contoh: 5000'}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300">Batal</button>
          <button onClick={handleApply} className="bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700">Terapkan</button>
        </div>
      </div>
    </div>
  );
};
