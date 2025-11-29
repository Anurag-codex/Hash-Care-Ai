import React, { useState } from 'react';
import { HeartPulse, Mail, Lock, User, ArrowRight, ShieldCheck, Activity, Building2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../types';

export const Auth: React.FC = () => {
  const { login, register } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '',
    height: '',
    weight: '',
    gender: 'Male'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);

      if (!isLogin) {
          // Sign Up Flow
          const success = register({
            name: formData.name || (role === 'admin' ? 'Admin User' : 'User'),
            email: formData.email,
            role: role,
            height: formData.height || '175 cm',
            weight: formData.weight || '70 kg',
            gender: formData.gender,
            bloodType: 'O+', 
            emergencyContactName: 'Not Set',
            emergencyContactPhone: '',
            avatar: ''
          }, formData.password);

          if (success) {
            setSuccessMsg("Account created successfully! Please sign in with your credentials.");
            setIsLogin(true);
            setFormData(prev => ({ ...prev, password: '' })); // Clear password
          } else {
            setErrorMsg("User with this email already exists.");
          }
          return;
      }

      // Login Flow
      const result = login(formData.email, formData.password);
      if (!result.success) {
        setErrorMsg(result.message || "Login failed");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Left Side - Artistic/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-teal-800 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
               <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">HashCare AI</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-6">
            The Future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-brand-200">Intelligent Healthcare</span>
          </h1>
          
          <p className="text-slate-300 text-lg max-w-md mb-12 leading-relaxed">
            Experience agentic AI that monitors, predicts, and manages your health ecosystem in real-time. Secure, efficient, and proactive.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-slate-200">
               <div className="p-2 bg-white/10 rounded-lg"><Activity className="w-5 h-5" /></div>
               <span className="font-medium">Real-time Vitals Monitoring</span>
            </div>
            <div className="flex items-center gap-4 text-slate-200">
               <div className="p-2 bg-white/10 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
               <span className="font-medium">Secure Blockchain Records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{isLogin ? 'Welcome Back' : 'Join HashCare'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Select your role to continue.
            </p>
          </div>

          {successMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">{successMsg}</span>
              </div>
          )}

          {errorMsg && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">{errorMsg}</span>
              </div>
          )}

          {/* Role Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
            <button 
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${role === 'patient' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
                <User className="w-4 h-4" /> Patient
            </button>
            <button 
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
                <Building2 className="w-4 h-4" /> Hospital Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder={role === 'patient' ? "Anurag Kashyap" : "Vikram Malhotra"} 
                      className="w-full bg-white dark:bg-slate-800 dark:text-white border-slate-200 dark:border-slate-700 border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                {role === 'patient' && (
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Height (cm)</label>
                        <input 
                          type="number" 
                          placeholder="175" 
                          className="w-full bg-white dark:bg-slate-800 dark:text-white border-slate-200 dark:border-slate-700 border rounded-xl py-3 px-4 mt-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          value={formData.height}
                          onChange={e => setFormData({...formData, height: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Weight (kg)</label>
                        <input 
                          type="number" 
                          placeholder="70" 
                          className="w-full bg-white dark:bg-slate-800 dark:text-white border-slate-200 dark:border-slate-700 border rounded-xl py-3 px-4 mt-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          value={formData.weight}
                          onChange={e => setFormData({...formData, weight: e.target.value})}
                        />
                     </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors w-5 h-5" />
                <input 
                  type="email" 
                  placeholder={role === 'patient' ? "anurag@hashcare.com" : "admin@apollo.com"} 
                  className="w-full bg-white dark:bg-slate-800 dark:text-white border-slate-200 dark:border-slate-700 border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                {isLogin && <a href="#" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">Forgot?</a>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white dark:bg-slate-800 dark:text-white border-slate-200 dark:border-slate-700 border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {role === 'admin' && isLogin && (
                 <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-xs text-indigo-800 dark:text-indigo-300">
                        <strong>Security Check:</strong> 2FA will be required after login.
                    </div>
                 </div>
            )}

            <button 
                disabled={loading}
                className={`w-full text-white font-semibold rounded-xl py-3.5 shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    role === 'patient' 
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-brand-500/20' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-500/20'
                }`}
            >
               {loading ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
               ) : (
                 <>
                   {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                 </>
               )}
            </button>
          </form>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => { setIsLogin(!isLogin); setSuccessMsg(''); setErrorMsg(''); }} className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};