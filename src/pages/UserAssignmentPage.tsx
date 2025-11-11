import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';
import { users, type User } from '../mockData';

const UserAssignmentPage = () => {
  const [userList] = useState<User[]>(users);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">User Assignment</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">Add New User</span>
        </motion.button>
      </div>

      {/* Add User Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Full Name" />
          <input type="email" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Email" />
          <input type="tel" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Mobile Number" />
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Address" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="accountant">Accountant</option>
            <option value="project-manager">Project Manager</option>
            <option value="team-member">Team Member</option>
          </select>
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Department" />
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            Create User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">All Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mobile</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userList.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.mobile}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.department || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit User: {selectedUser.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Name</label>
                <input
                  type="text"
                  defaultValue={selectedUser.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Mobile</label>
                <input
                  type="tel"
                  defaultValue={selectedUser.mobile}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Role</label>
                <select defaultValue={selectedUser.role} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="admin">Admin</option>
                  <option value="accountant">Accountant</option>
                  <option value="project-manager">Project Manager</option>
                  <option value="team-member">Team Member</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors">
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserAssignmentPage;
