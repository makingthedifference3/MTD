import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Loader, Check, X } from 'lucide-react';
import { getAllUsers, createUser, updateUser, deleteUser, type AuthUser } from '../services/authService';

type RoleType = 'admin' | 'accountant' | 'project_manager' | 'team_member' | 'data_manager';
type FormMode = 'create' | 'edit' | null;

export default function UserManagementPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    role: 'team_member' as RoleType,
    is_active: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await getAllUsers();
    setUsers(data || []);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      full_name: '',
      password: '',
      confirmPassword: '',
      role: 'team_member',
      is_active: true,
    });
    setFormError('');
    setFormSuccess('');
    setSelectedUser(null);
  };

  const handleCreateClick = () => {
    resetForm();
    setFormMode('create');
  };

  const handleEditClick = (user: AuthUser) => {
    setSelectedUser(user);
    const userRole = user.role === 'client' ? 'team_member' : (user.role as RoleType);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      password: '',
      confirmPassword: '',
      role: userRole,
      is_active: user.is_active,
    });
    setFormMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    if (!formData.username.trim()) {
      setFormError('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!formData.full_name.trim()) {
      setFormError('Full name is required');
      return;
    }

    if (formMode === 'create') {
      if (!formData.password) {
        setFormError('Password is required');
        return;
      }
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
    }

    try {
      if (formMode === 'create') {
        const newUser = await createUser({
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          role: formData.role,
          is_active: formData.is_active,
        });

        if (newUser) {
          setFormSuccess(`User ${newUser.full_name} created successfully!`);
          await loadUsers();
          setTimeout(() => {
            setFormMode(null);
            resetForm();
          }, 1500);
        } else {
          setFormError('Failed to create user');
        }
      } else if (formMode === 'edit' && selectedUser) {
        const updateData: {
          username?: string;
          email?: string;
          full_name?: string;
          role?: string;
          is_active?: boolean;
          password?: string;
        } = {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          is_active: formData.is_active,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        const updated = await updateUser(selectedUser.id, updateData);
        if (updated) {
          setFormSuccess(`User ${updated.full_name} updated successfully!`);
          await loadUsers();
          setTimeout(() => {
            setFormMode(null);
            resetForm();
          }, 1500);
        } else {
          setFormError('Failed to update user');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    // Double confirmation for safety
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }
    
    if (!window.confirm('⚠️ This action cannot be undone. Delete permanently?')) {
      return;
    }

    try {
      const success = await deleteUser(userId);
      if (success) {
        setFormSuccess(`✅ User ${userName} deleted successfully from Supabase!`);
        await loadUsers();
        // Auto-clear success message after 3 seconds
        setTimeout(() => setFormSuccess(''), 3000);
      } else {
        setFormError(`❌ Failed to delete user ${userName}. Check console for details.`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setFormError(`❌ Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (formMode) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-emerald-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">
                {formMode === 'create' ? 'Create New User' : 'Edit User'}
              </h1>
              <p className="text-gray-600">
                {formMode === 'create'
                  ? 'Add a new team member with login credentials'
                  : 'Update user information and credentials'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3"
              >
                <X className="w-5 h-5" />
                {formError}
              </motion.div>
            )}

            {formSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-3"
              >
                <Check className="w-5 h-5" />
                {formSuccess}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as RoleType,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                >
                  <option value="team_member">Team Member</option>
                  <option value="data_manager">Data Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {formMode === 'create' ? 'Password' : 'Password (leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  placeholder="••••••"
                />
              </div>

              {formData.password && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    placeholder="••••••"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active User
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormMode(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {formMode === 'create' ? 'Create User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-emerald-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">User Management</h1>
            <p className="text-gray-600">Create and manage team member login credentials</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Success/Error Messages */}
        {formSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            {formSuccess}
          </motion.div>
        )}

        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3"
          >
            <X className="w-5 h-5" />
            {formError}
          </motion.div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white/85"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50 border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Full Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-emerald-100 hover:bg-emerald-50 transition-all"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-gray-900">{user.username}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{user.full_name}</td>
                      <td className="px-6 py-4 text-gray-700">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            user.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all hover:scale-110"
                          title="Edit User"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.full_name)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all hover:scale-110 hover:shadow-lg"
                          title="Delete User (permanent)"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-emerald-100 p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Users</p>
            <p className="text-3xl font-bold text-black">{users.length}</p>
          </div>
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-emerald-100 p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Active</p>
            <p className="text-3xl font-bold text-green-600">{users.filter((u) => u.is_active).length}</p>
          </div>
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-emerald-100 p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Admins</p>
            <p className="text-3xl font-bold text-emerald-600">{users.filter((u) => u.role === 'admin').length}</p>
          </div>
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-emerald-100 p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Team Members</p>
            <p className="text-3xl font-bold text-blue-600">{users.filter((u) => u.role === 'team_member').length}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
