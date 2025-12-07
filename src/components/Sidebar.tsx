import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, LayoutDashboard, Briefcase, CheckSquare, Image, FileText, Users, Calendar,
  DollarSign, Receipt, CreditCard, RefreshCw, ClipboardList, GraduationCap, TrendingUp, CalendarClock, Bell
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';


interface SidebarProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant', 'project_manager'] },
  { id: 'csr-partners', label: 'CSR Partners', icon: Briefcase, roles: ['admin',  'project_manager'] },
  { id: 'projects', label: 'Projects', icon: Briefcase, roles: ['admin', 'project_manager','accountant'] },
  { id: 'project-timeline', label: 'Project Timeline', icon: CalendarClock, roles: ['admin', 'project_manager'] },
  { id: 'todo', label: 'To-Do List Assignment', icon: CheckSquare, roles: ['admin', 'accountant', 'project_manager'] },
  { id: 'real-time-update', label: 'Real Time Update', icon: RefreshCw, roles: ['admin', 'project_manager'] },
  { id: 'media', label: 'Media', icon: Image, roles: ['admin', 'project_manager'] },
  { id: 'article', label: 'Article', icon: FileText, roles: ['admin', 'project_manager'] },
  { id: 'calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'accountant', 'project_manager'] },
  { id: 'project-expenses', label: 'Project Expenses', icon: DollarSign, roles: ['admin', 'accountant', 'project_manager'] },
  { id: 'admin-expenses', label: 'Admin Expenses', icon: Receipt, roles: ['admin'] },
  { id: 'acc-expense', label: 'Accountant Expenses', icon: FileText, roles: ['accountant'] },
  { id: 'daily-report', label: 'Daily Report', icon: ClipboardList, roles: ['admin', 'accountant', 'project_manager'] },
  { id: 'result-analysis', label: 'Result Analysis', icon: GraduationCap, roles: ['admin', 'project_manager', 'data_manager'] },
  { id: 'upcoming-expenses', label: 'Upcoming Expenses', icon: TrendingUp, roles: ['admin', 'project_manager','accountant','team_members'] },
  { id: 'acc-upcoming-expenses', label: 'Manage Upcoming Expenses', icon: TrendingUp, roles: ['admin', 'accountant'] },
  { id: 'bills', label: 'Bills', icon: Receipt, roles: ['admins'] },
  { id: 'csr-budget', label: 'CSR Budget', icon: CreditCard, roles: ['admin'] },
  // { id: 'utilization-certificate', label: 'Utilization Certificate', icon: FileCheck, roles: ['admin', 'accountant'] },
  { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare, roles: ['accountant', 'project_manager', 'team_member', 'data_manager'] },
  // Admin Only
  { id: 'user-management', label: 'User Management', icon: Users, roles: ['admin'] },
];

