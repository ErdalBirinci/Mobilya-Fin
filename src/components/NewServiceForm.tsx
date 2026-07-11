import React, { useState, useRef } from 'react';
import { Camera, X, Check, MapPin, Phone, User as UserIcon, Clock, CreditCard, Banknote, FileText, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ServiceType, PaymentMethod, Service } from '../types';
import { compressImage } from '../utils/compressImage';
import { ImageModal } from './ImageModal';
import { getLocalDateString } from '../utils/date';

interface NewServiceFormProps {
  onSubmitSuccess?: (date: string) => void;
  onCancel: () => void;
  initialData?: Service;
  defaultDate?: string;
}

export const NewServiceForm: React.FC<NewServiceFormProps> = ({ onCancel, onSubmitSuccess, initialData, defaultDate }) => {
  const { addService, updateService } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<ServiceType>(initialData?.type || 'ALIS');
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');
  const [timeRange, setTimeRange] = useState(initialData?.timeRange || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'Nakit');
  const [totalAmount, setTotalAmount] = useState<number>(initialData?.totalAmount || 0);
  const [collectionAmount, setCollectionAmount] = useState<number>(initialData?.collectionAmount || 0);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [date, setDate] = useState<string>(initialData?.date || defaultDate || getLocalDateString());
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAlis = type === 'ALIS';

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
      setPhotos([...photos, ...compressedPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const serviceData = {
      type,
      timeRange,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      totalAmount,
      collectionAmount,
      notes,
      photos,
      date,
    };

    if (initialData) {
      updateService(initialData.id, serviceData);
    } else {
      addService({
        ...serviceData,
        orderIndex: 999, // sona eklenecek
        status: 'Planlandı',
      });
    }
    setIsSubmitting(false);
    if (onSubmitSuccess) onSubmitSuccess(date); else onCancel();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className={`px-8 py-6 border-b flex items-center justify-between ${isAlis ? 'border-emerald-100 bg-emerald-50/50' : 'border-indigo-100 bg-indigo-50/50'}`}>
        <h2 className={`text-2xl font-bold ${isAlis ? 'text-emerald-900' : 'text-indigo-900'}`}>{initialData ? 'Servisi Düzenle' : 'Yeni Servis Kaydı'}</h2>
        <button onClick={onCancel} className={`p-2 rounded-xl transition-colors ${isAlis ? 'text-emerald-500 hover:bg-emerald-100' : 'text-indigo-500 hover:bg-indigo-100'}`}>
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {/* Type Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8 w-full max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setType('ALIS')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${
              isAlis 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Alış İşlemi
          </button>
          <button
            type="button"
            onClick={() => setType('SATIS')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${
              !isAlis 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Satış İşlemi
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sol Kolon - Müşteri Bilgileri */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Müşteri Bilgileri</h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <UserIcon size={16} className={isAlis ? 'text-emerald-500' : 'text-indigo-500'} />
                Ad / Soyad
              </label>
              <input
                required
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow ${isAlis ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Phone size={16} className={isAlis ? 'text-emerald-500' : 'text-indigo-500'} />
                Telefon
              </label>
              <input
                required
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow ${isAlis ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                placeholder="Örn: +358 40 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className={isAlis ? 'text-emerald-500' : 'text-indigo-500'} />
                Açık Adres
              </label>
              <textarea
                required
                rows={3}
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow resize-none ${isAlis ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                placeholder="Örn: Mannerheimintie 10, 00100 Helsinki..."
              />
            </div>
          </div>

          {/* Sağ Kolon - Servis ve Finans Bilgileri */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Servis & Finans</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock size={16} className={isAlis ? 'text-emerald-500' : 'text-indigo-500'} />
                  Tarih
                </label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow ${isAlis ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Saat Aralığı
                </label>
                <input
                  required
                  type="text"
                  value={timeRange}
                  onChange={e => setTimeRange(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow ${isAlis ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                  placeholder="Örn: 10:00 - 12:00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <CreditCard size={16} className={isAlis ? 'text-emerald-500' : 'text-indigo-500'} />
                Ödeme Yöntemi
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow cursor-pointer appearance-none ${isAlis ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
              >
                <option value="Nakit">Nakit</option>
                <option value="Kredi Kartı">Kredi Kartı</option>
                <option value="Havale/EFT">Havale/EFT</option>
                <option value="Web Satış">Web Satış</option>
                <option value="Mobilpay">Mobilpay</option>
                <option value="Fatura">Fatura</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Banknote size={16} className="text-slate-500" />
                  Toplam Tutar (€)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={totalAmount || ''}
                  onChange={e => setTotalAmount(Number(e.target.value))}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 transition-shadow ${isAlis ? 'focus:ring-emerald-500' : 'focus:ring-indigo-500'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Banknote size={16} className="text-red-500" />
                  Tahsil Edilecek (€)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={collectionAmount || ''}
                  onChange={e => setCollectionAmount(Number(e.target.value))}
                  className={`w-full bg-red-50 border border-red-200 text-red-900 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 transition-shadow`}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notlar ve Fotoğraflar */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <FileText size={16} className={isAlis ? 'text-emerald-500' : 'text-indigo-500'} />
              Servis Notları
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className={`w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-shadow resize-none`}
              placeholder="Saha ekibi için önemli notlar..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                <Camera size={16} className={isAlis ? 'text-emerald-500' : 'text-indigo-500'} />
                Servis Fotoğrafları ({photos.length})
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center space-x-2 text-sm font-bold px-4 py-2 rounded-xl transition-colors ${isAlis ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
              >
                <Plus size={16} />
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
            
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    <img 
                      src={photo} 
                      alt={`Servis fotoğrafı ${idx + 1}`} 
                      className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => setSelectedImage(photo)}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <Camera size={32} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Henüz fotoğraf eklenmedi</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center space-x-2 px-8 py-3.5 text-sm font-bold text-white rounded-xl shadow-md transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              isAlis 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            <Check size={18} />
            <span>{isSubmitting ? 'Kaydediliyor...' : (initialData ? 'Değişiklikleri Kaydet' : 'Servis Kaydını Oluştur')}</span>
          </button>
        </div>
      </form>

      <ImageModal 
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};
