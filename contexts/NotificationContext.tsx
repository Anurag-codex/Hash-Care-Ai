
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon, Bell } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  duration?: number;
}

interface NotificationContextType {
  notifications: Toast[]; // History
  addNotification: (type: Toast['type'], title: string, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Toast[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]); // Active toasts on screen

  const addNotification = useCallback((type: Toast['type'], title: string, message: string, duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: Toast = { 
        id, 
        type, 
        title, 
        message, 
        duration, 
        timestamp: new Date(), 
        read: false 
    };

    // Add to History
    setNotifications((prev) => [newToast, ...prev]);
    
    // Add to Active Toasts (Popups)
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss toast (but keep in history)
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((t) => t.id !== id));
    dismissToast(id);
  }, [dismissToast]);

  const markAsRead = useCallback((id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => {
      setNotifications([]);
      setToasts([]);
  }, []);

  // --- Simulation of Real-Time Alerts ---
  useEffect(() => {
      const interval = setInterval(() => {
          // 20% chance to trigger a random notification every 10 seconds
          if (Math.random() > 0.8) {
              const scenarios = [
                  { type: 'info', title: 'Hydration Reminder', msg: 'Time to drink a glass of water.' },
                  { type: 'success', title: 'Goal Reached', msg: 'You hit your 5000 step goal!' },
                  { type: 'warning', title: 'Sedentary Alert', msg: 'You have been sitting for 1 hour. Walk around.' },
                  { type: 'info', title: 'Dr. Sharma Available', msg: 'Dr. Sharma has opened new slots for tomorrow.' },
                  { type: 'warning', title: 'High UV Index', msg: 'UV levels are high outside. Wear sunscreen.' }
              ];
              const s = scenarios[Math.floor(Math.random() * scenarios.length)];
              addNotification(s.type as any, s.title, s.msg);
          }
      }, 10000);
      return () => clearInterval(interval);
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, markAsRead, clearAll, unreadCount }}>
      {children}
      
      {/* Toast Container (Visual Popups) */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto transform transition-all duration-500 animate-in slide-in-from-right-full p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl ${
                toast.type === 'critical' ? 'bg-red-500/90 border-red-600 text-white' :
                toast.type === 'error' ? 'bg-rose-50 dark:bg-rose-900/90 border-rose-200 dark:border-rose-700 text-rose-800 dark:text-white' :
                toast.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/90 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-white' :
                toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-white' :
                'bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white'
            }`}
          >
             <div className="mt-0.5 shrink-0">
                 {toast.type === 'critical' && <AlertOctagon className="w-5 h-5 text-white animate-pulse" />}
                 {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />}
                 {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
                 {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
                 {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
             </div>
             <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
                 <p className={`text-xs mt-1 leading-relaxed ${toast.type === 'critical' ? 'text-red-100' : 'opacity-90'}`}>{toast.message}</p>
             </div>
             <button onClick={() => dismissToast(toast.id)} className="opacity-70 hover:opacity-100 transition-opacity">
                 <X className="w-4 h-4" />
             </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
