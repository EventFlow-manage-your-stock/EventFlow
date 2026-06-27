import { Permission } from './permissions.enum';

// Mapujemy sztywne role na zestawy uprawnień.
// W przyszłości ten obiekt zostanie zastąpiony zapytaniem do bazy danych.
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: Object.values(Permission), // Admin ma dostęp do wszystkiego
  
  LOGISTICIAN: [
    Permission.READ_ITEMS,
    Permission.CREATE_ITEMS,
    Permission.UPDATE_STOCK,
    Permission.READ_EVENTS,
    Permission.MANAGE_ALLOCATIONS
  ],
  
  FIELD_WORKER: [
    Permission.READ_ITEMS,
    Permission.UPDATE_STOCK,
    Permission.READ_EVENTS
  ]
};