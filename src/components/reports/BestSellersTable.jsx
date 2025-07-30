import React from 'react';

const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

export const BestSellersTable = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-80 flex flex-col">
      <h3 className="font-bold text-gray-800 mb-2">5 Produk Terlaris</h3>
      <div className="flex-grow overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2">Produk</th>
              <th scope="col" className="px-4 py-2 text-center">Terjual</th>
              <th scope="col" className="px-4 py-2 text-right">Omzet</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{item.name}</td>
                <td className="px-4 py-2 text-center">{item.quantity}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
