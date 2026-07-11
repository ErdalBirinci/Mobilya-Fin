import React from 'react';
import { Map, Navigation, Route as RouteIcon, Loader2 } from 'lucide-react';
import { Service } from '../types';
import { RouteMap } from './RouteMap';
import { geocodeAddress, calculateDistance } from '../utils/geocoding';
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface RouteOptimizerProps {
  services: Service[];
  onRouteOptimized?: () => void;
}

export const RouteOptimizer: React.FC<RouteOptimizerProps> = ({ services, onRouteOptimized }) => {
  const { services: allServices, reorderServices } = useAppContext();
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Sadece tamamlanmamış ve adresi olan servisleri al
  const pendingServices = services.filter(s => s.status !== 'Tamamlandı' && s.status !== 'İptal Edildi' && s.customerAddress);

  const handleOptimizeRoute = async (useCurrentLocation = false) => {
    if (pendingServices.length < 2) return;
    setIsCalculating(true);
    
    try {
      let startCoords = null;
      if (useCurrentLocation && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000
            });
          });
          startCoords = [pos.coords.latitude, pos.coords.longitude];
        } catch (err) {
          console.warn("Konum alınamadı:", err);
          alert("Konum alınamadı. Rotadaki ilk noktadan başlanacak.");
        }
      }

      // 1. Koordinatları al
      const points = [];
      for (const s of pendingServices) {
        const cachedKey = `geo_${s.customerAddress}`;
        const cached = localStorage.getItem(cachedKey);
        let coords = null;
        if (cached) {
          coords = JSON.parse(cached);
        } else {
          coords = await geocodeAddress(s.customerAddress);
          if (coords) {
            localStorage.setItem(cachedKey, JSON.stringify(coords));
          }
        }
        if (coords) {
          points.push({ service: s, coords });
        } else {
          points.push({ service: s, coords: null });
        }
      }

      // 2. Nearest neighbor ile sırala
      const withCoords = points.filter(p => p.coords !== null);
      const withoutCoords = points.filter(p => p.coords === null).map(p => p.service);
      
      const ordered = [];
      if (withCoords.length > 0) {
        let current = null;
        if (startCoords) {
          let nearestIdx = 0;
          let minDistance = Infinity;
          for (let i = 0; i < withCoords.length; i++) {
            const dist = calculateDistance(
              startCoords[0], startCoords[1],
              withCoords[i].coords[0], withCoords[i].coords[1]
            );
            if (dist < minDistance) {
              minDistance = dist;
              nearestIdx = i;
            }
          }
          current = withCoords.splice(nearestIdx, 1)[0];
          ordered.push(current.service);
        } else {
          // İlk noktadan başla
          current = withCoords.shift();
          ordered.push(current.service);
        }
        
        while (withCoords.length > 0) {
          let nearestIdx = 0;
          let minDistance = Infinity;
          for (let i = 0; i < withCoords.length; i++) {
            const dist = calculateDistance(
              current.coords[0], current.coords[1],
              withCoords[i].coords[0], withCoords[i].coords[1]
            );
            if (dist < minDistance) {
              minDistance = dist;
              nearestIdx = i;
            }
          }
          current = withCoords.splice(nearestIdx, 1)[0];
          ordered.push(current.service);
        }
      }
      
      const finalOrderedPending = [...ordered, ...withoutCoords];
      
      // 3. Orijinal todaysServices'i güncelle
      // Gelen "services" prop'u zaten o günün listesi (filtrelenmiş olsa bile)
      if (pendingServices.length > 0) {
        const date = pendingServices[0].date;
        const todaysAll = allServices.filter(s => s.date === date).sort((a,b) => a.orderIndex - b.orderIndex);
        
        // Tamamlanmış veya adresi olmayanlar yerini korusun, sadece pending'leri sıraya oturt
        const newTodays = [];
        let pendingIdx = 0;
        
        for (const s of todaysAll) {
          const isPending = pendingServices.find(ps => ps.id === s.id);
          if (isPending) {
            newTodays.push({ ...finalOrderedPending[pendingIdx], orderIndex: newTodays.length });
            pendingIdx++;
          } else {
            newTodays.push({ ...s, orderIndex: newTodays.length });
          }
        }
        
        const otherServices = allServices.filter(s => s.date !== date);
        reorderServices([...otherServices, ...newTodays]);
        if (onRouteOptimized) onRouteOptimized();
      }
      
    } catch (err) {
      console.error("Route optimization error:", err);
      alert("Rota hesaplanırken bir hata oluştu.");
    } finally {
      setIsCalculating(false);
    }
  };

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
    <div className="mb-6">
      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Map size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Günün Rotası</h4>
            <p className="text-xs text-slate-600 font-medium">Bekleyen {pendingServices.length} servis için rota ve süre tahmini alın.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button 
            onClick={() => handleOptimizeRoute(true)}
            disabled={isCalculating || pendingServices.length < 2}
            className="flex items-center gap-2 bg-white text-emerald-600 px-3 py-2 rounded-xl border border-emerald-200 text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            title="Mevcut konumuma en yakın noktadan başlayarak rotayı oluşturur"
          >
            {isCalculating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            Konumuma Göre Sırala
          </button>
          <button 
            onClick={() => handleOptimizeRoute(false)}
            disabled={isCalculating || pendingServices.length < 2}
            className="flex items-center gap-2 bg-white text-indigo-700 px-3 py-2 rounded-xl border border-indigo-200 text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCalculating ? <Loader2 size={16} className="animate-spin" /> : <RouteIcon size={16} />}
            Optimum Rota
          </button>
          <button 
            onClick={handleOpenMaps}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Haritada Aç
          </button>
        </div>
      </div>
      
      <RouteMap services={pendingServices} />
    </div>
  );
};
