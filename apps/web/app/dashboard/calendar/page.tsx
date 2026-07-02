'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Search, 
  Users, AlertTriangle, CheckCircle2,
  X, CalendarDays, Clock, Tag, Trash2, Edit2 // Nowe ikony dla Modala
} from 'lucide-react';
import { 
  addMonths, subMonths, format, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, startOfDay, endOfDay, isBefore
} from 'date-fns';
import { pl } from 'date-fns/locale';

// --- TYPY DANYCH ---
type EventFlag = 'vehicle' | 'users' | 'unconfirmed' | 'warning' | 'checked';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  colorClass: string;
  flags?: EventFlag[];
}

interface ProcessedEvent extends CalendarEvent {
  _row: number;
}

// --- MOCK DATA ---
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Zamek/ Wystawa AI - Algorytmy Iluzji',
    startDate: new Date(2026, 6, 1), 
    endDate: new Date(2026, 6, 14),
    colorClass: 'bg-teal-500',
    flags: ['checked']
  },
  {
    id: '2',
    title: 'Urlop | Antoni Pazder',
    startDate: new Date(2026, 6, 2),
    endDate: new Date(2026, 6, 8),
    colorClass: 'bg-slate-700',
  },
  {
    id: '3',
    title: 'Visual Rent/ 4x vokkero',
    startDate: new Date(2026, 5, 29), 
    endDate: new Date(2026, 6, 3),
    colorClass: 'bg-green-600',
    flags: ['checked']
  },
  {
    id: '4',
    title: 'Naprawa sprzętu + wymiana oleju',
    startDate: new Date(2026, 6, 6),
    endDate: new Date(2026, 6, 10),
    colorClass: 'bg-red-800',
    flags: ['warning']
  },
  {
    id: '5',
    title: 'Solaris/ spotkanie z pracownikami',
    startDate: new Date(2026, 6, 8),
    endDate: new Date(2026, 6, 10),
    colorClass: 'bg-orange-500',
    flags: ['users']
  }
];

