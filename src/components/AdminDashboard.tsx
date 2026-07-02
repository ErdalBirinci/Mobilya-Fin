import React, { useState } from 'react';
import { Package, Truck, Search, Plus, BarChart2, Shield, AlertTriangle, PieChart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ServiceList } from './ServiceList';
import { InventoryManager } from './InventoryManager';
import { NewServiceForm } from './NewServiceForm';
import { Reporting } from './Reporting';
import { AuditLogViewer } from './AuditLogViewer';
import { ExecutiveAnalytics } from './ExecutiveAnalytics';
import { AddressHistoryReport } from './AddressHistoryReport';
import { MapPin } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { inventory } = useAppContext();
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'INVENTORY' | 'NEW_SERVICE' | 'REPORTS' | 'AUDIT_LOGS' | 'ANALYTICS' | 'ADDRESS_HISTORY'>('SERVICES');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const hasCriticalStock = inventory.some((item) => item.quantity < 5);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex space-x-2 bg-slate-100 p-1.5 rounded-xl overflow-x-auto">
        <button 
          onClick={() => setActiveTab('SERVICES')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'SERVICES' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <Truck size={18} />
          <span>Servisler</span>
        </button>
        <button 
          onClick={() => setActiveTab('INVENTORY')}
          className={`relative flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'INVENTORY' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <Package size={18} />
          <span>Stok Durumu</span>
          {hasCriticalStock && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('REPORTS')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'REPORTS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <BarChart2 size={18} />
          <span>Raporlar</span>
        </button>
        <button 
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'ANALYTICS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <PieChart size={18} />
          <span>Analitik</span>
        </button>
        <button 
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'AUDIT_LOGS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <Shield size={18} />
          <span>Loglar</span>
        </button>
        <button 
          onClick={() => setActiveTab('ADDRESS_HISTORY')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'ADDRESS_HISTORY' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <MapPin size={18} />
          <span>Adres Geçmişi</span>
        </button>
      </div>

      {activeTab === 'SERVICES' && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Günlük Servis Planı</h2>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-100 border-none rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          
          <ServiceList date={date} />
          
          <button 
            onClick={() => setActiveTab('NEW_SERVICE')}
            className="mt-8 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Yeni Servis Ekle</span>
          </button>
        </div>
      )}

      {activeTab === 'INVENTORY' && (
        <InventoryManager />
      )}

      {activeTab === 'REPORTS' && (
        <Reporting />
      )}

      {activeTab === 'ANALYTICS' && (
        <ExecutiveAnalytics />
      )}

      {activeTab === 'AUDIT_LOGS' && (
        <AuditLogViewer />
      )}

      {activeTab === 'ADDRESS_HISTORY' && (
        <AddressHistoryReport />
      )}

      {activeTab === 'NEW_SERVICE' && (
        <NewServiceForm onCancel={() => setActiveTab('SERVICES')} />
      )}
    </div>
  );
};
