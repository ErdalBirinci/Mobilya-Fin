const fs = require('fs');
const file = 'src/components/ServiceCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <label className="text-sm font-bold text-slate-600 mr-4">Durumu Güncelle:</label>
                <select
                  value={service.status}
                  onChange={handleStatusChange}
                  className={cn(
                    "text-sm font-bold py-2 px-4 rounded-lg border outline-none appearance-none cursor-pointer transition-colors shadow-sm",
                    service.status === 'Planlandı' ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' :
                    service.status === 'Yolda' ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' :
                    service.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' :
                    service.status === 'İptal Edildi' ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' :
                    'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
                  )}
                >
                  <option value="Planlandı">Planlandı</option>
                  <option value="Yolda">Yolda</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="Ertelendi">Ertelendi</option>
                  <option value="İptal Edildi">İptal Edildi</option>
                </select>
              </div>`;

const replacement = `            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-600 mr-2">Hızlı İşlem:</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateStatus(service.id, 'Yolda'); }}
                  disabled={service.status === 'Yolda'}
                  className={cn(
                    "px-4 py-2 text-sm font-bold rounded-lg border transition-colors shadow-sm",
                    service.status === 'Yolda' 
                      ? 'bg-indigo-600 text-white border-indigo-700' 
                      : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                  )}
                >
                  🚚 Yolda
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateStatus(service.id, 'Tamamlandı'); }}
                  disabled={service.status === 'Tamamlandı'}
                  className={cn(
                    "px-4 py-2 text-sm font-bold rounded-lg border transition-colors shadow-sm",
                    service.status === 'Tamamlandı' 
                      ? 'bg-emerald-600 text-white border-emerald-700' 
                      : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  )}
                >
                  ✅ {isAlis ? 'Mobilya Teslim Alındı' : 'Teslim Edildi'}
                </button>
                
                <div className="relative ml-auto">
                  <select
                    value={service.status}
                    onChange={handleStatusChange}
                    className={cn(
                      "text-sm font-bold py-2 px-4 rounded-lg border outline-none appearance-none cursor-pointer transition-colors shadow-sm bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    <option value="Planlandı">Planlandı</option>
                    <option value="Ertelendi">Ertelendi</option>
                    <option value="İptal Edildi">İptal Edildi</option>
                    <option value="Yolda" disabled className="hidden">Yolda</option>
                    <option value="Tamamlandı" disabled className="hidden">Tamamlandı</option>
                  </select>
                </div>
              </div>`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Patched correctly');
} else {
    console.log('Target not found in content!');
}
