import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Edit2, Trash2, Loader } from 'lucide-react';
import * as usersService from '../services/usersService';
import { type User } from '../services/usersService';

const UserAssignmentPage = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    address: '',
    role: 'team_member',
    department: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await usersService.getAllUsers();
      setUserList(users);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.email || !formData.role) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const newUser: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        email: formData.email,
        full_name: formData.full_name,
        mobile_number: formData.mobile_number,
        address: formData.address,
        role: formData.role as User['role'],
        department: formData.department,
        is_active: true,
      };

      const created = await usersService.createUser(newUser);

      if (created) {
        setFormData({
          full_name: '',
          email: '',
          mobile_number: '',
          address: '',
          role: 'team_member',
          department: '',
        });
        setShowForm(false);
        setError(null);
        await loadUsers();
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !formData.full_name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const updates: Partial<User> = {
        full_name: formData.full_name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        address: formData.address,
        role: formData.role as User['role'],
        department: formData.department,
      };

      const updated = await usersService.updateUser(selectedUser.id, updates);

      if (updated) {
        setSelectedUser(null);
        setFormData({
          full_name: '',
          email: '',
          mobile_number: '',
          address: '',
          role: 'team_member',
          department: '',
        });
        setError(null);
        await loadUsers();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        const deleted = await usersService.deleteUser(userId);

        if (deleted) {
          setError(null);
          await loadUsers();
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700 border-purple-300',
      accountant: 'bg-blue-100 text-blue-700 border-blue-300',
      project_manager: 'bg-green-100 text-green-700 border-green-300',
      team_member: 'bg-gray-100 text-gray-700 border-gray-300',
      client: 'bg-amber-100 text-amber-700 border-amber-300',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      accountant: 'Accountant',
      project_manager: 'Project Manager',
      team_member: 'Team Member',
      client: 'Client',
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Assignment</h1>
          <p className="text-gray-600 mt-2">Manage system users and their roles</p>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors font-medium"
        >
          <UserPlus className="w-5 h-5" />
          <span>{showForm ? 'Cancel' : 'Add New User'}</span>
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-96">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
            <Loader className="w-10 h-10 text-emerald-500" />
          </motion.div>
        </div>
      )}

      {!loading && (
        <>
          {/* Add User Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Mobile Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="accountant">Accountant</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="team_member">Team Member</option>
                      <option value="client">Client</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Department"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        full_name: '',
                        email: '',
                        mobile_number: '',
                        address: '',
                        role: 'team_member',
                        department: '',
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Users ({userList.length})</h3>
            </div>
            <div className="overflow-x-auto">
              {userList.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mobile</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
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
                        <td className="px-6 py-4 font-medium text-gray-900">{user.full_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.mobile_number || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.department || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-700'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedUser(user);
                                setFormData({
                                  full_name: user.full_name,
                                  email: user.email,
                                  mobile_number: user.mobile_number || '',
                                  address: user.address || '',
                                  role: user.role,
                                  department: user.department || '',
                                });
                              }}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-12 text-center">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No users found. Create one to get started.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit User: {selectedUser.full_name}</h3>
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="accountant">Accountant</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="team_member">Team Member</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserAssignmentPage;
