import React from 'react';

const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

export const BestSellersModal = ({ isOpen, onClose, data, filter }) => {
  if (!isOpen) return null;

  const filterTitle = filter === 'today' ? 'Hari Ini' : filter === 'week' ? '7 Hari Terakhir' : 'Bulan Ini';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold p-6 bg-gray-50 border-b flex-shrink-0">
          Top 10 Produk Terlaris ({filterTitle})
        </h2>
        <div className="flex-grow p-4 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-2">#</th>
                <th scope="col" className="px-4 py-2">Produk</th>
                <th scope="col" className="px-4 py-2 text-center">Terjual</th>
                <th scope="col" className="px-4 py-2 text-right">Omzet</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-bold">{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{item.name}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end p-4 border-t bg-gray-50">
          <button onClick={onClose} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg">Tutup</button>
        </div>
      </div>
    </div>
  );
};