const Sidebar = ({ children, currentPage, onNavigate }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { currentRole, currentUser, logout } = useAuth();
  const { notificationCounts, expenseNotifications, taskNotifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get role from project context for non-admin users
  const getEffectiveRole = () => {
    // Admin and data_manager roles always come from users table
    if (currentRole === 'admin' || currentRole === 'data_manager') {
      return currentRole;
    }
    
    // For non-admin users, ALWAYS use role from project context
    const projectContextStr = localStorage.getItem('projectContext');
    if (projectContextStr) {
      try {
        const projectContext = JSON.parse(projectContextStr);
        if (projectContext.projectRole) {
          // Normalize role from project context (handles "Project Manager" or "project_manager")
          const normalized = projectContext.projectRole.toLowerCase().trim().replace(/\s+/g, '_');
          console.log('Sidebar using project role:', normalized, 'from context:', projectContext.projectRole);
          return normalized;
        }
      } catch (error) {
        console.error('Error parsing project context:', error);
      }
    }
    
    // If no project context, return team_member as safe default for non-admin users
    console.log('No project context found, defaulting to team_member');
    return 'team_member';
  };
  
  const effectiveRole = getEffectiveRole();
  console.log('Sidebar effectiveRole:', effectiveRole, 'currentRole from auth:', currentRole);
  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(effectiveRole));

  // Calculate role-based notification count for header badge
  const getHeaderNotificationCount = () => {
    if (effectiveRole === 'admin') {
      return 0; // Admin doesn't see task notifications
    } else if (effectiveRole === 'accountant') {
      return expenseNotifications + taskNotifications; // Accountant sees both
    } else {
      return taskNotifications; // Others see only tasks
    }
  };

  const headerNotificationCount = getHeaderNotificationCount();

  // Map menu IDs to routes
  const routeMap: Record<string, string> = {
    'dashboard': effectiveRole === 'admin' ? '/admin-dashboard' : 
                 effectiveRole === 'accountant' ? '/accountant-dashboard' :
                 effectiveRole === 'project_manager' ? '/pm-dashboard' :
                 effectiveRole === 'data_manager' ? '/data-manager' : '/team-member-dashboard',
    'csr-partners': '/csr-partners',
    'projects': '/projects',
    'project-timeline': '/project-timeline',
    'todo': '/todo',
    'real-time-update': '/real-time-update',
    'media': '/media',
    'article': '/article',
    'calendar': '/calendar',
    'project-expenses': '/project-expenses',
    'admin-expenses': '/admin-expenses',
    'acc-expense': '/acc-expense',
    'daily-report': '/daily-report',
    'csr-budget': '/csr-budget',
    'utilization-certificate': '/utilization-certificate',
    'upcoming-expenses': '/upcoming-expenses',
    'acc-upcoming-expenses': '/acc-upcoming-expenses',
    'bills': '/bills',
    'result-analysis': '/result-analysis',
    'my-tasks': '/my-tasks',
    'user-management': '/admin/users',
  };

  const handleNavigate = (itemId: string) => {
    const route = routeMap[itemId];
    if (route) {
      navigate(route);
    }
    onNavigate(itemId);
  };

  // Determine current active page from URL
  const isCurrentPage = (itemId: string) => {
    const route = routeMap[itemId];
    return route ? location.pathname === route : currentPage === itemId;
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.35 }}
            className="w-72 bg-white/70 backdrop-blur-2xl border-r border-emerald-100 shadow-xl flex flex-col rounded-r-4xl relative"
          >
            {/* Logo and Close Button */}
            <div className="p-6 pb-5 border-b border-emerald-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://img.logo.dev/mtdngo.com?token=pk_TWFfI7LzSyOkJp3PACHx6A"
                  alt="MTD Logo"
                  className="w-11 h-11 object-contain rounded-xl bg-white p-1.5 shadow-md ring-2 ring-emerald-200/70"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-emerald-900 truncate">{currentUser?.username}</p>
                  <p className="text-xs text-emerald-600 truncate">{currentUser?.email}</p>
                  <p className="text-xs text-emerald-500 truncate font-medium">@{currentUser?.username}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-emerald-100 rounded-lg transition-all hover:rotate-90 duration-300"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Bento Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide pt-5">
              <ul className="space-y-1.5">
                {filteredMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isCurrentPage(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                          ${isActive
                            ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                            : 'hover:bg-emerald-50/80 text-gray-700 hover:scale-[1.01] active:scale-[0.99]'
                          }`}
                        tabIndex={0}
                        aria-pressed={isActive}
                      >
                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-emerald-100/70'}`}>
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-700"}`} />
                        </div>
                        <span className={`text-sm font-medium flex-1 text-left ${isActive ? 'font-semibold' : ''}`}>
                          {item.label}
                        </span>
                        {notificationCounts[item.id] > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                              isActive 
                                ? 'bg-white text-emerald-600' 
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {notificationCounts[item.id]}
                          </motion.span>
                        )}
                        {isActive && !notificationCounts[item.id] && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-white shadow-sm"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout */}
            <div className="p-5 border-t border-gray-100">
              <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }} 
                className="logout-button w-full flex items-center gap-3 px-5 py-3 rounded-xl font-semibold"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isOpen && (
              <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-emerald-100 rounded-lg">
                <Menu className="w-6 h-6 text-emerald-700" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-emerald-800">
              {filteredMenuItems.find((item) => item.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>
          {headerNotificationCount > 0 && (
            <div className="relative">
              <button className="p-2 hover:bg-emerald-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-emerald-700" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {headerNotificationCount}
                </motion.span>
              </button>
            </div>
          )}
        </header>
        
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">{children}</main>
      </div>
    </div>
  );
};

export default Sidebar;
