import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ChevronDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FilterBar from '../components/FilterBar';
import {
  getAllAnalyticsData,
  type ProjectAnalytic,
  type MonthlyTrend,
  type CategoryDistribution,
  type FunnelStage,
  type ChartDataPoint,
} from '../services/analyticsService';

const AnalysisReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  // Database state
  const [barChartData, setBarChartData] = useState<ChartDataPoint[]>([]);
  const [pieChartData, setPieChartData] = useState<ChartDataPoint[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [lineChartData, setLineChartData] = useState<ChartDataPoint[]>([]);
  const [projectPerformance, setProjectPerformance] = useState<ProjectAnalytic[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [keyMetrics, setKeyMetrics] = useState({
    totalProjects: 0,
    totalBudget: 0,
    avgCompletion: 0,
  });

  // Fetch all analytics data on component mount
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const data = await getAllAnalyticsData();

        setBarChartData(data.itemAnalysis);
        setPieChartData(data.distributionData);
        setFunnelData(data.funnelData);
        setLineChartData(data.multiSeriesTrends);
        setProjectPerformance(data.projectPerformance);
        setMonthlyTrends(data.monthlyTrends);
        setCategoryDistribution(data.categoryDistribution);
        setKeyMetrics(data.keyMetrics);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        // Fallback to empty data
        setBarChartData([]);
        setPieChartData([]);
        setFunnelData([]);
        setLineChartData([]);
        setProjectPerformance([]);
        setMonthlyTrends([]);
        setCategoryDistribution([]);
      }
    };

    loadAnalyticsData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6">
        <FilterBar />
      </div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis Report</h1>
            <p className="text-gray-600 mt-2">Comprehensive project analytics and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <div className="relative">
              <button
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                className="flex items-center space-x-2 px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <span className="text-sm font-medium">FILTER</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilterOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-10">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50">All Data</button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50">Education</button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50">Health</button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50">Infrastructure</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wireframe Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar Chart - Exact wireframe data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Item Analysis</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 25]} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart - Exact wireframe percentages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Funnel Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Funnel Analysis</h2>
          <div className="space-y-2 mt-4">
            {funnelData.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.stage}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                  >
                    {item.value}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Line Chart - Multiple series */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Multi-Series Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="item" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="series1" stroke="#10b981" strokeWidth={2} name="Series 1" />
            <Line type="monotone" dataKey="series2" stroke="#60a5fa" strokeWidth={2} name="Series 2" />
            <Line type="monotone" dataKey="series3" stroke="#f59e0b" strokeWidth={2} name="Series 3" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-sm"
        >
          <BarChart3 className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-emerald-100 text-sm font-medium mb-1">Total Projects</p>
          <h3 className="text-4xl font-bold">{keyMetrics.totalProjects}</h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Total Budget</p>
          <h3 className="text-4xl font-bold text-gray-900">
            {(keyMetrics.totalBudget / 1000000).toFixed(1)}M
          </h3>
          <p className="text-emerald-600 text-sm mt-2">↑ 18% from last quarter</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Avg Completion</p>
          <h3 className="text-4xl font-bold text-gray-900">{keyMetrics.avgCompletion}%</h3>
          <p className="text-emerald-600 text-sm mt-2">↑ 5% from last quarter</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Project Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Project Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="project" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#10b981" name="Budget" radius={[8, 8, 0, 0]} />
              <Bar dataKey="spent" fill="#60a5fa" name="Spent" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Monthly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="budget" stroke="#10b981" strokeWidth={2} name="Budget" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AnalysisReport;
