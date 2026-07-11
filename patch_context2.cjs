const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target1 = `  const [services, setServices] = useState<Service[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);`;
const rep1 = `  const [services, setServices] = useState<Service[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);`;

content = content.replace(target1, rep1);

const targetLoad = `        const savedInventory = await localforage.getItem<InventoryItem[]>('inventory');
        const savedServices = await localforage.getItem<Service[]>('services');
        const savedAuditLogs = await localforage.getItem<AuditLog[]>('auditLogs');`;

const repLoad = `        const savedInventory = await localforage.getItem<InventoryItem[]>('inventory');
        const savedServices = await localforage.getItem<Service[]>('services');
        const savedAuditLogs = await localforage.getItem<AuditLog[]>('auditLogs');
        const savedNotifications = await localforage.getItem<AppNotification[]>('notifications');`;

content = content.replace(targetLoad, repLoad);

const targetLoad2 = `        if (savedAuditLogs) setAuditLogs(savedAuditLogs);`;
const repLoad2 = `        if (savedAuditLogs) setAuditLogs(savedAuditLogs);
        if (savedNotifications) setNotifications(savedNotifications);`;
content = content.replace(targetLoad2, repLoad2);

const targetSave = `  useEffect(() => {
    if (services.length > 0) {
      localforage.setItem('services', services);
    }
  }, [services]);`;
  
const repSave = `  useEffect(() => {
    if (services.length > 0) {
      localforage.setItem('services', services);
    }
  }, [services]);

  useEffect(() => {
    if (notifications.length > 0) {
      localforage.setItem('notifications', notifications);
    }
  }, [notifications]);`;
  
content = content.replace(targetSave, repSave);

const targetFunc = `  const reorderServices = (reorderedServices: Service[]) => {`;
const repFunc = `  const addNotification = (notif: Omit<AppNotification, 'id' | 'tenantId' | 'createdAt'>) => {
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

  const reorderServices = (reorderedServices: Service[]) => {`;
content = content.replace(targetFunc, repFunc);

const targetProvide = `  const tenantServices = React.useMemo(() => {`;
const repProvide = `  const tenantNotifications = React.useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((n) => n.tenantId === currentUser.tenantId && (!n.userId || n.userId === currentUser.id));
  }, [notifications, currentUser]);

  const tenantServices = React.useMemo(() => {`;
content = content.replace(targetProvide, repProvide);

const targetReturn = `        reorderServices,
        auditLogs: tenantLogs,
        isOnline,`;
const repReturn = `        reorderServices,
        auditLogs: tenantLogs,
        isOnline,
        notifications: tenantNotifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,`;
content = content.replace(targetReturn, repReturn);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Patched AppContext');
