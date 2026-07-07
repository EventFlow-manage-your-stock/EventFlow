'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar, Star, FileText, DollarSign, AlertTriangle, MessageSquare, Plus,
  Box, Truck, Wrench, Users, ArrowRight, CheckCircle2, Navigation, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/dashboard/summary');
        setData(res.data);
      } catch (error) {
        console.error('Błąd pobierania danych dashboardu', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Konfiguracja kafelków modułów - ze zintegrowanymi linkami do już utworzonych stron
  const modules = [
    { title: 'Magazyn', desc: 'Modele, egzemplarze, rezerwacje, braki i stany.', icon: Box, href: '/dashboard/warehouse' },
    { title: 'Wydarzenia', desc: 'Kalendarz, etapy, plan realizacji i checklisty.', icon: Calendar, href: '/dashboard/calendar' },
    { title: 'Oferty', desc: 'Edycje, sale, budżety, PDF i akceptacje.', icon: FileText, href: '#' },
    { title: 'Wynajmy', desc: 'Wydania, zwroty, konflikty i kompletacja.', icon: Truck, href: '#' },
    { title: 'Serwis', desc: 'Zgłoszenia pilne, naprawy, historia sprzętu.', icon: Wrench, href: '#' },
    { title: 'CRM', desc: 'Kontrahenci, kontakty, miejsca i notatki.', icon: Users, href: '#' },
  ];

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center text-slate-500 flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#00B5B5]" />
        <p className="text-sm font-bold animate-pulse">Ładowanie kokpitu operacyjnego...</p>
      </div>
    );
  }

  const { kpis, todaysEvents, alerts } = data || {};
  const smartFlowAlert = alerts?.find((a: any) => a.type === 'smart-flow');
  const regularAlerts = alerts?.filter((a: any) => a.type !== 'smart-flow') || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in-up">
      
      {/* HEADER KOKPITU */}
      <div className="flex items-end justify-between mb-8 mt-2">
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-1">Kokpit Operacyjny</h3>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dzisiaj w EventFlow</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Jedno miejsce do kontroli wydarzeń, magazynu, ofert, wynajmów i serwisu. Panel jest zaprojektowany tak, żeby użytkownik od razu wiedział, co wymaga uwagi.
          </p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/events/new')}
          className="flex items-center gap-2 bg-[#11282D] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition"
        >
          <Plus size={16} /> Nowe wydarzenie
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#00B5B5]/50 transition cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl bg-slate-50 text-sky-500 group-hover:scale-110 transition-transform`}>
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{kpis?.eventsThisWeek || 0}</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">Wydarzenia w tym tygodniu</p>
          </div>
        </div>

        <div onClick={() => router.push('/dashboard/warehouse')} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#00B5B5]/50 transition cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl bg-slate-50 text-emerald-500 group-hover:scale-110 transition-transform`}>
              <Box size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{kpis?.availableEquipmentPercent || 0}%</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">Sprzęt dostępny</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#00B5B5]/50 transition cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl bg-slate-50 text-blue-500 group-hover:scale-110 transition-transform`}>
              <FileText size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{kpis?.openOffers || 0}</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">Otwarte oferty</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#00B5B5]/50 transition cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl bg-slate-50 text-teal-500 group-hover:scale-110 transition-transform`}>
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{kpis?.plannedRevenue || 0}</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">Przychód planowany</p>
          </div>
        </div>
      </div>

      {/* ŚRODKOWA SEKCJA */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEWA: WYDARZENIA DZISIAJ */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-800">Wydarzenia dzisiaj</h2>
            <button onClick={() => router.push('/dashboard/calendar')} className="text-xs font-bold text-[#00B5B5] hover:underline">Zobacz wszystkie</button>
          </div>
          
          <div className="space-y-6">
            {todaysEvents?.length > 0 ? todaysEvents.map((event: any) => (
              <div key={event.id} onClick={() => router.push(`/dashboard/events/${event.id}`)} className="group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-[#00B5B5] transition">{event.title}</h3>
                      <span className="text-[10px] font-bold text-[#00B5B5] bg-[#00B5B5]/10 px-2 py-0.5 rounded-full">{event.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{event.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-slate-800">{event.revenue}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#00B5B5] h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${event.progress}%` }}
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200">
                    {event.manager}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 text-sm font-semibold">
                Brak wydarzeń na dzisiaj. Czas na kawę! ☕
              </div>
            )}
          </div>
        </div>

        {/* PRAWA: ALERTY / SMART FLOW */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
               <h2 className="text-lg font-black text-slate-800">Co wymaga uwagi</h2>
            </div>
            
            <div className="p-4 flex-1">
              {smartFlowAlert ? (
                <div className="bg-[#11282D] rounded-xl p-4 mb-4 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="flex items-center gap-2 text-white mb-2 relative z-10">
                    <Star size={16} className="fill-teal-400 text-teal-400" />
                    <h3 className="text-sm font-bold">Smart Flow</h3>
                  </div>
                  <p className="text-xs text-slate-300 mb-4 relative z-10 leading-relaxed">
                    {smartFlowAlert.message}
                  </p>
                  <button className="bg-[#00B5B5] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-400 transition shadow-sm w-max">
                    {smartFlowAlert.actionText}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4 text-emerald-600 text-xs font-bold text-center">
                  Smart Flow nie wykrył zagrożeń budżetowych.
                </div>
              )}

              <ul className="space-y-3">
                {regularAlerts.length > 0 ? regularAlerts.map((alert: any) => (
                  <li key={alert.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition cursor-pointer">
                    {alert.type === 'warning' && <Wrench size={16} className="text-red-500 mt-0.5 shrink-0" />}
                    {alert.type === 'info' && <MessageSquare size={16} className="text-sky-500 mt-0.5 shrink-0" />}
                    <span className="text-xs font-semibold text-slate-600 leading-snug">{alert.message}</span>
                  </li>
                )) : (
                  <li className="text-center py-4 text-slate-400 text-sm">Wszystko pod kontrolą!</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map((mod, idx) => (
          <div 
            key={idx} 
            onClick={() => router.push(mod.href)}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#00B5B5]/50 transition cursor-pointer group flex justify-between items-center"
          >
             <div className="flex flex-col gap-2">
               <div className="p-2.5 bg-slate-50 w-max rounded-xl text-slate-500 group-hover:text-[#00B5B5] group-hover:bg-[#00B5B5]/10 transition-colors">
                 <mod.icon size={20} />
               </div>
               <h3 className="text-[15px] font-black text-slate-800">{mod.title}</h3>
               <p className="text-[11px] font-semibold text-slate-400 leading-relaxed max-w-[200px]">{mod.desc}</p>
             </div>
             <ArrowRight size={20} className="text-slate-300 group-hover:text-[#00B5B5] group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>

    </div>
  );
}