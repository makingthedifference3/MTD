import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Loader, AlertCircle, ChevronDown } from 'lucide-react';
import { projectExpensesService, type ProjectExpense } from '../services/projectExpensesService';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';

const UpcomingExpensesPage = () => {
  const { currentUser } = useAuth();
  const [upcomingExpenses, setUpcomingExpenses] = useState<ProjectExpense[]>([]);
  const [categories, setCategories] = useState<Array<{id: string; name: string}>>([]);
  const [_projects, setProjects] = useState<Array<{id: string; name: string; project_code: string}>>([]);
  const [csrPartners, setCSRPartners] = useState<Array<{id: string; name: string; has_toll: boolean}>>([]);
  const [tolls, setTolls] = useState<Array<{id: string; toll_name: string}>>([]);
  const [budgetCategories, setBudgetCategories] = useState<Array<{id: string; name: string; parent_id: string | null}>>([]);
  const [budgetSubcategories, setBudgetSubcategories] = useState<Array<{id: string; name: string; parent_id: string | null}>>([]);
  const [budgetSubSubcategories, setBudgetSubSubcategories] = useState<Array<{id: string; name: string; parent_id: string | null}>>([]);
  const [filteredProjects, setFilteredProjects] = useState<Array<{id: string; name: string; project_code: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  
  const [selectedCsrPartner, setSelectedCsrPartner] = useState<string>('');
  const [selectedToll, setSelectedToll] = useState<string>('');
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string>('');
  const [selectedBudgetSubcategory, setSelectedBudgetSubcategory] = useState<string>('');
  const [hasToll, setHasToll] = useState(false);
  const [customCsrPartner, setCustomCsrPartner] = useState('');
  const [customProject, setCustomProject] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [newExpense, setNewExpense] = useState({
    merchant_name: '',
    date: '',
    category: '',
    category_id: '',
    project_id: '',
    total_amount: '',
    description: '',
    payment_method: 'Cash',
    budget_category_id: '',
    bill_drive_link: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch upcoming expenses (only created by current user)
      const allExpenses = await projectExpensesService.getUpcomingExpenses();
      const myExpenses = allExpenses.filter(expense => expense.created_by === currentUser?.id);
      setUpcomingExpenses(myExpenses);

      // Fetch categories for dropdown
      const expenseCategories = await projectExpensesService.getExpenseCategories();
      setCategories(expenseCategories);

      // Fetch CSR Partners
      const { data: partnersData } = await supabase
        .from('csr_partners')
        .select('id, name, has_toll')
        .eq('is_active', true)
        .order('name');
      setCSRPartners(partnersData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load upcoming expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchTollsForPartner = async (csrPartnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name')
        .eq('csr_partner_id', csrPartnerId)
        .eq('is_active', true)
        .order('toll_name');

      if (error) throw error;
      setTolls(data || []);
    } catch (error) {
      console.error('Error fetching tolls:', error);
      setTolls([]);
    }
  };

  const fetchProjectsForPartnerAndToll = async (csrPartnerId: string, tollId?: string) => {
    try {
      let query = supabase
        .from('projects')
        .select('id, name, project_code')
        .eq('csr_partner_id', csrPartnerId)
        .eq('is_active', true);

      if (tollId) {
        query = query.eq('toll_id', tollId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setFilteredProjects(data || []);
      setProjects(data || []);
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
        .is('parent_id', null)
        .order('name');

      if (error) throw error;
      setBudgetCategories(data || []);
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

  const handleAddExpense = async () => {
    if (!newExpense.merchant_name || !newExpense.date || !newExpense.total_amount || !newExpense.project_id) {
      setError('Please fill in all required fields (Merchant Name, Date, Amount, Project)');
      return;
    }

    try {
      const totalAmount = parseFloat(newExpense.total_amount) || 0;
      
      // Determine CSR Partner ID and Toll ID
      const csrPartnerId = selectedCsrPartner === 'others' ? null : selectedCsrPartner;
      const tollId = hasToll ? selectedToll : null;
      const projectId = newExpense.project_id === 'others' ? null : newExpense.project_id;

      // Handle category
      let categoryId = newExpense.category_id;
      let categoryName = newExpense.category;
      
      if (newExpense.category_id && newExpense.category_id !== 'others') {
        const selectedCategory = categories.find(c => c.id === newExpense.category_id);
        categoryName = selectedCategory?.name || newExpense.category;
      }

      // Handle bill upload if file is selected
      let billUrl = newExpense.bill_drive_link;

      if (selectedFile) {
        const fileName = `${Date.now()}_${selectedFile.name}`;
        const filePath = `bills/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('MTD_Bills')
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Failed to upload bill. Proceeding without bill.');
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('MTD_Bills')
            .getPublicUrl(filePath);

          billUrl = urlData.publicUrl;
        }
      }

      const { data, error: createError } = await supabase
        .from('project_expenses')
        .insert([{
          expense_code: `EXP-${Date.now()}`,
          project_id: projectId,
          csr_partner_id: csrPartnerId,
          toll_id: tollId,
          category_id: categoryId || null,
          merchant_name: newExpense.merchant_name,
          date: newExpense.date,
          category: categoryName,
          description: newExpense.description || null,
          base_amount: totalAmount,
          total_amount: totalAmount,
          status: 'draft',
          payment_method: newExpense.payment_method,
          budget_category_id: newExpense.budget_category_id || null,
          bill_drive_link: billUrl || null,
          created_by: currentUser?.id || null,
        }])
        .select();

      if (createError) throw createError;

      if (data) {
        // Reset form
        setNewExpense({
          merchant_name: '',
          date: '',
          category: '',
          category_id: '',
          project_id: '',
          total_amount: '',
          description: '',
          payment_method: 'Cash',
          budget_category_id: '',
          bill_drive_link: '',
        });
        setSelectedFile(null);
        setSelectedCsrPartner('');
        setSelectedToll('');
        setSelectedBudgetCategory('');
        setSelectedBudgetSubcategory('');
        setCustomCsrPartner('');
        setCustomProject('');
        setHasToll(false);
        setFilteredProjects([]);
        setTolls([]);
        setBudgetCategories([]);
        setBudgetSubcategories([]);
        setBudgetSubSubcategories([]);
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
          {/* Add New Expense Form - Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden"
          >
            {/* Header - Always Visible */}
            <button
              onClick={() => setIsFormExpanded(!isFormExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Plan New Expense</h3>
                  <p className="text-sm text-gray-500">Click to {isFormExpanded ? 'collapse' : 'expand'} form</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isFormExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </motion.div>
            </button>

            {/* Form Content - Collapsible */}
            <AnimatePresence>
              {isFormExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
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
                  <>
                    <select
                      value={newExpense.category_id}
                      onChange={(e) => {
                        const categoryId = e.target.value;
                        if (categoryId === 'others') {
                          setNewExpense({ ...newExpense, category_id: 'others', category: '' });
                        } else {
                          const category = categories.find(c => c.id === categoryId);
                          setNewExpense({ 
                            ...newExpense, 
                            category_id: categoryId,
                            category: category?.name || ''
                          });
                        }
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
                      <option value="others">Others</option>
                    </select>

                    {newExpense.category_id === 'others' && (
                      <input
                        type="text"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ 
                          ...newExpense, 
                          category: e.target.value,
                          category_id: ''
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-2"
                        placeholder="Enter custom category name"
                        required
                      />
                    )}
                  </>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill (Optional)</label>
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
                <p className="text-xs text-gray-500 mt-1">Upload bill image or PDF (max 5MB). Optional for planning.</p>
                {selectedFile && (
                  <p className="text-xs text-emerald-600 mt-1">Selected: {selectedFile.name}</p>
                )}
              </div>
            </div>

              <div className="flex justify-end mt-6">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
