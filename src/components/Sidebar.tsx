// import { useState } from 'react';
// import type { ReactNode } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Menu, X, LogOut, LayoutDashboard, Briefcase, CheckSquare, Image, FileText, Users, Calendar, DollarSign, Receipt, CreditCard, BarChart3 } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// interface SidebarProps {
//   children: ReactNode;
//   currentPage: string;
//   onNavigate: (page: string) => void;
// }

// const Sidebar = ({ children, currentPage, onNavigate }: SidebarProps) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const { currentRole, currentUser, logout } = useAuth();

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant', 'project-manager'] },
//     { id: 'csr-partners', label: 'CSR Partners', icon: Briefcase, roles: ['admin', 'accountant', 'project-manager'] },
//     { id: 'todo', label: 'To-Do List', icon: CheckSquare, roles: ['admin', 'accountant', 'project-manager'] },
//     { id: 'tasks', label: 'Task Assignment', icon: CheckSquare, roles: ['team-member'] },
//     { id: 'media', label: 'Media', icon: Image, roles: ['admin', 'project-manager'] },
//     { id: 'article', label: 'Article', icon: FileText, roles: ['admin', 'project-manager'] },
//     { id: 'team-members', label: 'Team Members', icon: Users, roles: ['admin', 'project-manager'] },
//     { id: 'calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'accountant', 'project-manager'] },
//     { id: 'project-expenses', label: 'Project Expenses', icon: DollarSign, roles: ['admin', 'accountant', 'project-manager'] },
//     { id: 'csr-budget', label: 'CSR Budget', icon: CreditCard, roles: ['admin', 'accountant'] },
//     { id: 'bills', label: 'Bills', icon: Receipt, roles: ['admin', 'project-manager', 'team-member'] },
//     { id: 'analysis-report', label: 'Analysis Report', icon: BarChart3, roles: ['admin', 'project-manager'] },
//   ];

//   const filteredMenuItems = menuItems.filter((item) => item.roles.includes(currentRole || ''));

//   return (
//     <div className="flex h-screen bg-slate-100">
//       <AnimatePresence>
//         {isOpen && (
//           <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="w-72 bg-white border-r border-gray-200 text-gray-900 shadow-sm flex flex-col">
//             <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//               <h1 className="text-2xl font-bold text-emerald-600">MTD CSR</h1>
//               <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 rounded-full bg-linear-to-r from-emerald-500 to-emerald-600 flex items-center justify-center font-bold text-white">
//                   {currentUser?.name.charAt(0)}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-900">{currentUser?.name}</p>
//                   <p className="text-xs text-gray-500">{currentUser?.email}</p>
//                 </div>
//               </div>
//             </div>

//             <nav className="flex-1 overflow-y-auto p-4">
//               <ul className="space-y-2">
//                 {filteredMenuItems.map((item) => {
//                   const Icon = item.icon;
//                   const isActive = currentPage === item.id;
//                   return (
//                     <li key={item.id}>
//                       <button
//                         onClick={() => onNavigate(item.id)}
//                         className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
//                           isActive ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-50 text-gray-700'
//                         }`}
//                       >
//                         <Icon className="w-5 h-5" />
//                         <span className="text-sm font-medium">{item.label}</span>
//                       </button>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </nav>

