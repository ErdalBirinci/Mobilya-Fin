const fs = require('fs');
let code = fs.readFileSync('src/components/RouteOptimizer.tsx', 'utf8');

const oldHandleOptimizeRoute = `  const handleOptimizeRoute = async () => {
    if (pendingServices.length < 2) return;
    setIsCalculating(true);
    
    try {
      // 1. Koordinatları al
      const points = [];`;

const newHandleOptimizeRoute = `  const handleOptimizeRoute = async (useCurrentLocation = false) => {
    if (pendingServices.length < 2) return;
    setIsCalculating(true);
    
    try {
      let startCoords = null;
      if (useCurrentLocation && navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
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
      const points = [];`;

code = code.replace(oldHandleOptimizeRoute, newHandleOptimizeRoute);

const oldNearestNeighbor = `      const ordered = [];
      if (withCoords.length > 0) {
        // İlk noktadan başla
        let current = withCoords.shift();
        ordered.push(current.service);
        
        while (withCoords.length > 0) {`;

const newNearestNeighbor = `      const ordered = [];
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
        
        while (withCoords.length > 0) {`;

code = code.replace(oldNearestNeighbor, newNearestNeighbor);

const oldButtons = `        <div className="flex items-center gap-2">
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

const newButtons = `        <div className="flex items-center gap-2 flex-wrap justify-end">
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
        </div>`;

code = code.replace(oldButtons, newButtons);
fs.writeFileSync('src/components/RouteOptimizer.tsx', code);
console.log('Patched RouteOptimizer.tsx');
