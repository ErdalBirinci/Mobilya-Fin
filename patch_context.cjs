const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Update imports
content = content.replace("import { User, InventoryItem, Service, Role, AuditLog } from '../types';", "import { User, InventoryItem, Service, Role, AuditLog, AppNotification } from '../types';");

// Update interface
const intfTarget = `  auditLogs: AuditLog[];
  isOnline: boolean;
}`;
const intfRep = `  auditLogs: AuditLog[];
  isOnline: boolean;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'tenantId' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}`;
content = content.replace(intfTarget, intfRep);

fs.writeFileSync('src/context/AppContext.tsx', content);
