import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, X, Check, AlertTriangle, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../context/AppContext';
import { InventoryItem, InventoryStatus } from '../types';
import { exportToCsv } from '../utils/export';

export const InventoryManager: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [qrItem, setQrItem] = useState<InventoryItem | null>(null);

  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id' | 'tenantId'>>({
    name: '',
    quantity: 0,
    status: 'Mevcut',
  });

  const [editItem, setEditItem] = useState<Partial<InventoryItem>>({});

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newItem.name.trim()) return;
    addInventoryItem({
      name: newItem.name,
      quantity: Number(newItem.quantity),
      status: newItem.status,
    });
    setIsAdding(false);
    setNewItem({ name: '', quantity: 0, status: 'Mevcut' });
  };

  const handleUpdate = () => {
    if (editingId && editItem) {
      updateInventoryItem(editingId, {
        ...editItem,
        quantity: Number(editItem.quantity),
      });
      setEditingId(null);
      setEditItem({});
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Ürün Adı', 'Stok Miktarı', 'Durum']
    ];
    filteredInventory.forEach(item => {
      rows.push([
        item.name,
        item.quantity,
        item.status
      ]);
    });
    exportToCsv('stok_listesi.csv', rows);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Stok Yönetimi</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
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
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Yeni Ekle
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-50 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold w-1/2">Ürün Adı</th>
              <th className="px-6 py-4 font-semibold w-1/4">Stok</th>
              <th className="px-6 py-4 font-semibold w-1/4">Durum</th>
              <th className="px-6 py-4 font-semibold text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isAdding && (
              <tr className="bg-indigo-50/30">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Ürün Adı"
                    className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    autoFocus
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-20 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                  />
                </td>
                <td className="px-6 py-3">
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value as InventoryStatus })}
                    className="bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Mevcut">Mevcut</option>
                    <option value="Tükendi">Tükendi</option>
                    <option value="Rezerve">Rezerve</option>
                    <option value="Kamyonda">Kamyonda</option>
                    <option value="Teslim Edildi">Teslim Edildi</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={handleAdd} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setIsAdding(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {filteredInventory.map((item) => {
              const isEditing = editingId === item.id;

              if (isEditing) {
                return (
                  <tr key={item.id} className="bg-slate-50/50">
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editItem.name || ''}
                        onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="number"
                        value={editItem.quantity || 0}
                        onChange={(e) => setEditItem({ ...editItem, quantity: Number(e.target.value) })}
                        className="w-20 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <select
                        value={editItem.status || 'Mevcut'}
                        onChange={(e) => setEditItem({ ...editItem, status: e.target.value as InventoryStatus })}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="Mevcut">Mevcut</option>
                        <option value="Tükendi">Tükendi</option>
                        <option value="Rezerve">Rezerve</option>
                        <option value="Kamyonda">Kamyonda</option>
                        <option value="Teslim Edildi">Teslim Edildi</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={handleUpdate} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                          <Check size={18} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 font-mono font-bold flex items-center gap-2">
                    {item.quantity} Adet
                    {item.quantity < 5 && (
                      <AlertTriangle size={16} className="text-rose-500" title="Kritik Stok Seviyesi" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                        item.status === 'Mevcut'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'Tükendi'
                          ? 'bg-red-100 text-red-700'
                          : item.status === 'Rezerve'
                          ? 'bg-amber-100 text-amber-700'
                          : item.status === 'Kamyonda'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setQrItem(item)}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-md transition-colors"
                        title="QR Kod Oluştur"
                      >
                        <QrCode size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditItem(item);
                        }}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-md transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteInventoryItem(item.id)}
                        className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredInventory.length === 0 && !isAdding && (
          <div className="text-center py-8 text-slate-400 font-medium">Stok kaydı bulunamadı.</div>
        )}
      </div>

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-8 w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold shadow-md flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Yeni Ürün Ekle</span>
        </button>
      )}

      {qrItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
            <button 
              onClick={() => setQrItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{qrItem.name}</h3>
              <p className="text-sm text-slate-500 font-medium">QR Kodu Yazdır</p>
            </div>

            <div className="flex justify-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
              <QRCodeSVG 
                value={qrItem.id} 
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>

            <button 
              onClick={() => window.print()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex flex-col items-center shadow-md hover:bg-indigo-700 transition-colors"
            >
              <span>Yazdır</span>
            </button>
            
            <style>
              {`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  .bg-white.rounded-3xl.p-8, .bg-white.rounded-3xl.p-8 * {
                    visibility: visible;
                  }
                  .bg-white.rounded-3xl.p-8 {
                    position: absolute;
                    left: 0;
                    top: 0;
                    margin: 0;
                    padding: 0;
                    box-shadow: none;
                    border: none;
                  }
                  button {
                    display: none !important;
                  }
                }
              `}
            </style>
          </div>
        </div>
      )}
    </div>
  );
};
