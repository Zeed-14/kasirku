// File: src/components/TransactionListItem.jsx

import React from 'react';

const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
const formatTime = (isoString) => new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export const TransactionListItem = ({ transaction, onClick }) => {
  return (
    <div 
      onClick={() => onClick(transaction)} 
      className="bg-white p-3 rounded-lg shadow-sm mb-3 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold text-gray-800">Transaksi #{transaction.id}</p>
          <p className="text-sm text-gray-500">{formatTime(transaction.created_at)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-blue-600">{formatCurrency(transaction.final_price)}</p>
          <p className="text-xs text-gray-400">{transaction.items.length} item</p>
        </div>
      </div>
    </div>
  );
};
