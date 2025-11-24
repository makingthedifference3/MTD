import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectExpensesService } from '../services/projectExpensesService';
import type { ProjectExpense, ExpenseStats } from '../services/projectExpensesService';

const ProjectExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ProjectExpense | null>(null);
  const [stats, setStats] = useState<ExpenseStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const allExpenses = await projectExpensesService.getAllExpenses();
      setExpenses(allExpenses);
      const expenseStats = await projectExpensesService.getExpenseStats(allExpenses);
      setStats(expenseStats);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const totalExpenses = stats.totalAmount;
  const pendingExpenses = stats.pendingAmount;
  const approvedExpenses = stats.approvedAmount;
  const rejectedExpenses = stats.rejectedAmount;

  const handleViewDetails = (expense: ProjectExpense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (selectedExpense) {
      try {
        await projectExpensesService.approveExpense(
          selectedExpense.id,
          'current_user_id' // TODO: Replace with actual user ID from AuthContext
        );
        setShowModal(false);
        await loadExpenses();
      } catch (error) {
        console.error('Error approving expense:', error);
      }
    }
  };

  const handleReject = async () => {
    if (selectedExpense) {
      const reason = prompt('Enter rejection reason:');
      if (reason) {
        try {
          await projectExpensesService.rejectExpense(selectedExpense.id, reason);
          setShowModal(false);
          await loadExpenses();
        } catch (error) {
          console.error('Error rejecting expense:', error);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Expenses</h1>
        <p className="text-gray-600 mt-2">Track and manage project expenditures</p>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Expenses - Large Featured Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 lg:row-span-2 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white shadow-lg"
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-2">Total Expenses</p>
              <h2 className="text-5xl font-bold mb-4">₹{totalExpenses.toLocaleString()}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <span className="text-emerald-50">Approved</span>
                <span className="font-semibold">₹{approvedExpenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <span className="text-emerald-50">Pending</span>
                <span className="font-semibold">₹{pendingExpenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <span className="text-emerald-50">Rejected</span>
                <span className="font-semibold">₹{rejectedExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pending Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{pendingExpenses.toLocaleString()}</h3>
          <p className="text-amber-600 text-sm font-medium">{expenses.filter(e => e.status === 'pending').length} items</p>
        </motion.div>

        {/* Approved Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <p className="text-gray-600 text-sm font-medium mb-2">Approved</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{approvedExpenses.toLocaleString()}</h3>
          <p className="text-emerald-600 text-sm font-medium">{expenses.filter(e => e.status === 'approved').length} items</p>
        </motion.div>

        {/* Rejected Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <p className="text-gray-600 text-sm font-medium mb-2">Rejected</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{rejectedExpenses.toLocaleString()}</h3>
          <p className="text-red-600 text-sm font-medium">{expenses.filter(e => e.status === 'rejected').length} items</p>
        </motion.div>

        {/* Quick Actions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-sm"
        >
          <p className="text-gray-300 text-sm font-medium mb-4">Quick Actions</p>
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            + New Expense
          </button>
        </motion.div>
      </div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">All Expenses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-emerald-50/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.expense_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.project_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{expense.total_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.submitted_by}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      expense.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : expense.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(expense)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          >
            <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Expense Details</h2>
              <p className="text-emerald-100 mt-1">{selectedExpense.id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Expense Code</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedExpense.expense_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedExpense.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-gray-900 font-semibold mt-1 text-2xl">₹{selectedExpense.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedExpense.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted By</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedExpense.submitted_by}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium {
                      selectedExpense.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : selectedExpense.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedExpense.status.charAt(0).toUpperCase() + selectedExpense.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">{selectedExpense.description}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectExpenses;
