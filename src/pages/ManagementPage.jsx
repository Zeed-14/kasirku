import React, { useState } from 'react';

// Impor komponen-komponen manajemen dari lokasi barunya
import { ProductManagementTable } from '../components/management/ProductManagementTable';
import { CategoryManagement } from '../components/management/CategoryManagement';
import { SupplierManagement } from '../components/management/SupplierManagement'; // Impor komponen baru

// Impor ikon
import { PackageIcon, TruckIcon, CategoryIcon } from '../components/icons';

// Komponen Utama Halaman Manajemen
export const ManagementPage = () => {
  const [activeTab, setActiveTab] = useState('produk');

  const tabs = [
    { id: 'produk', name: 'Produk', icon: <PackageIcon className="h-5 w-5 mr-2" /> },
    { id: 'suplier', name: 'Suplier', icon: <TruckIcon className="h-5 w-5 mr-2" /> },
    { id: 'kategori', name: 'Kategori', icon: <CategoryIcon className="h-5 w-5 mr-2" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'produk':
        return <ProductManagementTable />;
      // --- PERUBAHAN DI SINI ---
      case 'suplier':
        return <SupplierManagement />; // Ganti placeholder dengan komponen baru
      case 'kategori':
        return <CategoryManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4 flex-shrink-0">Manajemen</h1>
      <div className="mb-4 border-b border-gray-200 flex-shrink-0">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
