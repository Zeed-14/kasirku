import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast'; // Impor Toaster
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DebugConsole } from './components/DebugConsole';
import { 
  HomePage, 
  CashierPage, 
  ReportPage, 
  ManagementPage, 
  SettingsPage 
} from './pages';

function App() {
  const [activeMenu, setActiveMenu] = useState('Beranda');

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
      {/* Komponen Toaster untuk menampilkan notifikasi */}
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
      
      <DebugConsole />

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
