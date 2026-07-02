import React from 'react';
import { Map, Navigation } from 'lucide-react';
import { Service } from '../types';

interface RouteOptimizerProps {
  services: Service[];
}

export const RouteOptimizer: React.FC<RouteOptimizerProps> = ({ services }) => {
  // Sadece tamamlanmamış ve adresi olan servisleri al
  const pendingServices = services.filter(s => s.status !== 'Tamamlandı' && s.status !== 'İptal Edildi' && s.customerAddress);

  const handleOpenMaps = () => {
    if (pendingServices.length === 0) return;

    if (pendingServices.length === 1) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pendingServices[0].customerAddress)}&travelmode=driving`;
      window.open(url, '_blank');
      return;
    }

    const destination = pendingServices[pendingServices.length - 1].customerAddress;
    const waypoints = pendingServices.slice(0, -1).map(s => s.customerAddress);

    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    
    if (waypoints.length > 0) {
      // route optimization is a Google Maps feature when using waypoints
      url += `&waypoints=${encodeURIComponent(waypoints.join('|'))}`;
    }

    window.open(url, '_blank');
  };

  if (pendingServices.length === 0) {
    return null;
  }

  return (
    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Map size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">Günün Rotası</h4>
          <p className="text-xs text-slate-600 font-medium">Bekleyen {pendingServices.length} servis için rota ve süre tahmini alın.</p>
        </div>
      </div>
      <button 
        onClick={handleOpenMaps}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Navigation size={16} />
        Haritalarda Aç
      </button>
    </div>
  );
};
