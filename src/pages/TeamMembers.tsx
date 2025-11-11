import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, Phone, MapPin, X, User } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  team: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  manager: string;
  status: 'active' | 'on-leave' | 'inactive';
  joinedDate: string;
}

const TeamMembers = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    manager: '',
    department: '',
    team: '',
    role: 'Team Member'
  });
  
  const [members] = useState<TeamMember[]>([
    { id: 'TM001', name: 'John Doe', role: 'Project Manager', team: 'Team A', department: 'Operations', email: 'john@mtd.com', phone: '+91 98765 43210', address: 'Mumbai, MH', manager: 'Admin', status: 'active', joinedDate: '2023-01-15' },
    { id: 'TM002', name: 'Jane Smith', role: 'Accountant', team: 'Finance', department: 'Accounts', email: 'jane@mtd.com', phone: '+91 98765 43211', address: 'Delhi, DL', manager: 'Admin', status: 'active', joinedDate: '2023-02-20' },
    { id: 'TM003', name: 'Mike Johnson', role: 'Team Member', team: 'Team B', department: 'Field Work', email: 'mike@mtd.com', phone: '+91 98765 43212', address: 'Bangalore, KA', manager: 'John Doe', status: 'on-leave', joinedDate: '2023-03-10' },
    { id: 'TM004', name: 'Sarah Williams', role: 'Project Manager', team: 'Team C', department: 'Operations', email: 'sarah@mtd.com', phone: '+91 98765 43213', address: 'Chennai, TN', manager: 'Admin', status: 'active', joinedDate: '2023-04-05' },
    { id: 'TM005', name: 'David Brown', role: 'Team Member', team: 'Team A', department: 'Field Work', email: 'david@mtd.com', phone: '+91 98765 43214', address: 'Pune, MH', manager: 'John Doe', status: 'active', joinedDate: '2023-05-12' },
    { id: 'TM006', name: 'Lokesh Joshi', role: 'Team Member', team: 'Team B', department: 'Social Media', email: 'lokesh@mtd.com', phone: '+91 98765 43215', address: 'Mumbai, MH', manager: 'Sarah Williams', status: 'active', joinedDate: '2023-06-20' },
    { id: 'TM007', name: 'Priya Sharma', role: 'Team Member', team: 'Team C', department: 'Documentation', email: 'priya@mtd.com', phone: '+91 98765 43216', address: 'Delhi, DL', manager: 'Jane Smith', status: 'active', joinedDate: '2023-07-10' },
    { id: 'TM008', name: 'Rahul Verma', role: 'Team Member', team: 'Team A', department: 'Field Work', email: 'rahul@mtd.com', phone: '+91 98765 43217', address: 'Bangalore, KA', manager: 'John Doe', status: 'active', joinedDate: '2023-08-15' },
    { id: 'TM009', name: 'Anjali Patel', role: 'Team Member', team: 'Team B', department: 'Operations', email: 'anjali@mtd.com', phone: '+91 98765 43218', address: 'Mumbai, MH', manager: 'Sarah Williams', status: 'active', joinedDate: '2023-09-05' }
  ]);

  const filteredMembers = members.filter(member => 
    filterStatus === 'all' || member.status === filterStatus
  );

  const stats = [
    { label: 'Total Members', value: members.length },
    { label: 'Active', value: members.filter(m => m.status === 'active').length },
    { label: 'On Leave', value: members.filter(m => m.status === 'on-leave').length },
    { label: 'Teams', value: new Set(members.map(m => m.team)).size },
  ];

  const handleAddMember = () => {
    console.log('New member:', newMember);
    setShowAddModal(false);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      address: '',
      manager: '',
      department: '',
      team: '',
      role: 'Team Member'
    });
  };

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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

      {/* Members Grid - 3x3 Avatar Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {filteredMembers.map((member, index) => (
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
            <h3 className="font-bold text-gray-900 text-xl mb-1 text-center">{member.name}</h3>
            
            {/* Team - Department Label */}
            <p className="text-sm text-gray-600 mb-3 text-center">
              <span className="font-medium text-emerald-600">{member.team}</span>
              <span className="mx-2">-</span>
              <span className="font-medium text-gray-700">{member.department}</span>
            </p>

            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium mb-4 ${
              member.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
              member.status === 'on-leave' ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-700'
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
                {member.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                {member.address}
              </div>
            </div>

            {/* Manager Info */}
            <div className="border-t border-gray-100 pt-4 w-full text-center">
              <p className="text-xs text-gray-600 mb-1">Manager</p>
              <p className="text-sm font-semibold text-emerald-600">{member.manager}</p>
            </div>
          </motion.div>
        ))}
      </div>

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

            {/* Modal Body - Personal Data Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    placeholder="City, State"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager *
                  </label>
                  <select
                    value={newMember.manager}
                    onChange={(e) => setNewMember({ ...newMember, manager: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Sarah Williams">Sarah Williams</option>
                    <option value="Jane Smith">Jane Smith</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Department</option>
                    <option value="Operations">Operations</option>
                    <option value="Field Work">Field Work</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Accounts">Accounts</option>
                  </select>
                </div>

                {/* Team */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team
                  </label>
                  <select
                    value={newMember.team}
                    onChange={(e) => setNewMember({ ...newMember, team: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Team</option>
                    <option value="Team A">Team A</option>
                    <option value="Team B">Team B</option>
                    <option value="Team C">Team C</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Team Member">Team Member</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Accountant">Accountant</option>
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
