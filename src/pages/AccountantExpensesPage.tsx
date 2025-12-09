import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, Clock, CheckCircle2, Ban, DollarSign, AlertTriangle, Loader } from 'lucide-react';
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
  total_budget?: number;
  funding_partner?: string;
}

type ExportRow = {
  ExpenseCode: string;
  Date: string;
  Merchant: string;
  Description: string;
  Category: string;
  BudgetCategory: string;
  BudgetSubCategory: string;
  Project: string;
  FundingPartner: string;
  Status: string;
  ModeOfPayment: string;
  AmountDebited: number;
};

const AccountantExpensesPage: React.FC = () => {
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
  const [filterCSRPartner, setFilterCSRPartner] = useState<string>('');
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterToll, setFilterToll] = useState<string>('');
  const [csrPartners, setCSRPartners] = useState<CSRPartner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<Array<{id: string; name: string; parent_id: string | null; project_id: string}>>([]);
  const [filterBudgetCategory, setFilterBudgetCategory] = useState<string>('');
  const [filterBudgetSubcategory, setFilterBudgetSubcategory] = useState<string>('');
  const [filterBudgetSubSubcategory, setFilterBudgetSubSubcategory] = useState<string>('');
  const [filteredTolls, setFilteredTolls] = useState<Toll[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filteredBudgetCategories, setFilteredBudgetCategories] = useState<Array<{id: string; name: string; parent_id: string | null; project_id: string}>>([]);
  const [editMode, setEditMode] = useState(false);
  const [editableCsrPartner, setEditableCsrPartner] = useState<string>('');
  const [editableProject, setEditableProject] = useState<string>('');
  const [editableToll, setEditableToll] = useState<string>('');
  const [editableBudgetCategory, setEditableBudgetCategory] = useState<string>('');
  const [customCsrPartner, setCustomCsrPartner] = useState<string>('');
  const [customProject, setCustomProject] = useState<string>('');
  const [customToll, setCustomToll] = useState<string>('');
  const [modalFilteredTolls, setModalFilteredTolls] = useState<Toll[]>([]);
  const [modalFilteredProjects, setModalFilteredProjects] = useState<Project[]>([]);
  const [modalFilteredBudgetCategories, setModalFilteredBudgetCategories] = useState<Array<{id: string; name: string; parent_id: string | null}>>([]);
  const [expenseCategories, setExpenseCategories] = useState<Array<{id: string; name: string}>>([]);
  const [editableCategory, setEditableCategory] = useState<string>('');
  const [editableBudgetSubcategory, setEditableBudgetSubcategory] = useState<string>('');
  const [editableBudgetSubSubcategory, setEditableBudgetSubSubcategory] = useState<string>('');
  const [budgetWarning, setBudgetWarning] = useState<{
    show: boolean;
    level: 'subcategory' | 'category' | 'project' | null;
    message: string;
    stats: {
      subcategoryRemaining?: number;
      subcategoryTotal?: number;
      categoryRemaining?: number;
      categoryTotal?: number;
      projectRemaining?: number;
      projectTotal?: number;
    };
  }>({ show: false, level: null, message: '', stats: {} });
  const [showReceiptUploadModal, setShowReceiptUploadModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [allExpenses, users, partners, projectsList, tollsList, categories] = await Promise.all([
        projectExpensesService.getAllExpenses(),
        fetchUsers(),
        fetchCSRPartners(),
        fetchProjects(),
        fetchTolls(),
        fetchExpenseCategories(),
      ]);
      
      // Filter out draft expenses
      const nonDraftExpenses = allExpenses.filter(expense => expense.status !== 'draft');
      setExpenses(nonDraftExpenses);
      setUserMap(users);
      setCSRPartners(partners);
      setProjects(projectsList);
      setTolls(tollsList);
      setFilteredTolls(tollsList);
      setFilteredProjects(projectsList);
      setExpenseCategories(categories);
      await fetchAllBudgetCategories();
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
        .select('id, name, total_budget, funding_partner, location, project_code')
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

  const fetchExpenseCategories = async (): Promise<Array<{id: string; name: string}>> => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      return [];
    }
  };

  const fetchAllBudgetCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('id, name, parent_id, project_id, allocated_amount')
        .order('name');
      if (error) throw error;
      setBudgetCategories(data || []);
      setFilteredBudgetCategories(data || []);
    } catch (error) {
      console.error('Error fetching budget categories:', error);
      setBudgetCategories([]);
      setFilteredBudgetCategories([]);
    }
  };

  const quickCheckBudgetExceeded = (expense: ProjectExpense): boolean => {
    // Only check for expenses that aren't already paid or rejected
    if (!expense.project_id || expense.status === 'paid' || expense.status === 'rejected') {
      return false;
    }
    
    // Check budget category allocation if set
    const budgetCategoryId = (expense as any).budget_category_id;
    
    console.log('QuickCheck for expense:', expense.expense_code, {
      budgetCategoryId,
      budgetCategoriesLength: budgetCategories.length,
      status: expense.status
    });
    
    if (budgetCategoryId && budgetCategories.length > 0) {
      const budgetCat = budgetCategories.find(c => c.id === budgetCategoryId);
      const allocated = (budgetCat as any)?.allocated_amount ?? 0; // Treat null/undefined as 0
      
      console.log('Found budget category:', {
        found: !!budgetCat,
        allocated,
        expenseAmount: expense.total_amount
      });
      
      // Calculate how much has been spent in this category (excluding current expense)
      const categoryExpenses = expenses.filter(
        e => (e as any).budget_category_id === budgetCategoryId &&
        e.id !== expense.id &&
        (e.status === 'paid' || e.status === 'approved' || e.status === 'accepted')
      );
      const categorySpent = categoryExpenses.reduce((sum, e) => sum + e.total_amount, 0);
      
      // Would this expense push us over budget? (including when budget is 0)
      const totalAfterExpense = categorySpent + expense.total_amount;
      const exceeded = totalAfterExpense > allocated;
      
      console.log('Budget check result:', {
        categorySpent,
        expenseAmount: expense.total_amount,
        totalAfterExpense,
        allocated,
        exceeded
      });
      
      if (exceeded) {
        return true;
      }
    }
    
    // Also check project total budget (especially if no category budget set)
    const project = projects.find(p => p.id === expense.project_id);
    if (project) {
      const projectBudget = project.total_budget ?? 0;
      
      // Calculate total spent in project (excluding current expense)
      const projectExpenses = expenses.filter(
        e => e.project_id === expense.project_id &&
        e.id !== expense.id &&
        (e.status === 'paid' || e.status === 'approved' || e.status === 'accepted')
      );
      const projectSpent = projectExpenses.reduce((sum, e) => sum + e.total_amount, 0);
      const totalAfterExpense = projectSpent + expense.total_amount;
      const exceeded = totalAfterExpense > projectBudget;
      
      console.log('Project budget check:', {
        projectBudget,
        projectSpent,
        expenseAmount: expense.total_amount,
        totalAfterExpense,
        exceeded
      });
      
      if (exceeded) {
        return true;
      }
    }
    
    return false;
  };

  const checkBudgetAvailability = async (
    projectId: string,
    budgetCategoryId: string | null,
    expenseAmount: number
  ): Promise<void> => {
    setBudgetWarning({ show: false, level: null, message: '', stats: {} });

    if (!projectId) return;

    try {
      // Fetch project budget
      const { data: projectData } = await supabase
        .from('projects')
        .select('total_budget')
        .eq('id', projectId)
        .single();

      const projectTotalBudget = projectData?.total_budget || 0;

      // Calculate project spent amount (paid + approved + accepted expenses)
      const projectExpenses = expenses.filter(
        e => e.project_id === projectId && 
        (e.status === 'paid' || e.status === 'approved' || e.status === 'accepted')
      );
      const projectSpent = projectExpenses.reduce((sum, e) => sum + e.total_amount, 0);
      const projectRemaining = projectTotalBudget - projectSpent;

      // If budget category is selected, check category budgets
      if (budgetCategoryId) {
        const { data: budgetCategoryData } = await supabase
          .from('budget_categories')
          .select('id, name, parent_id, allocated_amount')
          .eq('project_id', projectId);

        const budgetCats = budgetCategoryData || [];
        const selectedCategory = budgetCats.find(c => c.id === budgetCategoryId);

        if (selectedCategory) {
          // Calculate spent for this category and all its children
          const getCategoryAndChildren = (catId: string): string[] => {
            const children = budgetCats.filter(c => c.parent_id === catId).map(c => c.id);
            return [catId, ...children.flatMap(childId => getCategoryAndChildren(childId))];
          };

          const categoryIds = getCategoryAndChildren(budgetCategoryId);
          const categoryExpenses = expenses.filter(
            e => categoryIds.includes((e as any).budget_category_id) &&
            (e.status === 'paid' || e.status === 'approved' || e.status === 'accepted')
          );
          const categorySpent = categoryExpenses.reduce((sum, e) => sum + e.total_amount, 0);
          const categoryTotal = selectedCategory.allocated_amount || 0;
          const categoryRemaining = categoryTotal - categorySpent;

          // Check if this is a subcategory or sub-subcategory
          if (selectedCategory.parent_id) {
            const parentCategory = budgetCats.find(c => c.id === selectedCategory.parent_id);
            
            // Check subcategory budget first
            if (categoryRemaining - expenseAmount < 0) {
              let level: 'subcategory' | 'category' = 'subcategory';
              let message = `Budget exceeded for ${selectedCategory.name}!`;
              const stats: any = {
                subcategoryRemaining: categoryRemaining,
                subcategoryTotal: categoryTotal,
              };

              // Check parent category budget
              if (parentCategory) {
                const parentCategoryIds = getCategoryAndChildren(parentCategory.id);
                const parentExpenses = expenses.filter(
                  e => parentCategoryIds.includes((e as any).budget_category_id) &&
                  (e.status === 'paid' || e.status === 'approved' || e.status === 'accepted')
                );
                const parentSpent = parentExpenses.reduce((sum, e) => sum + e.total_amount, 0);
                const parentTotal = parentCategory.allocated_amount || 0;
                const parentRemaining = parentTotal - parentSpent;

                stats.categoryRemaining = parentRemaining;
                stats.categoryTotal = parentTotal;

                if (parentCategory.parent_id) {
                  // This is sub-subcategory, parent is subcategory
                  const grandparent = budgetCats.find(c => c.id === parentCategory.parent_id);
                  if (grandparent) {
                    const grandparentIds = getCategoryAndChildren(grandparent.id);
                    const grandparentExpenses = expenses.filter(
                      e => grandparentIds.includes((e as any).budget_category_id) &&
                      (e.status === 'paid' || e.status === 'approved' || e.status === 'accepted')
                    );
                    const grandparentSpent = grandparentExpenses.reduce((sum, e) => sum + e.total_amount, 0);
                    const grandparentTotal = grandparent.allocated_amount || 0;
                    const grandparentRemaining = grandparentTotal - grandparentSpent;

                    message = `Budget exceeded for ${selectedCategory.name} (Sub-Sub-Category)!`;
                    stats.categoryRemaining = grandparentRemaining;
                    stats.categoryTotal = grandparentTotal;
                  }
                }
              }

              stats.projectRemaining = projectRemaining;
              stats.projectTotal = projectTotalBudget;

              setBudgetWarning({
                show: true,
                level,
                message,
                stats
              });
              return;
            }
          } else {
            // Main category - check its budget
            if (categoryRemaining - expenseAmount < 0) {
              setBudgetWarning({
                show: true,
                level: 'category',
                message: `Budget exceeded for ${selectedCategory.name} (Category)!`,
                stats: {
                  categoryRemaining,
                  categoryTotal,
                  projectRemaining,
                  projectTotal: projectTotalBudget
                }
              });
              return;
            }
          }
        }
      } else {
        // No budget category selected - only check project budget
        if (projectRemaining - expenseAmount < 0) {
          setBudgetWarning({
            show: true,
            level: 'project',
            message: 'Project budget exceeded!',
            stats: {
              projectRemaining,
              projectTotal: projectTotalBudget
            }
          });
          return;
        }
      }

      // Also check project budget even if category budget is fine
      if (projectRemaining - expenseAmount < 0) {
        setBudgetWarning({
          show: true,
          level: 'project',
          message: 'Project budget exceeded!',
          stats: {
            projectRemaining,
            projectTotal: projectTotalBudget
          }
        });
      }
    } catch (error) {
      console.error('Error checking budget availability:', error);
    }
  };

  const handleViewDetails = async (expense: ProjectExpense) => {
    setSelectedExpense(expense);
    setShowModal(true);
    setEditMode(true); // Always enable edit mode
    
    setEditableCsrPartner(expense.csr_partner_id || '');
    setEditableProject(expense.project_id || '');
    setEditableToll(expense.toll_id || '');
    setEditableCategory(expense.category_id || '');
    
    const budgetCategoryId = (expense as any).budget_category_id || '';
    setEditableBudgetCategory('');
    setEditableBudgetSubcategory('');
    setEditableBudgetSubSubcategory('');
    
    setCustomCsrPartner('');
    setCustomProject('');
    setCustomToll('');
    
    if (expense.csr_partner_id) {
      const { data: partnerTolls } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name')
        .eq('csr_partner_id', expense.csr_partner_id);
      setModalFilteredTolls(partnerTolls || []);
      
      const { data: partnerProjects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('csr_partner_id', expense.csr_partner_id);
      setModalFilteredProjects(partnerProjects || []);
    } else {
      setModalFilteredTolls(tolls);
      setModalFilteredProjects(projects);
    }
    
    if (expense.project_id) {
      const { data: projectBudgets } = await supabase
        .from('budget_categories')
        .select('id, name, parent_id')
        .eq('project_id', expense.project_id);
      setModalFilteredBudgetCategories(projectBudgets || []);
      
      // Set budget hierarchy based on current budget_category_id
      if (budgetCategoryId && projectBudgets) {
        const currentBudgetCat = projectBudgets.find(cat => cat.id === budgetCategoryId);
        if (currentBudgetCat) {
          if (currentBudgetCat.parent_id) {
            const parent = projectBudgets.find(cat => cat.id === currentBudgetCat.parent_id);
            if (parent?.parent_id) {
              // This is a sub-sub-category
              setEditableBudgetCategory(parent.parent_id);
              setEditableBudgetSubcategory(parent.id);
              setEditableBudgetSubSubcategory(currentBudgetCat.id);
            } else {
              // This is a subcategory
              setEditableBudgetCategory(parent?.id || '');
              setEditableBudgetSubcategory(currentBudgetCat.id);
            }
          } else {
            // This is a main category
            setEditableBudgetCategory(currentBudgetCat.id);
          }
        }
      }
    } else {
      setModalFilteredBudgetCategories([]);
    }
    
    // Check budget availability for this expense
    const budgetCatId = (expense as any).budget_category_id;
    await checkBudgetAvailability(expense.project_id, budgetCatId, expense.total_amount);
  };

  const handleAccept = async () => {
    if (selectedExpense && currentUser) {
      try {
        await projectExpensesService.acceptExpense(
          selectedExpense.id,
          currentUser.id
        );
        setShowModal(false);
        await loadData();
      } catch (error) {
        console.error('Error accepting expense:', error);
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

  const handleSaveEdits = async () => {
    if (!selectedExpense) return;
    
    try {
      const updates: any = {};
      
      // CSR Partner
      if (editableCsrPartner === 'custom') {
        if (!customCsrPartner.trim()) {
          alert('Please enter a custom CSR partner name');
          return;
        }
        updates.csr_partner_id = null;
        updates.description = (selectedExpense.description || '').replace(/\[Custom CSR Partner:.*?\]/g, '') + ` [Custom CSR Partner: ${customCsrPartner}]`;
      } else if (editableCsrPartner) {
        updates.csr_partner_id = editableCsrPartner;
        updates.description = (selectedExpense.description || '').replace(/\[Custom CSR Partner:.*?\]/g, '');
      }
      
      // Project
      if (editableProject === 'custom') {
        if (!customProject.trim()) {
          alert('Please enter a custom project name');
          return;
        }
        updates.description = (updates.description || selectedExpense.description || '').replace(/\[Custom Project:.*?\]/g, '') + ` [Custom Project: ${customProject}]`;
      } else if (editableProject) {
        updates.project_id = editableProject;
        updates.description = (updates.description || selectedExpense.description || '').replace(/\[Custom Project:.*?\]/g, '');
      }
      
      // Toll
      if (editableToll === 'custom') {
        if (!customToll.trim()) {
          alert('Please enter a custom subcompany name');
          return;
        }
        updates.toll_id = null;
        updates.description = (updates.description || selectedExpense.description || '') + ` [Custom Subcompany: ${customToll}]`;
      } else if (editableToll) {
        updates.toll_id = editableToll;
      } else {
        updates.toll_id = null;
      }
      
      // Category
      if (editableCategory) {
        updates.category_id = editableCategory;
        const category = expenseCategories.find(c => c.id === editableCategory);
        if (category) {
          updates.category = category.name;
        }
      }
      
      // Budget Category (use the most specific selected level)
      if (editableBudgetSubSubcategory) {
        updates.budget_category_id = editableBudgetSubSubcategory;
      } else if (editableBudgetSubcategory) {
        updates.budget_category_id = editableBudgetSubcategory;
      } else if (editableBudgetCategory) {
        updates.budget_category_id = editableBudgetCategory;
      } else {
        updates.budget_category_id = null;
      }
      
      const { error } = await supabase
        .from('project_expenses')
        .update(updates)
        .eq('id', selectedExpense.id);
      
      if (error) throw error;
      
      await loadData();
      setShowModal(false);
      alert('Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  const handleMarkAsPaid = async () => {
    if (selectedExpense && currentUser) {
      // Show receipt upload modal
      setShowReceiptUploadModal(true);
    }
  };

  const handleUploadReceipt = async () => {
    if (!selectedExpense || !currentUser || !receiptFile) {
      alert('Please select a receipt file to upload.');
      return;
    }

    try {
      setUploadingReceipt(true);
      
      // Get current user's name
      const uploaderName = currentUser.full_name?.replace(/\s+/g, '_') || 'Unknown';
      
      // Format bill date
      const billDate = new Date(selectedExpense.date).toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Get file extension
      const fileExtension = receiptFile.name.split('.').pop();
      
      // Create filename: receipt_uploaderName_billDate.ext
      const fileName = `receipt_${uploaderName}_${billDate}.${fileExtension}`;
      const filePath = `receipt/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('MTD_Bills')
        .upload(filePath, receiptFile, {
          upsert: true // Allow overwrite if same filename exists
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Failed to upload receipt. Please try again.');
        setUploadingReceipt(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('MTD_Bills')
        .getPublicUrl(filePath);

      const receiptUrl = urlData.publicUrl;

      // Update expense with receipt URL and mark as paid FIRST
      const { error: updateError } = await supabase
        .from('project_expenses')
        .update({
          status: 'paid',
          receipt_drive_link: receiptUrl
        })
        .eq('id', selectedExpense.id);

      if (updateError) {
        console.error('Error updating expense:', updateError);
        throw updateError;
      }

      // Note: Budget utilization is automatically updated by database trigger
      // when status changes to 'paid'. No manual updates needed here.

      setShowReceiptUploadModal(false);
      setShowModal(false);
      setReceiptFile(null);
      await loadData();
      alert('Expense marked as paid with receipt uploaded successfully!');
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      alert('Failed to mark expense as paid. Please try again.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleBulkAccept = async () => {
    if (selectedExpenseIds.size === 0) {
      alert('Please select expenses to accept');
      return;
    }

    const expensesToAccept = Array.from(selectedExpenseIds).filter(id => {
      const expense = expenses.find(e => e.id === id);
      return expense && expense.status === 'pending';
    });

    if (expensesToAccept.length === 0) {
      alert('No pending expenses selected');
      return;
    }

    if (!confirm(`Accept ${expensesToAccept.length} expense(s)?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      
      for (const expenseId of expensesToAccept) {
        await projectExpensesService.acceptExpense(expenseId, currentUser!.id);
      }

      await loadData();
      setSelectedExpenseIds(new Set());
      alert(`Successfully accepted ${expensesToAccept.length} expense(s)`);
    } catch (error) {
      console.error('Error accepting expenses:', error);
      alert('Failed to accept some expenses. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkMarkAsPaid = async () => {
    if (selectedExpenseIds.size === 0) {
      alert('Please select expenses to mark as paid');
      return;
    }

    const expensesToPay = Array.from(selectedExpenseIds).filter(id => {
      const expense = expenses.find(e => e.id === id);
      return expense && expense.status === 'approved';
    });

    if (expensesToPay.length === 0) {
      alert('No approved expenses selected. Only approved expenses can be marked as paid.');
      return;
    }

    if (!confirm(`Mark ${expensesToPay.length} expense(s) as paid? Receipts can be uploaded later one by one.`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      
      for (const expenseId of expensesToPay) {
        await supabase
          .from('project_expenses')
          .update({ status: 'paid' })
          .eq('id', expenseId);
      }

      await loadData();
      setSelectedExpenseIds(new Set());
      alert(`Successfully marked ${expensesToPay.length} expense(s) as paid`);
    } catch (error) {
      console.error('Error marking expenses as paid:', error);
      alert('Failed to mark some expenses as paid. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const filteredExpenses = getFilteredExpenses();
    // Only select expenses that can be acted upon (pending or approved)
    const actionableExpenses = filteredExpenses.filter(e => e.status === 'pending' || e.status === 'approved');
    
    if (selectedExpenseIds.size === actionableExpenses.length && actionableExpenses.length > 0) {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedExpenseIds(new Set(actionableExpenses.map(e => e.id)));
    }
  };

  const toggleSelectExpense = (expenseId: string) => {
    const newSelected = new Set(selectedExpenseIds);
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId);
    } else {
      newSelected.add(expenseId);
    }
    setSelectedExpenseIds(newSelected);
  };

  const getBudgetCategoryHierarchy = (categoryId: string | undefined): { category: string; subcategory: string; subSubcategory: string } => {
    if (!categoryId) return { category: '', subcategory: '', subSubcategory: '' };
    
    const category = budgetCategories.find(cat => cat.id === categoryId);
    if (!category) return { category: '', subcategory: '', subSubcategory: '' };
    
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
      return {
        category: parent?.name || '',
        subcategory: category.name,
        subSubcategory: ''
      };
    }
    return {
      category: category.name,
      subcategory: '',
      subSubcategory: ''
    };
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      if (filterCategory && expense.category !== filterCategory) return false;
      if (filterStatus && expense.status !== filterStatus) return false;
      if (filterDateFrom && new Date(expense.date) < new Date(filterDateFrom)) return false;
      if (filterDateTo && new Date(expense.date) > new Date(filterDateTo)) return false;
      if (filterCSRPartner && expense.csr_partner_id !== filterCSRPartner) return false;
      if (filterProject && expense.project_id !== filterProject) return false;
      if (filterToll && expense.toll_id !== filterToll) return false;
      
      const expenseBudgetCategoryId = (expense as any).budget_category_id;
      if (filterBudgetCategory) {
        if (!expenseBudgetCategoryId) return false;
        const expenseBudgetCat = budgetCategories.find(cat => cat.id === expenseBudgetCategoryId);
        if (!expenseBudgetCat) return false;
        
        if (expenseBudgetCat.id !== filterBudgetCategory && expenseBudgetCat.parent_id !== filterBudgetCategory) {
          const parentCat = budgetCategories.find(cat => cat.id === expenseBudgetCat.parent_id);
          if (!parentCat || parentCat.parent_id !== filterBudgetCategory) {
            return false;
          }
        }
      }
      
      if (filterBudgetSubcategory) {
        if (!expenseBudgetCategoryId) return false;
        const expenseBudgetCat = budgetCategories.find(cat => cat.id === expenseBudgetCategoryId);
        if (!expenseBudgetCat) return false;
        if (expenseBudgetCat.id !== filterBudgetSubcategory && expenseBudgetCat.parent_id !== filterBudgetSubcategory) {
          return false;
        }
      }
      
      if (filterBudgetSubSubcategory && expenseBudgetCategoryId !== filterBudgetSubSubcategory) return false;
      
      return true;
    });
  };

  const getStats = () => {
    const stats = {
      pending: 0,
      accepted: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
      pendingAmount: 0,
      acceptedAmount: 0,
      approvedAmount: 0,
      rejectedAmount: 0,
      paidAmount: 0,
    };

    expenses.forEach(expense => {
      switch (expense.status) {
        case 'pending':
        case 'submitted':
          stats.pending++;
          stats.pendingAmount += expense.total_amount;
          break;
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
        case 'paid':
          stats.paid++;
          stats.paidAmount += expense.total_amount;
          break;
      }
    });

    return stats;
  };

  const stats = getStats();

  // -------------------------
  // Export table to Excel/CSV (typed-safe)
  // -------------------------
  const exportTable = async () => {
    try {
      const rows = getFilteredExpenses();
      if (!rows || rows.length === 0) {
        alert('No rows to export.');
        return;
      }

      const exportData: ExportRow[] = rows.map((expense) => {
        const budgetHierarchy = getBudgetCategoryHierarchy((expense as any).budget_category_id);
        const project = projects.find(p => p.id === expense.project_id);
        return {
          ExpenseCode: expense.expense_code,
          Date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
          Merchant: expense.merchant_name || '',
          Description: expense.description || '',
          Category: expense.category || '',
          BudgetCategory: budgetHierarchy.category || '',
          BudgetSubCategory: budgetHierarchy.subcategory || '',
          Project: project?.name || '',
          FundingPartner: project?.funding_partner || '',
          Status: expense.status || '',
          ModeOfPayment: expense.payment_method || '',
          AmountDebited: expense.total_amount != null ? Number(expense.total_amount) : 0,
        };
      });

      const header: (keyof ExportRow)[] = [
        'ExpenseCode','Date','Merchant','Description','Category','BudgetCategory','BudgetSubCategory','Project','FundingPartner','Status','ModeOfPayment','AmountDebited'
      ];

      try {
        // dynamic import so app still runs if xlsx is not installed
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const XLSX = await import('xlsx');

        const ws = XLSX.utils.json_to_sheet(exportData, { header: header as string[] });

        // auto-width (simple heuristic) — typed safely
        const cols = header.map((k) => {
          const maxLen = Math.max(
            ...exportData.map(r => {
              const v = r[k];
              return v === null || v === undefined ? 0 : String(v).length;
            }),
            String(k).length
          );
          return { wch: Math.min(40, maxLen + 2) };
        });
        (ws as any)['!cols'] = cols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'All Expenses');
        const filename = `all_expenses_${new Date().toISOString().replace(/[:.]/g,'-')}.xlsx`;
        XLSX.writeFile(wb, filename);
        return;
      } catch (xlsxErr) {
        console.info('xlsx not available, falling back to CSV export.', xlsxErr);
        const headerStrings = header.map(h => String(h));
        const csvRows = [
          headerStrings.join(','),
          ...exportData.map(row => headerStrings.map(h => {
            const val = row[h as keyof ExportRow];
            if (val === null || val === undefined) return '';
            const s = String(val);
            const escaped = s.replace(/"/g, '""');
            if (escaped.includes(',') || escaped.includes('\n')) return `"${escaped}"`;
            return `"${escaped}"`;
          }).join(','))
        ].join('\r\n');

        const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_expenses_${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export. See console for details.');
    }
  };

  // -------------------------
  // JSX render
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Accountant - All Expenses</h1>
        <p className="text-gray-600 mt-2">Review and manage all project expenses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          <p className="text-lg font-semibold text-amber-600">₹{stats.pendingAmount.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.accepted}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Accepted</h3>
          <p className="text-lg font-semibold text-blue-600">₹{stats.acceptedAmount.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <Ban className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.rejected}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
          <p className="text-lg font-semibold text-red-600">₹{stats.rejectedAmount.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.paid}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Paid</h3>
          <p className="text-lg font-semibold text-green-600">₹{stats.paidAmount.toLocaleString()}</p>
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
            <h2 className="text-xl font-bold text-gray-900">All Expenses</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={exportTable}
                className="px-4 py-2 bg-green-400 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                title="Export visible expenses to Excel (Actions column excluded)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Import Excel
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedExpenseIds.size > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-blue-900">
                    {selectedExpenseIds.size} expense(s) selected
                  </span>
                  <button
                    onClick={() => setSelectedExpenseIds(new Set())}
                    className="text-xs text-blue-700 hover:text-blue-900 underline"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkAccept}
                    disabled={bulkActionLoading}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    {bulkActionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Accept Selected
                  </button>
                  <button
                    onClick={handleBulkMarkAsPaid}
                    disabled={bulkActionLoading}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    {bulkActionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                    Mark as Paid
                  </button>
                </div>
              </div>
            </div>
          )}
          
          
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
                  setFilterBudgetCategory('');
                  setFilterBudgetSubcategory('');
                  setFilterBudgetSubSubcategory('');
                  
                  if (partnerId) {
                    const { data: partnerTolls } = await supabase
                      .from('csr_partner_tolls')
                      .select('id, toll_name')
                      .eq('csr_partner_id', partnerId);
                    setFilteredTolls(partnerTolls || []);
                    
                    const { data: partnerProjects } = await supabase
                      .from('projects')
                      .select('id, name')
                      .eq('csr_partner_id', partnerId);
                    setFilteredProjects(partnerProjects || []);
                  } else {
                    setFilteredTolls(tolls);
                    setFilteredProjects(projects);
                    setFilteredBudgetCategories(budgetCategories);
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
                onChange={(e) => {
                  const projectId = e.target.value;
                  setFilterProject(projectId);
                  setFilterBudgetCategory('');
                  setFilterBudgetSubcategory('');
                  setFilterBudgetSubSubcategory('');
                  
                  if (projectId) {
                    const projectBudgets = budgetCategories.filter(cat => cat.project_id === projectId);
                    setFilteredBudgetCategories(projectBudgets);
                  } else {
                    setFilteredBudgetCategories(budgetCategories);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Projects</option>
                {filteredProjects.map(project => {
                  const projectDisplay = `${project.name}${(project as any).location ? ` (${(project as any).location})` : ''} : ${(project as any).project_code || ''}`;
                  return (
                    <option key={project.id} value={project.id}>{projectDisplay}</option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcompany</label>
              <select
                value={filterToll}
                onChange={async (e) => {
                  const tollId = e.target.value;
                  setFilterToll(tollId);
                  setFilterProject('');
                  setFilterBudgetCategory('');
                  setFilterBudgetSubcategory('');
                  setFilterBudgetSubSubcategory('');
                  
                  if (tollId) {
                    const { data: tollProjects } = await supabase
                      .from('projects')
                      .select('id, name')
                      .eq('toll_id', tollId);
                    setFilteredProjects(tollProjects || []);
                  } else if (filterCSRPartner) {
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
                <option value="">All Subcompanies</option>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Category</label>
              <select
                value={filterBudgetCategory}
                onChange={(e) => {
                  setFilterBudgetCategory(e.target.value);
                  setFilterBudgetSubcategory('');
                  setFilterBudgetSubSubcategory('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">All Categories</option>
                {filteredBudgetCategories.filter(cat => !cat.parent_id).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Subcategory</label>
              <select
                value={filterBudgetSubcategory}
                onChange={(e) => {
                  setFilterBudgetSubcategory(e.target.value);
                  setFilterBudgetSubSubcategory('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                disabled={!filterBudgetCategory}
              >
                <option value="">All Subcategories</option>
                {filteredBudgetCategories.filter(cat => cat.parent_id === filterBudgetCategory).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Sub-Subcategory</label>
              <select
                value={filterBudgetSubSubcategory}
                onChange={(e) => setFilterBudgetSubSubcategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                disabled={!filterBudgetSubcategory}
              >
                <option value="">All Sub-Subcategories</option>
                {filteredBudgetCategories.filter(cat => cat.parent_id === filterBudgetSubcategory).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {(filterCategory || filterStatus || filterDateFrom || filterDateTo || filterCSRPartner || filterProject || filterToll || filterBudgetCategory || filterBudgetSubcategory || filterBudgetSubSubcategory) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('');
                setFilterDateFrom('');
                setFilterDateTo('');
                setFilterCSRPartner('');
                setFilterProject('');
                setFilterToll('');
                setFilterBudgetCategory('');
                setFilterBudgetSubcategory('');
                setFilterBudgetSubSubcategory('');
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
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={(() => {
                      const actionable = getFilteredExpenses().filter(e => e.status === 'pending' || e.status === 'approved');
                      return actionable.length > 0 && selectedExpenseIds.size === actionable.length;
                    })()}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    title="Select all pending/approved expenses"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Merchant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Budget Cat.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Funding Partner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
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
                getFilteredExpenses().map((expense, index) => {
                  const budgetExceeded = quickCheckBudgetExceeded(expense);
                  return (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-emerald-50/50 transition-colors ${budgetExceeded ? 'bg-amber-50/30 border-l-4 border-l-amber-500' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedExpenseIds.has(expense.id)}
                        onChange={() => toggleSelectExpense(expense.id)}
                        disabled={expense.status !== 'pending' && expense.status !== 'approved'}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={expense.status !== 'pending' && expense.status !== 'approved' ? `Cannot select ${expense.status} expenses` : ''}
                      />
                    </td>
                    
                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    
                    {/* Amount with budget warning */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      <button
                        onClick={() => handleViewDetails(expense)}
                        className="flex items-center gap-1 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        {budgetExceeded && (
                          <span title="Budget may be exceeded">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          </span>
                        )}
                        ₹{expense.total_amount.toLocaleString()}
                      </button>
                    </td>
                    
                    {/* Merchant */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-[120px] truncate" title={expense.merchant_name}>
                        {expense.merchant_name}
                      </div>
                    </td>
                    
                    {/* Description - expandable */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-[150px]">
                        {expense.description && expense.description.length > 30 ? (
                          <div className="group relative">
                            <span className="truncate block">{expense.description.substring(0, 30)}...</span>
                            <span className="cursor-pointer text-emerald-600 text-xs hover:underline">more</span>
                            <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-xs rounded p-2 shadow-lg max-w-xs left-0 top-full mt-1">
                              {expense.description}
                            </div>
                          </div>
                        ) : (
                          <span>{expense.description || '-'}</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-[100px] truncate" title={expense.category}>
                        {expense.category}
                      </div>
                    </td>
                    
                    {/* Budget Category - combined with subcategory */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-[120px]">
                        {(() => {
                          const hierarchy = getBudgetCategoryHierarchy((expense as any).budget_category_id);
                          const combined = [hierarchy.category, hierarchy.subcategory].filter(Boolean).join(' > ');
                          if (combined.length > 25) {
                            return (
                              <div className="group relative">
                                <span className="truncate block">{combined.substring(0, 25)}...</span>
                                <span className="cursor-pointer text-emerald-600 text-xs hover:underline">more</span>
                                <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-xs rounded p-2 shadow-lg max-w-xs left-0 top-full mt-1 whitespace-normal">
                                  {combined}
                                </div>
                              </div>
                            );
                          }
                          return <span>{combined || '-'}</span>;
                        })()}
                      </div>
                    </td>
                    
                    {/* Project - expandable */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-[120px]">
                        {(() => {
                          const project = projects.find(p => p.id === expense.project_id);
                          if (!project) return '-';
                          const projectDisplay = `${project.name}${(project as any).location ? ` (${(project as any).location})` : ''} : ${(project as any).project_code || ''}`;
                          if (projectDisplay.length > 20) {
                            return (
                              <div className="group relative">
                                <span className="truncate block">{projectDisplay.substring(0, 20)}...</span>
                                <span className="cursor-pointer text-emerald-600 text-xs hover:underline">more</span>
                                <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-xs rounded p-2 shadow-lg max-w-xs left-0 top-full mt-1 whitespace-normal">
                                  {projectDisplay}
                                </div>
                              </div>
                            );
                          }
                          return <span>{projectDisplay}</span>;
                        })()}
                      </div>
                    </td>
                    
                    {/* Funding Partner */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-[120px] truncate" title={projects.find(p => p.id === expense.project_id)?.funding_partner || '-'}>
                        {projects.find(p => p.id === expense.project_id)?.funding_partner || '-'}
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : expense.status === 'accepted'
                          ? 'bg-blue-100 text-blue-700'
                          : expense.status === 'pending' || expense.status === 'submitted'
                          ? 'bg-amber-100 text-amber-700'
                          : expense.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </td>
                    
                    {/* Payment Method */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-20 truncate" title={expense.payment_method}>
                        {expense.payment_method || '-'}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(expense)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                  );
                })
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
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-6 text-white shrink-0">
              <h2 className="text-2xl font-bold">Expense Details</h2>
              <p className="text-emerald-100 mt-1">{selectedExpense.expense_code}</p>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 font-medium">✏️ Edit Mode: You can modify CSR Partner, Project, Subcompany, Category, and Budget Categories below.</p>
              </div>
              
              {/* Budget Warning Alert */}
              {budgetWarning.show && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-amber-900 mb-2">{budgetWarning.message}</h3>
                      <div className="space-y-2 text-xs text-amber-800">
                        {budgetWarning.stats.subcategoryRemaining !== undefined && (
                          <div className="flex justify-between items-center bg-amber-100/50 rounded px-2 py-1">
                            <span className="font-medium">Sub-Category Budget:</span>
                            <span className={budgetWarning.stats.subcategoryRemaining < 0 ? 'text-red-700 font-bold' : 'font-semibold'}>
                              ₹{budgetWarning.stats.subcategoryRemaining.toLocaleString()} / ₹{budgetWarning.stats.subcategoryTotal?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {budgetWarning.stats.categoryRemaining !== undefined && (
                          <div className="flex justify-between items-center bg-amber-100/50 rounded px-2 py-1">
                            <span className="font-medium">Category Budget:</span>
                            <span className={budgetWarning.stats.categoryRemaining < 0 ? 'text-red-700 font-bold' : 'font-semibold'}>
                              ₹{budgetWarning.stats.categoryRemaining.toLocaleString()} / ₹{budgetWarning.stats.categoryTotal?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {budgetWarning.stats.projectRemaining !== undefined && (
                          <div className="flex justify-between items-center bg-amber-100/50 rounded px-2 py-1">
                            <span className="font-medium">Project Budget:</span>
                            <span className={budgetWarning.stats.projectRemaining < 0 ? 'text-red-700 font-bold' : 'font-semibold'}>
                              ₹{budgetWarning.stats.projectRemaining.toLocaleString()} / ₹{budgetWarning.stats.projectTotal?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="mt-2 pt-2 border-t border-amber-300">
                          <span className="font-medium">Expense Amount: </span>
                          <span className="font-bold text-amber-900">₹{selectedExpense.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Expense Code</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedExpense.expense_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Merchant Name</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedExpense.merchant_name}</p>
                </div>
                
                {/* CSR Partner - Editable */}
                {editMode ? (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">CSR Partner</label>
                    <select
                      value={editableCsrPartner}
                      onChange={async (e) => {
                        const partnerId = e.target.value;
                        setEditableCsrPartner(partnerId);
                        setCustomCsrPartner('');
                        setEditableToll('');
                        setEditableProject('');
                        setEditableBudgetCategory('');
                        setEditableBudgetSubcategory('');
                        setEditableBudgetSubSubcategory('');
                        
                        if (partnerId && partnerId !== 'custom') {
                          const { data: partnerTolls } = await supabase
                            .from('csr_partner_tolls')
                            .select('id, toll_name')
                            .eq('csr_partner_id', partnerId);
                          setModalFilteredTolls(partnerTolls || []);
                          
                          const { data: partnerProjects } = await supabase
                            .from('projects')
                            .select('id, name')
                            .eq('csr_partner_id', partnerId);
                          setModalFilteredProjects(partnerProjects || []);
                        } else {
                          setModalFilteredTolls(tolls);
                          setModalFilteredProjects(projects);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select CSR Partner</option>
                      {csrPartners.map(partner => (
                        <option key={partner.id} value={partner.id}>{partner.name}</option>
                      ))}
                      <option value="custom">Custom (Enter Name)</option>
                    </select>
                    {editableCsrPartner === 'custom' && (
                      <input
                        type="text"
                        value={customCsrPartner}
                        onChange={(e) => setCustomCsrPartner(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-2"
                        placeholder="Enter custom CSR partner name"
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-600">CSR Partner</label>
                    <p className="text-gray-900 font-semibold mt-1">
                      {selectedExpense.csr_partner_id ? csrPartners.find(p => p.id === selectedExpense.csr_partner_id)?.name || 'Unknown' : 'Custom/Not Set'}
                    </p>
                  </div>
                )}
                
                {/* Toll - Editable (if exists) */}
                {(selectedExpense.toll_id || modalFilteredTolls.length > 0) && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Subcompany {selectedExpense.toll_id && '✓'}</label>
                    <select
                      value={editableToll}
                      onChange={async (e) => {
                        const tollId = e.target.value;
                        setEditableToll(tollId);
                        setCustomToll('');
                        setEditableProject('');
                        setEditableBudgetCategory('');
                        setEditableBudgetSubcategory('');
                        setEditableBudgetSubSubcategory('');
                        
                        if (tollId && tollId !== 'custom') {
                          const { data: tollProjects } = await supabase
                            .from('projects')
                            .select('id, name')
                            .eq('toll_id', tollId);
                          setModalFilteredProjects(tollProjects || []);
                        } else if (editableCsrPartner && editableCsrPartner !== 'custom') {
                          const { data: partnerProjects } = await supabase
                            .from('projects')
                            .select('id, name')
                            .eq('csr_partner_id', editableCsrPartner);
                          setModalFilteredProjects(partnerProjects || []);
                        } else {
                          setModalFilteredProjects(projects);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">No Subcompany / Select Subcompany</option>
                      {modalFilteredTolls.map(toll => (
                        <option key={toll.id} value={toll.id}>{toll.toll_name}</option>
                      ))}
                      <option value="custom">Custom (Enter Name)</option>
                    </select>
                    {editableToll === 'custom' && (
                      <input
                        type="text"
                        value={customToll}
                        onChange={(e) => setCustomToll(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-2"
                        placeholder="Enter custom subcompany name"
                      />
                    )}
                  </div>
                )}
                
                {/* Project - Editable */}
                {editMode ? (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Project</label>
                    <select
                      value={editableProject}
                      onChange={async (e) => {
                        const projectId = e.target.value;
                        setEditableProject(projectId);
                        setCustomProject('');
                        setEditableBudgetCategory('');
                        setEditableBudgetSubcategory('');
                        setEditableBudgetSubSubcategory('');
                        
                        if (projectId && projectId !== 'custom') {
                          const { data } = await supabase
                            .from('budget_categories')
                            .select('id, name, parent_id')
                            .eq('project_id', projectId);
                          setModalFilteredBudgetCategories(data || []);
                          
                          // Re-check budget with new project
                          if (selectedExpense) {
                            const budgetCatId = editableBudgetSubSubcategory || editableBudgetSubcategory || editableBudgetCategory || null;
                            await checkBudgetAvailability(projectId, budgetCatId, selectedExpense.total_amount);
                          }
                        } else {
                          setModalFilteredBudgetCategories([]);
                          setBudgetWarning({ show: false, level: null, message: '', stats: {} });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Project</option>
                      {modalFilteredProjects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                      <option value="custom">Custom (Enter Name)</option>
                    </select>
                    {editableProject === 'custom' && (
                      <input
                        type="text"
                        value={customProject}
                        onChange={(e) => setCustomProject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-2"
                        placeholder="Enter custom project name"
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Project</label>
                    <p className="text-gray-900 font-semibold mt-1">
                      {projects.find(p => p.id === selectedExpense.project_id)?.name || 'Unknown'}
                    </p>
                  </div>
                )}
                
                {/* Category - Editable */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Category</label>
                  <select
                    value={editableCategory}
                    onChange={(e) => setEditableCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Budget Category - Editable with cascading dropdowns */}
                {modalFilteredBudgetCategories.length > 0 && (
                  <>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-1 block">Budget Category</label>
                      <select
                        value={editableBudgetCategory}
                        onChange={async (e) => {
                          const catId = e.target.value;
                          setEditableBudgetCategory(catId);
                          setEditableBudgetSubcategory('');
                          setEditableBudgetSubSubcategory('');
                          
                          // Re-check budget
                          if (selectedExpense && editableProject) {
                            await checkBudgetAvailability(editableProject, catId || null, selectedExpense.total_amount);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Budget Category</option>
                        {modalFilteredBudgetCategories.filter(cat => !cat.parent_id).map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {editableBudgetCategory && modalFilteredBudgetCategories.filter(cat => cat.parent_id === editableBudgetCategory).length > 0 && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Budget Sub-Category</label>
                        <select
                          value={editableBudgetSubcategory}
                          onChange={async (e) => {
                            const subCatId = e.target.value;
                            setEditableBudgetSubcategory(subCatId);
                            setEditableBudgetSubSubcategory('');
                            
                            // Re-check budget
                            if (selectedExpense && editableProject) {
                              await checkBudgetAvailability(editableProject, subCatId || editableBudgetCategory || null, selectedExpense.total_amount);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Select Sub-Category</option>
                          {modalFilteredBudgetCategories.filter(cat => cat.parent_id === editableBudgetCategory).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {editableBudgetSubcategory && modalFilteredBudgetCategories.filter(cat => cat.parent_id === editableBudgetSubcategory).length > 0 && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Budget Sub-Sub-Category</label>
                        <select
                          value={editableBudgetSubSubcategory}
                          onChange={async (e) => {
                            const subSubCatId = e.target.value;
                            setEditableBudgetSubSubcategory(subSubCatId);
                            
                            // Re-check budget
                            if (selectedExpense && editableProject) {
                              await checkBudgetAvailability(editableProject, subSubCatId || editableBudgetSubcategory || editableBudgetCategory || null, selectedExpense.total_amount);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Select Sub-Sub-Category</option>
                          {modalFilteredBudgetCategories.filter(cat => cat.parent_id === editableBudgetSubcategory).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-gray-900 font-semibold mt-1 text-2xl">₹{selectedExpense.total_amount.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Budget Category Hierarchy */}
              {(() => {
                const budgetHierarchy = getBudgetCategoryHierarchy((selectedExpense as any).budget_category_id);
                if (budgetHierarchy.category || budgetHierarchy.subcategory || budgetHierarchy.subSubcategory) {
                  return (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <label className="text-sm font-semibold text-emerald-800 mb-2 block">Budget Category</label>
                      <div className="space-y-2">
                        {budgetHierarchy.category && (
                          <div>
                            <span className="text-xs font-medium text-emerald-600">Category: </span>
                            <span className="text-sm text-gray-900 font-semibold">{budgetHierarchy.category}</span>
                          </div>
                        )}
                        {budgetHierarchy.subcategory && (
                          <div>
                            <span className="text-xs font-medium text-emerald-600">Sub-Category: </span>
                            <span className="text-sm text-gray-900 font-semibold">{budgetHierarchy.subcategory}</span>
                          </div>
                        )}
                        {budgetHierarchy.subSubcategory && (
                          <div>
                            <span className="text-xs font-medium text-emerald-600">Sub-Sub-Category: </span>
                            <span className="text-sm text-gray-900 font-semibold">{budgetHierarchy.subSubcategory}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="grid grid-cols-2 gap-4">
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
                        : selectedExpense.status === 'pending' || selectedExpense.status === 'submitted'
                        ? 'bg-amber-100 text-amber-700'
                        : selectedExpense.status === 'paid'
                        ? 'bg-green-100 text-green-700'
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
              {(selectedExpense as ProjectExpense & { receipt_drive_link?: string }).receipt_drive_link && selectedExpense.status === 'paid' && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Receipt</label>
                  <button
                    onClick={() => {
                      setBillUrl((selectedExpense as ProjectExpense & { receipt_drive_link?: string }).receipt_drive_link || '');
                      setShowBillModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 mt-1 block font-medium hover:underline"
                  >
                    View Payment Receipt
                  </button>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSaveEdits}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                   Save Changes
                </button>
                <button
                  onClick={handleAccept}
                  disabled={selectedExpense.status === 'accepted' || selectedExpense.status === 'approved' || selectedExpense.status === 'paid' || selectedExpense.status === 'rejected'}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={handleReject}
                  disabled={selectedExpense.status === 'rejected' || selectedExpense.status === 'paid'}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleMarkAsPaid}
                  disabled={selectedExpense.status !== 'approved'}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  title={selectedExpense.status !== 'approved' ? 'Expense must be approved by admin first' : 'Mark as paid'}
                >
                  Mark as Paid
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

      {/* Receipt Upload Modal */}
      {showReceiptUploadModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-linear-to-r from-green-500 to-green-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Upload Payment Receipt</h2>
              <p className="text-green-100 mt-1">Upload proof of payment for {selectedExpense.expense_code}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt (PDF/Image) *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Check file size (max 10MB)
                      if (file.size > 10 * 1024 * 1024) {
                        alert('File size must be less than 10MB');
                        e.target.value = '';
                        return;
                      }
                      setReceiptFile(file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Upload payment receipt (max 10MB)</p>
                {receiptFile && (
                  <p className="text-xs text-green-600 mt-1 font-medium">✓ Selected: {receiptFile.name}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This receipt will be stored as proof of payment and can be viewed later.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUploadReceipt}
                  disabled={!receiptFile || uploadingReceipt}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {uploadingReceipt ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Upload & Mark as Paid
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowReceiptUploadModal(false);
                    setReceiptFile(null);
                  }}
                  disabled={uploadingReceipt}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
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

export default AccountantExpensesPage;
