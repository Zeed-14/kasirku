import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { ReportSummaryCard } from '../components/ReportSummaryCard';
import { TransactionListItem } from '../components/TransactionListItem';
import { ReceiptModal } from '../components/ReceiptModal';
import { RevenueIcon, TransactionIcon, BestSellerIcon } from '../components/icons';

export const ReportPage = () => {
  const [summary, setSummary] = useState({ revenue: 0, transactions: 0, bestSeller: 'N/A' });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Gagal memuat data laporan.');
        console.error(error);
      } else {
        const totalRevenue = data.reduce((sum, tx) => sum + tx.final_price, 0);
        const totalTransactions = data.length;
        
        const itemCounts = {};
        data.forEach(tx => {
          tx.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
          });
        });
        const bestSeller = Object.keys(itemCounts).length > 0 
          ? Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0][0] 
          : 'N/A';

        setSummary({ revenue: totalRevenue, transactions: totalTransactions, bestSeller });
        setTransactions(data);
      }
      setIsLoading(false);
    };

    fetchReportData();
  }, []);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction({
      ...transaction,
      amountPaid: transaction.final_price,
      change: 0,
    });
    setIsReceiptModalOpen(true);
  };

  const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  return (
    <>
      <div className="p-4 h-full flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Laporan Hari Ini</h1>
        {isLoading ? (
          <div className="text-center py-10">Memuat laporan...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <ReportSummaryCard title="Total Pendapatan" value={formatCurrency(summary.revenue)} icon={<RevenueIcon className="h-6 w-6"/>} />
              <ReportSummaryCard title="Jumlah Transaksi" value={summary.transactions} icon={<TransactionIcon className="h-6 w-6"/>} />
              <ReportSummaryCard title="Produk Terlaris" value={summary.bestSeller} icon={<BestSellerIcon className="h-6 w-6"/>} />
            </div>
            <h2 className="text-xl font-bold mb-3">Riwayat Transaksi</h2>
            <div className="flex-grow bg-gray-100 p-3 rounded-lg overflow-y-auto">
              {transactions.length > 0 ? (
                transactions.map(tx => (
                  <TransactionListItem key={tx.id} transaction={tx} onClick={handleTransactionClick} />
                ))
              ) : (
                <p className="text-center text-gray-500 mt-10">Belum ada transaksi hari ini.</p>
              )}
            </div>
          </>
        )}
      </div>
      <ReceiptModal 
        isOpen={isReceiptModalOpen} 
        onClose={() => setIsReceiptModalOpen(false)} 
        transactionDetails={selectedTransaction} 
      />
    </>
  );
};