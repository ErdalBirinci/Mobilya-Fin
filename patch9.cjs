const fs = require('fs');
const file = 'src/components/InventoryManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const target2 = `          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl border border-indigo-100 font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <Download size={18} />
            Dışa Aktar
          </button>`;

const rep2 = `          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-100 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 cursor-pointer"
          >
            <option value="Tümü">Tüm Durumlar</option>
            <option value="Vitrinde">Vitrinde</option>
            <option value="Satıldı">Satıldı</option>
            <option value="Rezerve">Rezerve</option>
            <option value="Kamyonda">Kamyonda</option>
            <option value="Teslim Edildi">Teslim Edildi</option>
          </select>
          <button 
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl border border-indigo-100 font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <Download size={18} />
            Dışa Aktar
          </button>`;

if(content.includes(target2)) {
    content = content.replace(target2, rep2);
    fs.writeFileSync(file, content);
    console.log('Patched correctly');
} else {
    console.log('Target not found!');
}
