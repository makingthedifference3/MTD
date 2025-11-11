import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Clock, X, Camera, Plus } from 'lucide-react';
import { expenses, type Expense } from '../mockData';

const ExpenseClaimPage = () => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    merchantName: '',
    date: '',
    category: '',
    totalAmount: '',
    description: ''
  });

  // Calculate claim statistics
  const pendingClaims = expenses.filter(e => e.status === 'Pending');
  const approvedClaims = expenses.filter(e => e.status === 'Approved');
  const rejectedClaims = expenses.filter(e => e.status === 'Rejected');
  
  const pendingAmount = pendingClaims.reduce((sum, e) => sum + e.totalAmount, 0);
  const approvedAmount = approvedClaims.reduce((sum, e) => sum + e.totalAmount, 0);
  const rejectedAmount = rejectedClaims.reduce((sum, e) => sum + e.totalAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 border-green-300';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleAddExpense = () => {
    console.log('New expense:', newExpense);
    setShowExpenseForm(false);
    setNewExpense({
      merchantName: '',
      date: '',
      category: '',
      totalAmount: '',
      description: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Claim Review</h1>
            <p className="text-gray-600 mt-2">Manage and review expense claims</p>
          </div>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>MY EXPENSE CLAIM</span>
          </button>
        </div>
      </div>

      {/* Claims Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">{pendingClaims.length.toString().padStart(2, '0')}</h2>
            <p className="text-emerald-100 text-lg">CLAIMS PENDING FOR APPROVAL</p>
          </div>
          <Clock className="w-16 h-16 text-emerald-200" />
        </div>
      </motion.div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">PENDING</p>
              <h3 className="text-3xl font-bold text-amber-600">{pendingClaims.length}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">₹{pendingAmount.toLocaleString()}</p>
        </motion.div>

        {/* Approved */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">APPROVED</p>
              <h3 className="text-3xl font-bold text-emerald-600">{approvedClaims.length}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">₹{approvedAmount.toLocaleString()}</p>
        </motion.div>

        {/* Rejected */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">REJECTED</p>
              <h3 className="text-3xl font-bold text-red-600">{rejectedClaims.length}</h3>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">₹{rejectedAmount.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Expense Claims Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bill Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Person</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{expense.merchantName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{expense.submittedBy}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{expense.category}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">₹{expense.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedExpense(expense)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Add Expense Claim</h2>
              <button
                onClick={() => setShowExpenseForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Merchant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant Name *
                  </label>
                  <input
                    type="text"
                    value={newExpense.merchantName}
                    onChange={(e) => setNewExpense({ ...newExpense, merchantName: e.target.value })}
                    placeholder="Enter merchant name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    value={newExpense.totalAmount}
                    onChange={(e) => setNewExpense({ ...newExpense, totalAmount: e.target.value })}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload receipt</p>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex items-center justify-end space-x-4 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowExpenseForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Submit Claim
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Review Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedExpense(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Review Expense Claim</h3>
              <button onClick={() => setSelectedExpense(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Merchant Name</p><p className="font-semibold text-gray-900">{selectedExpense.merchantName}</p></div>
                <div><p className="text-sm text-gray-500">Date</p><p className="font-semibold text-gray-900">{new Date(selectedExpense.date).toLocaleDateString()}</p></div>
                <div><p className="text-sm text-gray-500">Category</p><p className="font-semibold text-gray-900">{selectedExpense.category}</p></div>
                <div><p className="text-sm text-gray-500">Amount</p><p className="text-2xl font-bold text-emerald-600">₹{selectedExpense.totalAmount.toLocaleString()}</p></div>
              </div>

              <div><p className="text-sm text-gray-500">Description</p><p className="font-medium text-gray-900">{selectedExpense.description}</p></div>
              <div><p className="text-sm text-gray-500">Submitted By</p><p className="font-semibold text-gray-900">{selectedExpense.submittedBy}</p></div>

              <div><p className="text-sm text-gray-500">Attachment</p>
                <a href={selectedExpense.receiptLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  View Receipt
                </a>
              </div>

              {selectedExpense.status === 'Pending' && (
                <div className="space-y-3 pt-4 border-t">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Reason for rejection (optional)"
                  ></textarea>

                  <div className="flex space-x-3">
                    <button className="flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors">
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-colors">
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExpenseClaimPage;
