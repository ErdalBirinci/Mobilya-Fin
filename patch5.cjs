const fs = require('fs');
const file = 'src/components/RouteMap.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change Polyline color
content = content.replace(/color: '#6366f1'/g, "color: '#94a3b8'");

// Add legend
const legendHtml = `
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Günün Rota Haritası (Adres Bazlı)</h3>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-xs text-slate-600 font-medium">Alış</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-xs text-slate-600 font-medium">Satış</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-500"></span><span className="text-xs text-slate-600 font-medium">Tamamlandı</span></div>
        </div>
        {isLoading && <span className="text-xs text-indigo-600 animate-pulse font-semibold">Adresler haritaya işleniyor...</span>}
      </div>
`;

const oldHeader = `      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Günün Rota Haritası (Adres Bazlı)</h3>
        {isLoading && <span className="text-xs text-indigo-600 animate-pulse font-semibold">Adresler haritaya işleniyor...</span>}
      </div>`;

if(content.includes(oldHeader)) {
    content = content.replace(oldHeader, legendHtml);
}

// Make sure colors are explicitly correct in the marker
const markerCode = `const bgColor = isCompleted ? '#64748b' : (marker.type === 'ALIS' ? '#10b981' : '#3b82f6'); // Completed: Slate, Alis: Emerald, Satis: Blue`;
const newMarkerCode = `const bgColor = isCompleted ? '#64748b' : (marker.type === 'ALIS' ? '#10b981' : (marker.type === 'SATIS' ? '#3b82f6' : '#8b5cf6')); // Purple fallback`;
content = content.replace(markerCode, newMarkerCode);

fs.writeFileSync(file, content);
console.log('Patched correctly');
