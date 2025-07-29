// File: src/components/ReportSummaryCard.jsx

import React from 'react';

export const ReportSummaryCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};