//             <div className="p-4 border-t border-gray-200">
//               <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-white">
//                 <LogOut className="w-5 h-5" />
//                 <span className="text-sm font-medium">Logout</span>
//               </button>
//             </div>
//           </motion.aside>
//         )}
//       </AnimatePresence>

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               {!isOpen && (
//                 <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
//                   <Menu className="w-6 h-6 text-gray-700" />
//                 </button>
//               )}
//               <h2 className="text-2xl font-bold text-gray-800">
//                 {filteredMenuItems.find((item) => item.id === currentPage)?.label || 'Dashboard'}
//               </h2>
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 overflow-y-auto p-6 bg-slate-50">{children}</main>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, LayoutDashboard, Briefcase, CheckSquare, Image, FileText, Users, Calendar,
  DollarSign, Receipt, CreditCard, BarChart3, FileSpreadsheet, RefreshCw, ClipboardList, Database,GraduationCap, TrendingUp, FileCheck
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';


interface SidebarProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant', 'project_manager'] },
  { id: 'csr-partners', label: 'CSR Partners', icon: Briefcase, roles: ['admin'] },
  { id: 'projects', label: 'Projects', icon: Briefcase, roles: ['admin', 'accountant', 'project_manager'] },
  { id: 'todo', label: 'To-Do List Assignment', icon: CheckSquare, roles: ['admin', 'accountant', 'project_manager'] },
  { id: 'real-time-update', label: 'Real Time Update', icon: RefreshCw, roles: ['admin', 'project_manager'] },
  { id: 'media', label: 'Media', icon: Image, roles: ['admin', 'project_manager'] },
  { id: 'article', label: 'Article', icon: FileText, roles: ['admin', 'project_manager'] },
  { id: 'team-members', label: 'Team Members', icon: Users, roles: ['admin', 'project_manager'] },
  { id: 'dashboard-forms', label: 'Dashboard Forms', icon: FileSpreadsheet, roles: ['admin', 'project_manager', 'team_member'] },
  { id: 'calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'accountant', 'project_manager', 'team_member'] },
  { id: 'project-expenses', label: 'Project Expenses', icon: DollarSign, roles: ['admin', 'accountant', 'project_manager', 'team_member'] },
  { id: 'daily-report', label: 'Daily Report', icon: ClipboardList, roles: ['admin', 'accountant', 'project_manager', 'team_member'] },
  { id: 'data-entry', label: 'Data Entry', icon: Database, roles: ['admin', 'project_manager', 'team_member'] },
  { id: 'csr-budget', label: 'CSR Budget', icon: CreditCard, roles: ['admin', 'accountant'] },
  { id: 'utilization-certificate', label: 'Utilization Certificate', icon: FileCheck, roles: ['accountant'] },
  { id: 'upcoming-expenses', label: 'Upcoming Expenses', icon: TrendingUp, roles: ['admin', 'project_manager'] },
  { id: 'bills', label: 'Bills', icon: Receipt, roles: ['admin', 'project_manager', 'team_member'] },
  { id: 'analysis-report', label: 'Analysis Report', icon: BarChart3, roles: ['admin', 'project_manager'] },
  { id: 'result-analysis', label: 'Result Analysis', icon: GraduationCap, roles: ['admin'] },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare, roles: ['team_member'] },
  // Admin Only
  { id: 'user-management', label: 'User Management', icon: Users, roles: ['admin'] },
];

const Sidebar = ({ children, currentPage, onNavigate }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { currentRole, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(currentRole || ''));

  // Map menu IDs to routes
  const routeMap: Record<string, string> = {
    'dashboard': currentRole === 'admin' ? '/admin-dashboard' : 
                 currentRole === 'accountant' ? '/accountant-dashboard' :
                 currentRole === 'project_manager' ? '/pm-dashboard' : '/team-member-dashboard',
    'csr-partners': '/csr-partners',
    'projects': '/projects',
    'todo': '/todo',
    'real-time-update': '/real-time-update',
    'media': '/media',
    'article': '/article',
    'team-members': '/team-members',
    'dashboard-forms': '/dashboard-forms',
    'calendar': '/calendar',
    'project-expenses': '/project-expenses',
    'daily-report': '/daily-report',
    'data-entry': '/data-entry',
    'csr-budget': '/csr-budget',
    'utilization-certificate': '/utilization-certificate',
    'upcoming-expenses': '/upcoming-expenses',
    'bills': '/bills',
    'analysis-report': '/analysis-report',
    'result-analysis': '/result-analysis',
    'tasks': '/tasks',
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
                        {isActive && (
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
          {!isOpen && (
            <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-emerald-100 rounded-lg">
              <Menu className="w-6 h-6 text-emerald-700" />
            </button>
          )}
          <h2 className="text-2xl font-bold text-emerald-800">
            {filteredMenuItems.find((item) => item.id === currentPage)?.label || 'Dashboard'}
          </h2>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">{children}</main>
      </div>
    </div>
  );
};

export default Sidebar;
