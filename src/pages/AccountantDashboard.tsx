import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderKanban, ChevronRight,
  ArrowLeft, MapPin, Briefcase, Leaf, Building2, Heart, Droplet, GraduationCap,
  CheckCircle2, Users, Activity, Award, type LucideIcon, BarChart3, Grid3x3,
  TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Receipt
} from 'lucide-react';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useFilter } from '../context/useFilter';
import FilterBar from '../components/FilterBar';
import type { Project } from '../services/filterService';
import { expenseService } from '../services/expenseService';
import { budgetService } from '../services/budgetService';
import type { Expense } from '../services/expenseService';
import type { BudgetAllocation } from '../services/budgetService';

// Helper function to map icon names to actual Lucide icons
const getIconComponent = (iconName?: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'Leaf': Leaf,
    'Heart': Heart,
    'GraduationCap': GraduationCap,
    'Droplet': Droplet,
    'FolderKanban': FolderKanban,
    'Activity': Activity,
    'Laptop': Building2,
    'Users': Users,
    'Briefcase': Briefcase,
    'AlertCircle': Award,
    'TrendingUp': Activity,
    'Wrench': Award,
    'Camera': FolderKanban,
    'Music': Heart,
    'Home': Building2,
    'Shield': Heart,
    'Hammer': Award,
    'ShoppingCart': Users,
    'Truck': Activity,
    'Apple': Heart,
    'BookOpen': Heart,
    'Lightbulb': Heart,
    'Bike': Heart,
    'Wallet': Heart,
  };
  return iconMap[iconName || 'FolderKanban'] || FolderKanban;
};

interface ProjectWithBeneficiaries extends Project {
  displayName?: string;
  total_budget?: number;
  utilized_budget?: number;
}

