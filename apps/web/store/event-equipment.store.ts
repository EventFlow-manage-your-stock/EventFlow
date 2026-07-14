import { create } from 'zustand';
import { api } from '../lib/api';

interface ScannedItem {
  id_modelu: number;
  id_egzemplarza: number;
  ilosc: number;
  nazwa: string;
  sn: string | null;
  kod_kreskowy: string | null;
}

interface EventEquipmentState {
  dokumenty: any[];
  podsumowanie: any[];
  koszyk: ScannedItem[];
  mode: 'WZ' | 'PZ';
  isLoading: boolean;
  
  setMode: (mode: 'WZ' | 'PZ') => void;
  fetchSprzetWydarzenia: (eventId: number) => Promise<void>;
  scanCode: (code: string) => Promise<{ success: boolean; message: string; isWarning?: boolean }>;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  saveDocument: (eventId: number) => Promise<any>;
}

export const useEventEquipmentStore = create<EventEquipmentState>((set, get) => ({
  dokumenty: [],
  podsumowanie: [],
  koszyk: [],
  mode: 'WZ',
  isLoading: false,

  setMode: (mode) => set({ mode, koszyk: [] }),

  fetchSprzetWydarzenia: async (eventId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/api/magazyn/wydarzenia/${eventId}/sprzet`);
      set({ 
        dokumenty: res.data.dokumenty, 
        podsumowanie: res.data.podsumowanie,
        isLoading: false 
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  scanCode: async (code) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/api/magazyn/skan?kod=${encodeURIComponent(code)}`);
      if (!res.data) {
        set({ isLoading: false });
        return { success: false, message: 'Nie znaleziono sprzętu w bazie.' };
      }

      const item = res.data;
      const { koszyk, podsumowanie, mode } = get();

      // Rozbijanie case'a na pojedyncze sztuki
      const itemsToAdd = item.isCase ? item.contents : [item];
      const validItems = itemsToAdd.filter((i: any) => i.model?.typ_sprzetu !== 'opakowanie');

      if (validItems.length === 0) {
        set({ isLoading: false });
        return { success: false, message: 'Brak sprzętu w zeskanowanym opakowaniu.' };
      }

      const newKoszyk = [...koszyk];
      let hasWarning = false;

      validItems.forEach((vItem: any) => {
        // Zabezpieczenie przed podwójnym skanem
        if (newKoszyk.find(k => k.id_egzemplarza === vItem.id)) return;

        // Weryfikacja ze zgłoszonym planem wydarzenia
        const zapotrzebowanie = podsumowanie.find(p => p.model.id === vItem.id_modelu);
        
        if (!zapotrzebowanie) hasWarning = true; // Sprzęt całkowicie spoza planu
        else if (mode === 'WZ' && zapotrzebowanie.wydano >= zapotrzebowanie.zaplanowano) hasWarning = true; // Wydajemy więcej niż w planie
        else if (mode === 'PZ' && zapotrzebowanie.przyjeto >= zapotrzebowanie.wydano) hasWarning = true; // Przyjmujemy więcej niż wydano

        newKoszyk.push({
          id_modelu: vItem.id_modelu,
          id_egzemplarza: vItem.id,
          ilosc: 1,
          nazwa: vItem.nazwa || vItem.model?.nazwa,
          sn: vItem.sn,
          kod_kreskowy: vItem.kod_kreskowy
        });
      });

      set({ koszyk: newKoszyk, isLoading: false });

      if (hasWarning) {
         return { success: true, isWarning: true, message: 'Dodano, ale wykryto sprzęt spoza planu lub przekroczono ilości!' };
      }
      return { success: true, message: 'Pomyślnie dodano do koszyka.' };

    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, message: error.response?.data?.message || 'Błąd skanowania.' };
    }
  },

  removeFromCart: (index) => {
    const newKoszyk = [...get().koszyk];
    newKoszyk.splice(index, 1);
    set({ koszyk: newKoszyk });
  },

  clearCart: () => set({ koszyk: [] }),

  saveDocument: async (eventId) => {
    set({ isLoading: true });
    try {
      const { mode, koszyk } = get();
      const payload = {
        typ: mode,
        id_wydarzenia: eventId,
        notatki: `Dokument wygenerowany z panelu wydarzenia (${mode})`,
        pozycje: koszyk.map(k => ({
          id_modelu: k.id_modelu,
          id_egzemplarza: k.id_egzemplarza,
          ilosc: k.ilosc,
          nazwa_na_dokumencie: k.nazwa
        }))
      };

      const res = await api.post('/api/magazyn/dokumenty', payload);
      set({ koszyk: [], isLoading: false });
      await get().fetchSprzetWydarzenia(eventId); // Odśwież widok
      return res.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  }
}));