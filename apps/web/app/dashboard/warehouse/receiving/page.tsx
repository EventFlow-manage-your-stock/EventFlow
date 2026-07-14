'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Barcode, Trash2, Save, FileText, Loader2, Info, X } from 'lucide-react';
import { useWarehouseDocsStore } from '../../../../store/warehouse-docs.store';

export default function ReceivingIssuingPage() {
  const router = useRouter();
  const { cart, isLoading, scanCode, removeFromCart, updateCartItemName, clearCart, createDocument } = useWarehouseDocsStore();
  
  const [scanInput, setScanInput] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Utrzymujemy focus na skanerze po wejściu na stronę
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const result = await scanCode(scanInput.trim());
    setNotification({ type: result.success ? 'success' : 'error', text: result.message });
    setScanInput(''); // Czyścimy pole po strzale z czytnika
    
    // Ukrywamy powiadomienie po 3s
    setTimeout(() => setNotification(null), 3000);
    // Automatycznie wracamy fokusem na input
    if (inputRef.current) inputRef.current.focus();
  };

  const handleGenerateDoc = async (typ: 'WZ' | 'PZ') => {
    if (cart.length === 0) return alert('Koszyk jest pusty!');
    try {
      const doc = await createDocument(typ, 'Wygenerowano ze skanera EventFlow');
      // Po wygenerowaniu, otwieramy PDF w nowej karcie
      window.open(`/dashboard/warehouse/documents/${doc.id}/pdf`, '_blank');
    } catch (err) {
      alert('Nie udało się wygenerować dokumentu.');
    }
  };

  // Grupowanie przedmiotów po kategorii dla czytelności UI
  const groupedCart = cart.reduce((acc, curr, idx) => {
    const cat = curr.kategoria;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...curr, originalIndex: idx });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in-up p-6 h-full flex flex-col">
      
      <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
        <span className="cursor-pointer hover:text-[#00B5B5] font-semibold" onClick={() => router.push('/dashboard')}>Kokpit</span> 
        <ChevronRight size={14} />
        <span className="cursor-pointer hover:text-[#00B5B5] font-semibold" onClick={() => router.push('/dashboard/warehouse')}>Magazyn</span> 
        <ChevronRight size={14} />
        <span className="font-bold text-[#00B5B5] border-b-2 border-[#00B5B5] pb-0.5">Wydania i Przyjęcia (Skaner)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        
        {/* LEWA KOLUMNA: Skaner i statusy */}
        <div className="col-span-1 lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <Barcode className="text-[#00B5B5]" /> Skaner sprzętu
          </h2>

          <form onSubmit={handleScanSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Zeskanuj kod sprzętu lub skrzyni</label>
              <div className="relative">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Kliknij tutaj i użyj czytnika..." 
                  className="w-full pl-4 pr-10 py-4 border-2 border-slate-300 rounded-xl outline-none focus:border-[#00B5B5] text-lg font-mono shadow-inner transition-colors"
                  disabled={isLoading}
                  autoComplete="off"
                />
                {isLoading && <Loader2 className="absolute right-3 top-4 animate-spin text-slate-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <Info size={12}/> Zeskanowanie CASE automatycznie wyciągnie z niego sprzęt.
              </p>
            </div>
            
            <button type="submit" disabled={!scanInput || isLoading} className="w-full bg-[#11282D] text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-50">
              Szukaj w bazie (Enter)
            </button>
          </form>

          {notification && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {notification.type === 'error' ? <X size={20} /> : <Save size={20} />}
              {notification.text}
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6">
             <div className="flex justify-between items-center mb-4">
               <span className="text-sm font-bold text-slate-700">W koszyku:</span>
               <span className="bg-[#00B5B5]/10 text-[#00B5B5] px-3 py-1 rounded-lg font-black text-lg">{cart.length} szt.</span>
             </div>
             
             <div className="flex flex-col gap-3">
               <button onClick={() => handleGenerateDoc('WZ')} disabled={cart.length === 0} className="flex items-center justify-center gap-2 w-full bg-[#00B5B5] text-white font-bold py-3 rounded-xl hover:bg-teal-400 transition shadow-md disabled:opacity-50">
                 <FileText size={18} /> Generuj WZ (Wydanie)
               </button>
               <button onClick={() => handleGenerateDoc('PZ')} disabled={cart.length === 0} className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-400 transition shadow-md disabled:opacity-50">
                 <FileText size={18} /> Generuj PZ (Przyjęcie)
               </button>
               <button onClick={clearCart} disabled={cart.length === 0} className="flex items-center justify-center gap-2 w-full bg-white border border-red-200 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 transition disabled:opacity-50 mt-2">
                 <Trash2 size={18} /> Wyczyść listę
               </button>
             </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA: Koszyk/Lista Skanowania */}
        <div className="col-span-1 lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-lg">Zeskanowane pozycje na dokument</h3>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                <Barcode size={64} className="mb-4 opacity-20" />
                <p className="font-bold text-lg text-slate-500">Brak pozycji</p>
                <p className="text-sm mt-1 text-center">Zeskanuj kod urządzenia, aby dodać sprzęt do listy gotowej na wydrukowanie dokumentu.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedCart).map(([kategoria, pozycje]) => (
                  <div key={kategoria} className="mb-6">
                    <h4 className="font-black text-slate-800 text-sm mb-3 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00B5B5]"></span> {kategoria}
                    </h4>
                    <div className="space-y-2">
                      {pozycje.map((poz) => (
                        <div key={poz.originalIndex} className="flex items-center gap-4 bg-white border border-slate-200 p-3 rounded-xl hover:border-[#00B5B5]/50 transition group">
                          
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value={poz.nazwa_na_dokumencie}
                              onChange={(e) => updateCartItemName(poz.originalIndex, e.target.value)}
                              className="font-bold text-sm text-sky-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#00B5B5] outline-none w-full px-1 py-0.5 transition"
                              title="Kliknij, aby zmienić nazwę widoczną na dokumencie WZ/PZ"
                            />
                            <div className="flex gap-3 text-[11px] font-mono text-slate-400 px-1 mt-1">
                              {poz.sn && <span>SN: {poz.sn}</span>}
                              {poz.numer_urzadzenia && <span>NR: {poz.numer_urzadzenia}</span>}
                              {poz.kod_kreskowy && <span>KOD: {poz.kod_kreskowy}</span>}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-4">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black">
                              1 szt.
                            </span>
                            <button onClick={() => removeFromCart(poz.originalIndex)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}