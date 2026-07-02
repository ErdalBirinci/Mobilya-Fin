import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, parseISO, isSameWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAppContext, users } from '../context/AppContext';

export const DriverProductivityChart: React.FC = () => {
  const { services } = useAppContext();

  const chartData = useMemo(() => {
    // Sadece şoförleri filtrele
    const drivers = users.filter(u => u.role === 'DRIVER');
    
    // Son 4 haftayı (veya mevcut haftayı vs.) alabilirdik. 
    // Basitlik için tüm zamanların haftalık verisini gruplayalım.
    const weeklyData: Record<string, any> = {};

    services.forEach(service => {
      if (service.status === 'Tamamlandı') {
        const date = parseISO(service.date);
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Pazartesi başlangıçlı
        const weekKey = format(weekStart, 'dd MMM', { locale: tr });
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { week: weekKey };
          // Her şoför için 0 ile başlat
          drivers.forEach(d => {
            weeklyData[weekKey][d.name] = 0;
          });
          // Atanmamış servisler için de bir alan
          weeklyData[weekKey]['Atanmamış'] = 0;
        }

        if (service.driverId) {
          const driver = drivers.find(d => d.id === service.driverId);
          if (driver) {
            weeklyData[weekKey][driver.name] = (weeklyData[weekKey][driver.name] || 0) + 1;
          } else {
            weeklyData[weekKey]['Atanmamış'] += 1;
          }
        } else {
          weeklyData[weekKey]['Atanmamış'] += 1;
        }
      }
    });

    return Object.values(weeklyData).sort((a, b) => {
      // Basit sıralama (hafta etiketleri text olduğundan basitçe alfabetik/tarih sırası)
      // Ancak gerçekte date nesnesine göre sıralanmalı.
      return a.week.localeCompare(b.week);
    });
  }, [services]);

  const drivers = users.filter(u => u.role === 'DRIVER');

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#94a3b8'];

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Şoför Üretkenliği (Haftalık Tamamlanan Servisler)</h3>
        <div className="h-64 flex items-center justify-center text-slate-400 font-medium">
          Henüz tamamlanmış servis verisi bulunmuyor.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Şoför Üretkenliği (Haftalık Tamamlanan Servisler)</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600, color: '#475569' }} />
            {drivers.map((driver, idx) => (
              <Bar 
                key={driver.id} 
                dataKey={driver.name} 
                name={driver.name} 
                fill={colors[idx % colors.length]} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50} 
              />
            ))}
            <Bar dataKey="Atanmamış" name="Atanmamış" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
