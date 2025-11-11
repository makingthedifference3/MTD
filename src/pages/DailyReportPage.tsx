import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Calendar } from 'lucide-react';
import { dailyReports } from '../mockData';

const DailyReportPage = () => {
  const [dateRange, setDateRange] = useState({ start: '25/10/26', end: '26/10/26' });
  const [showExportOptions, setShowExportOptions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': 
      case 'COMPLETED': return 'bg-red-100 text-red-700 border-red-300';
      case 'In Progress': 
      case 'INPROGRESS': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Not Started': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
          <p className="text-gray-600 mt-2">Track daily task completion and assignments</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>EXPORT</span>
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg">Export as PDF</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50">Export as Excel</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg">Export as CSV</button>
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>ADD NEW</span>
          </motion.button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Date Range Filter</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="text"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-32 focus:outline-none font-medium"
                placeholder="Start Date"
              />
              <span className="text-gray-400">-</span>
              <input
                type="text"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-32 focus:outline-none font-medium"
                placeholder="End Date"
              />
              <button className="ml-2 p-1 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium">
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Daily Reports List - Card Style */}
      <div className="space-y-4">
        {dailyReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">TASK NAME</h3>
                <p className="text-gray-700">{report.taskName}</p>
              </div>
              <div className="flex items-center gap-3 ml-6">
                <div className="text-center">
                  <span className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold inline-block">
                    DUE DATE
                  </span>
                  <p className="text-xs text-gray-600 mt-1">{new Date(report.dueDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-6 py-3 rounded-full text-sm font-bold ${getStatusColor(report.completionStatus)}`}>
                  {report.completionStatus.toUpperCase()}
                </span>
                <div className="text-center">
                  <span className="px-6 py-3 bg-white border-2 border-gray-900 rounded-full text-sm font-bold inline-block">
                    ASSIGN BY
                  </span>
                  <p className="text-xs text-gray-600 mt-1">{report.assignedBy}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Total Tasks</p>
          <h3 className="text-3xl font-bold text-gray-900">{dailyReports.length}</h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
          <h3 className="text-3xl font-bold text-emerald-600">
            {dailyReports.filter(r => r.completionStatus.toLowerCase().includes('complete')).length}
          </h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
          <h3 className="text-3xl font-bold text-amber-600">
            {dailyReports.filter(r => r.completionStatus.toLowerCase().includes('progress')).length}
          </h3>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyReportPage;
