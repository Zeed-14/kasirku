import React from 'react';

// Komponen helper untuk setiap baris input (bisa dibuat jadi komponen reusable)
const SettingRow = ({ label, description, children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <label className="block text-sm font-medium text-gray-800">{label}</label>
    <p className="text-xs text-gray-500 mb-2">{description}</p>
    {children}
  </div>
);

export const ReceiptSettings = ({ settings, setSettings }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <SettingRow label="Pesan di Bawah Struk" description="Teks ini akan muncul di bagian paling bawah struk, cocok untuk info promo atau kebijakan retur.">
        <textarea 
          name="receipt_footer_message" 
          value={settings.receipt_footer_message || ''} 
          onChange={handleChange} 
          rows="4" 
          className="w-full p-2 border border-gray-300 rounded-md"
        ></textarea>
      </SettingRow>
    </div>
  );
};
