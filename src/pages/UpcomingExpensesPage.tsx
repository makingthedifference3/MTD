import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar } from 'lucide-react';

interface UpcomingExpense {
  id: number;
  description: string;
  plannedDate: string;
  estimatedAmount: number;
  category: string;
}

const UpcomingExpensesPage = () => {
  const [upcomingExpenses, setUpcomingExpenses] = useState<UpcomingExpense[]>([
    { id: 1, description: 'Infrastructure Development', plannedDate: '2025-02-15', estimatedAmount: 450000, category: 'Capital' },
    { id: 2, description: 'Teacher Training Program', plannedDate: '2025-02-20', estimatedAmount: 125000, category: 'Education' },
    { id: 3, description: 'Learning Material Purchase', plannedDate: '2025-03-01', estimatedAmount: 85000, category: 'Supplies' },
  ]);

  const [newExpense, setNewExpense] = useState({ description: '', plannedDate: '', estimatedAmount: '', category: '' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Upcoming Expenses</h2>
      </div>

      {/* Add New Expense Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan New Expense</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg lg:col-span-2"
            placeholder="Expense Description"
          />
          <input
            type="date"
            value={newExpense.plannedDate}
            onChange={(e) => setNewExpense({ ...newExpense, plannedDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Planned Date"
          />
          <input
            type="number"
            value={newExpense.estimatedAmount}
            onChange={(e) => setNewExpense({ ...newExpense, estimatedAmount: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Amount (₹)"
          />
          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Category</option>
            <option value="Capital">Capital</option>
            <option value="Education">Education</option>
            <option value="Supplies">Supplies</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              if (newExpense.description && newExpense.plannedDate && newExpense.estimatedAmount && newExpense.category) {
                setUpcomingExpenses([
                  ...upcomingExpenses,
                  { ...newExpense, id: Date.now(), estimatedAmount: parseFloat(newExpense.estimatedAmount) },
                ]);
                setNewExpense({ description: '', plannedDate: '', estimatedAmount: '', category: '' });
              }
            }}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Upcoming Expenses List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Planned Expenses</h3>
        {upcomingExpenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{expense.description}</h4>
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-xs text-gray-500">Planned Date</p>
                      <p className="font-medium text-gray-900">{new Date(expense.plannedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">{expense.category}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Estimated Amount</p>
                <p className="text-2xl font-bold text-emerald-600">₹{expense.estimatedAmount.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingExpensesPage;
