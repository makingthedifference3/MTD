import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { getBudgetHeads, getBudgetStats, type BudgetHead, type BudgetStats } from '@/services/budgetAllocationService';

const CSRBudget = () => {
  const [budgetHeads, setBudgetHeads] = useState<BudgetHead[]>([]);
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch budget data on component mount
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get budget heads (grouped by category)
        const heads = await getBudgetHeads();
        setBudgetHeads(heads);

        // Get budget statistics
        const budgetStats = await getBudgetStats();
        setStats(budgetStats);
      } catch (err) {
        console.error('Error fetching budget data:', err);
        setError('Failed to load budget data');
        setBudgetHeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CSR Budget</h1>
        <p className="text-gray-600 mt-2">Manage and track CSR fund allocation</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <p className="text-gray-600 mt-4">Loading budget data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-sm"
            >
              <DollarSign className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Allocated</p>
              <h3 className="text-3xl font-bold">₹{(stats.totalAllocated / 1000000).toFixed(1)}M</h3>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <p className="text-gray-600 text-sm font-medium mb-1">Total Utilized</p>
              <h3 className="text-3xl font-bold text-gray-900">₹{(stats.totalUtilized / 1000000).toFixed(1)}M</h3>
              <p className="text-emerald-600 text-sm mt-2">{stats.utilizationRate.toFixed(1)}% utilized</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <p className="text-gray-600 text-sm font-medium mb-1">Remaining</p>
              <h3 className="text-3xl font-bold text-gray-900">₹{(stats.totalRemaining / 1000000).toFixed(1)}M</h3>
              <p className="text-amber-600 text-sm mt-2">{(100 - stats.utilizationRate).toFixed(1)}% remaining</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <p className="text-gray-600 text-sm font-medium mb-1">Budget Heads</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.budgetHeads}</h3>
              <p className="text-gray-600 text-sm mt-2">{stats.totalProjects} projects</p>
            </motion.div>
          </div>

          {/* Budget Heads Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Budget Heads</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Allocated</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilized</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Remaining</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Projects</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {budgetHeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                        No budget heads found
                      </td>
                    </tr>
                  ) : (
                    budgetHeads.map((budget, index) => (
                      <motion.tr
                        key={budget.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="hover:bg-emerald-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{budget.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{(budget.allocated / 1000).toFixed(0)}K</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">₹{(budget.utilized / 1000).toFixed(0)}K</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{(budget.remaining / 1000).toFixed(0)}K</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{budget.projects}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${budget.utilizationPercentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 min-w-[45px]">{budget.utilizationPercentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CSRBudget;