const AccountantDashboard = () => {
  const {
    csrPartners,
    selectedPartner,
    selectedProject,
    filteredProjects,
    setSelectedPartner,
    setSelectedProject,
    resetFilters,
    isLoading,
    error,
  } = useFilter();

  const [viewMode, setViewMode] = useState<'partners' | 'projects' | 'projectDetails'>('partners');
  const [selectedProjectData, setSelectedProjectData] = useState<ProjectWithBeneficiaries | null>(null);
  const [dashboardView, setDashboardView] = useState<'hierarchy' | 'analytics'>('hierarchy');
  const [budgets, setBudgets] = useState<BudgetAllocation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Fetch financial data for analytics
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        let budgetData: BudgetAllocation[] = [];
        let expenseData: Expense[] = [];

        if (selectedProjectData?.id) {
          // Fetch data for selected project
          budgetData = await budgetService.getBudgetAllocationsByProject(selectedProjectData.id);
          expenseData = await expenseService.getExpensesByProject(selectedProjectData.id);
        } else {
          // Fetch all data
          budgetData = await budgetService.getAllBudgetAllocations();
          expenseData = await expenseService.getAllExpenses();
        }

        setBudgets(budgetData);
        setExpenses(expenseData);
      } catch (error) {
        console.error('Failed to load financial data:', error);
      }
    };

    if (dashboardView === 'analytics') {
      loadFinancialData();
    }
  }, [dashboardView, selectedProjectData?.id]);

  // Auto-switch to projects view when a partner is selected via FilterBar
  useEffect(() => {
    if (selectedPartner) {
      setViewMode('projects');
    }
  }, [selectedPartner]);

  // Auto-switch to project details when a project is selected via FilterBar
  useEffect(() => {
    console.log('AccountantDashboard - selectedProject:', selectedProject);
    if (selectedProject && filteredProjects.length > 0) {
      const project = filteredProjects.find(p => p.id === selectedProject);
      console.log('AccountantDashboard - Found project:', project?.name);
      if (project) {
        setSelectedProjectData(project as ProjectWithBeneficiaries);
        setViewMode('projectDetails');
      }
    }
  }, [selectedProject, filteredProjects]);

  // Get selected partner object from csrPartners using the selectedPartner ID from context
  const selectedPartnerObject = selectedPartner 
    ? csrPartners.find(p => p.id === selectedPartner)
    : null;

  // Get projects for selected partner - directly use filteredProjects which is already filtered by context
  const partnerProjects = filteredProjects;

  console.log('AccountantDashboard - selectedPartner:', selectedPartner);
  console.log('AccountantDashboard - partnerProjects count:', partnerProjects.length);
  console.log('AccountantDashboard - partnerProjects:', partnerProjects);

  const handlePartnerClick = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setViewMode('projects');
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProjectData(project as ProjectWithBeneficiaries);
    setSelectedProject(project.id);
    setViewMode('projectDetails');
  };

  const handleBack = () => {
    if (viewMode === 'projectDetails') {
      setViewMode('projects');
      setSelectedProjectData(null);
      setSelectedProject(null);
    } else if (viewMode === 'projects') {
      setViewMode('partners');
      setSelectedPartner(null);
      resetFilters();
    }
  };

  // Calculate monthly financials from budgets
  const monthlyFinancials = useMemo(() => {
    const monthlyData: Record<string, { revenue: number; expenses: number; profit: number }> = {};

    budgets.forEach((budget) => {
      const date = new Date(budget.created_at);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expenses: 0, profit: 0 };
      }

      monthlyData[monthKey].revenue += (budget.allocated_amount || 0) / 1000;
      monthlyData[monthKey].expenses += (budget.utilized_amount || 0) / 1000;
      monthlyData[monthKey].profit = monthlyData[monthKey].revenue - monthlyData[monthKey].expenses;
    });

    return Object.entries(monthlyData)
      .slice(-6)
      .map(([month, data]) => ({
        month,
        ...data,
      }));
  }, [budgets]);

  // Calculate expense breakdown by category
  const expenseBreakdown = useMemo(() => {
    const categoryMap: Record<string, number> = {};

    expenses.forEach((expense) => {
      const categoryName = expense.category_id || 'Other';
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + expense.total_amount;
    });

    const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);
    const colors = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#14b8a6', '#0d9488', '#0f766e'];

    return Object.entries(categoryMap).map(([name, value], index) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colors[index] || '#10b981',
    }));
  }, [expenses]);

  // Get recent transactions from expenses
  const recentTransactions = useMemo(() => {
    return expenses.slice(0, 5).map((expense, index) => ({
      id: index + 1,
      type: 'Expense',
      description: `${expense.category_id || 'Other'} - ${expense.description}`,
      amount: -expense.total_amount,
      date: expense.date,
      status: expense.status === 'approved' ? 'completed' : 'pending',
      category: expense.category_id || 'Other',
    }));
  }, [expenses]);

  const totalRevenue = monthlyFinancials.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = monthlyFinancials.reduce((sum, item) => sum + item.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 via-emerald-400/5 to-transparent rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl shadow-emerald-500/5 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent">
                  Project Command Center
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  {dashboardView === 'hierarchy' ? (
                    <>
                      {viewMode === 'partners' && 'Select CSR Partner to view their projects'}
                      {viewMode === 'projects' && selectedPartnerObject && `Projects by ${selectedPartnerObject.name}`}
                      {viewMode === 'projectDetails' && selectedProjectData && `Project: ${selectedProjectData.name}`}
                    </>
                  ) : (
                    'Analytics Dashboard - All Projects Overview'
                  )}
                </p>
              </div>
            </div>
            {/* View Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (dashboardView === 'hierarchy') {
                  setDashboardView('analytics');
                } else {
                  setDashboardView('hierarchy');
                  setViewMode('partners');
                  resetFilters();
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                dashboardView === 'analytics' 
                  ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-500'
              }`}
            >
              {dashboardView === 'hierarchy' ? (
                <>
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </>
              ) : (
                <>
                  <Grid3x3 className="w-5 h-5" />
                  <span>Projects</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ANALYTICS VIEW */}
      {dashboardView === 'analytics' ? (
        <motion.div
          key="analytics-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            
            {/* Revenue Card - Large */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-12 md:col-span-6 lg:col-span-4 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 opacity-70" />
                </div>
                <div className="space-y-2">
                  <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
                  <h3 className="text-5xl font-bold">₹{totalRevenue.toFixed(1)}K</h3>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                      +{profitMargin}% margin
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Expenses Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-12 md:col-span-6 lg:col-span-4 bg-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <Wallet className="w-7 h-7 text-emerald-400" />
                  </div>
                  <ArrowDownRight className="w-6 h-6 text-red-400 opacity-70" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Total Expenses</p>
                  <h3 className="text-5xl font-bold">₹{totalExpenses.toFixed(1)}K</h3>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-red-500/20 backdrop-blur-sm rounded-full text-xs font-semibold text-red-400">
                      {recentTransactions.length} transactions
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Net Profit Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-emerald-50 rounded-2xl">
                    <Activity className="w-7 h-7 text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Healthy
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Net Profit</p>
                  <h3 className="text-5xl font-bold text-black">₹{netProfit.toFixed(1)}K</h3>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-semibold">{profitMargin}%</span>
                    </div>
                    <span className="text-gray-400 text-sm">profit margin</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Financial Trends Chart - Wide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black mb-1">Financial Trends</h2>
                  <p className="text-gray-500 text-sm">Revenue vs Expenses over time</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlyFinancials}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af" 
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                      color: '#fff',
                      padding: '12px 16px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fill="url(#colorRevenue)" 
                    name="Revenue" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#000000" 
                    strokeWidth={3}
                    fill="url(#colorExpenses)" 
                    name="Expenses" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Expense Breakdown - Tall */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="col-span-12 lg:col-span-4 bg-linear-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32"></div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1">Expense Distribution</h2>
                  <p className="text-gray-400 text-sm">Category breakdown</p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#000',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {expenseBreakdown.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Transactions - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="col-span-12 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-500"
            >
              <div className="p-8 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-1">Recent Transactions</h2>
                    <p className="text-gray-500 text-sm">Latest financial activities</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-600">{recentTransactions.length} transactions</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className="hover:bg-emerald-50/30 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                              <Receipt className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{transaction.category}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm text-gray-600">{transaction.description}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-base font-bold text-black">
                            ₹{Math.abs(transaction.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm text-gray-500 font-medium">{transaction.date}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold inline-block ${
                            transaction.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
        </motion.div>
      ) : (
        // HIERARCHY VIEW - All existing code
        <>
          {/* Filter Bar */}
          <FilterBar />

          {/* Back Button */}
          {viewMode !== 'partners' && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all font-semibold text-gray-900 hover:text-emerald-600 shadow-lg hover:shadow-emerald-500/20"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </motion.button>
          )}

          <AnimatePresence mode="wait">
        {/* PARTNERS VIEW */}
        {viewMode === 'partners' && (
          <motion.div
            key="partners"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-600 font-semibold">Loading partners...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            ) : csrPartners.length === 0 ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
                <p className="text-amber-800 font-semibold text-lg">No CSR Partners found</p>
                <p className="text-amber-700 mt-2">Please insert sample data into the database first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {csrPartners.map((partner, index) => {
                // Count projects for this partner from filteredProjects
                const partnerProjectCount = filteredProjects.filter((p: Project) => p.csr_partner_id === partner.id).length;
                return (
                  <motion.button
                    key={partner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handlePartnerClick(partner.id)}
                    className="group relative text-left"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"></div>
                    
                    <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-all">
                            <Briefcase className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            {partnerProjectCount} Projects
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
                        {partner.company_name && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{partner.company_name}</p>
                        )}
                        
                        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                          View Projects
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
              </div>
            )}
          </motion.div>
        )}

        {/* PROJECTS VIEW */}
        {viewMode === 'projects' && selectedPartnerObject && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                <Building2 className="w-4 h-4" />
                {selectedPartnerObject.name}
              </div>
            </div>

            {partnerProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerProjects.map((project, index) => {
                  const Icon = getIconComponent(project.display_icon);
                  const colorClass = project.display_color || 'emerald';
                  
                  return (
                    <motion.button
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleProjectClick(project)}
                      className="group relative text-left"
                    >
                      <div className={`absolute inset-0 bg-linear-to-br from-${colorClass}-500/20 to-${colorClass}-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100`}></div>
                      
                      <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${colorClass}-500/5 rounded-bl-3xl group-hover:bg-${colorClass}-500/10 transition-colors`}></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 bg-${colorClass}-100 group-hover:bg-${colorClass}-200 rounded-xl transition-all`}>
                              <Icon className={`w-6 h-6 text-${colorClass}-600`} />
                            </div>
                            <div className={`text-sm font-bold text-${colorClass}-600 bg-${colorClass}-50 px-3 py-1 rounded-full`}>
                              {project.status || 'Active'}
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                          
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                            View Details
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">No projects found for this partner</p>
              </div>
            )}
          </motion.div>
        )}

        {/* PROJECT DETAILS VIEW */}
        {viewMode === 'projectDetails' && selectedProjectData && (
          <motion.div
            key="projectDetails"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Project Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-6 shadow-lg"
              >
                <div className="flex items-start gap-6 mb-6">
                  <div className={`p-4 bg-${selectedProjectData.display_color || 'emerald'}-100 rounded-xl`}>
                    {(() => {
                      const Icon = getIconComponent(selectedProjectData.display_icon);
                      return <Icon className={`w-8 h-8 text-${selectedProjectData.display_color || 'emerald'}-600`} />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProjectData.name}</h2>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        {selectedProjectData.status || 'Active'}
                      </span>
                      {selectedPartnerObject && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                          <Building2 className="w-4 h-4" />
                          {selectedPartnerObject.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Project Overview</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProjectData.description}</p>
                </div>

                {/* Impact Metrics - ALL FROM DATABASE */}
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Impact Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Total Beneficiaries */}
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 uppercase">Total Reach</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-900">
                      {(selectedProjectData.direct_beneficiaries || 0).toLocaleString()}
                    </p>
                  </div>

                  {/* Meals Served */}
                  {(selectedProjectData.meals_served || 0) > 0 && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                        <span className="text-xs font-bold text-orange-700 uppercase">Meals</span>
                      </div>
                      <p className="text-2xl font-black text-orange-900">
                        {((selectedProjectData.meals_served || 0) / 1000).toFixed(1)}K
                      </p>
                    </div>
                  )}

                  {/* Pads Distributed */}
                  {(selectedProjectData.pads_distributed || 0) > 0 && (
                    <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-pink-600" />
                        <span className="text-xs font-bold text-pink-700 uppercase">Pads</span>
                      </div>
                      <p className="text-2xl font-black text-pink-900">
                        {((selectedProjectData.pads_distributed || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  )}

                  {/* Students Enrolled */}
                  {(selectedProjectData.students_enrolled || 0) > 0 && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700 uppercase">Students</span>
                      </div>
                      <p className="text-2xl font-black text-blue-900">
                        {(selectedProjectData.students_enrolled || 0).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Trees Planted */}
                  {(selectedProjectData.trees_planted || 0) > 0 && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-5 h-5 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase">Trees</span>
                      </div>
                      <p className="text-2xl font-black text-green-900">
                        {((selectedProjectData.trees_planted || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  )}

                  {/* Schools Renovated */}
                  {(selectedProjectData.schools_renovated || 0) > 0 && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderKanban className="w-5 h-5 text-purple-600" />
                        <span className="text-xs font-bold text-purple-700 uppercase">Schools</span>
                      </div>
                      <p className="text-2xl font-black text-purple-900">
                        {selectedProjectData.schools_renovated || '0'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Project Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg"
              >
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">PROJECT ID</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">PROJECT CODE</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.project_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">STATUS</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.status || 'Active'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">LOCATION</p>
                    <p className="text-gray-900 font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {selectedProjectData.location || 'India'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">STATE</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">TOTAL BUDGET</p>
                    <p className="text-gray-900 font-bold text-lg">₹{(selectedProjectData.total_budget || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">UTILIZED BUDGET</p>
                    <p className="text-gray-900 font-bold text-lg">₹{(selectedProjectData.utilized_budget || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">BUDGET REMAINING</p>
                    <p className="text-emerald-600 font-bold text-lg">
                      ₹{((selectedProjectData.total_budget || 0) - (selectedProjectData.utilized_budget || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">INDIRECT BENEFICIARIES</p>
                    <p className="text-gray-900 font-bold">{(selectedProjectData.indirect_beneficiaries || 0).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default AccountantDashboard;
