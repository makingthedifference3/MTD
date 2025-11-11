import { motion } from 'framer-motion';
import { Plus, Minus, DollarSign } from 'lucide-react';
import { budgets } from '../mockData';

const CSRBudgetPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">CSR Budget Utilization</h2>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget, index) => {
          const remaining = budget.allocatedAmount - budget.utilizedAmount;
          const percentage = (budget.utilizedAmount / budget.allocatedAmount) * 100;

          return (
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
                  <span className="font-bold text-green-600">₹{(remaining / 100000).toFixed(2)}L</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-emerald-500 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">{percentage.toFixed(1)}% Utilized</p>

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
          );
        })}
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
