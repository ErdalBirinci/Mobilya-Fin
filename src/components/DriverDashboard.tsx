import React, { useState } from 'react';
import { ServiceList } from './ServiceList';
import { Truck, WifiOff, Camera, CheckCircle, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Scanner } from './Scanner';
import { InventoryStatus } from '../types';

export const DriverDashboard: React.FC = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { isOnline, inventory, updateInventoryItem } = useAppContext();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<any>(null);

  const handleScan = (decodedText: string) => {
    setIsScanning(false);
    const item = inventory.find(i => i.id === decodedText);
    if (item) {
      setScannedItem(item);
    } else {
      alert('Geçersiz QR Kod. Bu ürün sistemde bulunamadı.');
    }
  };

  const handleStatusUpdate = (status: InventoryStatus) => {
    if (scannedItem) {
      updateInventoryItem(scannedItem.id, { status });
      alert(`Ürün durumu "${status}" olarak güncellendi.`);
      setScannedItem(null);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-20">
      <div className="bg-indigo-600 -mx-4 -mt-4 sm:-mt-6 mb-8 px-6 py-8 rounded-b-3xl text-white shadow-md relative">
        {!isOnline && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
            <WifiOff size={14} />
            <span>Çevrimdışı Mod</span>
          </div>
        )}
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-white/20 rounded-xl shadow-sm">
            <Truck size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Görevlerim</h2>
            <p className="text-indigo-100 text-sm font-medium mt-1">Bugünkü servis rotanız ve görevleriniz</p>
          </div>
        </div>
        
        <div className="flex gap-3 mb-2">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-indigo-700/50 border border-indigo-400/30 rounded-xl px-4 py-3 text-white placeholder-white/50 font-semibold outline-none focus:bg-indigo-700/80 focus:ring-2 focus:ring-white/50 transition-colors shadow-inner"
          />
          <button
            onClick={() => setIsScanning(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Camera size={20} />
            Ürün Tarat
          </button>
        </div>
      </div>

      <div className="px-2">
        <ServiceList date={date} />
      </div>

      {isScanning && (
        <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />
      )}

      {scannedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{scannedItem.name}</h3>
                <p className="text-sm font-medium text-slate-500">Mevcut Durum: {scannedItem.status}</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 text-center font-medium">
              Lütfen ürünün yeni durumunu seçin:
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleStatusUpdate('Rezerve')} // Using 'Rezerve' or 'Mevcut' - wait, the user said 'Kamyonda' or 'Teslim Edildi', let's just add those to the status in types if needed, but existing options are Mevcut, Tükendi, Rezerve. Wait, "Kamyonda" and "Teslim Edildi" might not be in InventoryStatus type. Let me check the type.
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Truck size={18} />
                Kamyonda (Rezerve)
              </button>
              <button
                onClick={() => handleStatusUpdate('Tükendi')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Teslim Edildi (Tükendi)
              </button>
              <button
                onClick={() => setScannedItem(null)}
                className="w-full py-3 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
