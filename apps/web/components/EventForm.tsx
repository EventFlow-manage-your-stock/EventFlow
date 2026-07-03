'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, Calendar, Clock, MapPin, AlignLeft, 
  Tag, Building2, Save, AlertCircle, Contact
} from 'lucide-react';
import { api } from '../lib/api';

interface EventFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function EventForm({ onClose, onSuccess }: EventFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delikatne opóźnienie wymusza na przeglądarce zauważenie zmiany stanu, 
    // co gwarantuje odtworzenie płynnej animacji wejścia.
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); 
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        nazwa: data.nazwa,
        data_start: data.data_start,
        data_koniec: data.data_koniec,
        // Te dane odblokujemy, gdy zbudujemy dla nich obsługę w NestJS:
        // id_statusu_wydarzenia: Number(data.id_statusu_wydarzenia),
        // id_kontrahenta: Number(data.id_kontrahenta),
        // id_miejsca: Number(data.id_miejsca),
        // notatki: data.notatki
      };

      await api.post('/events', payload);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Błąd zapisu:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      {/* Tło bez rozmycia, bardzo delikatnie przyciemnione */}
      <div 
        className={`absolute inset-0 bg-slate-900/20 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      />

      <div 
        className={`relative flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nowe wydarzenie</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wprowadź szczegóły logistyczne do kalendarza</p>
          </div>
          <button 
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* SEKCJA: Główne informacje */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nazwa wydarzenia <span className="text-red-500">*</span>
                </label>
                <input 
                  {...register('nazwa', { required: true })} 
                  placeholder="np. Koncert Plenerowy, Targi IT..." 
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Calendar size={14} /> Start <span className="text-red-500">*</span>
                  </label>
                  <input 
                    {...register('data_start', { required: true })} 
                    type="datetime-local" 
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-black/20 dark:text-white [color-scheme:light_dark]" 
                  />
                </div>
                <div>
                  <label className="mb-1 block flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Clock size={14} /> Koniec <span className="text-red-500">*</span>
                  </label>
                  <input 
                    {...register('data_koniec', { required: true })} 
                    type="datetime-local" 
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-black/20 dark:text-white [color-scheme:light_dark]" 
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            {/* SEKCJA: Relacje (Gotowe na podpięcie backendu) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                Szczegóły operacyjne
              </h3>
              
              <div>
                <label className="mb-1 block flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Tag size={14} /> Status 
                </label>
                <select 
                  {...register('id_statusu_wydarzenia')}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none text-slate-500 focus:border-blue-500 dark:border-white/10 dark:bg-black/20"
                >
                  <option value="">Wybierz status z bazy...</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Building2 size={14} /> Kontrahent (Zleceniodawca)
                </label>
                <select 
                  {...register('id_kontrahenta')}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none text-slate-500 focus:border-blue-500 dark:border-white/10 dark:bg-black/20"
                >
                  <option value="">Wybierz firmę...</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <MapPin size={14} /> Miejsce realizacji
                </label>
                <select 
                  {...register('id_miejsca')}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none text-slate-500 focus:border-blue-500 dark:border-white/10 dark:bg-black/20"
                >
                  <option value="">Wybierz lokalizację...</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <AlignLeft size={14} /> Notatki wewnętrzne
                </label>
                <textarea 
                  {...register('notatki')}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none resize-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-black/20 dark:focus:bg-slate-900" 
                  placeholder="Zalecenia dotyczące ubioru, instrukcje wjazdowe, kontakt do menedżera..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 dark:border-white/10 dark:bg-black/10">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Anuluj
            </button>
            <button 
              type="submit"
              form="event-form"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-70 dark:shadow-none"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <><Save size={16} /> Utwórz wydarzenie</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}