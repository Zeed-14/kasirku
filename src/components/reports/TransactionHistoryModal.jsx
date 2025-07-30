import React, { useState, useEffect } from 'react';
// Path diperbaiki: naik dua level dari 'reports' untuk menemukan 'lib'
import { supabase } from '../../lib/supabaseClient';
import { TransactionListItem } from './TransactionListItem';
import { ReceiptModal } from '../common/ReceiptModal';
import toast from 'react-hot-toast';

const TRANSACTIONS_PER_PAGE = 15;

export const TransactionHistoryModal = ({ isOpen, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      const from = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
      const to = from + TRANSACTIONS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        toast.error('Gagal memuat riwayat transaksi.');
      } else {
        setTransactions(data);
        setTotalTransactions(count);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [isOpen, currentPage]);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction({ ...transaction, amountPaid: transaction.final_price, change: 0 });
    setIsReceiptModalOpen(true);
  };
  
  const totalPages = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
        <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col animate-scale-in">
          <div className="p-4 border-b bg-white rounded-t-lg">
            <h2 className="text-xl font-bold">Riwayat Semua Transaksi</h2>
          </div>
          <div className="flex-grow p-4 overflow-y-auto">
            {isLoading ? (
              <p>Memuat...</p>
            ) : (
              transactions.map(tx => (
                <TransactionListItem key={tx.id} transaction={tx} onClick={handleTransactionClick} />
              ))
            )}
          </div>
          <div className="p-4 border-t bg-white rounded-b-lg flex justify-between items-center">
            {totalPages > 1 && (
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">Sebelumnya</button>
                <span>Halaman {currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">Berikutnya</button>
              </div>
            )}
            <button onClick={onClose} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg">Tutup</button>
          </div>
        </div>
      </div>
      <ReceiptModal 
        isOpen={isReceiptModalOpen} 
        onClose={() => setIsReceiptModalOpen(false)} 
        transactionDetails={selectedTransaction} 
      />
    </>
  );
};