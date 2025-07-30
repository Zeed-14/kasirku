import React from 'react';

// Fungsi helper untuk format mata uang dengan pengecekan
const formatCurrency = (number) => {
  if (isNaN(number) || number === null) return 'Rp0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// Fungsi helper untuk format tanggal dan waktu dengan pengecekan
const formatDateTime = (isoString) => {
  if (!isoString) return 'Waktu tidak valid';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(isoString).toLocaleDateString('id-ID', options);
};

export const ReceiptModal = ({ isOpen, onClose, transactionDetails }) => {
  if (!isOpen || !transactionDetails) return null;

  const {
    id, // Ambil ID transaksi
    items,
    subtotal,
    discount_amount,
    final_price,
    amountPaid,
    change,
    created_at,
  } = transactionDetails;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #receipt-section, #receipt-section * { visibility: visible; }
            #receipt-section { position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}
      </style>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
        <div className="w-full max-w-sm bg-gray-100 rounded-lg p-4">
          <div id="receipt-section" className="bg-white p-6 font-mono">
            <div className="text-center">
              <h2 className="text-xl font-bold">POS-Ku</h2>
              <p className="text-xs">Jl. Aplikasi No. 123, Kota Koding</p>
              <p className="text-xs">{formatDateTime(created_at)}</p>
              {/* --- NOMOR TRANSAKSI DITAMBAHKAN DI SINI --- */}
              <p className="text-xs font-semibold">No. Transaksi: #{id}</p>
            </div>
            <div className="border-t border-b border-dashed border-gray-400 my-2 py-2">
              {items.map(item => (
                <div key={item.product_id || item.name} className="flex justify-between text-sm mb-1">
                  <div>
                    <p>{item.name}</p>
                    <p className="text-xs text-gray-600">{item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <p>{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="text-sm mt-2">
              <div className="flex justify-between"><p>Subtotal</p><p>{formatCurrency(subtotal)}</p></div>
              {discount_amount > 0 && (
                <div className="flex justify-between"><p>Diskon</p><p>- {formatCurrency(discount_amount)}</p></div>
              )}
            </div>
            <div className="flex justify-between font-bold border-t border-dashed border-gray-400 mt-2 pt-2">
              <p>TOTAL</p>
              <p>{formatCurrency(final_price)}</p>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <p>Tunai</p>
              <p>{formatCurrency(amountPaid)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Kembalian</p>
              <p>{formatCurrency(change)}</p>
            </div>
            <div className="text-center mt-6">
              <p className="font-semibold">Terima Kasih!</p>
              <p className="text-xs">Silakan datang kembali</p>
            </div>
            {/* --- KETERANGAN PERJANJIAN RETUR DITAMBAHKAN DI SINI --- */}
            <div className="border-t border-dashed border-gray-400 mt-4 pt-2 text-center">
              <p className="text-xs text-gray-600">
                Barang dapat dikembalikan dalam 24 jam dengan menyertakan struk ini.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handlePrint} className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700">Cetak Struk</button>
            <button onClick={onClose} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Transaksi Baru</button>
          </div>
        </div>
      </div>
    </>
  );
};
