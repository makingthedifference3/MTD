import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader, AlertCircle } from 'lucide-react';
import { teamMembersService } from '../services/teamMembersService';
import type { TeamMemberWithManager } from '../services/teamMembersService';

const TeamMembersPage = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMemberWithManager[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    manager_id: '',
    address: '',
    department: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [managers, setManagers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allMembers, allDepartments, availableManagers] = await Promise.all([
        teamMembersService.getAllTeamMembers(),
        teamMembersService.getAllDepartments(),
        teamMembersService.getAvailableManagers(),
      ]);

      setMembers(allMembers);
      setDepartments(allDepartments);
      setManagers(availableManagers as Array<{ id: string; full_name: string }>);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    try {
      await teamMembersService.createTeamMember({
        full_name: formData.full_name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        manager_id: formData.manager_id || null,
        department: formData.department,
        team: '',
        role: 'team_member',
        is_active: true,
      } as Parameters<typeof teamMembersService.createTeamMember>[0]);

      // Reset form and reload data
      setFormData({
        full_name: '',
        email: '',
        mobile_number: '',
        manager_id: '',
        address: '',
        department: '',
        city: '',
        state: '',
        pincode: '',
      });
      setShowForm(false);
      setError('');
      await loadData();
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add team member');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to deactivate this member?')) {
      try {
        await teamMembersService.deactivateTeamMember(memberId);
        await loadData();
      } catch (err) {
        console.error('Error deleting member:', err);
        setError('Failed to delete team member');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Team Member</span>
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Add Member Form */}
      {showForm && (
        <motion.form
          onSubmit={handleAddMember}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Team Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Full Name *"
              required
            />

            {/* Email */}
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Email *"
              required
            />

            {/* Mobile Number */}
            <input
              type="tel"
              value={formData.mobile_number}
              onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Mobile Number"
            />

            {/* Manager */}
            <select
              value={formData.manager_id}
              onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>

            {/* City */}
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="City"
            />

            {/* State */}
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="State"
            />

            {/* Pincode */}
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Pincode"
            />

            {/* Department */}
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Address */}
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
              placeholder="Address"
              rows={2}
            />
          </div>

          {/* Form Actions */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Add Member
            </button>
          </div>
        </motion.form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
            <Loader className="w-8 h-8 text-emerald-500" />
          </motion.div>
        </div>
      )}

      {/* Team Members Table */}
      {!loading && members.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mobile</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Manager</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Name with Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{member.full_name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>

                    {/* Mobile */}
                    <td className="px-6 py-4 text-sm text-gray-600">{member.mobile_number || 'N/A'}</td>

                    {/* Department */}
                    <td className="px-6 py-4 text-sm text-gray-600">{member.department || 'Unassigned'}</td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {member.role}
                      </span>
                    </td>

                    {/* Manager */}
                    <td className="px-6 py-4 text-sm text-gray-600">{member.manager_name || 'Unassigned'}</td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Deactivate member"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && members.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <p className="text-gray-500 text-lg">No team members found. Add one to get started.</p>
        </motion.div>
      )}
    </div>
  );
};

export default TeamMembersPage;
