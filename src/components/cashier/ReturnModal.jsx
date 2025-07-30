import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

export const ReturnModal = ({ isOpen, onClose, onReturnSuccess }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Process
  const [transactionId, setTransactionId] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsToReturn, setItemsToReturn] = useState({}); // { product_id: quantity }
  const [reason, setReason] = useState('');

  const resetState = () => {
    setStep(1);
    setTransactionId('');
    setTransaction(null);
    setIsLoading(false);
    setItemsToReturn({});
    setReason('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (error || !data) {
      toast.error('Transaksi tidak ditemukan!');
      setTransaction(null);
    } else {
      setTransaction(data);
      // Inisialisasi item yang bisa diretur
      const initialItems = {};
      data.items.forEach(item => {
        initialItems[item.product_id] = { ...item, return_quantity: 0 };
      });
      setItemsToReturn(initialItems);
      setStep(2);
    }
    setIsLoading(false);
  };

  const handleQuantityChange = (productId, change) => {
    const currentItem = itemsToReturn[productId];
    const newQuantity = currentItem.return_quantity + change;
    if (newQuantity >= 0 && newQuantity <= currentItem.quantity) {
      setItemsToReturn(prev => ({
        ...prev,
        [productId]: { ...currentItem, return_quantity: newQuantity }
      }));
    }
  };

  const totalRefund = Object.values(itemsToReturn).reduce((sum, item) => {
    return sum + (item.price * item.return_quantity);
  }, 0);

  const handleProcessReturn = () => {
    const returnedItems = Object.values(itemsToReturn).filter(item => item.return_quantity > 0);
    if (returnedItems.length === 0) {
      toast.error('Pilih minimal satu item untuk diretur.');
      return;
    }
    onReturnSuccess({
      original_transaction_id: transaction.id,
      refund_amount: totalRefund,
      returned_items: returnedItems.map(i => ({ product_id: i.product_id, name: i.name, price: i.price, quantity: i.return_quantity })),
      reason,
    });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold p-6 bg-gray-50 border-b flex-shrink-0">Retur Transaksi</h2>
        
        {step === 1 && (
          <form onSubmit={handleSearch} className="p-6">
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">Masukkan ID Transaksi</label>
            <div className="flex gap-2">
              <input type="number" name="transactionId" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required autoFocus />
              <button type="submit" disabled={isLoading} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{isLoading ? 'Mencari...' : 'Cari'}</button>
            </div>
          </form>
        )}

        {step === 2 && transaction && (
          <>
            <div className="p-6 overflow-y-auto">
              <div className="mb-4">
                <p><strong>ID Transaksi:</strong> {transaction.id}</p>
                <p><strong>Total Awal:</strong> {formatCurrency(transaction.final_price)}</p>
              </div>
              <div className="space-y-3">
                {Object.values(itemsToReturn).map(item => (
                  <div key={item.product_id} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">Dibeli: {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleQuantityChange(item.product_id, -1)} className="w-7 h-7 bg-gray-200 rounded-md font-bold">-</button>
                      <span>{item.return_quantity}</span>
                      <button onClick={() => handleQuantityChange(item.product_id, 1)} className="w-7 h-7 bg-gray-200 rounded-md font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Alasan Retur (Opsional)</label>
                <input type="text" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="flex justify-between items-center p-6 bg-gray-50 border-t flex-shrink-0">
              <div>
                <p className="text-sm">Total Pengembalian Dana</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRefund)}</p>
              </div>
              <button onClick={handleProcessReturn} className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700">Proses Retur</button>
            </div>
          </>
        )}

        <div className="flex justify-end p-4 border-t bg-white rounded-b-lg">
           <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-5 hover:bg-gray-300">Tutup</button>
        </div>
      </div>
    </div>
  );
};
