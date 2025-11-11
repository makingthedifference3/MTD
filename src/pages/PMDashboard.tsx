import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, DollarSign, FolderKanban, CheckCircle2, Clock, AlertCircle,
  Target, Zap, Activity, Award, ArrowUpRight, Calendar, Sparkles
} from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
      {/* Modern Header with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl shadow-emerald-500/5 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent">
                  Project Command Center
                </h1>
                <p className="text-gray-600 mt-1 font-medium">Real-time project oversight & team coordination</p>
              </div>
            </div>
            {hasFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30"
              >
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-wide">{filterMode.label}</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Layout - Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white border border-gray-200/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Gradient Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-600/0 group-hover:from-emerald-500/5 group-hover:to-emerald-600/5 transition-all duration-300 rounded-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 group-hover:from-emerald-500/20 group-hover:to-emerald-600/20 rounded-xl transition-all duration-300 group-hover:scale-110`}>
                  <stat.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">{stat.label}</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
            </div>

            {/* Decorative Corner */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          </motion.div>
        ))}
      </div>

      {/* Bento Grid - Hero Section with Charts and Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Project Status - Compact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Project Pipeline</h2>
              <p className="text-sm text-gray-500 mt-1">Distribution overview</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={projectStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {projectStatus.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {projectStatus.map((status, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: status.color }}></div>
                <span className="text-xs font-semibold text-gray-600">{status.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Performance - Large Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Performance Trends</h2>
              <p className="text-sm text-gray-500 mt-1">Projects completed vs ongoing</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-colors cursor-pointer"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af" 
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
                cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="completed" 
                fill="#10b981" 
                name="Completed" 
                radius={[8, 8, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
              <Bar 
                dataKey="ongoing" 
                fill="#6366f1" 
                name="Ongoing" 
                radius={[8, 8, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Impact Metrics - Full Width Bento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-white via-emerald-50/30 to-white border border-gray-200/50 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Impact Dashboard</h2>
              <p className="text-gray-600 text-sm mt-1 font-medium">Real-time beneficiary metrics & project outcomes</p>
            </div>
          </div>
          <select className="px-5 py-3 text-sm font-bold rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white text-gray-900 appearance-none cursor-pointer hover:border-emerald-400 transition-colors shadow-sm">
            <option value="all">🌍 ALL LOCATIONS</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Beneficiaries */}
          <div className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 transition-all cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-5 h-5 text-white/80" />
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </div>
              <p className="text-xs text-emerald-100 font-bold mb-2 uppercase tracking-wider">Total Reach</p>
              <p className="text-3xl font-black text-white mb-1">{beneficiaryMetrics.beneficiaries.current.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-emerald-100 text-xs font-semibold">
                <Target className="w-3 h-3" />
                {beneficiaryMetrics.beneficiaries.target.toLocaleString()} goal
              </div>
            </div>
          </div>

          {/* Pads Donated */}
          <div className="group relative bg-white border-2 border-pink-200 hover:border-pink-400 rounded-2xl p-5 transition-all cursor-pointer hover:shadow-2xl hover:shadow-pink-500/20 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                <Award className="w-5 h-5 text-pink-600" />
              </div>
              <div className="px-2 py-1 bg-pink-50 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-pink-600" />
              </div>
            </div>
            <p className="text-xs text-pink-700 font-bold mb-2 uppercase tracking-wider">Pads Donated</p>
            <p className="text-3xl font-black text-gray-900 mb-1">{beneficiaryMetrics.pads.current.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-semibold">of {beneficiaryMetrics.pads.target.toLocaleString()}</p>
          </div>

          {/* Meals Served */}
          <div className="group relative bg-white border-2 border-orange-200 hover:border-orange-400 rounded-2xl p-5 transition-all cursor-pointer hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div className="px-2 py-1 bg-orange-50 rounded-full">
                <Zap className="w-3 h-3 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-orange-700 font-bold mb-2 uppercase tracking-wider">Meals Served</p>
            <p className="text-3xl font-black text-gray-900 mb-1">
              {beneficiaryMetrics.meals.current > 1000 ? `${(beneficiaryMetrics.meals.current / 1000).toFixed(0)}K` : beneficiaryMetrics.meals.current.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 font-semibold">
              of {beneficiaryMetrics.meals.target > 1000 ? `${(beneficiaryMetrics.meals.target / 1000).toFixed(0)}K` : beneficiaryMetrics.meals.target.toLocaleString()}
            </p>
          </div>

          {/* Students Enrolled */}
          <div className="group relative bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-5 transition-all cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="px-2 py-1 bg-blue-50 rounded-full">
                <TrendingUp className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-700 font-bold mb-2 uppercase tracking-wider">Students</p>
            <p className="text-3xl font-black text-gray-900 mb-1">{beneficiaryMetrics.students.current.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-semibold">of {beneficiaryMetrics.students.target.toLocaleString()}</p>
          </div>

          {/* Trees Planted */}
          <div className="group relative bg-white border-2 border-green-200 hover:border-green-400 rounded-2xl p-5 transition-all cursor-pointer hover:shadow-2xl hover:shadow-green-500/20 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div className="px-2 py-1 bg-green-50 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-700 font-bold mb-2 uppercase tracking-wider">Trees Planted</p>
            <p className="text-3xl font-black text-gray-900 mb-1">{beneficiaryMetrics.trees.current.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-semibold">of {beneficiaryMetrics.trees.target.toLocaleString()}</p>
          </div>

          {/* Schools Renovated */}
          <div className="group relative bg-white border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-5 transition-all cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <FolderKanban className="w-5 h-5 text-purple-600" />
              </div>
              <div className="px-2 py-1 bg-purple-50 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-purple-700 font-bold mb-2 uppercase tracking-wider">Schools</p>
            <p className="text-3xl font-black text-gray-900 mb-1">{beneficiaryMetrics.schools.current}</p>
            <p className="text-xs text-gray-500 font-semibold">of {beneficiaryMetrics.schools.target}</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Activities - Modern Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-gray-50 to-emerald-50/30 p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Activity Stream</h2>
              <p className="text-sm text-gray-500 mt-0.5">Latest project updates</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className="group p-6 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`relative p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                    activity.status === 'completed' ? 'bg-emerald-100 group-hover:bg-emerald-200' :
                    activity.status === 'pending' ? 'bg-amber-100 group-hover:bg-amber-200' :
                    'bg-red-100 group-hover:bg-red-200'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : activity.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    {activity.status === 'pending' && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{activity.project}</h3>
                    <p className="text-sm text-gray-600 mt-0.5 font-medium">{activity.action}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full group-hover:bg-emerald-100 transition-colors">
                    <Calendar className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-600" />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-emerald-700">{activity.time}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PMDashboard;
