import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, users } from '../context/AppContext';
import { Truck, Package, Clock } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/driver-dashboard');
      }
    } else {
      setError('Geçersiz e-posta veya şifre.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sol Taraf - Görsel ve Marka */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-900">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80" 
            alt="Modern Mobilya" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between w-full p-12 lg:p-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-lg">
              S
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Sohvakeskus</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Operasyonlarınızı tek bir merkezden yönetin.
            </h1>
            <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
              Teslimat süreçlerini hızlandırın, sürücü rotalarını optimize edin ve müşteri memnuniyetini en üst düzeye çıkarın.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-indigo-100">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Truck size={20} />
                </div>
                <span className="font-medium">Gerçek Zamanlı Filo Takibi</span>
              </div>
              <div className="flex items-center gap-4 text-indigo-100">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Package size={20} />
                </div>
                <span className="font-medium">Akıllı Sipariş Yönetimi</span>
              </div>
              <div className="flex items-center gap-4 text-indigo-100">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Clock size={20} />
                </div>
                <span className="font-medium">Zamanında ve Güvenli Teslimat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Form */}
      <div className="flex-1 flex flex-col justify-center bg-slate-50 lg:bg-white relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[50%] rounded-full bg-indigo-100/50 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[50%] rounded-full bg-sky-100/50 blur-3xl" />
        </div>
        
        <div className="w-full max-w-md mx-auto px-6 sm:px-12 relative z-10">
          {/* Mobil Marka */}
          <div className="flex flex-col justify-center items-center lg:hidden mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-600/30 mb-4">
              S
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sohvakeskus</h2>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Hoş Geldiniz
            </h2>
            <p className="text-slate-500">
              Devam etmek için hesabınıza giriş yapın
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="text-red-600 font-bold">!</span>
                </div>
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm shadow-sm"
                    placeholder="admin@mobilya.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98]"
            >
              Sisteme Giriş Yap
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center lg:text-left">Demo Hesapları</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-sm">
                <span className="font-medium text-slate-600">Admin</span>
                <span className="text-slate-500 font-mono text-xs">admin@mobilya.com / password</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-sm">
                <span className="font-medium text-slate-600">Sürücü</span>
                <span className="text-slate-500 font-mono text-xs">driver@mobilya.com / password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
