import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, FolderKanban, DollarSign, TrendingUp, Settings, Shield, UserPlus, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFilteredData } from '../hooks/useFilteredData';
import { users, chartData } from '../mockData';

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { filterMode, aggregatedMetrics, hasFilters } = useFilteredData();

  const stats = [
    { 
      label: hasFilters ? 'Filtered Projects' : 'Total Projects', 
      value: aggregatedMetrics.totalCards, 
      change: `+${Math.round(aggregatedMetrics.totalCards * 0.2)}`, 
      icon: FolderKanban 
    },
    { 
      label: 'Beneficiaries', 
      value: aggregatedMetrics.beneficiaries.current.toLocaleString(), 
      change: `${aggregatedMetrics.beneficiaries.target.toLocaleString()} target`, 
      icon: Users 
    },
    { 
      label: 'Total Donations', 
      value: `₹${(aggregatedMetrics.donations.current / 1000).toFixed(1)}K`, 
      change: `₹${(aggregatedMetrics.donations.target / 1000).toFixed(1)}K target`, 
      icon: DollarSign 
    },
    { 
      label: 'Volunteers', 
      value: aggregatedMetrics.volunteers.current, 
      change: `${aggregatedMetrics.volunteers.target} target`, 
      icon: Activity 
    },
  ];

  // Use chart data for user growth
  const userGrowth = useMemo(() => 
    chartData.monthlyProgress.slice(0, 6).map(item => ({
      month: item.month,
      users: Math.round(120 + Math.random() * 40),
      projects: item.events
    }))
  , []);

  // Get recent users from mockData
  const recentUsers = useMemo(() => 
    users.slice(0, 3).map((user, index) => ({
      id: index + 1,
      name: user.name,
      role: user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: user.email,
      joinedDate: `2025-${11 - index}-${15 - index}`,
      status: 'active'
    }))
  , []);

  const quickActions = [
    { label: 'Add New User', icon: UserPlus, color: 'emerald' },
    { label: 'System Settings', icon: Settings, color: 'emerald' },
    { label: 'Security Audit', icon: Shield, color: 'emerald' },
    { label: 'View Reports', icon: TrendingUp, color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">System overview and user management</p>
          </div>
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-700">{filterMode.label}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <stat.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-emerald-600 text-sm font-medium">{stat.change}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-6 shadow-sm transition-all hover:shadow-md hover:scale-105"
          >
            <action.icon className="w-8 h-8 mb-3" />
            <p className="font-semibold">{action.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">User & Project Growth</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="projects" stroke="#60a5fa" strokeWidth={2} name="Projects" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="hover:bg-emerald-50/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.joinedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {user.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
