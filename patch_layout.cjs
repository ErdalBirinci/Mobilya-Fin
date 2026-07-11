const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const targetImport = `import { UserCircle, LogOut } from 'lucide-react';`;
const repImport = `import { UserCircle, LogOut, Bell } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { useState } from 'react';`;
content = content.replace(targetImport, repImport);

const targetComp = `export const Layout: React.FC = () => {
  const { currentUser, setCurrentUser } = useAppContext();`;
const repComp = `export const Layout: React.FC = () => {
  const { currentUser, setCurrentUser, notifications } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;`;
content = content.replace(targetComp, repComp);

const targetNav = `            <div className="flex items-center space-x-3 text-sm">`;
const repNav = `            <div className="relative flex items-center justify-center mr-2">
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
                <div className="absolute top-full right-0 mt-2 z-50 w-[360px]">
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-sm">`;
content = content.replace(targetNav, repNav);

fs.writeFileSync('src/components/Layout.tsx', content);
console.log('Layout patched');
