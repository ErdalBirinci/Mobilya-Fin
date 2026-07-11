const fs = require('fs');
let file = 'src/components/RouteOptimizer.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `import { Map, Navigation } from 'lucide-react';
import { Service } from '../types';
import { RouteMap } from './RouteMap';

interface RouteOptimizerProps {
  services: Service[];
}`;

const rep1 = `import { Map, Navigation, Route as RouteIcon, Loader2 } from 'lucide-react';
import { Service } from '../types';
import { RouteMap } from './RouteMap';
import { geocodeAddress, calculateDistance } from '../utils/geocoding';
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface RouteOptimizerProps {
  services: Service[];
  onRouteOptimized?: () => void;
}`;

content = content.replace(target1, rep1);

const target2 = `export const RouteOptimizer: React.FC<RouteOptimizerProps> = ({ services }) => {
  // Sadece tamamlanmamış ve adresi olan servisleri al
  const pendingServices = services.filter(s => s.status !== 'Tamamlandı' && s.status !== 'İptal Edildi' && s.customerAddress);

  const handleOpenMaps = () => {`;

const rep2 = `export const RouteOptimizer: React.FC<RouteOptimizerProps> = ({ services, onRouteOptimized }) => {
  const { services: allServices, reorderServices } = useAppContext();
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Sadece tamamlanmamış ve adresi olan servisleri al
  const pendingServices = services.filter(s => s.status !== 'Tamamlandı' && s.status !== 'İptal Edildi' && s.customerAddress);

  const handleOptimizeRoute = async () => {
    if (pendingServices.length < 2) return;
    setIsCalculating(true);
    
    try {
      // 1. Koordinatları al
      const points = [];
      for (const s of pendingServices) {
        const cachedKey = \`geo_\${s.customerAddress}\`;
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
        // İlk noktadan başla
        let current = withCoords.shift();
        ordered.push(current.service);
        
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

  const handleOpenMaps = () => {`;

content = content.replace(target2, rep2);

const target3 = `        <button 
          onClick={handleOpenMaps}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Navigation size={16} />
          Haritalarda Aç
        </button>`;

const rep3 = `        <div className="flex items-center gap-2">
          <button 
            onClick={handleOptimizeRoute}
            disabled={isCalculating || pendingServices.length < 2}
            className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-xl border border-indigo-200 text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCalculating ? <Loader2 size={16} className="animate-spin" /> : <RouteIcon size={16} />}
            {isCalculating ? 'Hesaplanıyor...' : 'Rotayı Hesapla'}
          </button>
          <button 
            onClick={handleOpenMaps}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Navigation size={16} />
            Haritalarda Aç
          </button>
        </div>`;

content = content.replace(target3, rep3);

fs.writeFileSync(file, content);
console.log('RouteOptimizer patched');
