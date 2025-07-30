import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, ReturnIcon } from '../icons';
import { SupplierReturnModal } from './SupplierReturnModal'; // Impor modal baru

// Komponen Modal untuk Tambah/Edit Suplier
const SupplierModal = ({ isOpen, onClose, onSave, supplier }) => {
  const [formData, setFormData] = useState({ name: '', contact_person: '', phone: '', address: '' });
  useEffect(() => { if (supplier) { setFormData({ name: supplier.name || '', contact_person: supplier.contact_person || '', phone: supplier.phone || '', address: supplier.address || '' }); } else { setFormData({ name: '', contact_person: '', phone: '', address: '' }); } }, [supplier, isOpen]);
  if (!isOpen) return null;
  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleSubmit = (e) => { e.preventDefault(); if (formData.name.trim() === '') { toast.error('Nama suplier tidak boleh kosong.'); return; } onSave({ ...supplier, ...formData }); };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold p-6 bg-gray-50 border-b flex-shrink-0">{supplier ? 'Edit Suplier' : 'Tambah Suplier Baru'}</h2>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto">
            <div className="mb-4"><label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Suplier</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required autoFocus /></div>
            <div className="mb-4"><label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-1">Narahubung</label><input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" /></div>
            <div className="mb-4"><label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" /></div>
            <div className="mb-4"><label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Alamat</label><textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full p-2 border border-gray-300 rounded-md"></textarea></div>
          </div>
          <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t flex-shrink-0">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-5 hover:bg-gray-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 px-5 hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Komponen Utama untuk Manajemen Suplier
export const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);
  
  // State baru untuk modal retur
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (error) { toast.error('Gagal memuat suplier.'); } 
    else { setSuppliers(data); }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleSaveSupplier = async (supplier) => {
    const toastId = toast.loading(supplier.id ? 'Memperbarui...' : 'Menyimpan...');
    const { id, created_at, ...supplierData } = supplier;
    if (id) {
      const { error } = await supabase.from('suppliers').update(supplierData).eq('id', id);
      if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } 
      else { toast.success('Suplier diperbarui!', { id: toastId }); }
    } else {
      const { error } = await supabase.from('suppliers').insert([supplierData]);
      if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } 
      else { toast.success('Suplier baru ditambahkan!', { id: toastId }); }
    }
    setIsModalOpen(false);
    setSupplierToEdit(null);
    fetchSuppliers();
  };
  
  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Menghapus suplier akan membuat produk terkait menjadi tidak memiliki suplier. Yakin?')) {
        const toastId = toast.loading('Menghapus...');
        await supabase.from('products').update({ supplier_id: null }).eq('supplier_id', supplierId);
        const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
        if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } 
        else { toast.success('Suplier dihapus!', { id: toastId }); }
        fetchSuppliers();
    }
  };

  // --- FUNGSI BARU UNTUK MEMPROSES RETUR KE SUPLIER ---
  const handleProcessReturn = async (returnPayload) => {
    const toastId = toast.loading('Memproses retur ke suplier...');
    const { error } = await supabase.rpc('process_supplier_return', returnPayload);

    if (error) {
      toast.error(`Gagal: ${error.message}`, { id: toastId });
    } else {
      toast.success('Retur ke suplier berhasil dicatat & stok diperbarui!', { id: toastId });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Daftar Suplier</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsReturnModalOpen(true)} className="flex items-center gap-2 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-yellow-600">
            <ReturnIcon className="h-5 w-5" />
            <span>Buat Retur</span>
          </button>
          <button onClick={() => { setSupplierToEdit(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700">
            <PlusIcon className="h-5 w-5" />
            <span>Tambah Suplier</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nama Suplier</th>
              <th scope="col" className="px-6 py-3">Narahubung</th>
              <th scope="col" className="px-6 py-3">Telepon</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" className="text-center py-4">Memuat...</td></tr>
            ) : (
              suppliers.map(sup => (
                <tr key={sup.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{sup.name}</td>
                  <td className="px-6 py-4">{sup.contact_person}</td>
                  <td className="px-6 py-4">{sup.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button onClick={() => { setSupplierToEdit(sup); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><PencilIcon className="h-5 w-5"/></button>
                      <button onClick={() => handleDeleteSupplier(sup.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <SupplierModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSupplier}
        supplier={supplierToEdit}
      />
      <SupplierReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onReturnSuccess={handleProcessReturn}
      />
    </div>
  );
};
