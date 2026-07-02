import { Service, User } from '../types';

/**
 * Mask the phone number.
 * Örnek: "+358 40 123 4567" -> "+358 40 *** ****"
 */
export const maskPhone = (phone: string, shouldMask: boolean): string => {
  if (!shouldMask || !phone) return phone;
  // İlk 8 karakteri göster, gerisini maskele
  const visiblePart = phone.slice(0, Math.min(8, phone.length));
  return visiblePart + ' *** ****';
};

/**
 * Mask the address.
 * Örnek: "Mannerheimintie 10, 00100 Helsinki" -> "*** (Gizlendi), 00100 Helsinki"
 */
export const maskAddress = (address: string, shouldMask: boolean): string => {
  if (!shouldMask || !address) return address;
  const parts = address.split(',');
  if (parts.length > 1) {
    return `*** (Gizlendi), ${parts[parts.length - 1].trim()}`;
  }
  return '*** (Gizlendi)';
};

/**
 * Müşteri adı maskeleme (İsteğe bağlı, anonimleştirme senaryosu için)
 */
export const maskName = (name: string, shouldMask: boolean): string => {
  if (!shouldMask || !name) return name;
  const parts = name.split(' ');
  return parts.map(p => p.charAt(0) + '***').join(' ');
};

/**
 * Şoför için, işlem durumu 'Tamamlandı' veya 'İptal Edildi' statüsüne geçtikten
 * tam 2 saat sonra kişisel verilerin maskelenip maskelenmeyeceğini belirler.
 */
export const shouldMaskData = (service: Service, currentUser: User): boolean => {
  // Yöneticiler verileri her zaman tam görür
  if (currentUser.role === 'ADMIN') {
    return false;
  }

  // Sadece Tamamlandı veya İptal Edildi durumlarında maskeleme yapılır
  if (service.status !== 'Tamamlandı' && service.status !== 'İptal Edildi') {
    return false;
  }

  // Gerçek senaryoda veritabanından 'completedAt' veya 'updatedAt' timestamp değeri gelmelidir.
  // Veri modelimizde 'completedAt' alanı olduğunu varsayarak 2 saat kontrolü yapıyoruz.
  const completedAtValue = (service as any).completedAt;
  
  if (completedAtValue) {
    const completedTime = new Date(completedAtValue).getTime();
    const now = new Date().getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    
    return (now - completedTime) >= twoHoursInMs;
  }

  // Eğer 'completedAt' yoksa, mock veriler için varsayılan olarak maskeleme yapalım (Test amaçlı)
  return true;
};
