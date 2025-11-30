import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { projectExpensesService } from '../services/projectExpensesService';
import type { ProjectExpense } from '../services/projectExpensesService';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';

interface UserMap {
  [key: string]: string;
}

const AdminExpensesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billUrl, setBillUrl] = useState<string>('');
  const [selectedExpense, setSelectedExpense] = useState<ProjectExpense | null>(null);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [allExpenses, users] = await Promise.all([
        projectExpensesService.getAllExpenses(),
        fetchUsers(),
      ]);
      
      setExpenses(allExpenses);
      setUserMap(users);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const fetchUsers = async (): Promise<UserMap> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name');

      if (error) throw error;
      
      const map: UserMap = {};
      data?.forEach((user: { id: string; full_name: string }) => {
        map[user.id] = user.full_name;
      });
      return map;
    } catch (error) {
      console.error('Error fetching users:', error);
      return {};
    }
  };

  const handleViewDetails = (expense: ProjectExpense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (selectedExpense && currentUser) {
      try {
        await projectExpensesService.approveExpense(
          selectedExpense.id,
          currentUser.id
        );
        setShowModal(false);
        await loadData();
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
          await loadData();
        } catch (error) {
          console.error('Error rejecting expense:', error);
        }
      }
    }
  };

  const handleMarkAsPaid = async () => {
    if (selectedExpense && currentUser) {
      try {
        await projectExpensesService.markAsPaid(
          selectedExpense.id,
          currentUser.id
        );
        setShowModal(false);
        await loadData();
      } catch (error) {
        console.error('Error marking expense as paid:', error);
      }
    }
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      if (filterCategory && expense.category !== filterCategory) return false;
      if (filterStatus && expense.status !== filterStatus) return false;
      if (filterDateFrom && new Date(expense.date) < new Date(filterDateFrom)) return false;
      if (filterDateTo && new Date(expense.date) > new Date(filterDateTo)) return false;
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin - All Expenses</h1>
        <p className="text-gray-600 mt-2">Review and manage all project expenses</p>
      </div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Expenses</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Categories</option>
                {Array.from(new Set(expenses.map(e => e.category))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>
          
          {(filterCategory || filterStatus || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('');
                setFilterDateFrom('');
                setFilterDateTo('');
              }}
              className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expense Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredExpenses().length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {expenses.length === 0 ? "No expenses found." : "No expenses match the selected filters."}
                  </td>
                </tr>
              ) : (
                getFilteredExpenses().map((expense, index) => (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-emerald-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.expense_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.merchant_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{expense.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {expense.submitted_by ? userMap[expense.submitted_by] || 'Unknown' : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : expense.status === 'pending' || expense.status === 'submitted'
                          ? 'bg-amber-100 text-amber-700'
                          : expense.status === 'paid'
                          ? 'bg-blue-100 text-blue-700'
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* View Expense Details Modal */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Expense Details</h2>
              <p className="text-emerald-100 mt-1">{selectedExpense.expense_code}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Expense Code</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedExpense.expense_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Merchant Name</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedExpense.merchant_name}</p>
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
                  <p className="text-gray-900 font-semibold mt-1">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted By</label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {selectedExpense.submitted_by ? userMap[selectedExpense.submitted_by] || 'Unknown' : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedExpense.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : selectedExpense.status === 'pending' || selectedExpense.status === 'submitted'
                        ? 'bg-amber-100 text-amber-700'
                        : selectedExpense.status === 'paid'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedExpense.status.charAt(0).toUpperCase() + selectedExpense.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedExpense.payment_method}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">{selectedExpense.description || 'No description provided'}</p>
              </div>
              {selectedExpense.status === 'rejected' && selectedExpense.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-red-800">Rejection Reason</label>
                  <p className="text-red-700 mt-1">{selectedExpense.rejection_reason}</p>
                </div>
              )}
              {(selectedExpense as ProjectExpense & { bill_drive_link?: string }).bill_drive_link && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Bill</label>
                  <button
                    onClick={() => {
                      setBillUrl((selectedExpense as ProjectExpense & { bill_drive_link?: string }).bill_drive_link || '');
                      setShowBillModal(true);
                    }}
                    className="text-emerald-600 hover:text-emerald-700 mt-1 block font-medium hover:underline"
                  >
                    View Bill Document
                  </button>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleApprove}
                  disabled={selectedExpense.status === 'approved' || selectedExpense.status === 'paid'}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={selectedExpense.status === 'rejected' || selectedExpense.status === 'paid'}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Reject
                </button>
                {selectedExpense.status === 'approved' && (
                  <button
                    onClick={handleMarkAsPaid}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}
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

      {/* Bill Preview Modal */}
      {showBillModal && billUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold">Bill Document</h2>
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setBillUrl('');
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {billUrl.endsWith('.pdf') ? (
                <iframe
                  src={billUrl}
                  className="w-full h-[600px] border border-gray-300 rounded-lg"
                  title="Bill Document"
                />
              ) : (
                <img
                  src={billUrl}
                  alt="Bill Document"
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminExpensesPage;
