import React from 'react';
// Impor semua ikon dari satu file untuk kebersihan kode
import { HomeIcon, CashierIcon, ReportIcon, ManagementIcon, SettingsIcon } from './icons';

export const BottomNav = ({ activeMenu, setActiveMenu }) => {
  // Daftar item menu untuk navigasi
  const menuItems = [
    { name: 'Beranda', icon: HomeIcon },
    { name: 'Kasir', icon: CashierIcon },
    { name: 'Laporan', icon: ReportIcon },
    { name: 'Manajemen', icon: ManagementIcon },
    { name: 'Pengaturan', icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around max-w-lg mx-auto">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.name;
          const IconComponent = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => setActiveMenu(item.name)}
              className="flex flex-col items-center justify-center w-full pt-2 pb-1 text-center transition-colors duration-200 focus:outline-none"
            >
              <IconComponent 
                className={`h-6 w-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} 
              />
              <span className={`text-xs ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
