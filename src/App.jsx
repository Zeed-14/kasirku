import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { 
  HomePage, 
  CashierPage, 
  ReportPage, 
  ManagementPage, 
  SettingsPage 
} from './pages'; // Impor semua halaman dari satu file

function App() {
  // State untuk melacak menu mana yang sedang aktif, default-nya 'Beranda'
  const [activeMenu, setActiveMenu] = useState('Beranda');

  // Fungsi untuk menentukan komponen halaman mana yang akan ditampilkan
  const renderPage = () => {
    switch (activeMenu) {
      case 'Beranda':
        return <HomePage />;
      case 'Kasir':
        return <CashierPage />;
      case 'Laporan':
        return <ReportPage />;
      case 'Manajemen':
        return <ManagementPage />;
      case 'Pengaturan':
        return <SettingsPage />;
      default:
        // Jika terjadi state yang tidak valid, kembali ke Beranda
        return <HomePage />;
    }
  };

  return (
    // Container utama aplikasi dengan layout flex column
    <div className="bg-gray-50 font-sans h-screen flex flex-col">
      
      {/* Header aplikasi yang selalu tampil */}
      <Header />

      {/* Konten utama yang dinamis berdasarkan menu aktif */}
      {/* Diberi padding-bottom agar konten tidak tertutup oleh navigasi bawah */}
      <main className="flex-grow overflow-y-auto pb-20">
        {renderPage()}
      </main>

      {/* Navigasi bawah yang selalu tampil */}
      <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
    </div>
  );
}

export default App;
