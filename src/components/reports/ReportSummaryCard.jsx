import React from 'react';

// Tambahkan prop 'color' untuk kustomisasi
export const ReportSummaryCard = ({ title, value, icon, onClick, color = 'blue' }) => {
  const Tag = onClick ? 'button' : 'div';

  // Definisikan tema warna berdasarkan prop
  const colorThemes = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
  };

  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <Tag 
      onClick={onClick} 
      className={`bg-white p-4 rounded-xl shadow-sm flex items-center w-full text-left transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
    >
      <div className={`p-3 rounded-lg mr-4 ${theme.bg}`}>
        <div className={theme.text}>{icon}</div>
      </div>
      <div className="overflow-hidden">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{value}</p>
      </div>
    </Tag>
  );
};
