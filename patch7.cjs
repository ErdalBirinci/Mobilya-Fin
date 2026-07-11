const fs = require('fs');
const file = 'src/components/ServiceCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">Saha ve Park Notu</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fieldNoteInput}
                  onChange={(e) => setFieldNoteInput(e.target.value)}
                  placeholder="Örn: Kamyoneti arka sokağa park edin..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button
                  onClick={handleSaveFieldNote}
                  disabled={isSavingNote || fieldNoteInput === service.fieldNote}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors",
                    isSavingNote ? "bg-emerald-500 text-white" : 
                    fieldNoteInput !== service.fieldNote ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 text-slate-400"
                  )}
                >
                  <Save size={16} />
                  {isSavingNote ? 'Kaydedildi' : 'Kaydet'}
                </button>
              </div>
            </div>`;

const replacement = `            <div className="mb-5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-indigo-600" />
                Saha Notları (Erişim, Bina, Park vb.)
              </label>
              <div className="flex flex-col gap-3">
                <textarea
                  value={fieldNoteInput}
                  onChange={(e) => setFieldNoteInput(e.target.value)}
                  placeholder="Sürücüler için teslimat adresindeki erişim zorluklarını veya bina detaylarını kaydedin... (Örn: Giriş arka sokaktan, 3. katta asansör yok vs.)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px] resize-y"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveFieldNote}
                    disabled={isSavingNote || fieldNoteInput === service.fieldNote}
                    className={cn(
                      "px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm",
                      isSavingNote ? "bg-emerald-500 text-white" : 
                      fieldNoteInput !== service.fieldNote ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 text-slate-400"
                    )}
                  >
                    <Save size={16} />
                    {isSavingNote ? 'Kaydedildi' : 'Notu Kaydet'}
                  </button>
                </div>
              </div>
            </div>`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Patched correctly');
} else {
    console.log('Target not found in content!');
}
