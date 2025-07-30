import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { ReportSummaryCard } from '../components/reports/ReportSummaryCard';
import { TransactionListItem } from '../components/reports/TransactionListItem';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { SalesChart } from '../components/reports/SalesChart';
import { CategoryPieChart } from '../components/reports/CategoryPieChart';
import { BestSellersTable } from '../components/reports/BestSellersTable';
import { ReportSkeleton } from '../components/common/ReportSkeleton';
import { TransactionHistoryModal } from '../components/reports/TransactionHistoryModal';
import { LowStockProductsModal } from '../components/reports/LowStockProductsModal';
import { BestSellersModal } from '../components/reports/BestSellersModal'; // Impor modal baru
import { RevenueIcon, TransactionIcon, BestSellerIcon, ClockIcon, ArchiveBoxXMarkIcon } from '../components/icons';

const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

export const ReportPage = () => {
  const [summary, setSummary] = useState({ revenue: 0, transactions: 0, bestSeller: 'N/A', lowStockCount: 0 });
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState('today');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  
  // --- STATE BARU UNTUK MODAL PRODUK TERLARIS ---
  const [isBestSellersModalOpen, setIsBestSellersModalOpen] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      const now = new Date();
      let startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      if (filter === 'week') { startDate.setDate(now.getDate() - 7); } 
      else if (filter === 'month') { startDate.setMonth(now.getMonth() - 1); }
      const { data, error } = await supabase.from('transactions').select('*').gte('created_at', startDate.toISOString()).order('created_at', { ascending: false });

      if (error) {
        toast.error('Gagal memuat data laporan.');
      } else {
        const totalRevenue = data.reduce((sum, tx) => sum + tx.final_price, 0);
        const itemCounts = {};
        const categoryRevenue = {};
        data.forEach(tx => { tx.items.forEach(item => { const revenue = item.price * item.quantity; if (!itemCounts[item.name]) itemCounts[item.name] = { name: item.name, quantity: 0, revenue: 0 }; itemCounts[item.name].quantity += item.quantity; itemCounts[item.name].revenue += revenue; const category = item.category || 'Lain-lain'; categoryRevenue[category] = (categoryRevenue[category] || 0) + revenue; }); });
        
        // --- PERUBAHAN: Ambil 10 produk terlaris ---
        const sortedBestSellers = Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
        setBestSellers(sortedBestSellers);
        setSummary(prev => ({ ...prev, revenue: totalRevenue, transactions: data.length, bestSeller: sortedBestSellers.length > 0 ? sortedBestSellers[0].name : 'N/A' }));
        setTransactions(data);
        const formattedPieData = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }));
        setPieChartData(formattedPieData);
        if (filter === 'today') { const hourlySales = Array(24).fill(0).map((_, i) => ({ name: `${String(i).padStart(2, '0')}:00`, total: 0 })); data.forEach(tx => { const hour = new Date(tx.created_at).getHours(); hourlySales[hour].total += tx.final_price; }); setChartData(hourlySales.filter(h => h.total > 0)); } else { const dailySales = {}; data.forEach(tx => { const day = new Date(tx.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit' }); dailySales[day] = (dailySales[day] || 0) + tx.final_price; }); setChartData(Object.entries(dailySales).map(([name, total]) => ({ name, total })).reverse()); }
      }
      const { count: lowStockCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock', 5).gt('stock', 0);
      setSummary(prev => ({ ...prev, lowStockCount: lowStockCount || 0 }));
      setIsLoading(false);
    };
    fetchReportData();
  }, [filter]);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction({ ...transaction, amountPaid: transaction.final_price, change: 0 });
    setIsReceiptModalOpen(true);
  };

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <>
      <div className="p-4 h-full flex flex-col overflow-hidden">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className="text-2xl font-bold">Laporan & Ringkasan</h1>
            <div className="flex items-center gap-2 mt-2 sm:mt-0 bg-white p-1 rounded-lg shadow-sm">
              {['today', 'week', 'month'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{f === 'today' ? 'Hari Ini' : f === 'week' ? '7 Hari' : 'Bulan Ini'}</button>))}
            </div>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <ReportSummaryCard title="Pendapatan" value={formatCurrency(summary.revenue)} icon={<RevenueIcon className="h-6 w-6"/>} color="green" />
            <ReportSummaryCard title="Transaksi" value={summary.transactions} icon={<TransactionIcon className="h-6 w-6"/>} color="blue" />
            {/* --- PERUBAHAN: Kartu ini sekarang bisa diklik --- */}
            <ReportSummaryCard title="Terlaris" value={summary.bestSeller} icon={<BestSellerIcon className="h-6 w-6"/>} color="yellow" onClick={() => setIsBestSellersModalOpen(true)} />
            <ReportSummaryCard title="Stok Menipis" value={`${summary.lowStockCount} Produk`} icon={<ArchiveBoxXMarkIcon className="h-6 w-6"/>} onClick={() => setIsLowStockModalOpen(true)} color="red" />
            <ReportSummaryCard title="Lihat Riwayat" value="Semua" icon={<ClockIcon className="h-6 w-6"/>} onClick={() => setIsHistoryModalOpen(true)} color="purple" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SalesChart data={chartData} />
            <CategoryPieChart data={pieChartData} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ganti tabel lama dengan yang baru */}
            <div className="lg:col-span-1">
              <BestSellersTable data={bestSellers.slice(0, 5)} />
            </div>
            <div className="lg:col-span-1 flex flex-col"><h2 className="text-xl font-bold mb-3">Transaksi Terbaru</h2><div className="flex-grow bg-gray-100 p-3 rounded-lg overflow-y-auto h-80">{transactions.length > 0 ? (transactions.map(tx => (<TransactionListItem key={tx.id} transaction={tx} onClick={handleTransactionClick} />))) : (<p className="text-center text-gray-500 mt-10">Belum ada transaksi pada periode ini.</p>)}</div></div>
          </div>
        </div>
      </div>
      <ReceiptModal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} transactionDetails={selectedTransaction} />
      <TransactionHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} />
      <LowStockProductsModal isOpen={isLowStockModalOpen} onClose={() => setIsLowStockModalOpen(false)} />
      {/* --- RENDER MODAL BARU --- */}
      <BestSellersModal isOpen={isBestSellersModalOpen} onClose={() => setIsBestSellersModalOpen(false)} data={bestSellers} filter={filter} />
    </>
  );
};