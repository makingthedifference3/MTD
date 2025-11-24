import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Loader, AlertCircle } from 'lucide-react';
import { projectExpensesService, type ProjectExpense } from '../services/projectExpensesService';

const UpcomingExpensesPage = () => {
  const [upcomingExpenses, setUpcomingExpenses] = useState<ProjectExpense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    date: '',
    estimated_amount: '',
    category: '',
    purpose: '',
    merchant_name: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch upcoming expenses (not yet submitted)
      const expenses = await projectExpensesService.getUpcomingExpenses();
      setUpcomingExpenses(expenses);

      // Fetch categories for dropdown
      const expenseCategories = await projectExpensesService.getExpenseCategories();
      const categoryNames = expenseCategories.map((cat) => cat.name);
      setCategories(categoryNames);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load upcoming expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.date || !newExpense.estimated_amount || !newExpense.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const expenseToCreate: Omit<ProjectExpense, 'id' | 'created_at' | 'updated_at'> = {
        expense_code: `EXP-${Date.now()}`,
        project_id: '',
        category_id: '',
        date: newExpense.date,
        category: newExpense.category,
        description: newExpense.description,
        purpose: newExpense.purpose,
        base_amount: parseFloat(newExpense.estimated_amount),
        total_amount: parseFloat(newExpense.estimated_amount),
        merchant_name: newExpense.merchant_name,
        status: 'draft',
        payment_method: 'Cash',
      };

      const created = await projectExpensesService.createExpense(expenseToCreate);

      if (created) {
        setNewExpense({
          description: '',
          date: '',
          estimated_amount: '',
          category: '',
          purpose: '',
          merchant_name: '',
        });
        setError(null);
        await loadData();
      }
    } catch (err) {
      console.error('Error creating expense:', err);
      setError('Failed to create expense');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Expenses</h1>
        <p className="text-gray-600 mt-2">Plan and track upcoming project expenses</p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-96">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
            <Loader className="w-10 h-10 text-emerald-500" />
          </motion.div>
        </div>
      )}

      {!loading && (
        <>
          {/* Add New Expense Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Plan New Expense</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Expense description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planned Date *</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Amount (₹) *</label>
                <input
                  type="number"
                  value={newExpense.estimated_amount}
                  onChange={(e) => setNewExpense({ ...newExpense, estimated_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Name</label>
                <input
                  type="text"
                  value={newExpense.merchant_name}
                  onChange={(e) => setNewExpense({ ...newExpense, merchant_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Vendor/Merchant name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                <input
                  type="text"
                  value={newExpense.purpose}
                  onChange={(e) => setNewExpense({ ...newExpense, purpose: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Purpose of expense"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <motion.button
                onClick={handleAddExpense}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Expense</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Upcoming Expenses List */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Planned Expenses</h3>

            {upcomingExpenses.length > 0 ? (
              <div className="space-y-4">
                {upcomingExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                          <Calendar className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{expense.description}</h4>
                          {expense.purpose && (
                            <p className="text-gray-600 text-sm mb-3">{expense.purpose}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Planned Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(expense.date).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Category</p>
                              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {expense.category}
                              </span>
                            </div>
                            {expense.merchant_name && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Merchant</p>
                                <p className="font-medium text-gray-900">{expense.merchant_name}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  expense.status === 'draft'
                                    ? 'bg-gray-100 text-gray-700'
                                    : expense.status === 'submitted'
                                      ? 'bg-amber-50 text-amber-700'
                                      : expense.status === 'approved'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {expense.status?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500 mb-1">Estimated Amount</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          ₹{expense.total_amount?.toLocaleString('en-IN') || 0}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-lg p-12 text-center"
              >
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No upcoming expenses planned. Create one to get started.</p>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UpcomingExpensesPage;
