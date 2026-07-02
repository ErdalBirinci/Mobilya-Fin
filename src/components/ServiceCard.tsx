import React, { useRef, useState } from 'react';
import { MapPin, Phone, Clock, CreditCard, Banknote, Camera, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { Service, User } from '../types';
import { cn } from '../lib/utils';
import { compressImage } from '../utils/compressImage';
import { maskPhone, maskAddress, shouldMaskData } from '../utils/security';

interface ServiceCardProps {
  service: Service;
  currentUser: User;
  onUpdateStatus: (id: string, status: Service['status']) => void;
  onUploadPhotos: (id: string, newPhotos: string[]) => void;
  dragHandleProps?: any;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  currentUser,
  onUpdateStatus,
  onUploadPhotos,
  dragHandleProps,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isAlis = service.type === 'ALIS';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files) as File[];
    const compressedPhotos: string[] = [];

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        compressedPhotos.push(compressed);
      } catch (error) {
        console.error('Resim sıkıştırma hatası:', error);
      }
    }

    if (compressedPhotos.length > 0) {
      onUploadPhotos(service.id, [...service.photos, ...compressedPhotos]);
    }
  };

  const isMasked = shouldMaskData(service, currentUser);
  const displayAddress = maskAddress(service.customerAddress, isMasked);
  const displayPhone = maskPhone(service.customerPhone, isMasked);

  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.customerAddress)}`;

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-shadow hover:shadow-md',
        isAlis ? 'border-l-4 border-l-emerald-500 border-emerald-100' : 'border-l-4 border-l-indigo-500 border-indigo-100'
      )}
    >
      {/* Üst Kısım (Header / Accordion Toggle) */}
      <div 
        className={cn('px-5 py-4 flex items-center justify-between cursor-pointer', isAlis ? 'bg-emerald-50/30' : 'bg-indigo-50/30')}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {currentUser.role === 'ADMIN' && (
            <div {...dragHandleProps} className={cn("cursor-grab active:cursor-grabbing p-1 -ml-2 transition-colors", isAlis ? 'text-emerald-500/70 hover:text-emerald-700' : 'text-indigo-500/70 hover:text-indigo-700')} onClick={(e) => e.stopPropagation()}>
              <GripVertical size={20} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={cn("text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider", isAlis ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800')}>
                {service.type === 'ALIS' ? 'Alış' : 'Satış'}
              </span>
              <span className="text-sm font-bold font-mono text-slate-500 flex items-center">
                <Clock size={14} className="mr-1" />
                {service.timeRange}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight truncate">
              {service.customerName}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 pl-4 shrink-0">
          <span className={cn(
            "text-xs font-bold py-1.5 px-3 rounded-lg border shadow-sm",
            service.status === 'Planlandı' ? 'bg-slate-100 text-slate-600 border-slate-200' :
            service.status === 'Yolda' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
            service.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
            service.status === 'İptal Edildi' ? 'bg-red-100 text-red-700 border-red-200' :
            'bg-amber-100 text-amber-700 border-amber-200'
          )}>
            {service.status}
          </span>
          <div className="text-slate-400">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Genişletilmiş Detaylar */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          <div className="p-5 flex-1">
            {/* Müşteri Bilgileri */}
            <div className="mb-5">
              <div className="space-y-3 text-sm text-slate-600 font-medium">
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="shrink-0 text-slate-400" />
                  {isMasked ? (
                    <span>{displayPhone}</span>
                  ) : (
                    <a href={`tel:${service.customerPhone}`} className="hover:text-indigo-600 transition-colors">
                      {displayPhone}
                    </a>
                  )}
                </div>
                
                <div className="flex items-start space-x-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  {isMasked ? (
                    <span className="break-words">{displayAddress}</span>
                  ) : (
                    <a href={mapLink} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors break-words">
                      {displayAddress}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Finansal Bilgiler */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-3 text-sm border border-slate-100">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <div className="flex items-center space-x-2">
                  <CreditCard size={16} className="text-slate-400" />
                  <span>Ödeme:</span>
                </div>
                <span className="font-bold text-slate-800">{service.paymentMethod}</span>
              </div>

              {currentUser.role === 'ADMIN' && (
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <div className="flex items-center space-x-2">
                    <Banknote size={16} className="text-slate-400" />
                    <span>Genel Tutar:</span>
                  </div>
                  <span className="font-bold text-slate-800">{service.totalAmount} €</span>
                </div>
              )}

              {(service.paymentMethod === 'Nakit' || service.paymentMethod === 'Kapıda Ödeme') && (
                <div className="flex items-center justify-between text-red-700 font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <div className="flex items-center space-x-2">
                    <Banknote size={16} />
                    <span>Tahsil Edilecek:</span>
                  </div>
                  <span className="font-black">{service.collectionAmount} €</span>
                </div>
              )}
            </div>

            {/* Notlar */}
            {service.notes && (
              <div className="mb-5 text-sm text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="font-bold text-amber-800 mb-1">Notlar:</p>
                <p className="font-medium">{service.notes}</p>
              </div>
            )}

            {/* Fotoğraflar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-700">Fotoğraflar ({service.photos.length})</span>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 bg-indigo-50 rounded-lg transition-colors"
                >
                  <Camera size={14} />
                  <span>Fotoğraf Ekle</span>
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
              </div>
              
              {service.photos.length > 0 && (
                <div className="flex overflow-x-auto space-x-3 pb-2">
                  {service.photos.map((photo, idx) => (
                    <img 
                      key={idx} 
                      src={photo} 
                      alt={`Servis fotoğrafı ${idx + 1}`} 
                      className="h-20 w-20 object-cover rounded-xl border border-slate-200 shrink-0 shadow-sm" 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Aksiyonlar ve Durum */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <label className="text-sm font-bold text-slate-600 mr-4">Durumu Güncelle:</label>
            <select
              value={service.status}
              onChange={(e) => onUpdateStatus(service.id, e.target.value as Service['status'])}
              className={cn(
                "text-sm font-bold py-2 px-4 rounded-lg border outline-none appearance-none cursor-pointer transition-colors shadow-sm",
                service.status === 'Planlandı' ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' :
                service.status === 'Yolda' ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' :
                service.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' :
                service.status === 'İptal Edildi' ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' :
                'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
              )}
            >
              <option value="Planlandı">Planlandı</option>
              <option value="Yolda">Yolda</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="Ertelendi">Ertelendi</option>
              <option value="İptal Edildi">İptal Edildi</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