const WEEKDAYS = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'NDZ'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  
  // --- NOWE STANY DLA MODALA ---
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Funkcja otwierająca modal (zatrzymuje propagację, by nie klikać w tło dnia)
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 200); // Czyści stan po animacji zamknięcia
  };

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const processedEvents = useMemo(() => {
    const sorted = [...MOCK_EVENTS].sort((a, b) => {
      const aStart = startOfDay(a.startDate).getTime();
      const bStart = startOfDay(b.startDate).getTime();
      if (aStart !== bStart) return aStart - bStart;
      return (b.endDate.getTime() - b.startDate.getTime()) - (a.endDate.getTime() - a.startDate.getTime());
    });

    const rowEndDates: number[] = [];
    return sorted.map(event => {
      const start = startOfDay(event.startDate).getTime();
      const end = startOfDay(event.endDate).getTime();
      let rowIndex = 0;
      while (rowEndDates[rowIndex] !== undefined && start <= rowEndDates[rowIndex]) {
        rowIndex++;
      }
      rowEndDates[rowIndex] = end;
      return { ...event, _row: rowIndex } as ProcessedEvent;
    });
  }, []);

  const today = new Date();

  return (
    <div className="flex h-full flex-col gap-4 relative">
      
      {/* GÓRNY PASEK NARZĘDZI */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-slate-900/50 dark:backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-white/10 transition">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-white w-40 text-center">
              {format(currentDate, 'LLLL yyyy', { locale: pl })}
            </h1>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-white/10 transition">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="hidden h-8 items-center rounded-lg border border-slate-200 bg-slate-50 p-1 md:flex dark:border-white/10 dark:bg-black/20">
            {(['month', 'week', 'day', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${
                  view === v 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {v === 'month' ? 'Miesiąc' : v === 'week' ? 'Tydzień' : v === 'day' ? 'Dzień' : 'Lista'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-black/20">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Wyszukaj..." 
              className="w-32 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg dark:shadow-none">
            <Plus size={16} /> Dodaj
          </button>
        </div>
      </div>

      {/* SIATKA KALENDARZA */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/5 dark:bg-slate-900/50">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-black/20">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-7 grid-rows-5 auto-rows-fr overflow-y-auto custom-scrollbar">
          {calendarDays.map((day) => {
            const dayTime = startOfDay(day).getTime();
            
            const dayEvents = processedEvents.filter(event => {
              const eStart = startOfDay(event.startDate).getTime();
              const eEnd = startOfDay(event.endDate).getTime();
              return dayTime >= eStart && dayTime <= eEnd;
            });

            let maxRow = -1;
            dayEvents.forEach(e => {
              if (e._row > maxRow) maxRow = e._row;
            });

            const slots = Array.from({ length: maxRow + 1 }).map((_, i) => 
              dayEvents.find(e => e._row === i) || null
            );

            const isCurrentMonth = isSameMonth(day, currentDate);
            const isPast = isBefore(endOfDay(day), today); 
            
            return (
              <div 
                key={day.toISOString()} 
                className={`min-h-[120px] border-r border-b border-slate-100 p-1 transition-colors hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5
                  ${!isCurrentMonth ? 'bg-slate-50/50 opacity-50 dark:bg-black/10' : ''}
                  ${isPast ? 'opacity-70 grayscale-[30%]' : ''}
                `}
              >
                <div className="flex justify-between px-1 mb-1">
                  <span className={`text-xl font-semibold ${isSameDay(day, today) ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'}`}>
                    {format(day, 'd')}
                  </span>
                  <span className="text-slate-200 dark:text-slate-800 font-bold">=</span>
                </div>

                <div className="flex flex-col gap-[2px]">
                  {slots.map((event, index) => {
                    if (!event) {
                      return <div key={`empty-${day.toISOString()}-${index}`} className="h-6 w-full" />;
                    }

                    const isStart = isSameDay(day, event.startDate);
                    const isEnd = isSameDay(day, event.endDate);

                    let radiusClass = 'rounded-none';
                    if (isStart && isEnd) radiusClass = 'rounded-md';
                    else if (isStart) radiusClass = 'rounded-l-md';
                    else if (isEnd) radiusClass = 'rounded-r-md';

                    return (
                      <div 
                        key={`${event.id}-${day.toISOString()}`}
                        onClick={(e) => handleEventClick(event, e)} // <-- DODANA INTERAKCJA
                        className={`group relative flex h-6 items-center px-1.5 text-[10px] font-medium text-white cursor-pointer transition hover:brightness-110 hover:shadow-sm ${event.colorClass} ${radiusClass}`}
                        style={{
                          marginLeft: isStart ? '2px' : '-5px',
                          marginRight: isEnd ? '2px' : '-5px',
                          zIndex: 10
                        }}
                      >
                        {(isStart || day.getDay() === 1) && (
                          <span className="truncate pr-4 z-20 drop-shadow-md">
                            {event.title}
                          </span>
                        )}

                        {isEnd && event.flags && (
                          <div className="absolute right-1 flex gap-1 z-20">
                            {event.flags.includes('checked') && <CheckCircle2 size={10} className="text-white" />}
                            {event.flags.includes('warning') && <AlertTriangle size={10} className="text-white" />}
                            {event.flags.includes('users') && <Users size={10} className="text-white" />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL SZCZEGÓŁÓW WYDARZENIA --- */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity p-4" onClick={closeModal}>
          {/* Kontener Modala (zatrzymujemy propagację, aby kliknięcie w sam modal go nie zamknęło) */}
          <div 
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-white/10 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modala z kolorem wydarzenia */}
            <div className={`h-3 w-full ${selectedEvent.colorClass}`}></div>
            
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-slate-900 pr-8 dark:text-white">
                  {selectedEvent.title}
                </h2>
                <button 
                  onClick={closeModal}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Detale */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5">
                    <CalendarDays size={16} className="text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Czas trwania</span>
                    <span>
                      {format(selectedEvent.startDate, 'd MMMM yyyy', { locale: pl })} - {format(selectedEvent.endDate, 'd MMMM yyyy', { locale: pl })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5">
                    <Tag size={16} className="text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Status / Flagi</span>
                    <span className="flex gap-2 mt-1">
                      {selectedEvent.flags ? selectedEvent.flags.map(flag => (
                        <span key={flag} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-white/5">
                          {flag}
                        </span>
                      )) : 'Brak przypisanych flag'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stopka z akcjami */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-black/20">
              <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-500/10">
                <Trash2 size={16} />
                Usuń
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-700 transition-colors dark:shadow-none">
                <Edit2 size={16} />
                Edytuj
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}