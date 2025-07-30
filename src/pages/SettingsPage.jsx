import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

import { StoreSettings } from '../components/settings/StoreSettings';
import { ReceiptSettings } from '../components/settings/ReceiptSettings';
import { DataSettings } from '../components/settings/DataSettings';
import { StoreIcon, ReceiptIcon, DatabaseIcon } from '../components/icons';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('toko');
  const [settings, setSettings] = useState({});
  const [initialSettings, setInitialSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (error) {
        toast.error('Gagal memuat pengaturan.');
      } else {
        setSettings(data);
        setInitialSettings(data);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const toastId = toast.loading('Menyimpan pengaturan...');
    const { error } = await supabase.from('settings').update(settings).eq('id', 1);
    if (error) {
      toast.error(`Gagal: ${error.message}`, { id: toastId });
    } else {
      toast.success('Pengaturan berhasil disimpan!', { id: toastId });
      setInitialSettings(settings);
    }
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const tabs = [
    { id: 'toko', name: 'Toko', icon: <StoreIcon className="h-5 w-5 mr-2" /> },
    { id: 'struk', name: 'Struk', icon: <ReceiptIcon className="h-5 w-5 mr-2" /> },
    { id: 'data', name: 'Data', icon: <DatabaseIcon className="h-5 w-5 mr-2" /> },
  ];

  const renderContent = () => {
    if (isLoading) {
      // Skeleton loader sederhana
      return (
        <div className="space-y-6 animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'toko':
        return <StoreSettings settings={settings} setSettings={setSettings} />;
      case 'struk':
        return <ReceiptSettings settings={settings} setSettings={setSettings} />;
      case 'data':
        return <DataSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4 flex-shrink-0">Pengaturan</h1>
      <div className="mb-4 border-b border-gray-200 flex-shrink-0">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto pb-20">
        {renderContent()}
      </div>

      {/* --- TOMBOL SIMPAN MENGAMBANG BARU --- */}
      {isDirty && (
        <div className="absolute bottom-20 left-0 right-0 p-4 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-3 rounded-lg shadow-lg border flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Anda memiliki perubahan yang belum disimpan.</span>
              <button onClick={handleSave} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow hover:bg-blue-700">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
