import { motion } from 'framer-motion';
import { Plus, Minus, DollarSign, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getBudgetHeadsByYear, getBudgetUtilizationStats, type BudgetUtilizationHead, type BudgetUtilizationStats } from '@/services/budgetUtilizationService';

const CSRBudgetPage = () => {
  const [budgetHeads, setBudgetHeads] = useState<BudgetUtilizationHead[]>([]);
  const [stats, setStats] = useState<BudgetUtilizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentYear = new Date().getFullYear().toString();
        const heads = await getBudgetHeadsByYear(currentYear);
        const budgetStats = await getBudgetUtilizationStats(currentYear);
        setBudgetHeads(heads);
        setStats(budgetStats);
      } catch (err) {
        setError('Failed to load budget data');
        console.error('Error fetching budget data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">CSR Budget Utilization</h2>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
          >
            <p className="text-sm text-blue-600 font-semibold">Total Allocated</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">₹{(stats.totalAllocated / 100000).toFixed(2)}L</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200"
          >
            <p className="text-sm text-emerald-600 font-semibold">Total Utilized</p>
            <p className="text-2xl font-bold text-emerald-900 mt-2">₹{(stats.totalUtilized / 100000).toFixed(2)}L</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200"
          >
            <p className="text-sm text-green-600 font-semibold">Total Available</p>
            <p className="text-2xl font-bold text-green-900 mt-2">₹{(stats.totalAvailable / 100000).toFixed(2)}L</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200"
          >
            <p className="text-sm text-purple-600 font-semibold">Utilization Rate</p>
            <p className="text-2xl font-bold text-purple-900 mt-2">{stats.overallUtilizationPercentage}%</p>
          </motion.div>
        </div>
      )}

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetHeads.length > 0 ? (
          budgetHeads.map((budget, index) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{budget.fundHead}</h3>
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Allocated</span>
                  <span className="font-bold text-gray-900">₹{(budget.allocatedAmount / 100000).toFixed(2)}L</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Utilized</span>
                  <span className="font-bold text-emerald-600">₹{(budget.utilizedAmount / 100000).toFixed(2)}L</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="font-bold text-green-600">₹{(budget.remainingAmount / 100000).toFixed(2)}L</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-emerald-500 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${budget.utilizationPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">{budget.utilizationPercentage}% Utilized</p>

                <div className="flex items-center space-x-2 mt-4">
                  <button className="flex-1 p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                    <Plus className="w-4 h-4 text-green-700 mx-auto" />
                  </button>
                  <button className="flex-1 p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
                    <Minus className="w-4 h-4 text-red-700 mx-auto" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No budget data available
          </div>
        )}
      </div>

      {/* Add New Fund Head */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Fund Head</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Fund Head Name" />
          <input type="number" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Allocated Amount" />
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            Add Fund
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSRBudgetPage;
