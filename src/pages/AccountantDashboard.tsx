import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Activity, CreditCard, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useFilteredData } from '../hooks/useFilteredData';
import { expenses, budgets, chartData } from '../mockData';

const AccountantDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { filterMode, aggregatedMetrics, hasFilters } = useFilteredData();

  // Calculate monthly financials from budgets
  const monthlyFinancials = useMemo(() => 
    chartData.monthlyProgress.slice(0, 6).map((item, index) => ({
      month: item.month,
      revenue: budgets.slice(index * 3, (index + 1) * 3).reduce((sum, b) => sum + b.allocatedAmount, 0) / 1000,
      expenses: budgets.slice(index * 3, (index + 1) * 3).reduce((sum, b) => sum + b.utilizedAmount, 0) / 1000,
      profit: (budgets.slice(index * 3, (index + 1) * 3).reduce((sum, b) => sum + b.allocatedAmount, 0) - 
               budgets.slice(index * 3, (index + 1) * 3).reduce((sum, b) => sum + b.utilizedAmount, 0)) / 1000
    }))
  , []);

  // Use expense distribution from chartData
  const expenseBreakdown = chartData.expenseDistribution.map((item, index) => ({
    name: item.name,
    value: Math.round((item.value / chartData.expenseDistribution.reduce((sum, e) => sum + e.value, 0)) * 100),
    color: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#14b8a6', '#0d9488', '#0f766e'][index] || '#10b981'
  }));

  // Get recent transactions from expenses
  const recentTransactions = expenses.slice(0, 5).map((expense, index) => ({
    id: index + 1,
    type: 'Expense',
    description: `${expense.category} - ${expense.merchantName}`,
    amount: -expense.totalAmount,
    date: expense.date,
    status: expense.status === 'Approved' ? 'completed' : 'pending',
    category: expense.category
  }));

  const totalRevenue = monthlyFinancials.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = monthlyFinancials.reduce((sum, item) => sum + item.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black tracking-tight mb-2">Financial Overview</h1>
            <p className="text-gray-600 text-lg">Track expenses, revenue, and financial health</p>
          </div>
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">{filterMode.label}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        {/* Revenue Card - Large */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 md:col-span-6 lg:col-span-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500"
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
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
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
          className="col-span-12 lg:col-span-4 bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
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
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
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
    </div>
  );
};

export default AccountantDashboard;
