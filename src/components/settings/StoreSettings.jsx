import React from 'react';

// Komponen helper untuk setiap baris input
const SettingRow = ({ label, description, children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <label className="block text-sm font-medium text-gray-800">{label}</label>
    <p className="text-xs text-gray-500 mb-2">{description}</p>
    {children}
  </div>
);

export const StoreSettings = ({ settings, setSettings }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <SettingRow label="Nama Toko" description="Nama ini akan muncul di header dan di struk belanja.">
        <input 
          type="text" 
          name="store_name" 
          value={settings.store_name || ''} 
          onChange={handleChange} 
          className="w-full p-2 border border-gray-300 rounded-md" 
        />
      </SettingRow>

      <SettingRow label="Alamat Toko" description="Alamat lengkap toko untuk ditampilkan di struk.">
        <textarea 
          name="store_address" 
          value={settings.store_address || ''} 
          onChange={handleChange} 
          rows="3" 
          className="w-full p-2 border border-gray-300 rounded-md"
        ></textarea>
      </SettingRow>

      <SettingRow label="Nomor Telepon" description="Kontak toko yang akan ditampilkan di struk.">
        <input 
          type="text" 
          name="store_phone" 
          value={settings.store_phone || ''} 
          onChange={handleChange} 
          className="w-full p-2 border border-gray-300 rounded-md" 
        />
      </SettingRow>
    </div>
  );
};
