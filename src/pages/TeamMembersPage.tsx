import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { users } from '../mockData';

const TeamMembersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Team Member</span>
        </motion.button>
      </div>

      {/* Add Member Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Team Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Name" />
          <input type="email" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Email" />
          <input type="tel" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Mobile Number" />
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Manager" />
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" placeholder="Address" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2">
            <option>Select Department</option>
            <option>Operations</option>
            <option>Social Media</option>
            <option>Finance</option>
            <option>IT</option>
            <option>Marketing</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
          <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">Cancel</button>
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">Add Member</button>
        </div>
      </div>

      {/* Team Members List */}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.mobile}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.department}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersPage;
