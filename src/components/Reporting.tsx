import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { fi } from 'date-fns/locale';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, TrendingDown, AlertCircle, Calendar, Filter } from 'lucide-react';
import { Service } from '../types';

type DateFilterType = 'DAILY' | 'MONTHLY' | 'CUSTOM';

export const Reporting: React.FC = () => {
  const { services } = useAppContext();
  
  const [filterType, setFilterType] = useState<DateFilterType>('DAILY');
  const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Filtreleme mantığı
  const filteredServices = useMemo(() => {
    const today = new Date();
    let start: Date;
    let end: Date;

    if (filterType === 'DAILY') {
      start = startOfDay(today);
      end = endOfDay(today);
    } else if (filterType === 'MONTHLY') {
      start = startOfMonth(today);
      end = endOfMonth(today);
    } else {
      start = startOfDay(parseISO(customStartDate));
      end = endOfDay(parseISO(customEndDate));
    }

    return services.filter(service => {
      const serviceDate = parseISO(service.date);
      return isWithinInterval(serviceDate, { start, end });
    });
  }, [services, filterType, customStartDate, customEndDate]);

  // İstatistikleri hesapla
  const stats = useMemo(() => {
    let alisCount = 0;
    let alisTotal = 0;
    let satisCount = 0;
    let satisTotal = 0;
    let failedCount = 0;

    filteredServices.forEach(s => {
      if (s.status === 'İptal Edildi' || s.status === 'Ertelendi') {
        failedCount++;
      } else if (s.status === 'Tamamlandı') {
        if (s.type === 'ALIS') {
          alisCount++;
          alisTotal += s.totalAmount;
        } else {
          satisCount++;
          satisTotal += s.totalAmount;
        }
      } else {
        // Planlandı veya Yolda olanlar tamamlanmış sayılmaz ama sayıya eklenebilir. 
        // İsterseniz burada onları da işleyebilirsiniz, şu an sadece Tamamlandı'ları ciroya dahil ediyoruz.
        if (s.type === 'ALIS') alisCount++;
        if (s.type === 'SATIS') satisCount++;
      }
    });

    return { alisCount, alisTotal, satisCount, satisTotal, failedCount };
  }, [filteredServices]);

  // Grafik verisi
  const chartData = [
    {
      name: 'Alış İşlemleri',
      Tutar: stats.alisTotal,
      Adet: stats.alisCount,
    },
    {
      name: 'Satış İşlemleri',
      Tutar: stats.satisTotal,
      Adet: stats.satisCount,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filtreler */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <Calendar size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Tarih Aralığı Seçimi</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DateFilterType)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
            >
              <option value="DAILY">Bugün</option>
              <option value="MONTHLY">Bu Ay</option>
              <option value="CUSTOM">Özel Tarih</option>
            </select>

            {filterType === 'CUSTOM' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border-l-4 border-l-emerald-500 border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Toplam Alış</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-800">{stats.alisTotal.toLocaleString('fi-FI')} €</span>
          </div>
          <p className="text-sm font-medium text-slate-500">{stats.alisCount} adet işlem</p>
        </div>

        <div className="bg-white rounded-2xl border-l-4 border-l-indigo-500 border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Toplam Satış</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-800">{stats.satisTotal.toLocaleString('fi-FI')} €</span>
          </div>
          <p className="text-sm font-medium text-slate-500">{stats.satisCount} adet işlem</p>
        </div>

        <div className="bg-white rounded-2xl border-l-4 border-l-red-500 border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">İptal / Ertelenen</h3>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-800">{stats.failedCount}</span>
          </div>
          <p className="text-sm font-medium text-slate-500">başarısız işlem</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Finansal Karşılaştırma</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} tickFormatter={(value) => `€${value}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString('fi-FI')} €`, 'Tutar']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600, color: '#475569' }} />
                <Bar dataKey="Tutar" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tablo */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">İşlem Özeti</h3>
          </div>
          <div className="flex-1 overflow-auto max-h-72">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-semibold">İşlem</th>
                  <th className="px-4 py-3 font-semibold">Tarih</th>
                  <th className="px-4 py-3 font-semibold text-right">Tutar</th>
                  <th className="px-4 py-3 font-semibold text-right">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-medium">Kayıt bulunamadı.</td>
                  </tr>
                ) : (
                  filteredServices.map(service => (
                    <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{service.customerName}</div>
                        <div className={`text-xs font-bold ${service.type === 'ALIS' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                          {service.type === 'ALIS' ? 'Alış' : 'Satış'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-500">
                        {format(parseISO(service.date), 'dd MMM yyyy', { locale: fi })}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-700">
                        {service.totalAmount.toLocaleString('fi-FI')} €
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          service.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' :
                          service.status === 'İptal Edildi' || service.status === 'Ertelendi' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {service.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
