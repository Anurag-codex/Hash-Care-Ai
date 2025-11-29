
import React, { useState } from 'react';
import { Page, NavItem, UserRole } from '../types';
import { 
  LayoutDashboard, Stethoscope, Activity, HeartPulse, AlertCircle, 
  ShieldCheck, Building2, Users, Settings, Menu, Bell, 
  Search, LogOut, ChevronRight, Map, FileText, Pill, CreditCard, Bed, User, Smartphone, Ruler,
  Ambulance, Bot, BrainCircuit, ChevronLeft, Trash2, X, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { Avatar, Badge, Button } from './Common';

// --- Navigation Configurations ---

const PATIENT_NAV_ITEMS: NavItem[] = [
  { id: Page.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { id: Page.MAP, label: 'Find Hospitals', icon: Map },
  { id: Page.CHAT, label: 'Health Assistant', icon: Stethoscope },
  { id: Page.HEALTH_CHAT, label: 'AI Health Chat', icon: Bot },
  { id: Page.MEDICAL_TRACKER, label: 'Medical & Diet', icon: Activity },
  { id: Page.IOT_MONITOR, label: 'IoT Monitor', icon: HeartPulse },
  { id: Page.SOS, label: 'Emergency SOS', icon: AlertCircle },
  { id: Page.INSURANCE, label: 'Insurance', icon: ShieldCheck },
  { id: Page.MEDICAL_INTELLIGENCE, label: 'Medical Intelligence', icon: BrainCircuit },
  { id: Page.COMMUNITY, label: 'Community', icon: Users },
  { id: Page.SETTINGS, label: 'Settings', icon: Settings },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: Page.ADMIN_DASHBOARD, label: 'Admin Dashboard', icon: LayoutDashboard },
  { id: Page.AMBULANCE_COMMAND, label: 'Ambulance Command', icon: Ambulance },
  { id: Page.STAFF_MANAGEMENT, label: 'Staff Management', icon: Users },
  { id: Page.BED_ALLOCATION, label: 'Bed Allocation', icon: Bed },
  { id: Page.APPOINTMENTS, label: 'Appointments', icon: CalendarIcon },
  { id: Page.PHARMACY, label: 'Pharmacy & Inventory', icon: Pill },
  { id: Page.SETTINGS, label: 'Settings', icon: Settings },
];

function CalendarIcon(props: any) { return <FileText {...props} /> }

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
  userRole: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<{ 
    currentPage: Page; 
    onNavigate: (page: Page) => void; 
    isOpen: boolean; 
    onClose: () => void; 
    userRole: UserRole; 
    onLogout: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}> = ({ currentPage, onNavigate, isOpen, onClose, userRole, onLogout, isCollapsed, toggleCollapse }) => {
  const items = userRole === 'admin' ? ADMIN_NAV_ITEMS : PATIENT_NAV_ITEMS;

  return (
    <>
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 shadow-xl transform transition-all duration-300 ease-in-out 
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
            w-64
        `}
      >
        <div className="h-full flex flex-col">
          <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-slate-50 dark:border-slate-700 shrink-0 transition-all`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shrink-0 ${userRole === 'admin' ? 'bg-indigo-600' : 'bg-gradient-to-br from-brand-400 to-brand-600'}`}>
              {userRole === 'admin' ? <Building2 className="text-white w-5 h-5" /> : <HeartPulse className="text-white w-5 h-5" />}
            </div>
            {!isCollapsed && (
                <div className="ml-3 overflow-hidden whitespace-nowrap">
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-400 block">HashCare AI</span>
                    {userRole === 'admin' && <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-bold">Admin Portal</span>}
                </div>
            )}
          </div>

          {/* Collapse Toggle (Desktop Only) */}
          <button 
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full p-1 text-slate-500 hover:text-brand-500 shadow-md z-50"
          >
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    {!isCollapsed && (
                        <>
                            <span className="truncate">{item.label}</span>
                            {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                        </>
                    )}
                    {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                        </div>
                    )}
                  </button>
                );
            })}
          </div>

          <div className={`p-4 border-t border-slate-50 dark:border-slate-700 shrink-0 mt-auto ${isCollapsed ? 'flex justify-center' : ''}`}>
             <button 
                  onClick={onLogout}
                  className={`flex items-center ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'w-full gap-3 px-3 py-2.5'} rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors`}
                  title="Sign Out"
              >
                  <LogOut className="w-4 h-4 shrink-0" />
                  {!isCollapsed && "Sign Out"}
              </button>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={onClose}
        />
      )}
    </>
  );
};

const Header: React.FC<{ onMenuClick: () => void; userRole: UserRole }> = ({ onMenuClick, userRole }) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user } = useUser();
    const { notifications, removeNotification, clearAll, unreadCount } = useNotification();

    return (
        <header className="sticky top-0 z-30 h-16 px-4 lg:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={userRole === 'admin' ? "Search patients, staff..." : "Search health records..."}
                        className="bg-transparent border-none focus:outline-none text-sm w-48 placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                 {/* Notifications */}
                 <div className="relative">
                    <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative text-slate-500 dark:text-slate-400 transition-colors">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {notificationsOpen && (
                        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-5 z-50">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Notifications</h4>
                                {notifications.length > 0 && (
                                    <button onClick={clearAll} className="text-[10px] text-slate-500 hover:text-red-500 flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> Clear All
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-xs">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="p-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex gap-3 items-start group transition-colors relative">
                                            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                                                notif.type === 'critical' ? 'bg-red-500 animate-pulse' : 
                                                notif.type === 'warning' ? 'bg-amber-500' : 
                                                notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                            }`}></div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{notif.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{notif.timestamp.toLocaleTimeString()}</p>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                                                className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                        <Avatar name={user?.name || 'User'} size="sm" />
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{userRole === 'admin' ? 'Admin' : 'Patient ID: #8492'}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 hidden md:block transition-transform ${profileOpen ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {profileOpen && (
                         <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 animate-in fade-in slide-in-from-top-5 z-50">
                             {/* Profile Content from previous step */}
                             <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700 mb-3">
                                <Avatar name={user?.name || 'User'} size="md" />
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white">{user?.name}</p>
                                    <p className="text-xs text-slate-500">{user?.email}</p>
                                </div>
                             </div>
                             {userRole === 'patient' && (
                                 <div className="grid grid-cols-2 gap-2 mb-3">
                                     <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-lg">
                                         <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                                            <Ruler className="w-3 h-3" /> Height
                                         </div>
                                         <div className="text-sm font-semibold text-slate-800 dark:text-white">{user?.height || '--'}</div>
                                     </div>
                                     <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-lg">
                                         <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                                            <Activity className="w-3 h-3" /> Weight
                                         </div>
                                         <div className="text-sm font-semibold text-slate-800 dark:text-white">{user?.weight || '--'}</div>
                                     </div>
                                 </div>
                             )}
                             <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded-lg flex items-start gap-2 border border-red-100 dark:border-red-900/20">
                                 <Smartphone className="w-4 h-4 text-red-500 mt-0.5" />
                                 <div>
                                     <p className="text-xs font-bold text-red-600 dark:text-red-400">Emergency Contact</p>
                                     <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{user?.emergencyContactName || 'Not Set'}</p>
                                     <p className="text-[10px] text-slate-500">{user?.emergencyContactPhone}</p>
                                 </div>
                             </div>
                         </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, onNavigate, children, userRole, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 flex transition-colors duration-300">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userRole={userRole}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} userRole={userRole} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden overflow-y-auto relative">
          <div className="max-w-7xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
