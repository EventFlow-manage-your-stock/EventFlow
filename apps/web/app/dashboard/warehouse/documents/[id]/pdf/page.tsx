'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { api } from '../../../../../../lib/api';
import Barcode from 'react-barcode';

export default function DocumentPdfViewPage() {
  const params = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/api/magazyn/dokumenty/${params.id}`);
        setDoc(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
  }, [params.id]);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00B5B5] w-8 h-8" /></div>;
  if (!doc) return <div className="h-screen flex items-center justify-center text-red-500 font-bold">Nie znaleziono dokumentu.</div>;

  // Grupujemy pobrane z bazy pozycje wg kategorii (Zgodnie z wymaganiami V14)
  const groupedItems = doc.pozycje.reduce((acc: any, curr: any) => {
    const kategoria = curr.model?.kategoria?.nazwa || 'Brak kategorii';
    if (!acc[kategoria]) acc[kategoria] = [];
    acc[kategoria].push(curr);
    return acc;
  }, {});

  const fullDocName = doc.typ === 'WZ' ? 'Wydanie Zewnętrzne (WZ)' : doc.typ === 'PZ' ? 'Przyjęcie Zewnętrzne (PZ)' : 'Dokument Magazynowy';

  return (
    <div className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white text-slate-800 text-sm font-sans">
      
      {/* Pasek narzędzi (niewidoczny na wydruku) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <button onClick={() => window.close()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition">
          <ArrowLeft size={16} /> Zamknij kartę
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#11282D] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition">
          <Printer size={16} /> Drukuj do PDF
        </button>
      </div>

      {/* ARKUSZ A4 */}
      <div className="max-w-4xl mx-auto bg-white p-12 print:p-0 print:shadow-none shadow-xl border border-slate-200 print:border-none rounded-sm min-h-[1050px]">
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-[#11282D] pb-8 mb-8">
          <div>
             <h1 className="text-3xl font-black text-[#11282D] tracking-tight">{fullDocName}</h1>
             <p className="text-lg font-semibold text-slate-500 mt-1">NR: {doc.numer}</p>
          </div>
          <div className="text-right">
             <div className="text-2xl font-black text-[#00B5B5] tracking-tighter">EventFlow</div>
             <p className="text-slate-500 mt-2 text-xs font-semibold">Data wygenerowania: <br/><span className="text-slate-800">{new Date(doc.data_dokumentu).toLocaleString()}</span></p>
          </div>
        </div>

        {/* INFO ZBIORCZE */}
        <div className="grid grid-cols-2 gap-8 mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div>
             <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Powiązanie</h3>
             {doc.wydarzenie ? (
               <div className="font-bold text-base text-slate-800">{doc.wydarzenie.nazwa}</div>
             ) : doc.wynajem ? (
               <div className="font-bold text-base text-slate-800">Wynajem sprzętu #{doc.wynajem.id}</div>
             ) : (
               <div className="font-medium text-slate-500 italic">Brak przypisanego wydarzenia</div>
             )}
          </div>
          <div>
             <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Dokument wystawił(a)</h3>
             <div className="font-bold text-base text-slate-800">{doc.tworca.imie} {doc.tworca.nazwisko}</div>
          </div>
        </div>

        {/* TABELA POZYCJI WRAZ Z KATEGORIAMI */}
        <div className="mb-12">
          {Object.entries(groupedItems).map(([catName, items]: [string, any]) => (
            <div key={catName} className="mb-6 page-break-inside-avoid">
              <h2 className="bg-[#11282D] text-white font-bold py-2 px-4 rounded-t-lg text-sm">{catName}</h2>
              <table className="w-full border-x border-b border-slate-200 text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Nazwa Sprzętu / Model</th>
                    <th className="py-3 px-4 w-40 text-center">Kody weryfikacyjne</th>
                    <th className="py-3 px-4 w-24 text-center">Ilość</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {items.map((item: any, idx: number) => {
                     // Wyciąganie kodu do Barkodu
                     const barValue = item.egzemplarz?.kod_kreskowy || item.egzemplarz?.sn || `EV${item.id}`;

                     return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {item.nazwa_na_dokumencie || item.model?.nazwa}
                          {item.egzemplarz?.sn && <div className="text-[10px] font-medium text-slate-400 mt-1 font-mono">SN: {item.egzemplarz.sn}</div>}
                        </td>
                        <td className="py-2 px-4 text-center bg-white border-l border-r border-slate-50">
                          <div className="flex justify-center scale-[0.65] origin-center -my-3">
                            <Barcode value={barValue} width={1.8} height={40} fontSize={12} margin={0} background="transparent" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-black text-slate-800 text-lg">
                          {Number(item.ilosc)} <span className="text-xs font-semibold text-slate-400">szt.</span>
                        </td>
                      </tr>
                     )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* PODSUMOWANIE ILOŚCIOWE I NOTATKI */}
        <div className="flex justify-between items-end">
          <div className="w-1/2">
            {doc.notatki && (
              <div className="text-sm">
                <span className="block font-bold text-slate-800 mb-1">Uwagi do dokumentu:</span>
                <span className="text-slate-600 whitespace-pre-wrap">{doc.notatki}</span>
              </div>
            )}
          </div>
          <div className="text-right">
             <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Łącznie sztuk na dokumencie</div>
             <div className="text-3xl font-black text-[#00B5B5]">
                {doc.pozycje.reduce((sum: number, p: any) => sum + Number(p.ilosc), 0)} szt.
             </div>
          </div>
        </div>

        {/* MIEJSCE NA PODPIS (V14) */}
        <div className="mt-32 pt-8 border-t border-slate-200 grid grid-cols-2 gap-20 text-center break-inside-avoid">
           <div>
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wydający (Podpis)</span>
           </div>
           <div>
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Odbierający (Podpis)</span>
           </div>
        </div>

      </div>
    </div>
  );
}