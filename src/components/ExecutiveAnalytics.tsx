import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, Activity, DollarSign, CheckCircle } from 'lucide-react';

export const ExecutiveAnalytics: React.FC = () => {
  const { services } = useAppContext();

  const analyticsData = useMemo(() => {
    const monthlyData: Record<string, { month: string; purchases: number; sales: number }> = {};
    let totalRevenue = 0;
    let totalCompleted = 0;
    let totalServices = 0;

    services.forEach(service => {
      // Summary metrics
      totalServices++;
      if (service.status === 'Tamamlandı') {
        totalCompleted++;
        if (service.type === 'SATIS') {
          totalRevenue += service.totalAmount;
        }
      }

      // Monthly Chart Data
      const date = parseISO(service.date);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy', { locale: tr });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, purchases: 0, sales: 0 };
      }

      if (service.type === 'ALIS') {
        monthlyData[monthKey].purchases += service.totalAmount;
      } else if (service.type === 'SATIS') {
        monthlyData[monthKey].sales += service.totalAmount;
      }
    });

    const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    const efficiency = totalServices > 0 ? (totalCompleted / totalServices) * 100 : 0;

    return { chartData, totalRevenue, efficiency, totalCompleted, totalServices };
  }, [services]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Toplam Gelir (Satış)</p>
            <p className="text-2xl font-black text-slate-800">{analyticsData.totalRevenue.toLocaleString('tr-TR')} €</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Operasyonel Verimlilik</p>
            <p className="text-2xl font-black text-slate-800">%{analyticsData.efficiency.toFixed(1)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tamamlanan İşlem</p>
            <p className="text-2xl font-black text-slate-800">{analyticsData.totalCompleted} / {analyticsData.totalServices}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Büyüme Eğilimi</p>
            <p className="text-2xl font-black text-slate-800">Pozitif</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Aylık Alış vs Satış Karşılaştırması</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} tickFormatter={(value) => `€${value}`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value.toLocaleString('tr-TR')} €`, '']}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600, color: '#475569' }} />
              <Bar dataKey="purchases" name="Alış (Purchases)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="sales" name="Satış (Sales)" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
