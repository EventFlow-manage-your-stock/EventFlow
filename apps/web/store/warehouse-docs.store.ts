import { create } from 'zustand';
import { api } from '../lib/api';

export interface CartItem {
  id_modelu: number;
  id_egzemplarza: number | null;
  ilosc: number;
  nazwa: string;
  kategoria: string;
  sn: string | null;
  kod_kreskowy: string | null;
  numer_urzadzenia: string | null;
  nazwa_na_dokumencie: string;
}

interface WarehouseDocsState {
  cart: CartItem[];
  isLoading: boolean;
  scanCode: (code: string) => Promise<{ success: boolean; message: string }>;
  updateCartItemName: (index: number, newName: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  createDocument: (typ: 'WZ' | 'PZ', notatki?: string, id_wydarzenia?: number) => Promise<any>;
}

export const useWarehouseDocsStore = create<WarehouseDocsState>((set, get) => ({
  cart: [],
  isLoading: false,

  scanCode: async (code: string) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/api/magazyn/skan?kod=${encodeURIComponent(code)}`);
      if (!res.data) {
        set({ isLoading: false });
        return { success: false, message: 'Nie znaleziono sprzętu o tym kodzie w bazie.' };
      }

      const item = res.data;
      const currentCart = get().cart;

      // Jeśli to nie jest case, sprawdzamy czy nie ma go już w koszyku
      if (!item.isCase) {
         const exists = currentCart.find(c => c.id_egzemplarza === item.id);
         if (exists) {
           set({ isLoading: false });
           return { success: false, message: 'Ten egzemplarz jest już w koszyku!' };
         }
      }

      const newItems: CartItem[] = [];

      // Inteligentne rozpakowywanie skrzyni (V15)
      if (item.isCase && item.contents && item.contents.length > 0) {
        item.contents.forEach((content: any) => {
          const exists = currentCart.find(c => c.id_egzemplarza === content.id);
          // Pomijamy puste opakowania w samym dokumencie WZ/PZ
          if (!exists && content.model?.typ_sprzetu !== 'opakowanie') {
            newItems.push({
              id_modelu: content.id_modelu,
              id_egzemplarza: content.id,
              ilosc: 1,
              nazwa: content.nazwa || `${content.model?.nazwa} #${content.numer_urzadzenia || content.id}`,
              kategoria: content.model?.kategoria?.nazwa || 'Brak kategorii',
              sn: content.sn,
              kod_kreskowy: content.kod_kreskowy,
              numer_urzadzenia: content.numer_urzadzenia,
              nazwa_na_dokumencie: content.nazwa || `${content.model?.nazwa} #${content.numer_urzadzenia || content.id}`
            });
          }
        });
      } else if (!item.isCase && item.model?.typ_sprzetu !== 'opakowanie') {
         newItems.push({
            id_modelu: item.id_modelu,
            id_egzemplarza: item.id,
            ilosc: 1,
            nazwa: item.nazwa || `${item.model?.nazwa} #${item.numer_urzadzenia || item.id}`,
            kategoria: item.model?.kategoria?.nazwa || 'Brak kategorii',
            sn: item.sn,
            kod_kreskowy: item.kod_kreskowy,
            numer_urzadzenia: item.numer_urzadzenia,
            nazwa_na_dokumencie: item.nazwa || `${item.model?.nazwa} #${item.numer_urzadzenia || item.id}`
         });
      }

      if (newItems.length === 0) {
        set({ isLoading: false });
        return { success: false, message: 'Brak odpowiedniego sprzętu (opakowania są pomijane na WZ/PZ).' };
      }

      set({ cart: [...currentCart, ...newItems], isLoading: false });
      return { success: true, message: `Dodano ${newItems.length} pozycje(i) do dokumentu.` };

    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, message: error.response?.data?.message || 'Wystąpił błąd skanowania.' };
    }
  },

  updateCartItemName: (index, newName) => {
    const newCart = [...get().cart];
    newCart[index].nazwa_na_dokumencie = newName;
    set({ cart: newCart });
  },

  removeFromCart: (index) => {
    const newCart = [...get().cart];
    newCart.splice(index, 1);
    set({ cart: newCart });
  },

  clearCart: () => set({ cart: [] }),

  createDocument: async (typ, notatki, id_wydarzenia) => {
    set({ isLoading: true });
    try {
      const { cart } = get();
      const payload = {
        typ,
        notatki,
        id_wydarzenia,
        pozycje: cart.map(c => ({
          id_modelu: c.id_modelu,
          id_egzemplarza: c.id_egzemplarza,
          ilosc: c.ilosc,
          nazwa_na_dokumencie: c.nazwa_na_dokumencie
        }))
      };

      const res = await api.post('/api/magazyn/dokumenty', payload);
      set({ cart: [], isLoading: false });
      return res.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  }
}));