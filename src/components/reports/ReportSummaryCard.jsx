import React from 'react';

// Tambahkan prop 'onClick' dan ubah div menjadi button
export const ReportSummaryCard = ({ title, value, icon, onClick }) => {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag 
      onClick={onClick} 
      className={`bg-white p-4 rounded-lg shadow-sm flex items-center w-full text-left ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
    >
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
      </div>
    </Tag>
  );
};
