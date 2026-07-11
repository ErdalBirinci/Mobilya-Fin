const fs = require('fs');
const file = 'src/components/RouteMap.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<Popup>
                    <div className="p-1">
                      <strong className="block text-sm mb-1">{marker.customerName}</strong>
                      <span className="text-xs text-slate-500 block">{marker.customerAddress}</span>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold inline-block px-2 py-1 bg-slate-100 rounded-md">
                          {marker.status}
                        </span>
                        <a
                          href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(marker.customerAddress)}\`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-md transition-colors whitespace-nowrap"
                        >
                          Haritada Aç
                        </a>
                      </div>
                    </div>
                  </Popup>`;

const replacement = `<Popup minWidth={280}>
                    <div className="p-2 min-w-[260px]">
                      <div className="flex justify-between items-start mb-2">
                        <strong className="block text-sm text-slate-800">{marker.customerName}</strong>
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                          marker.type === 'ALIS' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }\`}>
                          {marker.type}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 mb-3">
                        <p className="text-xs text-slate-600 flex items-start gap-1">
                          <span className="font-semibold text-slate-700 min-w-[50px]">Adres:</span>
                          <span className="break-words">{marker.customerAddress}</span>
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <span className="font-semibold text-slate-700 min-w-[50px]">Saat:</span>
                          <span>{marker.timeRange}</span>
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <span className="font-semibold text-slate-700 min-w-[50px]">Telefon:</span>
                          <span>{marker.customerPhone}</span>
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <span className="font-semibold text-slate-700 min-w-[50px]">Tutar:</span>
                          <span>{marker.totalAmount} TL ({marker.paymentMethod})</span>
                        </p>
                        {marker.notes && (
                          <p className="text-xs text-slate-600 flex items-start gap-1">
                            <span className="font-semibold text-slate-700 min-w-[50px]">Not:</span>
                            <span className="italic line-clamp-2">{marker.notes}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <span className={\`text-[11px] font-semibold px-2 py-1 rounded-md \${
                          marker.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' :
                          marker.status === 'Yolda' ? 'bg-amber-100 text-amber-700' :
                          'bg-indigo-100 text-indigo-700'
                        }\`}>
                          {marker.status}
                        </span>
                        
                        <a
                          href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(marker.customerAddress)}\`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer no-underline"
                        >
                          📍 Haritada Aç
                        </a>
                      </div>
                    </div>
                  </Popup>`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Patched correctly');
} else {
    console.log('Target not found in content!');
}
