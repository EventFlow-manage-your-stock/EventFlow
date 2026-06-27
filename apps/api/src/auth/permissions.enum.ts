export enum Permission {
  // Moduł Magazynowy
  READ_ITEMS = 'items:read',
  CREATE_ITEMS = 'items:create',
  UPDATE_STOCK = 'items:update_stock',
  DELETE_ITEMS = 'items:delete',

  // Moduł Wydarzeń
  READ_EVENTS = 'events:read',
  CREATE_EVENTS = 'events:create',
  MANAGE_ALLOCATIONS = 'events:allocate',

  // Zarządzanie Firmą i Ludźmi
  MANAGE_USERS = 'users:manage',
  VIEW_BILLING = 'billing:view',
}