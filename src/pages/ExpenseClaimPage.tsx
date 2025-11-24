import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Clock, X, Camera, Plus, Loader } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import {
  getAllExpenses,
  getExpenseStats,
  createExpenseClaim,
  approveExpense,
  rejectExpense,
  type ProjectExpense,
  type ExpenseDisplay,
  type ExpenseStats,
} from '@/services/expenseClaimService';

const ExpenseClaimPage = () => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || '00000000-0000-0000-0000-000000000000';
  const [expenses, setExpenses] = useState<ExpenseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDisplay | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [stats, setStats] = useState<ExpenseStats>({
    pendingCount: 0,
    pendingAmount: 0,
    approvedCount: 0,
    approvedAmount: 0,
    rejectedCount: 0,
    rejectedAmount: 0,
    totalExpenses: 0,
    totalAmount: 0,
  });
  const [newExpense, setNewExpense] = useState({
    merchantName: '',
    date: '',
    category: '',
    totalAmount: '',
    description: '',
    receiptFile: null as File | null,
  });

  // Fetch expenses on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const [expensesData, statsData] = await Promise.all([
          getAllExpenses(),
          getExpenseStats(),
        ]);

        // Transform to ExpenseDisplay format
        const displayExpenses: ExpenseDisplay[] = expensesData.map((exp) => ({
          id: exp.id,
          merchantName: exp.merchant_name,
          date: exp.date,
          submittedBy: exp.submitted_by || 'Unknown',
          category: exp.category,
          totalAmount: exp.total_amount,
          status: exp.status as 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'reimbursed',
          receiptLink: exp.receipt_drive_link,
          description: exp.description,
        }));

        setExpenses(displayExpenses);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        setError('Failed to load expenses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Handle adding new expense
  const handleAddExpense = async () => {
    try {
      if (!newExpense.merchantName || !newExpense.totalAmount || !newExpense.category) {
        alert('Please fill in all required fields');
        return;
      }

      const expenseData: Omit<ProjectExpense, 'id' | 'created_at' | 'updated_at' | 'updated_by'> = {
        expense_code: `EXP-${Date.now()}`,
        project_id: '00000000-0000-0000-0000-000000000000', // TODO: Get from project context
        category_id: '00000000-0000-0000-0000-000000000000', // TODO: Get from category selector
        task_id: null,
        merchant_name: newExpense.merchantName,
        merchant_contact: '',
        merchant_address: '',
        merchant_gstin: '',
        merchant_pan: '',
        date: newExpense.date,
        category: newExpense.category,
        sub_category: '',
        description: newExpense.description,
        purpose: '',
        base_amount: parseFloat(newExpense.totalAmount),
        tax_amount: 0,
        gst_percentage: 0,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        other_charges: 0,
        discount_amount: 0,
        total_amount: parseFloat(newExpense.totalAmount),
        payment_method: 'Online',
        payment_reference: '',
        payment_date: '',
        paid_to: '',
        bank_details: {},
        bill_drive_link: '',
        invoice_drive_link: '',
        receipt_drive_link: '',
        supporting_docs: {},
        status: 'draft',
        submitted_by: currentUserId,
        submitted_date: new Date().toISOString().split('T')[0],
        reviewed_by: null,
        reviewed_date: null,
        approved_by: null,
        approved_date: null,
        rejection_reason: null,
        reimbursed_date: null,
        account_code: '',
        gl_code: '',
        cost_center: '',
        is_reimbursable: true,
        reimbursed_to: '',
        approval_chain: {},
        current_approver: null,
        priority: 'normal',
        tags: [],
        notes: '',
        internal_notes: '',
        metadata: {},
        created_by: currentUserId,
      };

      const result = await createExpenseClaim(expenseData);

      if (result) {
        const newDisplayExpense: ExpenseDisplay = {
          id: result.id,
          merchantName: result.merchant_name,
          date: result.date,
          submittedBy: result.submitted_by || 'Unknown',
          category: result.category,
          totalAmount: result.total_amount,
          status: result.status as 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'reimbursed',
          receiptLink: result.receipt_drive_link,
          description: result.description,
        };

        setExpenses([newDisplayExpense, ...expenses]);
        setShowExpenseForm(false);
        setNewExpense({
          merchantName: '',
          date: '',
          category: '',
          totalAmount: '',
          description: '',
          receiptFile: null,
        });

        // Refresh stats
        const updatedStats = await getExpenseStats();
        setStats(updatedStats);
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to submit expense. Please try again.');
    }
  };

  // Handle approve expense
  const handleApprove = async (expenseId: string) => {
    try {
      await approveExpense(expenseId, currentUserId);
      
      // Update local state
      const updatedExpenses = expenses.map((exp) =>
        exp.id === expenseId ? { ...exp, status: 'approved' as const } : exp
      );
      setExpenses(updatedExpenses);
      setSelectedExpense(null);

      // Refresh stats
      const updatedStats = await getExpenseStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Error approving expense:', err);
      alert('Failed to approve expense. Please try again.');
    }
  };

  // Handle reject expense
  const handleReject = async (expenseId: string) => {
    try {
      if (!rejectReason) {
        alert('Please provide a rejection reason');
        return;
      }

      await rejectExpense(expenseId, rejectReason, currentUserId);

      // Update local state
      const updatedExpenses = expenses.map((exp) =>
        exp.id === expenseId ? { ...exp, status: 'rejected' as const } : exp
      );
      setExpenses(updatedExpenses);
      setSelectedExpense(null);
      setRejectReason('');

      // Refresh stats
      const updatedStats = await getExpenseStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Error rejecting expense:', err);
      alert('Failed to reject expense. Please try again.');
    }
  };

  // Helper function for status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading expenses...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Claims Counter */}
      {!loading && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">{stats.pendingCount.toString().padStart(2, '0')}</h2>
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
                  <h3 className="text-3xl font-bold text-amber-600">{stats.pendingCount}</h3>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.pendingAmount.toLocaleString()}</p>
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
                  <h3 className="text-3xl font-bold text-emerald-600">{stats.approvedCount}</h3>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.approvedAmount.toLocaleString()}</p>
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
                  <h3 className="text-3xl font-bold text-red-600">{stats.rejectedCount}</h3>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.rejectedAmount.toLocaleString()}</p>
            </motion.div>
          </div>

          {/* Expense Claims Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {expenses.length > 0 ? (
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
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
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
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No expenses found. Create your first expense claim.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
                  <input
                    type="file"
                    id="receipt-upload"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewExpense({ ...newExpense, receiptFile: file });
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer block"
                  >
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {newExpense.receiptFile ? newExpense.receiptFile.name : 'Click to upload receipt'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop (PDF, JPG, PNG)</p>
                  </label>
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
                {selectedExpense.receiptLink ? (
                  <a href={selectedExpense.receiptLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                    View Receipt
                  </a>
                ) : (
                  <p className="text-gray-500">No attachment</p>
                )}
              </div>

              {selectedExpense.status === 'pending' && (
                <div className="space-y-3 pt-4 border-t">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Reason for rejection (optional)"
                  ></textarea>

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleReject(selectedExpense.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedExpense.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-colors"
                    >
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
