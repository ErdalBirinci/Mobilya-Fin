import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import { X, Check } from 'lucide-react';
import { Service } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SignatureModalProps {
  service: Service;
  onClose: () => void;
  onComplete: (signatureUrl: string, receiptUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ service, onClose, onComplete }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  const handleSave = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert('Lütfen imza atınız.');
      return;
    }

    setIsGenerating(true);
    try {
      // 1. İmzayı Data URL olarak al
      const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

      // 2. PDF Oluştur (Client-Side)
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('Teslimat Fisi', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Tarih: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: tr })}`, 20, 40);
      doc.text(`Musteri: ${service.customerName}`, 20, 50);
      doc.text(`Adres: ${service.customerAddress}`, 20, 60);
      doc.text(`Telefon: ${service.customerPhone}`, 20, 70);
      
      doc.text(`Islem Tipi: ${service.type === 'ALIS' ? 'Alis' : 'Satis'}`, 20, 90);
      doc.text(`Tahsil Edilen Tutar: ${service.collectionAmount} EUR`, 20, 100);
      doc.text(`Odeme Yontemi: ${service.paymentMethod}`, 20, 110);
      
      doc.text('Musteri Imzasi:', 20, 130);
      doc.addImage(signatureDataUrl, 'PNG', 20, 140, 60, 30);
      
      // Supabase'e yükleme yerine şimdilik tarayıcıda base64 PDF üretiyoruz 
      // (Bunu DataURI olarak kaydedeceğiz veya "fake" bir link olarak kaydedeceğiz)
      const pdfDataUri = doc.output('datauristring');
      
      // İşlem başarılı
      onComplete(signatureDataUrl, pdfDataUri);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Müşteri İmzası</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 flex flex-col items-center">
          <p className="text-sm text-slate-500 mb-4 text-center">
            {service.customerName} teslimatı onaylamak için lütfen aşağıya imza atınız.
          </p>
          
          <div className="w-full border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden bg-slate-50">
            <SignatureCanvas 
              ref={sigCanvas}
              canvasProps={{
                className: 'w-full h-48 sm:h-64 cursor-crosshair'
              }}
            />
          </div>
          
          <button 
            onClick={handleClear}
            className="mt-3 text-sm text-slate-500 font-semibold hover:text-slate-800 underline"
          >
            Temizle
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-slate-600 font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={isGenerating}
            className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${
              isGenerating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isGenerating ? 'Kaydediliyor...' : (
              <>
                <Check size={18} /> Onayla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
