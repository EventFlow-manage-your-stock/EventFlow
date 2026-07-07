'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, Bold, Italic, Strikethrough, Link as LinkIcon, List, ListOrdered, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modelId: number;
  modelName: string;
  initialData?: any | null; 
}

export default function ItemModal({ isOpen, onClose, onSuccess, modelId, modelName, initialData }: ItemModalProps) {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm();
  const [magazyny, setMagazyny] = useState<any[]>([]);
  const [dostepneCase, setDostepneCase] = useState<any[]>([]);
  const [statusySerwisowe, setStatusySerwisowe] = useState<any[]>([]);
  const isEdit = !!initialData;

  // Nasłuchiwanie wyboru statusu z listy
  const watchStatus = watch('status_serwisowy');
  const showServiceFields = watchStatus && !['Działa', 'Naprawiony', ''].includes(watchStatus);

  useEffect(() => {
    if (isOpen) {
      fetchDictionaries();
      if (initialData) {
        reset({
          ...initialData,
          data_produkcji: initialData.data_produkcji ? initialData.data_produkcji.split('T')[0] : '',
        });
      } else {
        reset({ nazwa: modelName, status_serwisowy: 'Działa', pakowany_pojedynczo: false });
      }
    }
  }, [isOpen, initialData, modelName]);

  const fetchDictionaries = async () => {
    try {
      const [magazynyRes, casesRes, statusyRes] = await Promise.all([
        api.get('/api/magazyn/slowniki/magazyny'),
        api.get('/api/magazyn/slowniki/cases'),
        api.get('/api/serwis/statusy') // Pobieramy słownik statusów serwisowych
      ]);
      setMagazyny(magazynyRes.data);
      setDostepneCase(casesRes.data);
      setStatusySerwisowe(statusyRes.data);
    } catch (error) {
      console.error('Błąd pobierania słowników:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const cleanNumber = (val: any) => (val === "" || val === undefined || val === null) ? null : Number(val);
      const cleanString = (val: any) => (val === "" || val === undefined || val === null) ? null : String(val);

      const payload = {
        ...data,
        id_magazynu: cleanNumber(data.id_magazynu),
        id_case: cleanNumber(data.id_case),
        cena_zakupu: cleanNumber(data.cena_zakupu),
        data_produkcji: data.data_produkcji ? new Date(data.data_produkcji).toISOString() : null,
        pakowany_pojedynczo: !!data.pakowany_pojedynczo,
        nazwa: cleanString(data.nazwa) || modelName,
        numer_urzadzenia: cleanString(data.numer_urzadzenia),
        sn: cleanString(data.sn),
        miejsce_w_mag: cleanString(data.miejsce_w_mag),
        opis: cleanString(data.opis),
        status_serwisowy: cleanString(data.status_serwisowy) || 'Działa',
        kod_kreskowy: cleanString(data.kod_kreskowy),
        
        // Pola automatycznego zgłoszenia (wysłane na backend)
        tworz_zgloszenie: showServiceFields,
        tytul_usterki: cleanString(data.tytul_usterki),
        id_statusu_serwisu: cleanNumber(data.id_statusu_serwisu),
        opis_usterki: cleanString(data.opis_usterki)
      };

      if (isEdit) {
        await api.put(`/api/magazyn/egzemplarze/${initialData.id}`, payload);
      } else {
        await api.post(`/api/magazyn/modele/${modelId}/egzemplarze`, payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Błąd zapisu egzemplarza:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/30 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-[850px] bg-white shadow-2xl flex flex-col rounded-xl overflow-hidden z-10 animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Edycja egzemplarza' : 'Dodaj nowy egzemplarz'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            
            {/* KOLUMNA LEWA */}
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Model</label>
                <input disabled value={modelName} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-500 cursor-not-allowed outline-none" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Nazwa (opcjonalnie własna)</label>
                <input type="text" {...register('nazwa')} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 outline-none text-sm bg-white" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Numer urządzenia (np. 1, 2, A, B)</label>
                <input type="text" {...register('numer_urzadzenia')} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 outline-none text-sm bg-blue-50/50 font-bold" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Numer seryjny (SN)</label>
                <input type="text" {...register('sn')} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 outline-none text-sm font-mono bg-blue-50/50" />
              </div>

              <div className="relative">
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Data produkcji</label>
                <input type="date" {...register('data_produkcji')} className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md focus:border-blue-500 outline-none text-sm text-slate-700 bg-white" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Magazyn fizyczny</label>
                <select {...register('id_magazynu')} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 outline-none text-sm bg-white cursor-pointer">
                  <option value="">Wybierz...</option>
                  {magazyny.map(m => <option key={m.id} value={m.id}>{m.nazwa}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Miejsce w magazynie</label>
                <input type="text" {...register('miejsce_w_mag')} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 outline-none text-sm bg-blue-50/50 uppercase" />
              </div>
            </div>

            {/* KOLUMNA PRAWA */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-3 rounded-md border border-slate-200">
                <input type="checkbox" id="pakowany" {...register('pakowany_pojedynczo')} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <label htmlFor="pakowany" className="text-[13px] font-bold text-slate-700 cursor-pointer select-none">Pakowany pojedynczo</label>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Status Serwisowy (Kondycja)</label>
                <select {...register('status_serwisowy')} className="w-full px-3 py-2 border-2 border-slate-300 rounded-md focus:border-sky-500 outline-none text-sm bg-white cursor-pointer font-medium shadow-sm">
                  <option value="Działa" className="text-emerald-700 font-bold">Działa</option>
                  <option value="Wymaga serwisu (działa)" className="text-amber-600 font-bold">Wymaga serwisu (działa)</option>
                  <option value="Wymaga serwisu (nie działa)" className="text-red-600 font-bold">Wymaga serwisu (nie działa)</option>
                  <option value="W serwisie" className="text-sky-600 font-bold">W serwisie</option>
                  <option value="Naprawiony" className="text-emerald-600 font-bold">Naprawiony</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-sky-600 mb-1.5">Włóż do skrzyni (Przypisz Case)</label>
                <select {...register('id_case')} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white cursor-pointer shadow-sm">
                  <option value="">Luzem (Brak skrzyni)</option>
                  {dostepneCase.filter(c => c.id !== initialData?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.model?.nazwa} {c.numer_urzadzenia ? `[#${c.numer_urzadzenia}]` : ''} - W środku: {c._count?.zawartosc_case || 0} szt.</option>
                  ))}
                </select>
              </div>

              <div>
                 <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Własne notatki / Uwagi ogólne</label>
                 <textarea {...register('opis')} rows={3} placeholder="np. Odprysk na obudowie" className="w-full p-3 text-sm border border-slate-300 rounded-md outline-none focus:border-sky-500 resize-none bg-white" />
              </div>
            </div>

            {/* DYNAMICZNY BLOK GENEROWANIA ZGŁOSZENIA SERWISOWEGO */}
            {showServiceFields && (
              <div className="col-span-1 md:col-span-2 bg-red-50/50 border border-red-200 rounded-xl p-5 mt-4 shadow-sm animate-fade-in-up">
                 <h4 className="text-[14px] font-black text-red-600 mb-4 flex items-center gap-2">
                   <AlertTriangle size={18} className="fill-red-100" /> Automatyczne Zgłoszenie Serwisowe
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                     <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Co się stało? (Tytuł zgłoszenia) *</label>
                     <input type="text" {...register('tytul_usterki')} required={showServiceFields} placeholder="np. Nie działa zasilanie" className="w-full px-3 py-2 border border-red-300 rounded focus:border-red-500 outline-none text-sm bg-white" />
                   </div>
                   <div>
                     <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Priorytet zlecenia *</label>
                     <select {...register('id_statusu_serwisu')} required={showServiceFields} className="w-full px-3 py-2 border border-red-300 rounded focus:border-red-500 outline-none text-sm bg-white cursor-pointer font-semibold">
                       <option value="">Wybierz kolejkę...</option>
                       {statusySerwisowe.map(s => <option key={s.id} value={s.id}>{s.nazwa}</option>)}
                     </select>
                   </div>
                   <div className="md:col-span-2">
                     <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Szczegóły dla serwisanta</label>
                     <textarea {...register('opis_usterki')} rows={3} placeholder="Okoliczności powstania usterki..." className="w-full px-3 py-2 border border-red-200 rounded focus:border-red-500 outline-none text-sm bg-white resize-none" />
                   </div>
                 </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-[13px] font-bold text-emerald-600 border border-emerald-500 rounded bg-white hover:bg-emerald-50 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16}/>}
              {isEdit ? 'Zapisz zmiany' : 'Dodaj egzemplarz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}