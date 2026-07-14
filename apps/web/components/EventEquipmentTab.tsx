'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useEventEquipmentStore } from '../store/event-equipment.store';
import { Barcode, CheckCircle2, AlertTriangle, Printer, Loader2, X, Plus, LogOut, LogIn, FileText } from 'lucide-react';

interface Props {
  eventId: number;
}

export function EventEquipmentTab({ eventId }: Props) {
  const { 
    podsumowanie, dokumenty, koszyk, mode, isLoading, 
    setMode, fetchSprzetWydarzenia, scanCode, removeFromCart, clearCart, saveDocument 
  } = useEventEquipmentStore();

  const [scanInput, setScanInput] = useState('');
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' | 'warning' } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSprzetWydarzenia(eventId);
  }, [eventId]);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const result = await scanCode(scanInput.trim());
    setMsg({ text: result.message, type: result.success ? (result.isWarning ? 'warning' : 'success') : 'error' });
    setScanInput('');
    setTimeout(() => setMsg(null), 4000);
    inputRef.current?.focus();
  };

  const handleSave = async () => {
    if (koszyk.length === 0) return;
    try {
      const doc = await saveDocument(eventId);
      window.open(`/dashboard/warehouse/documents/${doc.id}/pdf`, '_blank');
      setMsg({ text: `Zapisano i wygenerowano dokument ${mode}!`, type: 'success' });
    } catch (err) {
      setMsg({ text: 'Błąd podczas zapisywania dokumentu.', type: 'error' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEWA KOLUMNA: Skaner i Koszyk */}
      <div className="col-span-1 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
        
        {/* Przełącznik WZ / PZ */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
           <button 
             onClick={() => setMode('WZ')} 
             className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition ${mode === 'WZ' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <LogOut size={16}/> Wydaj z magazynu (WZ)
           </button>
           <button 
             onClick={() => setMode('PZ')} 
             className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition ${mode === 'PZ' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <LogIn size={16}/> Przyjmij z eventu (PZ)
           </button>
        </div>

        <form onSubmit={handleScanSubmit} className="mb-6">
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skanuj kody (S/N, QR, Barcode)</label>
           <div className="relative">
             <input 
               ref={inputRef}
               type="text" 
               value={scanInput}
               onChange={e => setScanInput(e.target.value)}
               className="w-full pl-4 pr-10 py-3 border-2 border-slate-300 rounded-xl outline-none focus:border-[#00B5B5] font-mono text-lg transition"
               placeholder="Kliknij i skanuj..."
               autoFocus
             />
             <Barcode className="absolute right-3 top-3.5 text-slate-400" />
           </div>
        </form>

        {msg && (
          <div className={`p-4 rounded-xl text-sm font-bold mb-6 flex items-start gap-3 border ${msg.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : msg.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
            {msg.type === 'warning' && <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
            {msg.text}
          </div>
        )}

        <div className="border-t border-slate-200 pt-4">
           <h3 className="font-bold text-slate-700 mb-3 flex justify-between items-center">
             Bieżący koszyk ({mode})
             <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs">{koszyk.length} szt.</span>
           </h3>
           
           <div className="max-h-[300px] overflow-y-auto space-y-2 mb-4 custom-scrollbar pr-2">
             {koszyk.length === 0 ? (
                <div className="text-center text-slate-400 text-sm p-4 border border-dashed border-slate-200 rounded-lg">Koszyk jest pusty</div>
             ) : (
               koszyk.map((k, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm group">
                   <div className="truncate pr-2 font-medium text-slate-700">
                     {k.nazwa}
                     <div className="text-[10px] font-mono text-slate-400 mt-0.5">KOD: {k.kod_kreskowy || k.sn || k.id_egzemplarza}</div>
                   </div>
                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><X size={16}/></button>
                 </div>
               ))
             )}
           </div>

           <button 
             onClick={handleSave} 
             disabled={koszyk.length === 0 || isLoading}
             className="w-full flex items-center justify-center gap-2 bg-[#11282D] text-white py-3 rounded-xl font-bold shadow-md hover:bg-slate-800 transition disabled:opacity-50"
           >
             {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Printer size={18}/>} 
             Zapisz i Drukuj {mode}
           </button>
        </div>
      </div>

      {/* PRAWA KOLUMNA: Arkusz kompletacji (Plan vs Realizacja) */}
      <div className="col-span-1 lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-[600px]">
         <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
           <h3 className="font-black text-slate-800 text-lg">Arkusz kompletacji (Checklista)</h3>
         </div>

         <div className="overflow-x-auto p-0 flex-1">
           <table className="w-full text-left text-sm whitespace-nowrap">
             <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="p-4 font-bold text-slate-500 text-xs uppercase">Sprzęt (Model)</th>
                 <th className="p-4 font-bold text-slate-500 text-xs uppercase text-center">Zapotrzebowanie</th>
                 <th className="p-4 font-bold text-slate-500 text-xs uppercase text-center">Wydano (WZ)</th>
                 <th className="p-4 font-bold text-slate-500 text-xs uppercase text-center">Przyjęto (PZ)</th>
                 <th className="p-4 font-bold text-slate-500 text-xs uppercase text-center">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {podsumowanie.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="p-12 text-center text-slate-400">Brak zaplanowanego sprzętu. Dodaj sprzęt w zakładce Oferty lub Wynajmy.</td>
                 </tr>
               ) : (
                 podsumowanie.map((row, idx) => {
                   // Logika kolorowania i ikon dla postępu
                   const wydanoWszystko = row.wydano >= row.zaplanowano;
                   const zwroconoWszystko = row.przyjeto >= row.wydano && row.wydano > 0;
                   
                   return (
                     <tr key={idx} className="hover:bg-slate-50 transition">
                       <td className="p-4 font-bold text-slate-700">{row.model.nazwa} <div className="text-[10px] text-slate-400 mt-0.5">{row.model.kategoria?.nazwa}</div></td>
                       <td className="p-4 text-center font-mono font-black text-slate-800">{row.zaplanowano}</td>
                       <td className={`p-4 text-center font-mono font-bold ${wydanoWszystko ? 'text-emerald-600 bg-emerald-50/50' : 'text-amber-600'}`}>{row.wydano}</td>
                       <td className={`p-4 text-center font-mono font-bold ${zwroconoWszystko ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-600'}`}>{row.przyjeto}</td>
                       <td className="p-4 text-center">
                         {zwroconoWszystko ? (
                           <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase"><CheckCircle2 size={12}/> Zakończono</span>
                         ) : wydanoWszystko ? (
                           <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Wydane (w terenie)</span>
                         ) : (
                           <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Do spakowania</span>
                         )}
                       </td>
                     </tr>
                   )
                 })
               )}
             </tbody>
           </table>
         </div>
         
         {/* Dokumenty Historyczne Eventu */}
         <div className="bg-slate-50 p-5 rounded-b-xl border-t border-slate-200">
           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Wygenerowane dokumenty dla tego eventu</h4>
           <div className="flex gap-2 flex-wrap">
             {dokumenty.map((doc: any) => (
               <a key={doc.id} href={`/dashboard/warehouse/documents/${doc.id}/pdf`} target="_blank" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition shadow-sm ${doc.typ === 'WZ' ? 'bg-white border-sky-200 text-sky-700 hover:bg-sky-50' : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
                 <FileText size={14}/> {doc.numer}
               </a>
             ))}
             {dokumenty.length === 0 && <span className="text-xs text-slate-400">Brak dokumentów</span>}
           </div>
         </div>

      </div>
    </div>
  );
}