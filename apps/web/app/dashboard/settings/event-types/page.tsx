'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus, Loader2, ArrowUp, ArrowDown, Save, Trash2, Edit2, X, Tag } from 'lucide-react';
import { useDictionariesStore } from '../../../../store/dictionaries.store';

export default function EventTypesPage() {
  const router = useRouter();
  const { 
    eventTypes, isLoading, fetchDictionaries, 
    createItem, updateItem, deleteItem, reorderItems 
  } = useDictionariesStore();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nazwa: '', kolor: '' });

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ nazwa: '', kolor: '#3b82f6' });

  useEffect(() => {
    fetchDictionaries();
  }, []);

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const list = [...eventTypes];
    if (direction === 'up' && index > 0) {
      [list[index - 1], list[index]] = [list[index], list[index - 1]];
      await reorderItems('typy-wydarzen', list);
    } else if (direction === 'down' && index < list.length - 1) {
      [list[index + 1], list[index]] = [list[index], list[index + 1]];
      await reorderItems('typy-wydarzen', list);
    }
  };

  const handleSaveEdit = async () => {
    if (editingId && editForm.nazwa.trim() !== '') {
      await updateItem('typy-wydarzen', editingId, editForm);
      setEditingId(null);
    }
  };

  const handleSaveNew = async () => {
    if (addForm.nazwa.trim() === '') return alert('Nazwa jest wymagana');
    await createItem('typy-wydarzen', addForm);
    setIsAdding(false);
    setAddForm({ nazwa: '', kolor: '#3b82f6' });
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in-up p-6">
      
      {/* BREADCRUMBS */}
      <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
        <span className="cursor-pointer hover:text-[#00B5B5] font-semibold" onClick={() => router.push('/dashboard')}>Kokpit</span> 
        <ChevronRight size={14} />
        <span className="cursor-pointer hover:text-[#00B5B5] font-semibold" onClick={() => router.push('/dashboard/settings')}>Ustawienia</span> 
        <ChevronRight size={14} />
        <span className="font-bold text-[#00B5B5] border-b-2 border-[#00B5B5] pb-0.5">Typy wydarzeń</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px] p-6">
        
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800">Typy wydarzeń</h2>
            <p className="text-sm text-slate-500 mt-1">Zarządzaj rodzajami eventów. Wybrany kolor będzie widoczny na paskach w Kalendarzu.</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-[#11282D] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition">
            <Plus size={16} /> Dodaj typ
          </button>
        </div>

        <div className="space-y-2">
          {isLoading ? (
             <div className="p-12 flex justify-center text-[#00B5B5]"><Loader2 className="animate-spin w-8 h-8" /></div>
          ) : (
            <>
              {isAdding && (
                <div className="flex items-center gap-4 bg-sky-50 border border-sky-200 p-3 rounded-xl mb-4 shadow-inner">
                  <input type="color" value={addForm.kolor} onChange={e => setAddForm({...addForm, kolor: e.target.value})} className="w-8 h-8 rounded cursor-pointer border border-slate-300" title="Wybierz kolor do kalendarza" />
                  <input type="text" autoFocus placeholder="Nazwa typu (np. Konferencja)" value={addForm.nazwa} onChange={e => setAddForm({...addForm, nazwa: e.target.value})} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold outline-none focus:border-[#00B5B5]" />
                  <button onClick={handleSaveNew} className="p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"><Save size={16}/></button>
                  <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition"><X size={16}/></button>
                </div>
              )}

              {eventTypes.map((typ, index) => (
                <div key={typ.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition shadow-sm group">
                  
                  {editingId === typ.id ? (
                    <div className="flex items-center gap-4 w-full">
                      <input type="color" value={editForm.kolor} onChange={e => setEditForm({...editForm, kolor: e.target.value})} className="w-8 h-8 rounded cursor-pointer border border-slate-300" />
                      <input type="text" value={editForm.nazwa} onChange={e => setEditForm({...editForm, nazwa: e.target.value})} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#00B5B5]" />
                      <button onClick={handleSaveEdit} className="p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"><Save size={16}/></button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition"><X size={16}/></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1 pr-4 border-r border-slate-100 opacity-20 group-hover:opacity-100 transition">
                           <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-[#00B5B5] disabled:opacity-30"><ArrowUp size={14}/></button>
                           <button onClick={() => handleMove(index, 'down')} disabled={index === eventTypes.length - 1} className="text-slate-400 hover:text-[#00B5B5] disabled:opacity-30"><ArrowDown size={14}/></button>
                        </div>
                        
                        <div className="flex items-center justify-center w-8 h-8 bg-slate-50 rounded-lg border border-slate-200" style={{ borderColor: typ.kolor }}>
                           <Tag size={16} color={typ.kolor || '#3b82f6'} />
                        </div>
                        
                        <span className="font-bold text-slate-700">{typ.nazwa}</span>
                      </div>
                      
                      <div className="flex gap-2">
                         <button onClick={() => { setEditingId(typ.id); setEditForm({ nazwa: typ.nazwa, kolor: typ.kolor || '#3b82f6' }); }} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded transition"><Edit2 size={16}/></button>
                         <button onClick={() => { if(confirm('Ukryć ten typ wydarzenia?')) deleteItem('typy-wydarzen', typ.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {eventTypes.length === 0 && !isAdding && !isLoading && (
                <div className="text-center p-8 text-slate-400 font-medium">Brak zdefiniowanych typów wydarzeń.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}