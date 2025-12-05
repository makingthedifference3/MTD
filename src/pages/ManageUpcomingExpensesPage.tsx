import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Loader, AlertCircle, AlertTriangle } from 'lucide-react';
import { projectExpensesService, type ProjectExpense } from '../services/projectExpensesService';
import { supabase } from '../services/supabaseClient';

interface BudgetCategory {
  id: string;
  name: string;
  parent_id: string | null;
  project_id: string;
  allocated_amount: number;
}

interface Project {
  id: string;
  name: string;
  total_budget: number;
}

interface User {
  id: string;
  full_name: string;
}

const ManageUpcomingExpensesPage = () => {
  const [upcomingExpenses, setUpcomingExpenses] = useState<ProjectExpense[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all upcoming expenses (from all users)
      const expenses = await projectExpensesService.getUpcomingExpenses();
      setUpcomingExpenses(expenses);

      // Fetch budget categories
      const { data: budgetData, error: budgetError } = await supabase
        .from('budget_categories')
        .select('id, name, parent_id, project_id, allocated_amount')
        .order('name');
      if (budgetError) throw budgetError;
      setBudgetCategories(budgetData || []);

      // Fetch projects with total_budget
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, total_budget')
        .order('name');
      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch users for creator names
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name');
      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load upcoming expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this planned expense?')) {
      return;
    }

    try {
      await projectExpensesService.deleteExpense(expenseId);
      setUpcomingExpenses(upcomingExpenses.filter(e => e.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense');
    }
  };

  const checkBudgetExceeded = (expense: ProjectExpense): { exceeded: boolean; message: string } => {
    // Only check for expenses that aren't already paid or rejected
    if (!expense.project_id || expense.status === 'paid' || expense.status === 'rejected') {
      return { exceeded: false, message: '' };
    }
    
    // Check budget category allocation if set
    const budgetCategoryId = (expense as any).budget_category_id;
    
    if (budgetCategoryId && budgetCategories.length > 0) {
      const budgetCat = budgetCategories.find(c => c.id === budgetCategoryId);
      const allocated = budgetCat?.allocated_amount ?? 0;
      
      // Calculate how much has been spent in this category (excluding current expense)
      const categoryExpenses = upcomingExpenses.filter(
        e => (e as any).budget_category_id === budgetCategoryId &&
        e.id !== expense.id &&
        (e.status === 'paid' || e.status === 'approved' || e.status === 'accepted')
      );
      const categorySpent = categoryExpenses.reduce((sum, e) => sum + e.total_amount, 0);
      
      // Would this expense push us over budget?
      const totalAfterExpense = categorySpent + expense.total_amount;
      const exceeded = totalAfterExpense > allocated;
      
      if (exceeded) {
        return {
          exceeded: true,
          message: `Budget Category "${budgetCat?.name}" exceeded: ₹${totalAfterExpense.toLocaleString()} / ₹${allocated.toLocaleString()}`
        };
      }
    }
    
    // Also check project total budget
    const project = projects.find(p => p.id === expense.project_id);
    if (project) {
      const projectBudget = project.total_budget ?? 0;
      
      // Calculate total spent in project (excluding current expense)
      const projectExpenses = upcomingExpenses.filter(
        e => e.project_id === expense.project_id &&
        e.id !== expense.id &&
        (e.status === 'paid' || e.status === 'approved' || e.status === 'accepted')
      );
      const projectSpent = projectExpenses.reduce((sum, e) => sum + e.total_amount, 0);
      const totalAfterExpense = projectSpent + expense.total_amount;
      const exceeded = totalAfterExpense > projectBudget;
      
      if (exceeded) {
        return {
          exceeded: true,
          message: `Project "${project.name}" budget exceeded: ₹${totalAfterExpense.toLocaleString()} / ₹${projectBudget.toLocaleString()}`
        };
      }
    }
    
    return { exceeded: false, message: '' };
  };

  const getCreatorName = (createdBy: string | undefined): string => {
    if (!createdBy) return 'Unknown User';
    const user = users.find(u => u.id === createdBy);
    return user?.full_name || 'Unknown User';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Upcoming Expenses</h1>
        <p className="text-gray-600 mt-2">Review and manage all planned expenses from all users</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading expenses...</span>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {!loading && (
        <>
          {/* Planned Expenses List */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Planned Expenses</h3>

            {upcomingExpenses.length > 0 ? (
              <div className="space-y-4">
                {upcomingExpenses.map((expense, index) => {
                  const budgetCheck = checkBudgetExceeded(expense);
                  const creatorName = getCreatorName(expense.created_by);
                  
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border ${
                        budgetCheck.exceeded 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {creatorName}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              expense.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                              expense.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                              expense.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {expense.status.toUpperCase()}
                            </span>
                          </div>

                          {budgetCheck.exceeded && (
                            <div className="mb-4 flex items-start gap-2 bg-red-100 border border-red-300 rounded-lg p-3">
                              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-red-800">Budget Exceeded</p>
                                <p className="text-sm text-red-700">{budgetCheck.message}</p>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Code:</span>
                              <p className="font-medium text-gray-900">{expense.expense_code}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Merchant:</span>
                              <p className="font-medium text-gray-900">{expense.merchant_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Category:</span>
                              <p className="font-medium text-gray-900">{expense.category}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <p className={`font-semibold ${budgetCheck.exceeded ? 'text-red-600' : 'text-emerald-600'}`}>
                                ₹{expense.total_amount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Date:</span>
                              <p className="font-medium text-gray-900 flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(expense.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Payment Method:</span>
                              <p className="font-medium text-gray-900">{expense.payment_method}</p>
                            </div>
                            {expense.description && (
                              <div className="md:col-span-2">
                                <span className="text-gray-500">Description:</span>
                                <p className="font-medium text-gray-900">{expense.description}</p>
                              </div>
                            )}
                          </div>

                          {expense.bill_drive_link && (
                            <div className="mt-3">
                              <a
                                href={expense.bill_drive_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium hover:underline"
                              >
                                View Bill →
                              </a>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="ml-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Planned Expenses</h3>
                <p className="text-gray-600">No upcoming expenses have been planned yet.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUpcomingExpensesPage;
