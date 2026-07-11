const fs = require('fs');
const file = 'src/components/RouteMap.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<Popup minWidth={280}>
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

const replacement = `<Popup minWidth={300} maxWidth={320}>
                    <div className="p-1 min-w-[280px]">
                      <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-100">
                        <div>
                          <strong className="block text-sm font-bold text-slate-800 leading-tight">{marker.customerName}</strong>
                          <span className="text-[11px] text-slate-500">{marker.customerPhone}</span>
                        </div>
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-md \${
                          marker.type === 'ALIS' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }\`}>
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
                  </Popup>`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Patched correctly');
} else {
    console.log('Target not found in content!');
}
