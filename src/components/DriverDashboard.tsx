import React, { useState } from 'react';
import { ServiceList } from './ServiceList';
import { Truck, WifiOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const DriverDashboard: React.FC = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { isOnline } = useAppContext();

  return (
    <div className="max-w-md mx-auto pb-20">
      <div className="bg-indigo-600 -mx-4 -mt-4 sm:-mt-6 mb-8 px-6 py-8 rounded-b-3xl text-white shadow-md relative">
        {!isOnline && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
            <WifiOff size={14} />
            <span>Çevrimdışı Mod</span>
          </div>
        )}
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-white/20 rounded-xl shadow-sm">
            <Truck size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Görevlerim</h2>
            <p className="text-indigo-100 text-sm font-medium mt-1">Bugünkü servis rotanız ve görevleriniz</p>
          </div>
        </div>
        
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-indigo-700/50 border border-indigo-400/30 rounded-xl px-4 py-3 text-white placeholder-white/50 font-semibold outline-none focus:bg-indigo-700/80 focus:ring-2 focus:ring-white/50 transition-colors shadow-inner"
        />
      </div>

      <div className="px-2">
        <ServiceList date={date} />
      </div>
    </div>
  );
};
