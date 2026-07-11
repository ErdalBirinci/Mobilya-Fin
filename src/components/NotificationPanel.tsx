import React, { useState } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AppNotification } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface NotificationPanelProps {
  onClose?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'INFO': return <Info size={18} className="text-blue-500" />;
      case 'WARNING': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'SUCCESS': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'ERROR': return <XCircle size={18} className="text-rose-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const getBgColor = (type: AppNotification['type'], read: boolean) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'INFO': return 'bg-blue-50/50';
      case 'WARNING': return 'bg-amber-50/50';
      case 'SUCCESS': return 'bg-emerald-50/50';
      case 'ERROR': return 'bg-rose-50/50';
      default: return 'bg-slate-50/50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 max-h-[80vh] w-full max-w-sm">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-800">Bildirimler</h3>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button 
              onClick={markAllNotificationsAsRead}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Tümünü Okundu İşaretle
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <Bell size={32} className="text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">Henüz hiç bildiriminiz yok.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-3 rounded-xl border border-slate-100 transition-colors cursor-pointer hover:border-indigo-200 ${getBgColor(notif.type, notif.read)}`}
              onClick={() => !notif.read && markNotificationAsRead(notif.id)}
            >
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-bold truncate ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-0.5">
                      {format(new Date(notif.createdAt), 'HH:mm', { locale: tr })}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
