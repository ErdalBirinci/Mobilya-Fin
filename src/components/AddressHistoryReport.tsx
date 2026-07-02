import React, { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fi } from 'date-fns/locale';
import { useAppContext } from '../context/AppContext';

export const AddressHistoryReport: React.FC = () => {
  const { services } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Adres bazında gruplama yapabiliriz ya da direkt adrese göre arama yaptırabiliriz
  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    
    return services.filter(service => 
      service.customerAddress?.toLowerCase().includes(term) ||
      service.customerName.toLowerCase().includes(term)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [services, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const completed = filteredHistory.filter(s => s.status === 'Tamamlandı').length;
    const failed = filteredHistory.filter(s => ['İptal Edildi', 'Ertelendi'].includes(s.status)).length;
    const pending = total - completed - failed;
    
    const totalRevenue = filteredHistory
      .filter(s => s.status === 'Tamamlandı')
      .reduce((sum, s) => sum + s.totalAmount, 0);

    return { total, completed, failed, pending, totalRevenue };
  }, [filteredHistory]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="text-indigo-600" />
          Adres Geçmişi Raporlama
        </h2>
        <p className="text-slate-500 mb-6 text-sm font-medium">
          Belirli bir müşteri veya adres için geçmişteki tüm işlemleri, ziyaretleri ve finansal kayıtları görüntüleyin.
        </p>

        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Müşteri adı veya adres ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {searchTerm.trim() && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Toplam İşlem</p>
              <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Tamamlanan</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <p className="text-2xl font-black text-emerald-800">{stats.completed}</p>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Bekleyen/Yolda</p>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                <p className="text-2xl font-black text-amber-800">{stats.pending}</p>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 shadow-sm">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Toplam Tutar</p>
              <p className="text-2xl font-black text-indigo-800">{stats.totalRevenue.toLocaleString('fi-FI')} €</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">İşlem Detayları</h3>
            </div>
            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium">
                Aradığınız kritere uygun kayıt bulunamadı.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Tarih</th>
                      <th className="px-5 py-4 font-semibold">Müşteri</th>
                      <th className="px-5 py-4 font-semibold">Adres</th>
                      <th className="px-5 py-4 font-semibold">Tür</th>
                      <th className="px-5 py-4 font-semibold text-right">Tutar</th>
                      <th className="px-5 py-4 font-semibold text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredHistory.map(service => (
                      <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Calendar size={16} className="text-slate-400" />
                            {format(parseISO(service.date), 'dd MMM yyyy', { locale: fi })}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {service.customerName}
                        </td>
                        <td className="px-5 py-4 max-w-xs truncate text-slate-500" title={service.customerAddress}>
                          {service.customerAddress || '-'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider ${
                            service.type === 'ALIS' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {service.type === 'ALIS' ? 'ALIŞ' : 'SATIŞ'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-black text-slate-700">
                          {service.totalAmount.toLocaleString('fi-FI')} €
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            service.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' :
                            ['İptal Edildi', 'Ertelendi'].includes(service.status) ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {service.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
