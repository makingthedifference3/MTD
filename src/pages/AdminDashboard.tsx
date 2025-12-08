import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User2, Mail, CalendarDays } from 'lucide-react';
import { getAllUsers } from '../services/authService';
import type { AuthUser } from '../services/authService';
import { PMDashboardInner } from './PMDashboard';
import { useFilter } from '../context/useFilter';

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
  const { resetFilters } = useFilter();
  const [dbUsers, setDbUsers] = useState<AuthUser[]>([]);

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

  // Reset filters when leaving the page (only on unmount)
  useEffect(() => {
    return () => {
      resetFilters();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
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
