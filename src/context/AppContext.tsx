import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { User, InventoryItem, Service, Role, AuditLog, AppNotification } from '../types';
import { sendNotification } from '../utils/notifications';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'tenantId'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  services: Service[];
  addService: (service: Omit<Service, 'id' | 'tenantId'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  reorderServices: (reorderedServices: Service[]) => void;
  auditLogs: AuditLog[];
  isOnline: boolean;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'tenantId' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const mockUsers: User[] = [
  { id: '1', tenantId: 'tenant-1', name: 'Yönetici Ahmet', email: 'admin@mobilya.com', password: 'password', role: 'ADMIN' },
  { id: '2', tenantId: 'tenant-1', name: 'Şoför Mehmet', email: 'driver@mobilya.com', password: 'password', role: 'DRIVER' },
];

const mockInventory: InventoryItem[] = [
  { id: '1', tenantId: 'tenant-1', name: 'L Köşe Koltuk', quantity: 2, status: 'Vitrinde' },
  { id: '2', tenantId: 'tenant-1', name: 'Ahşap Yemek Masası', quantity: 0, status: 'Satıldı' },
];

const mockServices: Service[] = [
  {
    id: '1',
    tenantId: 'tenant-1',
    type: 'ALIS',
    timeRange: '10:00 - 12:00',
    orderIndex: 0,
    customerName: 'Aino Virtanen',
    customerPhone: '+358 40 123 4567',
    customerAddress: 'Mannerheimintie 10, 00100 Helsinki',
    paymentMethod: 'Nakit',
    totalAmount: 500,
    collectionAmount: 0,
    notes: '2. kerros, ei hissiä. Kanna varovasti.',
    photos: [],
    status: 'Tamamlandı',
    driverId: '2',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: '2',
    tenantId: 'tenant-1',
    type: 'SATIS',
    timeRange: '13:00 - 15:00',
    orderIndex: 1,
    customerName: 'Matti Korhonen',
    customerPhone: '+358 50 987 6543',
    customerAddress: 'Aleksanterinkatu 45, 00100 Helsinki',
    paymentMethod: 'Kredi Kartı',
    totalAmount: 1250,
    collectionAmount: 1250,
    notes: 'Asennus vaaditaan.',
    photos: [],
    status: 'Tamamlandı',
    driverId: '2',
    date: new Date().toISOString().split('T')[0],
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineOperations();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load
    const loadData = async () => {
      try {
        const savedInventory = await localforage.getItem<InventoryItem[]>('inventory');
        const savedServices = await localforage.getItem<Service[]>('services');
        const savedLogs = await localforage.getItem<AuditLog[]>('auditLogs');
        
        if (savedInventory) setInventory(savedInventory);
        else setInventory(mockInventory);

        if (savedServices) setServices(savedServices);
        else setServices(mockServices);

        if (savedLogs) setAuditLogs(savedLogs);
      } catch (err) {
        console.error('Error loading from localforage', err);
      }
    };

    loadData();

    // Listen for SW sync complete
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_COMPLETE') {
          console.log('Background sync completed message received');
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (inventory.length > 0) localforage.setItem('inventory', inventory);
  }, [inventory]);

  useEffect(() => {
    if (services.length > 0) localforage.setItem('services', services);
  }, [services]);

  useEffect(() => {
    if (auditLogs.length > 0) localforage.setItem('auditLogs', auditLogs);
  }, [auditLogs]);

  const logAction = (action: string, entityType: 'SERVICE' | 'INVENTORY', entityId: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const queueOperation = async (operation: any) => {
    try {
      const queue = (await localforage.getItem<any[]>('bekleyen_islemler')) || [];
      queue.push(operation);
      await localforage.setItem('bekleyen_islemler', queue);
      console.log('Operation queued', operation);

      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
          // @ts-ignore
          await registration.sync.register('sync-services');
        } catch (err) {
          console.error('Background sync register failed', err);
        }
      }
    } catch (err) {
      console.error('Failed to queue operation', err);
    }
  };

  const syncOfflineOperations = async () => {
    try {
      const queue = (await localforage.getItem<any[]>('bekleyen_islemler')) || [];
      if (queue.length > 0) {
        console.log('Syncing offline operations...', queue);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await localforage.setItem('bekleyen_islemler', []);
        console.log('Sync complete');
      }
    } catch (err) {
      console.error('Failed to sync offline operations', err);
    }
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'tenantId'>) => {
    if (!currentUser) return;
    const newItem: InventoryItem = { ...item, id: Math.random().toString(36).substr(2, 9), tenantId: currentUser.tenantId };
    setInventory((prev) => [...prev, newItem]);
    if (!isOnline) queueOperation({ type: 'ADD_INVENTORY', payload: newItem });
    logAction('ADD_INVENTORY', 'INVENTORY', newItem.id, `Added inventory: ${newItem.name}`);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    if (!isOnline) queueOperation({ type: 'UPDATE_INVENTORY', id, updates });
    logAction('UPDATE_INVENTORY', 'INVENTORY', id, `Updated inventory id: ${id}`);
  };

  const deleteInventoryItem = (id: string) => {
    const item = inventory.find(i => i.id === id);
    setInventory((prev) => prev.filter((item) => item.id !== id));
    if (!isOnline) queueOperation({ type: 'DELETE_INVENTORY', id });
    logAction('DELETE_INVENTORY', 'INVENTORY', id, `Deleted inventory: ${item?.name}`);
  };

  const addService = (service: Omit<Service, 'id' | 'tenantId'>) => {
    if (!currentUser) return;
    const newService: Service = { ...service, id: Math.random().toString(36).substr(2, 9), tenantId: currentUser.tenantId };
    console.log("Adding service:", newService); setServices((prev) => [...prev, newService]);
    if (!isOnline) queueOperation({ type: 'ADD_SERVICE', payload: newService });

    sendNotification('Yeni Servis Atandı', {
      body: `${newService.customerName} - ${newService.type === 'ALIS' ? 'Alış' : 'Satış'} servisi planlandı.`,
    });
    addNotification({
      title: 'Yeni Görev Atandı',
      message: `${newService.customerName} için yeni bir ${newService.type === 'ALIS' ? 'Alış' : 'Satış'} görevi oluşturuldu.`,
      type: 'INFO',
      read: false
    });
    logAction('ADD_SERVICE', 'SERVICE', newService.id, `Added service for ${newService.customerName}`);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) => prev.map((service) => (service.id === id ? { ...service, ...updates } : service)));
    if (!isOnline) queueOperation({ type: 'UPDATE_SERVICE', id, updates });

    if (updates.status === 'İptal Edildi') {
      const service = services.find((s) => s.id === id);
      if (service) {
        sendNotification('Servis İptal Edildi', {
          body: `${service.customerName} isimli müşterinin servisi iptal edildi.`,
        });
      }
    }
    logAction('UPDATE_SERVICE', 'SERVICE', id, `Updated service id: ${id}`);
  };

  const deleteService = (id: string) => {
    const service = services.find(s => s.id === id);
    setServices((prev) => prev.filter((service) => service.id !== id));
    if (!isOnline) queueOperation({ type: 'DELETE_SERVICE', id });
    logAction('DELETE_SERVICE', 'SERVICE', id, `Deleted service for ${service?.customerName}`);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'tenantId' | 'createdAt'>) => {
    if (!currentUser) return;
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      tenantId: currentUser.tenantId,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const reorderServices = (reorderedServices: Service[]) => {
    if (!currentUser) return;
    setServices((prev) => {
      const otherTenants = prev.filter(s => s.tenantId !== currentUser.tenantId);
      return [...otherTenants, ...reorderedServices];
    });
    addNotification({
      title: 'Rota Değiştirildi',
      message: 'Görev sırası ve rota güncellendi. Yeni rotayı kontrol edin.',
      type: 'WARNING',
      read: false
    });
    if (!isOnline) queueOperation({ type: 'REORDER_SERVICES', payload: reorderedServices });
  };

  const tenantNotifications = React.useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((n) => n.tenantId === currentUser.tenantId && (!n.userId || n.userId === currentUser.id));
  }, [notifications, currentUser]);

  const tenantServices = React.useMemo(() => {
    if (!currentUser) return [];
    return services.filter(s => s.tenantId === currentUser.tenantId);
  }, [services, currentUser]);

  const tenantInventory = React.useMemo(() => {
    if (!currentUser) return [];
    return inventory.filter(i => i.tenantId === currentUser.tenantId);
  }, [inventory, currentUser]);

  const tenantLogs = React.useMemo(() => {
    if (!currentUser) return [];
    return auditLogs.filter(l => l.tenantId === currentUser.tenantId);
  }, [auditLogs, currentUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        inventory: tenantInventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        services: tenantServices,
        addService,
        updateService,
        deleteService,
        reorderServices,
        auditLogs: tenantLogs,
        isOnline,
        notifications: tenantNotifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const users = mockUsers;
