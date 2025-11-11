import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye } from 'lucide-react';
import { users, type User } from '../mockData';
import { useAuth } from '../context/AuthContext';

const SwitchUsersPage = () => {
  const { login } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700 border-purple-300',
      accountant: 'bg-blue-100 text-blue-700 border-blue-300',
      'project-manager': 'bg-green-100 text-green-700 border-green-300',
      'team-member': 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      accountant: 'Accountant',
      'project-manager': 'Project Manager',
      'team-member': 'Team Member',
    };
    return labels[role] || role;
  };

  const handleSwitchUser = (user: User) => {
    login(user.role);
    setSelectedUser(null);
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

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{user.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-3 ${getRoleBadge(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>{user.email}</p>
                  <p>{user.mobile}</p>
                  {user.department && <p className="font-medium text-gray-700">{user.department}</p>}
                </div>

                <button
                  onClick={() => setSelectedUser(user)}
                  className="mt-4 w-full flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View as {user.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Switch User View</h3>
            <p className="text-gray-600 mb-6">
              You are about to switch to <span className="font-bold text-gray-900">{selectedUser.name}'s</span> view as{' '}
              <span className="font-bold text-emerald-600">{getRoleLabel(selectedUser.role)}</span>. This will change your dashboard and permissions temporarily.
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
