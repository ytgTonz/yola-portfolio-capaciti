import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export function Admin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAlreadyAdmin = localStorage.getItem('yola_is_admin') === 'true';
    setIsAdmin(isAlreadyAdmin);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === 'yola2026') {
      localStorage.setItem('yola_is_admin', 'true');
      setIsAdmin(true);
      setError('');
      setPassword('');
      // Trigger a storage event to let other open tabs/windows know if needed, or just redirect
      window.dispatchEvent(new Event('storage'));
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('yola_is_admin');
    setIsAdmin(false);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="max-w-md mx-auto px-6 py-20 flex-grow w-full flex flex-col justify-center items-center min-h-[70vh]"
    >
      {isAdmin ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-100 shadow-xl rounded-sm p-8 text-center w-full"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-green-600" size={32} />
          </div>
          <h2 className="text-sm uppercase tracking-widest font-bold text-gray-800 mb-2">Admin Mode Active</h2>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">
            You now have full administrative privileges to add, edit, or delete items on the Certifications and Projects pages.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/certifications')}
              className="w-full py-2.5 bg-black text-white rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
            >
              Go to Certifications
            </button>
            <button 
              onClick={() => navigate('/projects')}
              className="w-full py-2.5 bg-black text-white rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
            >
              Go to Projects
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-2.5 bg-gray-100 text-black rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors"
            >
              Exit Admin Mode
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 shadow-xl rounded-sm p-8 w-full"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="text-gray-800" size={32} />
          </div>
          <h2 className="text-sm uppercase tracking-widest font-bold text-gray-800 mb-2 text-center">Secret Admin Portal</h2>
          <p className="text-xs text-gray-400 mb-6 text-center leading-relaxed">
            Enter the administrative password to enable content editing tools.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2.5 text-xs focus:outline-none focus:border-black"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                <ShieldAlert size={12} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-2.5 bg-black text-white rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
            >
              Authenticate
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-[9px] text-gray-400 font-mono">
              Default password: admin or yola2026
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
