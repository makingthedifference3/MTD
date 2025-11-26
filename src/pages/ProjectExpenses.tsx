import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { projectExpensesService } from '../services/projectExpensesService';
import type { ProjectExpense, ExpenseStats, ExpenseCategory } from '../services/projectExpensesService';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';

interface UserMap {
  [key: string]: string;
}

interface Project {
  id: string;
  name: string;
  project_code: string;
}

const ProjectExpenses: React.FC = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ProjectExpense | null>(null);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
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

  const [newExpense, setNewExpense] = useState({
    merchant_name: '',
    date: '',
    category: '',
    category_id: '',
    project_id: '',
    total_amount: '',
    description: '',
    bill_drive_link: '',
    payment_method: 'Cash',
  });

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [allExpenses, users, allProjects, allCategories] = await Promise.all([
        projectExpensesService.getAllExpenses(),
        fetchUsers(),
        fetchProjects(),
        projectExpensesService.getExpenseCategories(),
      ]);
      
      setExpenses(allExpenses);
      setUserMap(users);
      setProjects(allProjects);
      setCategories(allCategories);

      // Calculate stats only for current user's expenses
      const myExpenses = currentUser 
        ? allExpenses.filter(e => e.submitted_by === currentUser.id)
        : [];
      const expenseStats = await projectExpensesService.getExpenseStats(myExpenses);
      setStats(expenseStats);
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

  const fetchProjects = async (): Promise<Project[]> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, project_code')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
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

  const handleStatusCardClick = (status: 'pending' | 'approved' | 'rejected') => {
    setSelectedStatus(status);
    setShowStatusModal(true);
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      // Filter by category
      if (filterCategory && expense.category !== filterCategory) return false;
      
      // Filter by status
      if (filterStatus && expense.status !== filterStatus) return false;
      
      // Filter by date range
      if (filterDateFrom && new Date(expense.date) < new Date(filterDateFrom)) return false;
      if (filterDateTo && new Date(expense.date) > new Date(filterDateTo)) return false;
      
      return true;
    });
  };

  const getStatusFilteredExpenses = () => {
    if (!selectedStatus || !currentUser) return [];
    return expenses.filter(e => 
      e.submitted_by === currentUser.id && 
      e.status === selectedStatus
    );
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to create an expense');
      return;
    }

    // Validate that we have a valid category_id
    let validCategoryId = newExpense.category_id;
    
    if (!validCategoryId || validCategoryId.trim() === '') {
      // If no category selected but category name provided, create it
      if (newExpense.category && newExpense.category.trim()) {
        try {
          console.log('Creating new category:', newExpense.category);
          
          // Create a new category with proper UUID
          const { data: newCategory, error: categoryError } = await supabase
            .from('expense_categories')
            .insert({
              name: newExpense.category,
              code: newExpense.category.toUpperCase().replace(/\s+/g, '_'),
              is_active: true
            })
            .select('id')
            .single();

          if (categoryError) {
            console.error('Category creation error:', categoryError);
            throw categoryError;
          }
          
          if (!newCategory || !newCategory.id) {
            console.error('No category returned from insert');
            throw new Error('Failed to get category ID');
          }

          console.log('Created category with ID:', newCategory.id);
          validCategoryId = newCategory.id;
        } catch (error) {
          console.error('Error creating category:', error);
          alert('Failed to create expense category. Please try again.');
          return;
        }
      } else {
        alert('Please select or enter a category');
        return;
      }
    }

    // Validate that we have a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(validCategoryId)) {
      console.error('Invalid category_id format:', validCategoryId);
      alert('Invalid category ID format. Please try again.');
      return;
    }

    try {
      const expenseData: Omit<ProjectExpense, 'id' | 'created_at' | 'updated_at'> = {
        expense_code: `EXP-${Date.now()}`,
        project_id: newExpense.project_id,
        category_id: validCategoryId, // Use the validated category ID
        merchant_name: newExpense.merchant_name,
        date: newExpense.date,
        category: newExpense.category,
        description: newExpense.description,
        total_amount: parseFloat(newExpense.total_amount),
        base_amount: parseFloat(newExpense.total_amount),
        status: 'pending',
        payment_method: newExpense.payment_method as 'Cash' | 'Cheque' | 'Online' | 'Card',
        submitted_by: currentUser.id,
      };

      // Add bill_drive_link if provided
      if (newExpense.bill_drive_link) {
        (expenseData as any).bill_drive_link = newExpense.bill_drive_link;
      }

      console.log('Submitting expense with data:', expenseData);
      
      // Validate only the critical UUID fields (category_id and project_id)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(expenseData.category_id)) {
        alert(`Invalid category_id format: ${expenseData.category_id}`);
        return;
      }
      if (!uuidRegex.test(expenseData.project_id)) {
        alert(`Invalid project_id format: ${expenseData.project_id}`);
        return;
      }
      // Note: submitted_by might not be UUID format in your system, so we don't validate it
      
      const created = await projectExpensesService.createExpense(expenseData);

      if (created) {
        setShowCreateModal(false);
        setNewExpense({
          merchant_name: '',
          date: '',
          category: '',
          category_id: '',
          project_id: '',
          total_amount: '',
          description: '',
          bill_drive_link: '',
          payment_method: 'Cash',
        });
        await loadData();
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Expenses</h1>
            <p className="text-gray-600 mt-2">Track and manage project expenditures</p>
          </div>
        </div>
      </div>

      {/* Stats Section - As per image design */}
      <div className="mb-8">
        {/* Claims Pending Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">{stats.pending}</h2>
            <h3 className="text-xl font-semibold text-gray-700">CLAIMS PENDING FOR APPROVAL</h3>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-8 py-3 rounded-full font-medium transition-colors"
            >
              MY EXPENSE CLAIM
            </button>
          </div>
        </motion.div>

        {/* My Claim Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">MY CLAIM REPORT</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending */}
            <button
              onClick={() => handleStatusCardClick('pending')}
              className="flex items-center justify-between bg-emerald-50 rounded-2xl p-4 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer w-full"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full p-3">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="font-semibold text-gray-900">PENDING {stats.pending}</span>
              </div>
              <div className="bg-white rounded-full px-4 py-2">
                <span className="font-bold text-gray-900">{stats.pendingAmount.toLocaleString()}</span>
              </div>
            </button>

            {/* Approved */}
            <button
              onClick={() => handleStatusCardClick('approved')}
              className="flex items-center justify-between bg-emerald-50 rounded-2xl p-4 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer w-full"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="font-semibold text-gray-900">APPROVED {stats.approved}</span>
              </div>
              <div className="bg-white rounded-full px-4 py-2">
                <span className="font-bold text-gray-900">{stats.approvedAmount.toLocaleString()}</span>
              </div>
            </button>

            {/* Rejected */}
            <button
              onClick={() => handleStatusCardClick('rejected')}
              className="flex items-center justify-between bg-emerald-50 rounded-2xl p-4 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer w-full"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full p-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className="font-semibold text-gray-900">REJECTED {stats.rejected}</span>
              </div>
              <div className="bg-white rounded-full px-4 py-2">
                <span className="font-bold text-gray-900">{stats.rejectedAmount.toLocaleString()}</span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
                    {expenses.length === 0 ? "No expenses found. Click 'MY EXPENSE CLAIM' to create your first expense." : "No expenses match the selected filters."}
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
            <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-6 text-white">
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
              {(selectedExpense as any).bill_drive_link && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Bill Link</label>
                  <a 
                    href={(selectedExpense as any).bill_drive_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 mt-1 block"
                  >
                    View Bill Document
                  </a>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleApprove}
                  disabled={selectedExpense.status === 'approved'}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={selectedExpense.status === 'rejected'}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
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

      {/* Status Filter Modal */}
      {showStatusModal && selectedStatus && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className={`p-6 text-white ${
              selectedStatus === 'approved' 
                ? 'bg-linear-to-r from-emerald-500 to-emerald-600' 
                : selectedStatus === 'pending'
                ? 'bg-linear-to-r from-amber-500 to-amber-600'
                : 'bg-linear-to-r from-red-500 to-red-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold capitalize">{selectedStatus} Expenses</h2>
                  <p className="text-white/90 mt-1">
                    {getStatusFilteredExpenses().length} {selectedStatus} expense(s)
                  </p>
                </div>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {getStatusFilteredExpenses().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No {selectedStatus} expenses found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Merchant</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                        {selectedStatus === 'rejected' && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getStatusFilteredExpenses().map((expense, index) => (
                        <motion.tr
                          key={expense.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{expense.expense_code}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{expense.merchant_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{expense.category}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{expense.total_amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{expense.payment_method}</td>
                          {selectedStatus === 'rejected' && (
                            <td className="px-4 py-3 text-sm text-red-600 max-w-xs truncate">
                              {expense.rejection_reason || 'No reason provided'}
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => {
                                setSelectedExpense(expense);
                                setShowStatusModal(false);
                                setShowModal(true);
                              }}
                              className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Expense Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Create New Expense</h2>
              <p className="text-emerald-100 mt-1">Submit your expense claim</p>
            </div>
            <form onSubmit={handleCreateExpense} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                  <select
                    value={newExpense.project_id}
                    onChange={(e) => setNewExpense({ ...newExpense, project_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.project_code} - {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Merchant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Name *</label>
                  <input
                    type="text"
                    value={newExpense.merchant_name}
                    onChange={(e) => setNewExpense({ ...newExpense, merchant_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter merchant name"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  {categories.length === 0 ? (
                    <input
                      type="text"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ 
                        ...newExpense, 
                        category: e.target.value,
                        category_id: '' 
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter category (e.g., Travel, Food, Supplies)"
                      required
                    />
                  ) : (
                    <select
                      value={newExpense.category_id}
                      onChange={(e) => {
                        const categoryId = e.target.value;
                        const category = categories.find(c => c.id === categoryId);
                        setNewExpense({ 
                          ...newExpense, 
                          category_id: categoryId,
                          category: category?.name || ''
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.total_amount}
                    onChange={(e) => setNewExpense({ ...newExpense, total_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    value={newExpense.payment_method}
                    onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online">GPay/Online</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter expense description"
                    rows={3}
                  />
                </div>

                {/* Bill Drive Link */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bill (Google Drive Link)</label>
                  <input
                    type="url"
                    value={newExpense.bill_drive_link}
                    onChange={(e) => setNewExpense({ ...newExpense, bill_drive_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://drive.google.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload your bill to Google Drive and paste the shareable link here</p>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewExpense({
                      merchant_name: '',
                      date: '',
                      category: '',
                      category_id: '',
                      project_id: '',
                      total_amount: '',
                      description: '',
                      bill_drive_link: '',
                      payment_method: 'Cash',
                    });
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Submit Expense
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectExpenses;
