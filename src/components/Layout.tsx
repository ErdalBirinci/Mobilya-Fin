import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserCircle, LogOut, Bell } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { useState } from 'react';

export const Layout: React.FC = () => {
  const { currentUser, setCurrentUser, notifications } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
              S
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">Sohvakeskus</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center justify-center mr-2">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-[-60px] sm:right-0 mt-2 z-50 w-[320px] sm:w-[360px]">
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <UserCircle size={24} className="text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-800">{currentUser.name}</span>
                <span className="text-xs text-slate-400">{currentUser.role === 'ADMIN' ? 'Yönetici' : 'Saha Ekibi'}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
              title="Çıkış Yap"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
