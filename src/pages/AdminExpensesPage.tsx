import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, Ban, DollarSign } from 'lucide-react';
import { projectExpensesService } from '../services/projectExpensesService';
import type { ProjectExpense } from '../services/projectExpensesService';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';

interface UserMap {
  [key: string]: string;
}

interface CSRPartner {
  id: string;
  name: string;
}

interface Toll {
  id: string;
  toll_name: string;
}

interface Project {
  id: string;
  name: string;
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
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterCSRPartner, setFilterCSRPartner] = useState<string>('');
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterToll, setFilterToll] = useState<string>('');
  const [csrPartners, setCSRPartners] = useState<CSRPartner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [filteredTolls, setFilteredTolls] = useState<Toll[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<Array<{id: string; name: string; parent_id: string | null; project_id: string}>>([]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [allExpenses, users, partners, projectsList, tollsList] = await Promise.all([
        projectExpensesService.getAllExpenses(),
        fetchUsers(),
        fetchCSRPartners(),
        fetchProjects(),
        fetchTolls(),
      ]);
      
      // Filter to show only accepted, approved, and rejected expenses
      const relevantExpenses = allExpenses.filter(exp => 
        exp.status === 'accepted' || exp.status === 'approved' || exp.status === 'rejected'
      );
      
      setExpenses(relevantExpenses);
      setUserMap(users);
      setCSRPartners(partners);
      setProjects(projectsList);
      setTolls(tollsList);
      setFilteredTolls(tollsList);
      setFilteredProjects(projectsList);
      await fetchBudgetCategories();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const fetchBudgetCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('id, name, parent_id, project_id')
        .order('name');
      if (error) throw error;
      setBudgetCategories(data || []);
    } catch (error) {
      console.error('Error fetching budget categories:', error);
      setBudgetCategories([]);
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

  const fetchCSRPartners = async (): Promise<CSRPartner[]> => {
    try {
      const { data, error } = await supabase
        .from('csr_partners')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching CSR partners:', error);
      return [];
    }
  };

  const fetchProjects = async (): Promise<Project[]> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  };

  const fetchTolls = async (): Promise<Toll[]> => {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name')
        .order('toll_name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tolls:', error);
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
        // Update local state immediately
        setExpenses(prev => prev.map(exp => 
          exp.id === selectedExpense.id ? { ...exp, status: 'approved' as const, approved_by: currentUser.id } : exp
        ));
        await loadData();
      } catch (error) {
        console.error('Error approving expense:', error);
      }
    }
  };

  const handleBulkApprove = async () => {
    if (selectedExpenses.size === 0) {
      alert('Please select at least one expense to approve');
      return;
    }

    const count = selectedExpenses.size;
    const confirmed = window.confirm(`Are you sure you want to approve ${count} expense(s)?`);
    
    if (!confirmed || !currentUser) return;

    try {
      // Approve all selected expenses
      await Promise.all(
        Array.from(selectedExpenses).map(expenseId =>
          projectExpensesService.approveExpense(expenseId, currentUser.id)
        )
      );
      
      setSelectedExpenses(new Set());
      await loadData();
      alert(`Successfully approved ${count} expense(s)`);
    } catch (error) {
      console.error('Error bulk approving expenses:', error);
      alert('Failed to approve some expenses. Please try again.');
    }
  };

  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpenses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId);
      } else {
        newSet.add(expenseId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const acceptedExpenses = getFilteredExpenses().filter(exp => exp.status === 'accepted');
    if (selectedExpenses.size === acceptedExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(acceptedExpenses.map(exp => exp.id)));
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

  const getBudgetCategoryHierarchy = (categoryId: string | undefined): { category: string; subcategory: string; subSubcategory: string } => {
    if (!categoryId) return { category: '', subcategory: '', subSubcategory: '' };
    
    const category = budgetCategories.find(cat => cat.id === categoryId);
    if (!category) return { category: '', subcategory: '', subSubcategory: '' };
    
    // Check if this is a sub-subcategory (has grandparent)
    if (category.parent_id) {
      const parent = budgetCategories.find(cat => cat.id === category.parent_id);
      if (parent?.parent_id) {
        const grandparent = budgetCategories.find(cat => cat.id === parent.parent_id);
        return {
          category: grandparent?.name || '',
          subcategory: parent.name,
          subSubcategory: category.name
        };
      }
      // This is a subcategory (has parent but no grandparent)
      return {
        category: parent?.name || '',
        subcategory: category.name,
        subSubcategory: ''
      };
    }
    // This is a top-level category
    return {
      category: category.name,
      subcategory: '',
      subSubcategory: ''
    };
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      if (filterCategory && expense.category !== filterCategory) return false;
      if (filterDateFrom && new Date(expense.date) < new Date(filterDateFrom)) return false;
      if (filterDateTo && new Date(expense.date) > new Date(filterDateTo)) return false;
      if (filterCSRPartner && expense.csr_partner_id !== filterCSRPartner) return false;
      if (filterProject && expense.project_id !== filterProject) return false;
      if (filterToll && expense.toll_id !== filterToll) return false;
      return true;
    });
  };

  const getStats = () => {
    const stats = {
      accepted: 0,
      approved: 0,
      rejected: 0,
      acceptedAmount: 0,
      approvedAmount: 0,
      rejectedAmount: 0,
    };

    expenses.forEach(expense => {
      switch (expense.status) {
        case 'accepted':
          stats.accepted++;
          stats.acceptedAmount += expense.total_amount;
          break;
        case 'approved':
          stats.approved++;
          stats.approvedAmount += expense.total_amount;
          break;
        case 'rejected':
          stats.rejected++;
          stats.rejectedAmount += expense.total_amount;
          break;
      }
    });

    return stats;
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin - Accepted Expenses</h1>
        <p className="text-gray-600 mt-2">Review and approve expenses accepted by accountant</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.accepted}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Accepted (Pending Review)</h3>
          <p className="text-lg font-semibold text-blue-600">₹{stats.acceptedAmount.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.approved}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Approved</h3>
          <p className="text-lg font-semibold text-emerald-600">₹{stats.approvedAmount.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <Ban className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.rejected}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
          <p className="text-lg font-semibold text-red-600">₹{stats.rejectedAmount.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Accepted Expenses</h2>
            <div className="flex gap-3">
              {selectedExpenses.size > 0 && (
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Selected ({selectedExpenses.size})
                </button>
              )}
              <button
                onClick={() => alert('Excel import functionality coming soon!')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Import Excel
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CSR Partner</label>
              <select
                value={filterCSRPartner}
                onChange={async (e) => {
                  const partnerId = e.target.value;
                  setFilterCSRPartner(partnerId);
                  setFilterToll('');
                  setFilterProject('');
                  
                  if (partnerId) {
                    // Filter tolls for this CSR partner
                    const { data: partnerTolls } = await supabase
                      .from('csr_partner_tolls')
                      .select('id, toll_name')
                      .eq('csr_partner_id', partnerId);
                    setFilteredTolls(partnerTolls || []);
                    
                    // Filter projects for this CSR partner
                    const { data: partnerProjects } = await supabase
                      .from('projects')
                      .select('id, name')
                      .eq('csr_partner_id', partnerId);
                    setFilteredProjects(partnerProjects || []);
                  } else {
                    setFilteredTolls(tolls);
                    setFilteredProjects(projects);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All CSR Partners</option>
                {csrPartners.map(partner => (
                  <option key={partner.id} value={partner.id}>{partner.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Projects</option>
                {filteredProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Toll</label>
              <select
                value={filterToll}
                onChange={async (e) => {
                  const tollId = e.target.value;
                  setFilterToll(tollId);
                  setFilterProject('');
                  
                  if (tollId) {
                    // Filter projects for this toll
                    const { data: tollProjects } = await supabase
                      .from('projects')
                      .select('id, name')
                      .eq('toll_id', tollId);
                    setFilteredProjects(tollProjects || []);
                  } else if (filterCSRPartner) {
                    // Reset to CSR partner projects
                    const { data: partnerProjects } = await supabase
                      .from('projects')
                      .select('id, name')
                      .eq('csr_partner_id', filterCSRPartner);
                    setFilteredProjects(partnerProjects || []);
                  } else {
                    setFilteredProjects(projects);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Tolls</option>
                {filteredTolls.map(toll => (
                  <option key={toll.id} value={toll.id}>{toll.toll_name}</option>
                ))}
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          {(filterCategory || filterDateFrom || filterDateTo || filterCSRPartner || filterProject || filterToll) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterDateFrom('');
                setFilterDateTo('');
                setFilterCSRPartner('');
                setFilterProject('');
                setFilterToll('');
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
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedExpenses.size > 0 && selectedExpenses.size === getFilteredExpenses().filter(exp => exp.status === 'accepted').length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expense Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Budget Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sub Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount Debited</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredExpenses().length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.status === 'accepted' && (
                        <input
                          type="checkbox"
                          checked={selectedExpenses.has(expense.id)}
                          onChange={() => toggleExpenseSelection(expense.id)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.expense_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.merchant_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={expense.description}>{expense.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getBudgetCategoryHierarchy((expense as any).budget_category_id).category || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getBudgetCategoryHierarchy((expense as any).budget_category_id).subcategory || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{projects.find(p => p.id === expense.project_id)?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : expense.status === 'accepted'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{expense.total_amount.toLocaleString()}</td>
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
                        : selectedExpense.status === 'accepted'
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
                  disabled={selectedExpense.status === 'approved' || selectedExpense.status === 'rejected'}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={selectedExpense.status === 'rejected' || selectedExpense.status === 'approved'}
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

      {/* Bill Preview Modal */}
      {showBillModal && billUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-6 text-white flex items-center justify-between">
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

