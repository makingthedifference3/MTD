import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Search, Loader } from 'lucide-react';
import * as usersService from '../services/usersService';
import type { User } from '../services/usersService';
import { useAuth } from '../context/useAuth';

const SwitchUsersPage = () => {
  const { login, currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0 });

  // Load users and stats on mount
  useEffect(() => {
    loadUsersData();
  }, []);

  // Filter users when search or role filter changes
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterRole, allUsers]);

  const loadUsersData = async () => {
    try {
      setLoading(true);

      // Load all active users
      const users = await usersService.getAllActiveUsers();
      setAllUsers(users);

      // Get statistics
      const userStats = await usersService.getUserStats();
      setStats({
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = allUsers;

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u.department && u.department.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700 border-purple-300',
      accountant: 'bg-blue-100 text-blue-700 border-blue-300',
      'project-manager': 'bg-green-100 text-green-700 border-green-300',
      'team-member': 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const handleSwitchUser = async (selectedUserData: User) => {
    try {
      // Log the switch activity
      if (currentUser) {
        await usersService.logUserSwitch(currentUser.id, selectedUserData.id, currentUser.role);
      }

      // Update user's last login time
      await usersService.updateLastLogin(selectedUserData.id);

      // Normalize role format (convert 'project-manager' to 'project_manager')
      const normalizedRole = selectedUserData.role.replace('-', '_') as
        | 'admin'
        | 'accountant'
        | 'project_manager'
        | 'team_member'
        | 'client';

      // Create AuthUser object from selected user
      const authUser = {
        id: selectedUserData.id,
        username: selectedUserData.email.split('@')[0],
        email: selectedUserData.email,
        full_name: selectedUserData.full_name,
        role: normalizedRole,
        is_active: selectedUserData.is_active,
      };

      // Perform login
      login(authUser);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error switching user:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Users className="w-8 h-8 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800">Switch Users</h2>
      </div>

      <div className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-lg p-6">
        <p className="text-lg">
          As an admin, you can switch to any user's view to see how the system looks from their perspective.
          This helps in testing role-based access and troubleshooting issues.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Active Users</p>
          <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              filterRole === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Roles
          </button>
          {['admin', 'accountant', 'project-manager', 'team-member'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                filterRole === role
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {usersService.formatRole(role)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="ml-3 text-gray-600">Loading users...</p>
        </div>
      )}

      {/* User Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-2xl font-bold">
                    {usersService.getUserInitials(user)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{user.full_name}</h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-3 ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {usersService.formatRole(user.role)}
                    </span>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{user.email}</p>
                      {user.mobile_number && <p>{user.mobile_number}</p>}
                      {user.department && <p className="font-medium text-gray-700">{user.department}</p>}
                      {user.last_login_at && (
                        <p className="text-xs text-gray-500">
                          Last login: {usersService.getTimeSinceLogin(user.last_login_at)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedUser(user)}
                      className="mt-4 w-full flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View as {user.full_name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Switch User View</h3>
            <p className="text-gray-600 mb-6">
              You are about to switch to{' '}
              <span className="font-bold text-gray-900">{selectedUser.full_name}'s</span> view as{' '}
              <span className="font-bold text-emerald-600">{usersService.formatRole(selectedUser.role)}</span>. This
              will change your dashboard and permissions temporarily.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You can always switch back to admin view from the user menu.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSwitchUser(selectedUser)}
                className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
              >
                Switch Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SwitchUsersPage;
