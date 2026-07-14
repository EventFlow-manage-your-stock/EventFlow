'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus, Loader2, ArrowUp, ArrowDown, Save, Trash2, Edit2, CheckCircle2, Box, FileText, Settings, X } from 'lucide-react';
import { useDictionariesStore } from '../../../../store/dictionaries.store';

export default function OperationalStatusesPage() {
  const router = useRouter();
  const { 
    eventStatuses, warehouseStatuses, accountingStatuses, isLoading, 
    fetchDictionaries, createItem, updateItem, deleteItem, reorderItems 
  } = useDictionariesStore();

  const [activeTab, setActiveTab] = useState<'statusy-wydarzenia' | 'statusy-magazynowe' | 'statusy-ksiegowe'>('statusy-wydarzenia');
  
  // Stan do edycji in-line
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nazwa: '', kolor: '', ikona: '' });

  // Stan do dodawania nowego
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ nazwa: '', kolor: '#00B5B5', ikona: 'circle' });

  useEffect(() => {
    fetchDictionaries();
  }, []);

  const getActiveList = () => {
    if (activeTab === 'statusy-wydarzenia') return eventStatuses;
    if (activeTab === 'statusy-magazynowe') return warehouseStatuses;
    return accountingStatuses;
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const list = [...getActiveList()];
    if (direction === 'up' && index > 0) {
      [list[index - 1], list[index]] = [list[index], list[index - 1]];
      await reorderItems(activeTab, list);
    } else if (direction === 'down' && index < list.length - 1) {
      [list[index + 1], list[index]] = [list[index], list[index + 1]];
      await reorderItems(activeTab, list);
    }
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      await updateItem(activeTab, editingId, editForm);
      setEditingId(null);
    }
  };

  const handleSaveNew = async () => {
    if (addForm.nazwa.trim() === '') return alert('Nazwa jest wymagana');
    await createItem(activeTab, addForm);
    setIsAdding(false);
    setAddForm({ nazwa: '', kolor: '#00B5B5', ikona: 'circle' });
  };

  const renderIcon = (iconName: string, color: string) => {
    // Prosty mapper nazw na ikony Lucide. W systemie można go dowolnie rozbudowywać.
    switch (iconName) {
      case 'check': return <CheckCircle2 size={16} color={color} />;
      case 'box': return <Box size={16} color={color} />;
      case 'file': return <FileText size={16} color={color} />;
      case 'settings': return <Settings size={16} color={color} />;
      default: return <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>; // circle
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in-up p-6">
      
      {/* BREADCRUMBS */}
      <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
        <span className="cursor-pointer hover:text-[#00B5B5] font-semibold" onClick={() => router.push('/dashboard')}>Kokpit</span> 
        <ChevronRight size={14} />
        <span className="cursor-pointer hover:text-[#00B5B5] font-semibold" onClick={() => router.push('/dashboard/settings')}>Ustawienia</span> 
        <ChevronRight size={14} />
        <span className="font-bold text-[#00B5B5] border-b-2 border-[#00B5B5] pb-0.5">Statusy operacyjne</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button onClick={() => setActiveTab('statusy-wydarzenia')} className={`px-6 py-4 text-sm font-bold transition border-b-2 ${activeTab === 'statusy-wydarzenia' ? 'border-[#00B5B5] text-[#00B5B5] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>Główne statusy wydarzeń</button>
          <button onClick={() => setActiveTab('statusy-magazynowe')} className={`px-6 py-4 text-sm font-bold transition border-b-2 ${activeTab === 'statusy-magazynowe' ? 'border-[#00B5B5] text-[#00B5B5] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>Statusy magazynowe</button>
          <button onClick={() => setActiveTab('statusy-ksiegowe')} className={`px-6 py-4 text-sm font-bold transition border-b-2 ${activeTab === 'statusy-ksiegowe' ? 'border-[#00B5B5] text-[#00B5B5] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>Statusy księgowe</button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800">
              {activeTab === 'statusy-wydarzenia' && 'Główne statusy wydarzeń'}
              {activeTab === 'statusy-magazynowe' && 'Statusy operacyjne magazynu'}
              {activeTab === 'statusy-ksiegowe' && 'Statusy dokumentów księgowych'}
            </h2>
            <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-[#11282D] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition">
              <Plus size={16} /> Dodaj status
            </button>
          </div>

          <div className="space-y-2">
            {isLoading ? (
               <div className="p-12 flex justify-center text-[#00B5B5]"><Loader2 className="animate-spin w-8 h-8" /></div>
            ) : (
              <>
                {/* Wiersz dodawania */}
                {isAdding && (
                  <div className="flex items-center gap-4 bg-sky-50 border border-sky-200 p-3 rounded-xl mb-4 shadow-inner">
                    <input type="color" value={addForm.kolor} onChange={e => setAddForm({...addForm, kolor: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
                    <select value={addForm.ikona} onChange={e => setAddForm({...addForm, ikona: e.target.value})} className="px-3 py-2 rounded border border-slate-300 text-sm outline-none">
                      <option value="circle">Kropka</option>
                      <option value="check">Zatwierdzony (Check)</option>
                      <option value="box">Pudełko (WMS)</option>
                      <option value="file">Dokument</option>
                      <option value="settings">W naprawie (Tryb)</option>
                    </select>
                    <input type="text" autoFocus placeholder="Nazwa statusu" value={addForm.nazwa} onChange={e => setAddForm({...addForm, nazwa: e.target.value})} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold outline-none focus:border-[#00B5B5]" />
                    <button onClick={handleSaveNew} className="p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"><Save size={16}/></button>
                    <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition"><X size={16}/></button>
                  </div>
                )}

                {/* Lista */}
                {getActiveList().map((status, index) => (
                  <div key={status.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition shadow-sm group">
                    
                    {editingId === status.id ? (
                      <div className="flex items-center gap-4 w-full">
                        <input type="color" value={editForm.kolor} onChange={e => setEditForm({...editForm, kolor: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
                        <select value={editForm.ikona} onChange={e => setEditForm({...editForm, ikona: e.target.value})} className="px-3 py-2 rounded border border-slate-300 text-sm outline-none">
                          <option value="circle">Kropka</option>
                          <option value="check">Zatwierdzony (Check)</option>
                          <option value="box">Pudełko (WMS)</option>
                          <option value="file">Dokument</option>
                          <option value="settings">W naprawie (Tryb)</option>
                        </select>
                        <input type="text" value={editForm.nazwa} onChange={e => setEditForm({...editForm, nazwa: e.target.value})} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#00B5B5]" />
                        <button onClick={handleSaveEdit} className="p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"><Save size={16}/></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition"><X size={16}/></button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1 pr-4 border-r border-slate-100 opacity-20 group-hover:opacity-100 transition">
                             <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-[#00B5B5] disabled:opacity-30"><ArrowUp size={14}/></button>
                             <button onClick={() => handleMove(index, 'down')} disabled={index === getActiveList().length - 1} className="text-slate-400 hover:text-[#00B5B5] disabled:opacity-30"><ArrowDown size={14}/></button>
                          </div>
                          
                          <div className="flex items-center justify-center w-8 h-8 bg-slate-50 rounded-lg border border-slate-100">
                             {renderIcon(status.ikona || 'circle', status.kolor || '#94a3b8')}
                          </div>
                          
                          <span className="font-bold text-slate-700">{status.nazwa}</span>
                        </div>
                        
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingId(status.id); setEditForm({ nazwa: status.nazwa, kolor: status.kolor || '#94a3b8', ikona: status.ikona || 'circle' }); }} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded transition"><Edit2 size={16}/></button>
                           <button onClick={() => { if(confirm('Ukryć ten status?')) deleteItem(activeTab, status.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}