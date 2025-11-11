import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, FolderKanban, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFilteredData } from '../hooks/useFilteredData';
import { projects } from '../mockData';

const PMDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { filteredCards, filterMode, aggregatedMetrics, hasFilters } = useFilteredData();

  // Get filtered projects based on selected partner/project
  const filteredProjectIds = [...new Set(filteredCards.map(c => c.projectId))];
  const filteredProjects = projects.filter(p => filteredProjectIds.includes(p.id));
  
  // Calculate dynamic beneficiary metrics from filtered projects
  const beneficiaryMetrics = {
    beneficiaries: {
      current: filteredProjects.reduce((sum, p) => sum + (p.beneficiariesCurrent || 0), 0),
      target: filteredProjects.reduce((sum, p) => sum + (p.beneficiariesTarget || 0), 0)
    },
    pads: {
      current: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.pads_donated?.current || 0), 0),
      target: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.pads_donated?.target || 0), 0)
    },
    meals: {
      current: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.meals_distributed?.current || 0), 0),
      target: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.meals_distributed?.target || 0), 0)
    },
    students: {
      current: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.students_enrolled?.current || 0), 0),
      target: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.students_enrolled?.target || 0), 0)
    },
    trees: {
      current: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.trees_planted?.current || 0), 0),
      target: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.trees_planted?.target || 0), 0)
    },
    schools: {
      current: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.schools_renovated?.current || 0), 0),
      target: filteredProjects.reduce((sum, p) => sum + (p.projectMetrics?.schools_renovated?.target || 0), 0)
    }
  };

  const stats = [
    { 
      label: hasFilters ? 'Filtered Projects' : 'Active Projects', 
      value: aggregatedMetrics.totalCards, 
      change: '+12%', 
      icon: FolderKanban, 
      color: 'emerald' 
    },
    { 
      label: 'Beneficiaries', 
      value: aggregatedMetrics.beneficiaries.current.toLocaleString(), 
      change: `${aggregatedMetrics.beneficiaries.target.toLocaleString()} target`, 
      icon: Users, 
      color: 'emerald' 
    },
    { 
      label: 'Total Donations', 
      value: `₹${(aggregatedMetrics.donations.current / 1000).toFixed(1)}K`, 
      change: `₹${(aggregatedMetrics.donations.target / 1000).toFixed(1)}K target`, 
      icon: DollarSign, 
      color: 'emerald' 
    },
    { 
      label: 'Events Completed', 
      value: aggregatedMetrics.events.current, 
      change: `${aggregatedMetrics.events.target} target`, 
      icon: TrendingUp, 
      color: 'emerald' 
    },
  ];

  const projectStatus = [
    { 
      name: 'Active', 
      value: filteredProjects.filter(p => p.status === 'active').length, 
      color: '#10b981' 
    },
    { 
      name: 'Upcoming', 
      value: filteredProjects.filter(p => p.status === 'upcoming').length, 
      color: '#f59e0b' 
    },
    { 
      name: 'Completed', 
      value: filteredProjects.filter(p => p.status === 'completed').length, 
      color: '#6366f1' 
    },
  ];

  const monthlyData = [
    { month: 'Jan', completed: 12, ongoing: 8 },
    { month: 'Feb', completed: 15, ongoing: 10 },
    { month: 'Mar', completed: 18, ongoing: 12 },
    { month: 'Apr', completed: 14, ongoing: 15 },
    { month: 'May', completed: 20, ongoing: 18 },
    { month: 'Jun', completed: 22, ongoing: 16 },
  ];

  // Generate recent activities from filtered projects
  const recentActivities = filteredProjects.slice(0, 4).map((project, idx) => ({
    id: project.id,
    project: project.name,
    action: project.status === 'active' ? 'In Progress' : 
            project.status === 'completed' ? 'Completed' : 'Scheduled',
    time: idx === 0 ? '2 hours ago' : idx === 1 ? '4 hours ago' : idx === 2 ? '6 hours ago' : '8 hours ago',
    status: project.status === 'completed' ? 'completed' : 
            project.status === 'active' ? 'pending' : 'alert'
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of all projects and team activities</p>
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

      {/* Stats Bento Grid */}
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
              <div className={`p-3 bg-emerald-50 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-emerald-600 text-sm font-medium">{stat.change}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Beneficiary Count Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Beneficiary Count</h2>
            <p className="text-gray-600 text-sm mt-1">Project impact metrics and targets</p>
          </div>
          <select className="px-4 py-2 text-sm rounded-lg border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white text-gray-900 font-medium appearance-none cursor-pointer">
            <option value="all">LOCATION WISE</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-linear-to-br from-emerald-50 to-white border-2 border-emerald-200 hover:border-emerald-400 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md">
            <p className="text-xs text-emerald-700 font-semibold mb-2 uppercase">Beneficiaries</p>
            <p className="text-2xl font-bold text-gray-900">{beneficiaryMetrics.beneficiaries.current.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">/ {beneficiaryMetrics.beneficiaries.target.toLocaleString()} target</p>
          </div>
          <div className="bg-linear-to-br from-pink-50 to-white border-2 border-pink-200 hover:border-pink-400 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md">
            <p className="text-xs text-pink-700 font-semibold mb-2 uppercase">Pads Donated</p>
            <p className="text-2xl font-bold text-gray-900">{beneficiaryMetrics.pads.current.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">/ {beneficiaryMetrics.pads.target.toLocaleString()} target</p>
          </div>
          <div className="bg-linear-to-br from-orange-50 to-white border-2 border-orange-200 hover:border-orange-400 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md">
            <p className="text-xs text-orange-700 font-semibold mb-2 uppercase">Meals Served</p>
            <p className="text-2xl font-bold text-gray-900">{beneficiaryMetrics.meals.current > 1000 ? `${(beneficiaryMetrics.meals.current / 1000).toFixed(0)}K` : beneficiaryMetrics.meals.current.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">/ {beneficiaryMetrics.meals.target > 1000 ? `${(beneficiaryMetrics.meals.target / 1000).toFixed(0)}K` : beneficiaryMetrics.meals.target.toLocaleString()} target</p>
          </div>
          <div className="bg-linear-to-br from-blue-50 to-white border-2 border-blue-200 hover:border-blue-400 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md">
            <p className="text-xs text-blue-700 font-semibold mb-2 uppercase">Students Enrolled</p>
            <p className="text-2xl font-bold text-gray-900">{beneficiaryMetrics.students.current.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">/ {beneficiaryMetrics.students.target.toLocaleString()} target</p>
          </div>
          <div className="bg-linear-to-br from-green-50 to-white border-2 border-green-200 hover:border-green-400 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md">
            <p className="text-xs text-green-700 font-semibold mb-2 uppercase">Trees Planted</p>
            <p className="text-2xl font-bold text-gray-900">{beneficiaryMetrics.trees.current.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">/ {beneficiaryMetrics.trees.target.toLocaleString()} target</p>
          </div>
          <div className="bg-linear-to-br from-purple-50 to-white border-2 border-purple-200 hover:border-purple-400 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md">
            <p className="text-xs text-purple-700 font-semibold mb-2 uppercase">Schools Renovated</p>
            <p className="text-2xl font-bold text-gray-900">{beneficiaryMetrics.schools.current}</p>
            <p className="text-sm text-gray-500 mt-1">/ {beneficiaryMetrics.schools.target} target</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Project Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Project Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={projectStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {projectStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Monthly Performance</h2>
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
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="ongoing" fill="#60a5fa" name="Ongoing" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              className="p-6 hover:bg-emerald-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'completed' ? 'bg-emerald-100' :
                    activity.status === 'pending' ? 'bg-amber-100' :
                    'bg-red-100'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle2 className={`w-5 h-5 ${
                        activity.status === 'completed' ? 'text-emerald-600' : ''
                      }`} />
                    ) : activity.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activity.project}</h3>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PMDashboard;
