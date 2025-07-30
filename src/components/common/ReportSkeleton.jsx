import React from 'react';

export const ReportSkeleton = () => {
  return (
    <div className="p-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
      
      {/* Skeleton untuk visualisasi data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="h-80 bg-gray-200 rounded-lg"></div>
        <div className="h-80 bg-gray-200 rounded-lg"></div>
      </div>

      <div className="h-6 bg-gray-200 rounded-md w-1/4 mb-3"></div>
      <div className="space-y-3">
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="h-16 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};
