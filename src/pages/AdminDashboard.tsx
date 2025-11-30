import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User2, Mail, CalendarDays, FolderKanban, Target, DollarSign } from 'lucide-react';
import { getAllUsers } from '../services/authService';
import type { AuthUser } from '../services/authService';
import { useFilter } from '../context/useFilter';
import { PMDashboardInner } from './PMDashboard';

const formatRoleLabel = (role?: string) => {
  if (!role) return 'User';
  return role
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const AdminDashboard = () => {
  const [dbUsers, setDbUsers] = useState<AuthUser[]>([]);
  const { projects } = useFilter();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        setDbUsers(users);
      } catch (error) {
        console.error('Failed to load recent users:', error);
      }
    };

    loadUsers();
  }, []);

  const recentUsers = useMemo(
    () =>
      dbUsers.slice(0, 3).map((user, index) => ({
        id: user.id || `user-${index}`,
        name: user.full_name,
        role: formatRoleLabel(user.role),
        email: user.email,
        joinedDate: new Date().toISOString().split('T')[0],
        status: user.is_active ? 'active' : 'inactive',
      })),
    [dbUsers]
  );

  // Calculate admin stats from all projects
  const adminStats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.total_budget || 0), 0);
    const totalBeneficiaries = projects.reduce((sum, p) => sum + (p.direct_beneficiaries || 0), 0);
    
    return {
      totalProjects: projects.length,
      activeProjects,
      totalBudget,
      totalBeneficiaries,
    };
  }, [projects]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
      {/* All Projects Overview */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Projects Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-linear-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-emerald-500/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-200 rounded-xl">
                <FolderKanban className="w-6 h-6 text-emerald-700" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-3 py-1 rounded-full">TOTAL</span>
            </div>
            <p className="text-3xl font-black text-emerald-900 mb-1">{adminStats.totalProjects}</p>
            <p className="text-sm text-emerald-700 font-semibold">All Projects</p>
          </motion.div>

          {/* Active Projects Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-200 rounded-xl">
                <Target className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-200 px-3 py-1 rounded-full">ACTIVE</span>
            </div>
            <p className="text-3xl font-black text-blue-900 mb-1">{adminStats.activeProjects}</p>
            <p className="text-sm text-blue-700 font-semibold">Active Projects</p>
          </motion.div>

          {/* Total Budget Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-200 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-700" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-200 px-3 py-1 rounded-full">BUDGET</span>
            </div>
            <p className="text-3xl font-black text-purple-900 mb-1">₹{(adminStats.totalBudget / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-purple-700 font-semibold">Total Budget</p>
          </motion.div>

          {/* Total Beneficiaries Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-linear-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-orange-500/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-200 rounded-xl">
                <User2 className="w-6 h-6 text-orange-700" />
              </div>
              <span className="text-xs font-bold text-orange-700 bg-orange-200 px-3 py-1 rounded-full">PEOPLE</span>
            </div>
            <p className="text-3xl font-black text-orange-900 mb-1">{(adminStats.totalBeneficiaries / 1000).toFixed(0)}K</p>
            <p className="text-sm text-orange-700 font-semibold">Beneficiaries</p>
          </motion.div>
        </div>
      </motion.div>

      {/* PMDashboard Inner - will show all projects when no partner selected */}
      <PMDashboardInner shouldLockContext={false} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-emerald-500/10">
          <div className="p-6 border-b border-gray-100 flex flex-col gap-1">
            {/* <p className="text-sm font-semibold text-emerald-600">People Ops</p> */}
            <h2 className="text-2xl font-bold text-gray-900">Recent Users</h2>
            <p className="text-sm text-gray-500">Latest members welcomed into the platform</p>
          </div>

          <div className="p-6">
            {recentUsers.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-8">No recent users found yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recentUsers.map((user, index) => {
                  const statusBadge =
                    user.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700';

                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="relative overflow-hidden rounded-2xl border border-emerald-100/60 bg-white p-5 shadow-lg shadow-emerald-500/10"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 via-emerald-500 to-emerald-600"></div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                          <User2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.role}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge}`}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="mt-5 space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium text-gray-800">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-emerald-500" />
                          <span>Joined {user.joinedDate}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
