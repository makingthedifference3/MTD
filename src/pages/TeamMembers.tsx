import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, Phone, MapPin, X, User, Loader } from 'lucide-react';
import { teamMembersService } from '../services/teamMembersService';
import type { TeamMemberWithManager } from '../services/teamMembersService';

interface TeamMemberDisplay {
  id: string;
  full_name: string;
  role: string;
  team: string;
  department: string;
  email: string;
  mobile_number: string;
  address: string;
  manager_name?: string;
  status: 'active' | 'on-leave' | 'inactive';
  joinedDate: string;
}

interface ManagerOption {
  id: string;
  full_name: string;
}

const TeamMembers = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allMembers, setAllMembers] = useState<TeamMemberDisplay[]>([]);
  const [availableManagers, setAvailableManagers] = useState<ManagerOption[]>([]);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [statsData, setStatsData] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    teams: 0,
  });
  const [newMember, setNewMember] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    address: '',
    manager_id: '',
    department: '',
    team: '',
    role: 'team_member',
    city: '',
    state: '',
    pincode: '',
  });

  // Load team members on component mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);

      // Load all team members
      const members = await teamMembersService.getAllTeamMembers();
      const formattedMembers: TeamMemberDisplay[] = (members as unknown[]).map((m: unknown) => {
        const member = m as TeamMemberWithManager;
        return {
          id: member.id,
          full_name: member.full_name,
          role: member.role,
          team: member.team || 'Unassigned',
          department: member.department || 'Unassigned',
          email: member.email,
          mobile_number: member.mobile_number || '',
          address: member.address || '',
          manager_name: member.manager_name || 'Unassigned',
          status: (member.is_active ? 'active' : 'inactive') as 'active' | 'on-leave' | 'inactive',
          joinedDate: (member.created_at && typeof member.created_at === 'string') ? member.created_at.split('T')[0] : '',
        };
      });

      setAllMembers(formattedMembers);

      // Calculate stats
      const activeCount = formattedMembers.filter((m) => m.status === 'active').length;
      const teamsSet = new Set(formattedMembers.map((m) => m.team).filter((t) => t !== 'Unassigned'));

      setStatsData({
        total: formattedMembers.length,
        active: activeCount,
        onLeave: 0,
        teams: teamsSet.size,
      });

      // Load managers for dropdown
      const managers = await teamMembersService.getAvailableManagers();
      setAvailableManagers(managers as ManagerOption[]);

      // Load departments and teams for dropdowns
      const departments = await teamMembersService.getAllDepartments();
      const teams = await teamMembersService.getAllTeams();
      setAllDepartments(departments);
      setAllTeams(teams);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = allMembers.filter(
    (member) => filterStatus === 'all' || member.status === filterStatus
  );

  const handleAddMember = async () => {
    if (!newMember.full_name || !newMember.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const memberData = {
        full_name: newMember.full_name,
        email: newMember.email,
        mobile_number: newMember.mobile_number,
        address: newMember.address,
        city: newMember.city,
        state: newMember.state,
        pincode: newMember.pincode,
        manager_id: newMember.manager_id || null,
        department: newMember.department,
        team: newMember.team,
        role: newMember.role,
        is_active: true,
      };

      const createdMember = await teamMembersService.createTeamMember(memberData as Parameters<typeof teamMembersService.createTeamMember>[0]);

      if (createdMember) {
        await loadTeamMembers();
        setShowAddModal(false);
        setNewMember({
          full_name: '',
          email: '',
          mobile_number: '',
          address: '',
          manager_id: '',
          department: '',
          team: '',
          role: 'team_member',
          city: '',
          state: '',
          pincode: '',
        });
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding team member');
    }
  };

  const statCards = [
    { label: 'Total Members', value: statsData.total },
    { label: 'Active', value: statsData.active },
    { label: 'On Leave', value: statsData.onLeave },
    { label: 'Teams', value: statsData.teams },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-600 mt-2">Manage your team and assignments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Loader className="w-10 h-10 text-emerald-500" />
          </motion.div>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
          >
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Members</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </motion.div>

          {/* Members Grid - 3 column layout */}
          {filteredMembers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 text-lg">No team members found</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
              {filteredMembers.map((member: TeamMemberDisplay, index: number) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center"
                >
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-lg">
                    <User className="w-12 h-12" />
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-gray-900 text-xl mb-1 text-center">{member.full_name}</h3>

                  {/* Team - Department Label */}
                  <p className="text-sm text-gray-600 mb-3 text-center">
                    <span className="font-medium text-emerald-600">{member.team}</span>
                    <span className="mx-2">-</span>
                    <span className="font-medium text-gray-700">{member.department}</span>
                  </p>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                    member.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : member.status === 'on-leave'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.status.replace('-', ' ').toUpperCase()}
                  </span>

                  {/* Contact Info */}
                  <div className="space-y-2 w-full mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                      {member.mobile_number || 'N/A'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                      {member.address || 'N/A'}
                    </div>
                  </div>

                  {/* Manager Info */}
                  <div className="border-t border-gray-100 pt-4 w-full text-center">
                    <p className="text-xs text-gray-600 mb-1">Manager</p>
                    <p className="text-sm font-semibold text-emerald-600">{member.manager_name || 'Unassigned'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Add New Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={newMember.full_name}
                    onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={newMember.mobile_number}
                    onChange={(e) => setNewMember({ ...newMember, mobile_number: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={newMember.city}
                    onChange={(e) => setNewMember({ ...newMember, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={newMember.state}
                    onChange={(e) => setNewMember({ ...newMember, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={newMember.pincode}
                    onChange={(e) => setNewMember({ ...newMember, pincode: e.target.value })}
                    placeholder="Pincode"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    placeholder="Full address"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                  <select
                    value={newMember.manager_id}
                    onChange={(e) => setNewMember({ ...newMember, manager_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Manager</option>
                    {availableManagers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Department</option>
                    {allDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                  <select
                    value={newMember.team}
                    onChange={(e) => setNewMember({ ...newMember, team: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Team</option>
                    {allTeams.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="team_member">Team Member</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex items-center justify-end space-x-4 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Member
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
