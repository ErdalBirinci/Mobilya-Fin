export type Role = 'ADMIN' | 'DRIVER';

export type InventoryStatus = 'Vitrinde' | 'Satıldı' | 'Rezerve' | 'Kamyonda' | 'Teslim Edildi';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'SERVICE' | 'INVENTORY';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface Tenant {
  id: string;
  name: string;
}

export type ItemCondition = 'Temiz' | 'Kusurlu' | 'Elden Çıkarılacak';

export interface InventoryItem {
  id: string;
  tenantId: string;
  name: string;
  quantity: number;
  status: InventoryStatus;
  condition?: ItemCondition;
}

export type ServiceType = 'ALIS' | 'SATIS';

export type PaymentMethod = 'Nakit' | 'Kredi Kartı' | 'Havale/EFT' | 'Web Satış' | 'Mobilpay' | 'Fatura' | 'Ücretsiz';

export type ServiceStatus = 'Planlandı' | 'Yolda' | 'Tamamlandı' | 'İptal Edildi' | 'Ertelendi';

export interface Service {
  id: string;
  tenantId: string;
  type: ServiceType; // ALIS (Yeşil) veya SATIS (Mavi)
  timeRange: string; // Örn: 10:00 - 12:00
  orderIndex: number; // Servis sırası (Sürükle bırak)
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: PaymentMethod;
  totalAmount: number; // Sadece Yönetici
  collectionAmount: number; // Nakit/Kapıda ödeme ise Servis Elemanı görebilir
  notes: string;
  photos: string[]; // Base64 veya URL
  signatureUrl?: string; // Müşteri imzası
  receiptUrl?: string; // Teslimat fişi PDF
  fieldNote?: string; // Saha ve Park Notu
  driverId?: string; // Atanan şoför
  status: ServiceStatus;
  date: string; // YYYY-MM-DD
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

export interface AppNotification {
  id: string;
  tenantId: string;
  userId?: string; 
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
