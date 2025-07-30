import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon, PencilIcon, TrashIcon, MenuIcon, MergeIcon } from '../icons';
import { MergeCategoryModal } from './MergeCategoryModal'; // Impor modal baru

// ... (Komponen CategoryModal tetap sama persis)
const CategoryModal = ({ isOpen, onClose, onSave, category }) => { const [name, setName] = useState(''); useEffect(() => { if (category) { setName(category.name); } else { setName(''); } }, [category, isOpen]); if (!isOpen) return null; const handleSubmit = (e) => { e.preventDefault(); if (name.trim() === '') { toast.error('Nama kategori tidak boleh kosong.'); return; } onSave({ ...category, name }); }; return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in"> <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in"> <form onSubmit={handleSubmit}> <div className="p-6"> <h3 className="text-lg font-medium text-gray-900">{category ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3> <div className="mt-4"> <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Nama Kategori" autoFocus /> </div> </div> <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end gap-3"> <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300">Batal</button> <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700">Simpan</button> </div> </form> </div> </div> ); };

export const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false); // State baru
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('position', { ascending: true });
    if (error) { toast.error('Gagal memuat kategori.'); } 
    else { setCategories(data); }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCategories(items);
    const categoryIds = items.map(item => item.id);
    const { error } = await supabase.rpc('update_category_positions', { category_ids: categoryIds });
    if (error) { toast.error('Gagal menyimpan urutan baru.'); fetchCategories(); } 
    else { toast.success('Urutan kategori berhasil disimpan!'); }
  };
  
  // --- FUNGSI BARU UNTUK MENGGABUNGKAN KATEGORI ---
  const handleMergeCategory = async (sourceId, destinationId) => {
    const toastId = toast.loading('Menggabungkan kategori...');
    const { error } = await supabase.rpc('merge_categories', { source_id: sourceId, destination_id: destinationId });
    if (error) {
      toast.error(`Gagal: ${error.message}`, { id: toastId });
    } else {
      toast.success('Kategori berhasil digabungkan!', { id: toastId });
    }
    setIsMergeModalOpen(false);
    fetchCategories();
  };

  // ... (Fungsi handleSave dan handleDelete tetap sama)
  const handleSaveCategory = async (category) => { const toastId = toast.loading(category.id ? 'Memperbarui...' : 'Menyimpan...'); if (category.id) { const { error } = await supabase.from('categories').update({ name: category.name }).eq('id', category.id); if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } else { toast.success('Kategori diperbarui!', { id: toastId }); } } else { const { error } = await supabase.from('categories').insert([{ name: category.name }]); if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } else { toast.success('Kategori baru ditambahkan!', { id: toastId }); } } setIsModalOpen(false); setCategoryToEdit(null); fetchCategories(); };
  const handleDeleteCategory = async (categoryId) => { if (window.confirm('Menghapus kategori akan membuat produk terkait menjadi tidak berkategori. Yakin?')) { const toastId = toast.loading('Menghapus...'); await supabase.from('products').update({ category_id: null }).eq('category_id', categoryId); const { error } = await supabase.from('categories').delete().eq('id', categoryId); if (error) { toast.error(`Gagal: ${error.message}`, { id: toastId }); } else { toast.success('Kategori dihapus!', { id: toastId }); } fetchCategories(); } };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Daftar Kategori</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsMergeModalOpen(true)} className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-700">
            <MergeIcon className="h-5 w-5" />
            <span>Gabungkan</span>
          </button>
          <button onClick={() => { setCategoryToEdit(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700">
            <PlusIcon className="h-5 w-5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">Seret dan lepas untuk mengubah urutan kategori di halaman kasir.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr><th scope="col" className="px-2 py-3 w-12"></th><th scope="col" className="px-6 py-3">Nama Kategori</th><th scope="col" className="px-6 py-3"><span className="sr-only">Aksi</span></th></tr>
          </thead>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                  {isLoading ? (
                    <tr><td colSpan="3" className="text-center py-4">Memuat...</td></tr>
                  ) : (
                    categories.map((cat, index) => (
                      <Draggable key={cat.id} draggableId={String(cat.id)} index={index}>
                        {(provided) => (
                          <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-2 py-4 text-center text-gray-400 cursor-grab"><MenuIcon className="h-5 w-5" /></td>
                            <td className="px-6 py-4 font-medium">{cat.name}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-4">
                                <button onClick={() => { setCategoryToEdit(cat); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><PencilIcon className="h-5 w-5"/></button>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5"/></button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </DragDropContext>
        </table>
      </div>
      <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCategory} category={categoryToEdit} />
      <MergeCategoryModal isOpen={isMergeModalOpen} onClose={() => setIsMergeModalOpen(false)} onConfirm={handleMergeCategory} categories={categories} />
    </div>
  );
};
