
import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';

const AuthScreen: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for both Login and Registration
    // In production, use firebase auth methods
    if (username && password) {
      onLogin({ 
        uid: Math.random().toString(36).substr(2, 9), 
        username: username, 
        email: email || 'user@example.com' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#009572] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-400/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-6 mb-6 transition-transform hover:rotate-0">
            {isRegistering ? <UserPlus className="text-[#009572]" size={40} /> : <ShieldCheck className="text-[#009572]" size={40} />}
          </div>
          <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
            {isRegistering ? "Join Imran's Academy" : "Imran's Control Panel"}
          </h1>
          <p className="text-emerald-50 mt-2 font-medium opacity-80 uppercase text-[10px] tracking-[0.2em]">
            {isRegistering ? "Create your teacher profile" : "Secure Educator Login"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl space-y-5 border border-white/20">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Teacher ID"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-[#009572] transition-all font-semibold text-slate-800"
              />
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-1 animate-slide-down">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@academy.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-[#009572] transition-all font-semibold text-slate-800"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-[#009572] transition-all font-semibold text-slate-800"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#009572] hover:bg-[#007d60] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 transition-all active:scale-95 group mt-4"
          >
            {isRegistering ? "Create Account" : "Access Dashboard"} 
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-slate-500 text-xs font-bold hover:text-[#009572] transition-colors"
            >
              {isRegistering ? "Already have an account? Log In" : "Need an account? Register Now"}
            </button>
          </div>
        </form>
        
        <p className="text-emerald-100/50 text-[10px] text-center mt-8 font-bold uppercase tracking-widest">
          Cloud Backup Enabled • Restricted Private System
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
