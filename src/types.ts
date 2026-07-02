export type Role = 'ADMIN' | 'DRIVER';

export type InventoryStatus = 'Mevcut' | 'Tükendi' | 'Rezerve';

export interface Tenant {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  tenantId: string;
  name: string;
  quantity: number;
  status: InventoryStatus;
}

export type ServiceType = 'ALIS' | 'SATIS';

export type PaymentMethod = 'Nakit' | 'Kredi Kartı' | 'Havale/EFT' | 'Web Satış' | 'Mobilpay' | 'Fatura';

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
