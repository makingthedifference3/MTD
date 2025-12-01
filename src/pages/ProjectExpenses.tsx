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

const ProjectExpenses: React.FC = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billUrl, setBillUrl] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected' | 'paid' | null>(null);
  const [_selectedExpense, setSelectedExpense] = useState<ProjectExpense | null>(null);
  const [_userMap, setUserMap] = useState<UserMap>({});
  const [_showModal, setShowModal] = useState(false);
  
  // Suppress unused variable warnings
  void _selectedExpense;
  void _userMap;
  void _showModal;
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    paid: 0,
    accepted: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
    paidAmount: 0,
    acceptedAmount: 0,
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
    budget_category_id: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Cascading dropdown states
  const [csrPartners, setCSRPartners] = useState<Array<{id: string; name: string; has_toll: boolean}>>([]);
  const [selectedCsrPartner, setSelectedCsrPartner] = useState('');
  const [customCsrPartner, setCustomCsrPartner] = useState('');
  const [hasToll, setHasToll] = useState(false);
  const [tolls, setTolls] = useState<Array<{id: string; toll_name: string}>>([]);
  const [selectedToll, setSelectedToll] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Array<{id: string; name: string; project_code: string}>>([]);
  const [customProject, setCustomProject] = useState('');
  const [budgetCategories, setBudgetCategories] = useState<Array<{id: string; name: string; parent_id: string | null}>>([]);
  const [budgetSubcategories, setBudgetSubcategories] = useState<Array<{id: string; name: string; parent_id: string | null}>>([]);
  const [budgetSubSubcategories, setBudgetSubSubcategories] = useState<Array<{id: string; name: string; parent_id: string | null}>>([]);
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState('');
  const [selectedBudgetSubcategory, setSelectedBudgetSubcategory] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [allExpenses, users, allCategories, allCsrPartners] = await Promise.all([
        projectExpensesService.getAllExpenses(),
        fetchUsers(),
        projectExpensesService.getExpenseCategories(),
        fetchCsrPartners(),
      ]);
      
      setExpenses(allExpenses);
      setUserMap(users);
      setCategories(allCategories);
      setCSRPartners(allCsrPartners);

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

  const fetchCsrPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('csr_partners')
        .select('id, name, has_toll')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching CSR partners:', error);
      return [];
    }
  };

  const fetchTollsForPartner = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name')
        .eq('csr_partner_id', partnerId)
        .order('toll_name');
      
      if (error) throw error;
      setTolls(data || []);
    } catch (error) {
      console.error('Error fetching tolls:', error);
      setTolls([]);
    }
  };

  const fetchProjectsForPartnerAndToll = async (partnerId: string, tollId?: string) => {
    try {
      let query = supabase
        .from('projects')
        .select('id, name, project_code')
        .eq('csr_partner_id', partnerId);
      
      if (tollId) {
        query = query.eq('toll_id', tollId);
      }
      
      query = query.order('name');
      
      const { data, error } = await query;
      
      if (error) throw error;
      setFilteredProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setFilteredProjects([]);
    }
  };

  const fetchBudgetCategories = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('id, name, parent_id')
        .eq('project_id', projectId)
        .order('name');
      
      if (error) throw error;
      
      // Split into categories, subcategories, and sub-subcategories
      const categories = (data || []).filter(cat => !cat.parent_id);
      setBudgetCategories(categories);
      
      // Reset lower levels
      setBudgetSubcategories([]);
      setBudgetSubSubcategories([]);
      setSelectedBudgetCategory('');
      setSelectedBudgetSubcategory('');
    } catch (error) {
      console.error('Error fetching budget categories:', error);
      setBudgetCategories([]);
    }
  };

  const fetchBudgetSubcategories = async (projectId: string, parentId: string) => {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('id, name, parent_id')
        .eq('project_id', projectId)
        .eq('parent_id', parentId)
        .order('name');
      
      if (error) throw error;
      setBudgetSubcategories(data || []);
      setBudgetSubSubcategories([]);
      setSelectedBudgetSubcategory('');
    } catch (error) {
      console.error('Error fetching budget subcategories:', error);
      setBudgetSubcategories([]);
    }
  };

  const fetchBudgetSubSubcategories = async (projectId: string, parentId: string) => {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('id, name, parent_id')
        .eq('project_id', projectId)
        .eq('parent_id', parentId)
        .order('name');
      
      if (error) throw error;
      setBudgetSubSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching budget sub-subcategories:', error);
      setBudgetSubSubcategories([]);
    }
  };
  const handleStatusCardClick = (status: 'pending' | 'approved' | 'rejected' | 'paid') => {
    setSelectedStatus(status);
    setShowStatusModal(true);
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
      // Upload file to Supabase storage if selected
      let billUrl = newExpense.bill_drive_link;
      
      if (selectedFile) {
        setUploadingFile(true);
        try {
          const fileExt = selectedFile.name.split('.').pop();
          const userName = currentUser.full_name.replace(/\s+/g, '_');
          const now = new Date();
          const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
          const fileName = `${userName}_${dateStr}.${fileExt}`;
          const filePath = `bills/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('MTD_Bills')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: false
            });
          
          console.log('Upload result:', { uploadData, uploadError });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('MTD_Bills')
            .getPublicUrl(filePath);

          billUrl = urlData.publicUrl;
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Failed to upload bill. Please try again.');
          setUploadingFile(false);
          return;
        } finally {
          setUploadingFile(false);
        }
      }

      // Handle custom project - need to use first available project as placeholder
      let finalProjectId = newExpense.project_id;
      let descriptionAdditions = newExpense.description || '';
      
      if (newExpense.project_id === 'others') {
        // Use the first project from filtered projects or any project as placeholder
        if (filteredProjects.length > 0) {
          finalProjectId = filteredProjects[0].id;
        } else {
          // Fallback: get any project
          const { data: anyProject } = await supabase
            .from('projects')
            .select('id')
            .limit(1)
            .single();
          finalProjectId = anyProject?.id || '';
        }
        descriptionAdditions += ` [Custom Project: ${customProject}]`;
      }
      
      if (customCsrPartner) {
        descriptionAdditions += ` [Custom CSR Partner: ${customCsrPartner}]`;
      }

      const expenseData: Omit<ProjectExpense, 'id' | 'created_at' | 'updated_at'> & { bill_drive_link?: string; csr_partner_id?: string; toll_id?: string; budget_category_id?: string } = {
        expense_code: `EXP-${Date.now()}`,
        project_id: finalProjectId,
        category_id: validCategoryId, // Use the validated category ID
        merchant_name: newExpense.merchant_name,
        date: newExpense.date,
        category: newExpense.category,
        description: descriptionAdditions,
        total_amount: parseFloat(newExpense.total_amount),
        base_amount: parseFloat(newExpense.total_amount),
        status: 'pending',
        payment_method: newExpense.payment_method as 'Cash' | 'Cheque' | 'Online' | 'Card',
        submitted_by: currentUser.id,
        csr_partner_id: selectedCsrPartner === 'others' ? undefined : selectedCsrPartner,
        toll_id: hasToll && selectedToll ? selectedToll : undefined,
        budget_category_id: newExpense.budget_category_id || undefined,
      };

      // Add bill_drive_link if uploaded or provided
      if (billUrl) {
        expenseData.bill_drive_link = billUrl;
      }

      console.log('Submitting expense with data:', expenseData);
      
      // Validate only the critical UUID fields (category_id and project_id)
      if (!uuidRegex.test(expenseData.category_id)) {
        alert(`Invalid category_id format: ${expenseData.category_id}`);
        return;
      }
      if (expenseData.project_id && !uuidRegex.test(expenseData.project_id)) {
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
          budget_category_id: '',
        });
        setSelectedFile(null);
        setSelectedCsrPartner('');
        setSelectedToll('');
        setHasToll(false);
        setFilteredProjects([]);
        setTolls([]);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Paid */}
            <button
              onClick={() => handleStatusCardClick('paid')}
              className="flex items-center justify-between bg-emerald-50 rounded-2xl p-4 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer w-full"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="font-semibold text-gray-900">PAID {stats.paid}</span>
              </div>
              <div className="bg-white rounded-full px-4 py-2">
                <span className="font-bold text-gray-900">{stats.paidAmount.toLocaleString()}</span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>


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
                : selectedStatus === 'paid'
                ? 'bg-linear-to-r from-blue-500 to-blue-600'
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
                {/* CSR Partner */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CSR Partner *</label>
                  <select
                    value={selectedCsrPartner}
                    onChange={(e) => {
                      const partnerId = e.target.value;
                      setSelectedCsrPartner(partnerId);
                      setCustomCsrPartner('');
                      setSelectedToll('');
                      setNewExpense({ ...newExpense, project_id: '', budget_category_id: '' });
                      setFilteredProjects([]);
                      setBudgetCategories([]);
                      
                      if (partnerId && partnerId !== 'others') {
                        const partner = csrPartners.find(p => p.id === partnerId);
                        const partnerHasToll = partner?.has_toll || false;
                        setHasToll(partnerHasToll);
                        
                        if (partnerHasToll) {
                          fetchTollsForPartner(partnerId);
                        } else {
                          setTolls([]);
                          fetchProjectsForPartnerAndToll(partnerId);
                        }
                      } else {
                        setHasToll(false);
                        setTolls([]);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select CSR Partner</option>
                    {csrPartners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                    <option value="others">Others (Custom)</option>
                  </select>
                  {selectedCsrPartner === 'others' && (
                    <input
                      type="text"
                      value={customCsrPartner}
                      onChange={(e) => setCustomCsrPartner(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-2"
                      placeholder="Enter custom CSR partner name"
                      required
                    />
                  )}
                </div>

                {/* Toll - Conditional */}
                {hasToll && selectedCsrPartner && selectedCsrPartner !== 'others' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Toll *</label>
                    <select
                      value={selectedToll}
                      onChange={(e) => {
                        const tollId = e.target.value;
                        setSelectedToll(tollId);
                        setNewExpense({ ...newExpense, project_id: '' });
                        if (tollId && selectedCsrPartner) {
                          fetchProjectsForPartnerAndToll(selectedCsrPartner, tollId);
                        } else {
                          setFilteredProjects([]);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select Toll</option>
                      {tolls.map((toll) => (
                        <option key={toll.id} value={toll.id}>
                          {toll.toll_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Project */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                  <select
                    value={newExpense.project_id}
                    onChange={(e) => {
                      const projectId = e.target.value;
                      setNewExpense({ ...newExpense, project_id: projectId, budget_category_id: '' });
                      setCustomProject('');
                      setBudgetCategories([]);
                      setBudgetSubcategories([]);
                      setBudgetSubSubcategories([]);
                      if (projectId && projectId !== 'others') {
                        fetchBudgetCategories(projectId);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={selectedCsrPartner === 'others' ? false : (!selectedCsrPartner || (hasToll && !selectedToll))}
                  >
                    <option value="">Select Project</option>
                    {filteredProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.project_code} - {project.name}
                      </option>
                    ))}
                    <option value="others">Others (Custom)</option>
                  </select>
                  {newExpense.project_id === 'others' && (
                    <input
                      type="text"
                      value={customProject}
                      onChange={(e) => setCustomProject(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-2"
                      placeholder="Enter custom project name"
                      required
                    />
                  )}
                </div>

                {/* Budget Category - Only show if project selected and not "others" */}
                {newExpense.project_id && newExpense.project_id !== 'others' && budgetCategories.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Category</label>
                    <select
                      value={selectedBudgetCategory}
                      onChange={(e) => {
                        const categoryId = e.target.value;
                        setSelectedBudgetCategory(categoryId);
                        setSelectedBudgetSubcategory('');
                        setBudgetSubcategories([]);
                        setBudgetSubSubcategories([]);
                        if (categoryId && categoryId !== 'others') {
                          fetchBudgetSubcategories(newExpense.project_id, categoryId);
                          setNewExpense({ ...newExpense, budget_category_id: categoryId });
                        } else {
                          setNewExpense({ ...newExpense, budget_category_id: '' });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Budget Category</option>
                      {budgetCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="others">Others</option>
                    </select>
                  </div>
                )}

                {/* Budget Subcategory */}
                {budgetSubcategories.length > 0 && selectedBudgetCategory && selectedBudgetCategory !== 'others' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Subcategory</label>
                    <select
                      value={selectedBudgetSubcategory}
                      onChange={(e) => {
                        const subcategoryId = e.target.value;
                        setSelectedBudgetSubcategory(subcategoryId);
                        setBudgetSubSubcategories([]);
                        if (subcategoryId && subcategoryId !== 'others') {
                          fetchBudgetSubSubcategories(newExpense.project_id, subcategoryId);
                          setNewExpense({ ...newExpense, budget_category_id: subcategoryId });
                        } else {
                          setNewExpense({ ...newExpense, budget_category_id: selectedBudgetCategory });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Budget Subcategory</option>
                      {budgetSubcategories.map((subcat) => (
                        <option key={subcat.id} value={subcat.id}>
                          {subcat.name}
                        </option>
                      ))}
                      <option value="others">Others</option>
                    </select>
                  </div>
                )}

                {/* Budget Sub-Subcategory */}
                {budgetSubSubcategories.length > 0 && selectedBudgetSubcategory && selectedBudgetSubcategory !== 'others' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Sub-Subcategory</label>
                    <select
                      value={newExpense.budget_category_id}
                      onChange={(e) => {
                        const subSubcategoryId = e.target.value;
                        if (subSubcategoryId && subSubcategoryId !== 'others') {
                          setNewExpense({ ...newExpense, budget_category_id: subSubcategoryId });
                        } else {
                          setNewExpense({ ...newExpense, budget_category_id: selectedBudgetSubcategory });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Budget Sub-Subcategory</option>
                      {budgetSubSubcategories.map((subsubcat) => (
                        <option key={subsubcat.id} value={subsubcat.id}>
                          {subsubcat.name}
                        </option>
                      ))}
                      <option value="others">Others</option>
                    </select>
                  </div>
                )}

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

                {/* Bill Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bill</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size must be less than 5MB');
                          e.target.value = '';
                          return;
                        }
                        setSelectedFile(file);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload bill image or PDF (max 5MB)</p>
                  {selectedFile && (
                    <p className="text-xs text-emerald-600 mt-1">Selected: {selectedFile.name}</p>
                  )}
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
                      budget_category_id: '',
                    });
                    setSelectedFile(null);
                    setSelectedCsrPartner('');
                    setSelectedToll('');
                    setHasToll(false);
                    setFilteredProjects([]);
                    setTolls([]);
                  }}
                  disabled={uploadingFile}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {uploadingFile ? 'Uploading...' : 'Submit Expense'}
                </button>
              </div>
            </form>
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

export default ProjectExpenses;
