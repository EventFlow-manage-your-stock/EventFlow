'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Plus, Loader2 } from 'lucide-react';
import { useServiceStore } from '../../../store/serwis.store';

// Helper do formatowania daty jak na makiecie
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;

  // Sprawdzamy czy to ten sam dzień (ignoring timezone edge cases for UI simplicity)
  if (date.toDateString() === now.toDateString()) {
    return `dzisiaj ${timeString}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `wczoraj ${timeString}`;
  }

  if (diffDays > 0) {
    return `${diffDays} dni temu`;
  }

  return date.toLocaleDateString('pl-PL');
};

const getStatusColor = (statusName: string, defaultColor: string) => {
  const name = statusName?.toLowerCase() || '';
  if (name.includes('pilne')) return 'text-red-500 bg-red-50';
  if (name.includes('napraw')) return 'text-amber-500 bg-amber-50';
  if (name.includes('gotow')) return 'text-emerald-500 bg-emerald-50';
  return defaultColor ? `text-[${defaultColor}] bg-slate-50` : 'text-slate-500 bg-slate-100';
};

export default function ServicePage() {
  const router = useRouter();
  const { tickets, fetchTickets, isLoading } = useServiceStore();

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in-up">
      
      {/* HEADER */}
      <div className="flex items-end justify-between mb-8 mt-2">
        <div>
          <h3 className="text-[11px] font-bold text-sky-600 tracking-widest uppercase mb-1">Serwis</h3>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Zgłoszenia sprzętu</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Prosty moduł serwisowy: kto zgłosił, kiedy, status, kto rozwiązał i opis rozwiązania.
          </p>
        </div>
        {/* W przyszłości link do /dashboard/service/new */}
        <button className="flex items-center gap-2 bg-[#11282D] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition">
          <Plus size={16} /> Dodaj zgłoszenie
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center text-slate-400">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            const sprzet = ticket.egzemplarz;
            const sprzetName = sprzet ? `${sprzet.model?.nazwa} #${sprzet.numer_urzadzenia || sprzet.sn}` : 'Nieznany sprzęt';
            const reporterName = ticket.zglosil ? `${ticket.zglosil.imie} ${ticket.zglosil.nazwisko?.charAt(0)}.` : 'Nieznany';
            const statusStyle = getStatusColor(ticket.status?.nazwa, ticket.status?.kolor);

            return (
              <div 
                key={ticket.id}
                onClick={() => router.push(`/dashboard/service/${ticket.id}`)}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-[#00B5B5]/30 transition cursor-pointer flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-sky-50 rounded-full text-sky-500">
                      <Wrench size={16} />
                    </div>
                    {ticket.status && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${statusStyle}`}>
                        {ticket.status.nazwa}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[15px] font-black text-slate-800 mb-1">{ticket.tytul}</h3>
                  <p className="text-xs font-semibold text-slate-400">{sprzetName}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mt-4 text-[11px] font-semibold text-slate-500 flex flex-col gap-1">
                  <p><span className="text-slate-400">Zgłosił:</span> <span className="text-slate-700">{reporterName}</span></p>
                  <p><span className="text-slate-400">Kiedy:</span> <span className="text-slate-700">{formatRelativeTime(ticket.data_zgloszenia)}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && tickets.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-semibold bg-white border border-slate-200 rounded-2xl border-dashed">
          Brak aktywnych zgłoszeń serwisowych.
        </div>
      )}
    </div>
  );
}