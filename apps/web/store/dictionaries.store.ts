import { create } from 'zustand';
import { api } from '../lib/api';

interface DictionariesState {
  eventTypes: any[];
  eventStatuses: any[];
  warehouseStatuses: any[];
  accountingStatuses: any[];
  isLoading: boolean;
  fetchDictionaries: () => Promise<void>;
  updateItem: (type: string, id: number, data: any) => Promise<void>;
  createItem: (type: string, data: any) => Promise<void>;
  deleteItem: (type: string, id: number) => Promise<void>;
  reorderItems: (type: string, items: any[]) => Promise<void>;
}

export const useDictionariesStore = create<DictionariesState>((set, get) => ({
  eventTypes: [],
  eventStatuses: [],
  warehouseStatuses: [],
  accountingStatuses: [],
  isLoading: false,

  fetchDictionaries: async () => {
    set({ isLoading: true });
    try {
      const [typesRes, evStatusRes, whStatusRes, accStatusRes] = await Promise.all([
        api.get('/api/slowniki/typy-wydarzen'),
        api.get('/api/slowniki/statusy-wydarzenia'),
        api.get('/api/slowniki/statusy-magazynowe'),
        api.get('/api/slowniki/statusy-ksiegowe'),
      ]);

      set({
        eventTypes: typesRes.data,
        eventStatuses: evStatusRes.data,
        warehouseStatuses: whStatusRes.data,
        accountingStatuses: accStatusRes.data,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch dictionaries', error);
      set({ isLoading: false });
    }
  },

  createItem: async (type: string, data: any) => {
    await api.post(`/api/slowniki/${type}`, data);
    await get().fetchDictionaries();
  },

  updateItem: async (type: string, id: number, data: any) => {
    await api.put(`/api/slowniki/${type}/${id}`, data);
    await get().fetchDictionaries();
  },

  deleteItem: async (type: string, id: number) => {
    await api.delete(`/api/slowniki/${type}/${id}`);
    await get().fetchDictionaries();
  },

  reorderItems: async (type: string, items: any[]) => {
    // Aktualizujemy stan optymistycznie
    if (type === 'typy-wydarzen') set({ eventTypes: items });
    if (type === 'statusy-wydarzenia') set({ eventStatuses: items });
    if (type === 'statusy-magazynowe') set({ warehouseStatuses: items });
    if (type === 'statusy-ksiegowe') set({ accountingStatuses: items });

    // Wysłanie nowej kolejności do bazy
    const payload = items.map((item, idx) => ({ id: item.id, kolejnosc: idx + 1 }));
    await api.put(`/api/slowniki/${type}/kolejnosc`, { items: payload });
  }
}));