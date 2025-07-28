import React, { useState, useEffect } from 'react';

// Fungsi untuk memformat angka menjadi format mata uang Rupiah
const formatCurrency = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

export const PaymentModal = ({ isOpen, onClose, totalPrice, onConfirmPayment }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);

  // Efek ini akan berjalan setiap kali total harga atau uang yang dibayar berubah
  useEffect(() => {
    const paid = parseFloat(amountPaid);
    if (!isNaN(paid) && paid >= totalPrice) {
      setChange(paid - totalPrice);
    } else {
      setChange(0);
    }
  }, [amountPaid, totalPrice]);

  // Reset state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setAmountPaid('');
      setChange(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmPayment();
    onClose();
  };

  const isPaymentSufficient = parseFloat(amountPaid) >= totalPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
        <h2 className="text-xl font-bold mb-4 text-center">Pembayaran</h2>
        
        <div className="mb-4 bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Total Belanja</p>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalPrice)}</p>
        </div>

        <div className="mb-4">
          <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">Uang Tunai Diterima</label>
          <input
            type="number"
            name="amountPaid"
            id="amountPaid"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full text-lg p-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Contoh: 50000"
            autoFocus
          />
        </div>
        
        <div className="mb-6 bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Kembalian</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(change)}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={!isPaymentSufficient}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Konfirmasi Pembayaran
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 rounded-lg py-2 hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
