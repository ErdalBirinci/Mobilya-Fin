const fs = require('fs');
const file = 'src/components/InventoryManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  const [editItem, setEditItem] = useState<Partial<InventoryItem>>({});

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );`;

const rep1 = `  const [editItem, setEditItem] = useState<Partial<InventoryItem>>({});
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | 'Tümü'>('Tümü');

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tümü' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });`;

content = content.replace(target1, rep1);

const target2 = `        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 bg-slate-50 transition-all font-medium"
            />
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={16} />
            Dışa Aktar
          </button>
        </div>`;

const rep2 = `        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 bg-slate-50 transition-all font-medium"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-bold text-slate-700 cursor-pointer shadow-sm"
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
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={16} />
            Dışa Aktar
          </button>
        </div>`;

content = content.replace(target2, rep2);
fs.writeFileSync(file, content);
console.log('Patched');
