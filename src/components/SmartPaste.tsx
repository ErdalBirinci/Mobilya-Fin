import React, { useState } from 'react';
import { pipeline, env } from '@xenova/transformers';
import { Wand2, Loader2 } from 'lucide-react';

// Disable local models to fetch from HF Hub
env.allowLocalModels = false;

interface SmartPasteProps {
  onDataExtracted: (data: { address?: string; phone?: string; time?: string }) => void;
  isAlis: boolean;
}

export const SmartPaste: React.FC<SmartPasteProps> = ({ onDataExtracted, isAlis }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setProgress('Model yükleniyor... (İlk seferde 30-40MB indirebilir)');

    try {
      // Question-Answering pipeline
      const extractor = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
      
      setProgress('Adres analiz ediliyor...');
      const addressResult = await extractor('What is the address or street or location?', text) as any;
      
      setProgress('Telefon analiz ediliyor...');
      const phoneResult = await extractor('What is the phone number?', text) as any;
      
      setProgress('Saat analiz ediliyor...');
      const timeResult = await extractor('What is the time or hour?', text) as any;

      // Güven skorlarına göre sonuçları filtreleme
      const extracted = {
        address: addressResult.score > 0.05 ? addressResult.answer : '',
        phone: phoneResult.score > 0.05 ? phoneResult.answer : '',
        time: timeResult.score > 0.05 ? timeResult.answer : ''
      };

      // Eğer NLP modeli bulamazsa basit regex yedek desteği
      const phoneRegex = /(?:\+90|0)?[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}/;
      const regexPhoneMatch = text.match(phoneRegex);
      if (!extracted.phone && regexPhoneMatch) {
         extracted.phone = regexPhoneMatch[0];
      }

      const timeRegex = /([0-1]?[0-9]|2[0-3]):[0-5][0-9]/;
      const regexTimeMatch = text.match(timeRegex);
      if (!extracted.time && regexTimeMatch) {
         extracted.time = regexTimeMatch[0];
      }

      onDataExtracted(extracted);
      setText('');
    } catch (error) {
      console.error('NLP Analiz hatası:', error);
      alert('Analiz sırasında bir hata oluştu.');
    } finally {
      setIsAnalyzing(false);
      setProgress('');
    }
  };

  return (
    <div className={`mb-8 p-6 rounded-2xl border ${isAlis ? 'bg-emerald-50/30 border-emerald-100' : 'bg-indigo-50/30 border-indigo-100'}`}>
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className={isAlis ? 'text-emerald-500' : 'text-indigo-500'} size={20} />
        <h3 className="font-bold text-slate-800">Akıllı Yapıştır (Smart Paste)</h3>
        <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-md bg-slate-200 text-slate-600">Transformers.js</span>
      </div>
      
      <p className="text-sm text-slate-500 mb-4">
        Müşteriden gelen karmaşık WhatsApp mesajını buraya yapıştırın. Yapay zeka modeli (Yerel NLP) metni analiz edip adres, telefon ve saati otomatik çıkartacaktır.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Örn: Yarın saat 14:00 için adresim Kadıköy Moda sokak, tel: 05321234567"
        className={`w-full h-24 p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 resize-none mb-4 ${isAlis ? 'focus:ring-emerald-500' : 'focus:ring-indigo-500'}`}
      />

      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-500">
          {isAnalyzing && (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={14} />
              {progress}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !text.trim()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
            isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 shadow-sm'
          } ${isAlis ? 'bg-emerald-600' : 'bg-indigo-600'}`}
        >
          {isAnalyzing ? 'Analiz Ediliyor...' : 'Analiz Et'}
        </button>
      </div>
    </div>
  );
};
