import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
// Path impor diperbarui ke folder 'layout'
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';

// Path impor halaman tidak berubah, sudah benar
import { HomePage } from './pages/HomePage';
import { CashierPage } from './pages/CashierPage';
import { ReportPage } from './pages/ReportPage';
import { ManagementPage } from './pages/ManagementPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const [activeMenu, setActiveMenu] = useState('Kasir');

  const renderPage = () => {
    switch (activeMenu) {
      case 'Beranda': return <HomePage />;
      case 'Kasir': return <CashierPage />;
      case 'Laporan': return <ReportPage />;
      case 'Manajemen': return <ManagementPage />;
      case 'Pengaturan': return <SettingsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className="bg-gray-50 font-sans h-screen flex flex-col">
        <Header />
        <main className="flex-grow overflow-y-auto pb-20">
          {renderPage()}
        </main>
        <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>
    </>
  );
}

export default App;