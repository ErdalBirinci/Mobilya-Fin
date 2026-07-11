import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Service } from '../types';
import L from 'leaflet';
import { geocodeAddress } from '../utils/geocoding';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
  services: Service[];
}

// Map bounds updater component
const MapUpdater: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [positions, map]);
  return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({ services }) => {
  const [geocodedServices, setGeocodedServices] = useState<(Service & { position: [number, number], order: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      if (services.length === 0) return;
      setIsLoading(true);
      
      const results: (Service & { position: [number, number], order: number })[] = [];
      
      for (let i = 0; i < services.length; i++) {
        const s = services[i];
        let position: [number, number] | null = null;
        
        // Check cache first
        const cachedKey = `geo_${s.customerAddress}`;
        const cached = localStorage.getItem(cachedKey);
        
        if (cached) {
          position = JSON.parse(cached);
        } else if (s.customerAddress) {
          position = await geocodeAddress(s.customerAddress);
          if (position) {
            localStorage.setItem(cachedKey, JSON.stringify(position));
          }
        }
        
        if (position) {
          results.push({
            ...s,
            position,
            order: i + 1
          });
        }
      }
      
      if (isMounted) {
        setGeocodedServices(results);
        setIsLoading(false);
      }
    };

    fetchCoordinates();
    
    return () => {
      isMounted = false;
    };
  }, [services]);

  const positions = geocodedServices.map(m => m.position);
  
  if (services.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mt-6 overflow-hidden z-0 relative">

      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Günün Rota Haritası (Adres Bazlı)</h3>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-xs text-slate-600 font-medium">Alış</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-xs text-slate-600 font-medium">Satış</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-500"></span><span className="text-xs text-slate-600 font-medium">Tamamlandı</span></div>
        </div>
        {isLoading && <span className="text-xs text-indigo-600 animate-pulse font-semibold">Adresler haritaya işleniyor...</span>}
      </div>

      <div className="w-full h-[400px] z-0 bg-slate-50 relative">
        {positions.length > 0 ? (
          <MapContainer 
            center={positions[0] || [41.0082, 28.9784]} 
            zoom={10} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapUpdater positions={positions} />
            
            {positions.length > 1 && (
              <Polyline 
                positions={positions} 
                pathOptions={{ color: '#94a3b8', weight: 4, opacity: 0.7, dashArray: '8 8' }} 
              />
            )}

            {geocodedServices.map((marker) => {
              const isCompleted = marker.status === 'Tamamlandı';
              const bgColor = isCompleted ? '#64748b' : (marker.type === 'ALIS' ? '#10b981' : (marker.type === 'SATIS' ? '#3b82f6' : '#8b5cf6')); // Purple fallback
              const iconHtml = `
                <div style="
                  background-color: ${bgColor};
                  color: white;
                  border: 2px solid white;
                  border-radius: 50%;
                  width: 24px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 12px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  opacity: ${isCompleted ? '0.7' : '1'};
                ">
                  ${marker.order}
                </div>
              `;
              
              const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-leaflet-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              });

              return (
                <Marker key={marker.id} position={marker.position} icon={customIcon}>
                  <Popup minWidth={300} maxWidth={320}>
                    <div className="p-1 min-w-[280px]">
                      <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-100">
                        <div>
                          <strong className="block text-sm font-bold text-slate-800 leading-tight">{marker.customerName}</strong>
                          <span className="text-[11px] text-slate-500">{marker.customerPhone}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          marker.type === 'ALIS' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {marker.type === 'ALIS' ? '↓ ALIŞ' : '↑ SATIŞ'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-start gap-2">
                          <span className="text-[15px] leading-none mt-0.5">📍</span>
                          <span className="text-xs text-slate-700 break-words leading-relaxed">{marker.customerAddress}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] leading-none">🕒</span>
                          <span className="text-xs font-medium text-slate-700">{marker.timeRange}</span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1 mt-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Toplam Tutar:</span>
                            <span className="font-semibold text-slate-800">{marker.totalAmount} TL</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Alınacak (Tahsilat):</span>
                            <span className="font-bold text-indigo-600">{marker.collectionAmount} TL</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Ödeme Yöntemi:</span>
                            <span className="font-medium text-slate-700">{marker.paymentMethod}</span>
                          </div>
                        </div>

                        {marker.notes && (
                          <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 mt-2">
                            <span className="block text-[10px] font-bold text-amber-800 mb-1">İŞLEM DETAYI / NOTLAR:</span>
                            <span className="text-xs text-amber-900 leading-snug">{marker.notes}</span>
                          </div>
                        )}

                        {marker.photos && marker.photos.length > 0 && (
                          <div className="mt-2">
                            <span className="block text-[10px] font-bold text-slate-500 mb-1">EKLİ GÖRSELLER ({marker.photos.length}):</span>
                            <div className="flex flex-wrap gap-1.5">
                              {marker.photos.slice(0, 3).map((photo, idx) => (
                                <img key={idx} src={photo} alt="İşlem görseli" className="w-12 h-12 object-cover rounded-md border border-slate-200" />
                              ))}
                              {marker.photos.length > 3 && (
                                <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                  +{marker.photos.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-3">
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${
                          marker.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' :
                          marker.status === 'Yolda' ? 'bg-amber-100 text-amber-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {marker.status}
                        </span>
                        
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.customerAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'white', textDecoration: 'none' }}
                          className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          Haritada Aç
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
             {isLoading ? (
               <>
                 <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                 <p className="text-sm font-medium">Harita Yükleniyor...</p>
               </>
             ) : (
               <p className="text-sm font-medium">Haritada gösterilecek geçerli adres bulunamadı.</p>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
