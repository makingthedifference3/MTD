import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  X, 
  ExternalLink, 
  Download, 
  Search,
  Receipt,
  FileImage,
  Eye,
  Filter,
  XCircle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { projectExpensesService } from '../services/projectExpensesService';
import type { ProjectExpense } from '../services/projectExpensesService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface CSRPartner {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  csr_partner_id?: string;
}

interface UserMap {
  [key: string]: string;
}

// Extended expense type to include bill links
interface ExpenseWithBills extends ProjectExpense {
  bill_drive_link?: string;
  invoice_drive_link?: string;
  receipt_drive_link?: string;
  bill_bucket_path?: string;
  invoice_bucket_path?: string;
  receipt_bucket_path?: string;
}

const Bills: React.FC = () => {
  // Data states
  const [expenses, setExpenses] = useState<ExpenseWithBills[]>([]);
  const [csrPartners, setCsrPartners] = useState<CSRPartner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCSRPartner, setSelectedCSRPartner] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithBills | null>(null);
  const [selectedBillUrl, setSelectedBillUrl] = useState<string>('');
  const [billType, setBillType] = useState<string>('');
  const [bucketFiles, setBucketFiles] = useState<{name: string; url: string}[]>([]);

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [expensesData, partnersData, projectsData, usersData] = await Promise.all([
        fetchExpenses(),
        fetchCSRPartners(),
        fetchProjects(),
        fetchUsers()
      ]);
      
      setExpenses(expensesData);
      setCsrPartners(partnersData);
      setProjects(projectsData);
      setUserMap(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (): Promise<ExpenseWithBills[]> => {
    try {
      const data = await projectExpensesService.getAllExpenses();
      return data as ExpenseWithBills[];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
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
        .select('id, name, csr_partner_id')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
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

  const fetchBucketFilesForExpense = async (expenseId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('MTD_Bills')
        .list(`expenses/${expenseId}`);

      if (error) throw error;

      const files = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('MTD_Bills')
            .getPublicUrl(`expenses/${expenseId}/${file.name}`);
          return {
            name: file.name,
            url: urlData.publicUrl
          };
        })
      );
      
      return files;
    } catch (error) {
      console.error('Error fetching bucket files:', error);
      return [];
    }
  };

  // Filter projects based on selected CSR Partner
  const filteredProjects = useMemo(() => {
    if (!selectedCSRPartner) return projects;
    return projects.filter(p => p.csr_partner_id === selectedCSRPartner);
  }, [projects, selectedCSRPartner]);

  // Get unique categories from expenses
  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map(e => e.category).filter(Boolean)));
  }, [expenses]);

  // Apply all filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // CSR Partner filter via project
      if (selectedCSRPartner) {
        const project = projects.find(p => p.id === expense.project_id);
        if (!project || project.csr_partner_id !== selectedCSRPartner) return false;
      }
      
      // Project filter
      if (selectedProject && expense.project_id !== selectedProject) return false;
      
      // Category filter
      if (selectedCategory && expense.category !== selectedCategory) return false;
      
      // Status filter
      if (selectedStatus && expense.status !== selectedStatus) return false;
      
      // Date range filter
      if (startDate && new Date(expense.date) < new Date(startDate)) return false;
      if (endDate && new Date(expense.date) > new Date(endDate)) return false;
      
      // Search query
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesCode = expense.expense_code?.toLowerCase().includes(search);
        const matchesMerchant = expense.merchant_name?.toLowerCase().includes(search);
        const matchesCategory = expense.category?.toLowerCase().includes(search);
        const matchesDescription = expense.description?.toLowerCase().includes(search);
        if (!matchesCode && !matchesMerchant && !matchesCategory && !matchesDescription) return false;
      }
      
      return true;
    });
  }, [expenses, selectedCSRPartner, selectedProject, selectedCategory, selectedStatus, startDate, endDate, searchQuery, projects]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredExpenses.length;
    const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.total_amount || 0), 0);
    const pendingCount = filteredExpenses.filter(e => e.status === 'pending' || e.status === 'submitted').length;
    const approvedCount = filteredExpenses.filter(e => e.status === 'approved').length;
    const paidCount = filteredExpenses.filter(e => e.status === 'paid').length;
    
    return { total, totalAmount, pendingCount, approvedCount, paidCount };
  }, [filteredExpenses]);

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  // Handle view expense details
  const handleViewExpense = async (expense: ExpenseWithBills) => {
    setSelectedExpense(expense);
    const files = await fetchBucketFilesForExpense(expense.id);
    setBucketFiles(files);
    setShowViewModal(true);
  };

  // Handle view bill/document
  const handleViewBill = (url: string, type: string) => {
    setSelectedBillUrl(url);
    setBillType(type);
    setShowBillModal(true);
  };

  // Open drive link in new tab
  const openDriveLink = (url: string) => {
    window.open(url, '_blank');
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCSRPartner('');
    setSelectedProject('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSearchQuery('');
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Bills & Expenses Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

    const tableData = filteredExpenses.map(expense => [
      expense.expense_code || '',
      expense.merchant_name || '',
      expense.category || '',
      `₹${(expense.total_amount || 0).toLocaleString()}`,
      new Date(expense.date).toLocaleDateString(),
      getProjectName(expense.project_id),
      expense.status
    ]);

    autoTable(doc, {
      head: [['Expense Code', 'Merchant', 'Category', 'Amount', 'Date', 'Project', 'Status']],
      body: tableData,
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`bills_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredExpenses.map(expense => ({
      'Expense Code': expense.expense_code,
      'Merchant': expense.merchant_name,
      'Category': expense.category,
      'Amount': expense.total_amount,
      'Date': new Date(expense.date).toLocaleDateString(),
      'Project': getProjectName(expense.project_id),
      'Status': expense.status,
      'Description': expense.description,
      'Payment Method': expense.payment_method,
      'Submitted By': expense.submitted_by ? userMap[expense.submitted_by] || 'Unknown' : 'N/A',
      'Bill Link': expense.bill_drive_link || '',
      'Invoice Link': expense.invoice_drive_link || '',
      'Receipt Link': expense.receipt_drive_link || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bills');
    XLSX.writeFile(wb, `bills_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const data = filteredExpenses.map(expense => ({
      'Expense Code': expense.expense_code,
      'Merchant': expense.merchant_name,
      'Category': expense.category,
      'Amount': expense.total_amount,
      'Date': new Date(expense.date).toLocaleDateString(),
      'Project': getProjectName(expense.project_id),
      'Status': expense.status,
      'Description': expense.description,
      'Bill Link': expense.bill_drive_link || '',
      'Invoice Link': expense.invoice_drive_link || '',
      'Receipt Link': expense.receipt_drive_link || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bills_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bills & Expenses</h1>
        <p className="text-gray-600 mt-2">View and manage all expense bills and documents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.approvedCount}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-2xl font-bold text-blue-600">{stats.paidCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* CSR Partner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CSR Partner</label>
            <select
              value={selectedCSRPartner}
              onChange={(e) => {
                setSelectedCSRPartner(e.target.value);
                setSelectedProject('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">All CSR Partners</option>
              {csrPartners.map(partner => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">All Projects</option>
              {filteredProjects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Search & Actions Row */}
        <div className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by expense code, merchant, category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bills Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expense Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Documents</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {expenses.length === 0 ? "No expenses found." : "No expenses match the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense, index) => (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-emerald-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.expense_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.merchant_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{(expense.total_amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getProjectName(expense.project_id)}</td>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {expense.bill_drive_link && (
                          <button
                            onClick={() => openDriveLink(expense.bill_drive_link!)}
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-xs font-medium"
                            title="View Bill"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        {expense.invoice_drive_link && (
                          <button
                            onClick={() => openDriveLink(expense.invoice_drive_link!)}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-medium"
                            title="View Invoice"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                        {expense.receipt_drive_link && (
                          <button
                            onClick={() => openDriveLink(expense.receipt_drive_link!)}
                            className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-xs font-medium"
                            title="View Receipt"
                          >
                            <FileImage className="w-4 h-4" />
                          </button>
                        )}
                        {!expense.bill_drive_link && !expense.invoice_drive_link && !expense.receipt_drive_link && (
                          <span className="text-gray-400 text-xs">No docs</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewExpense(expense)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination info */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </p>
        </div>
      </motion.div>

      {/* View Expense Details Modal */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Expense Details</h2>
                <p className="text-emerald-100 mt-1">{selectedExpense.expense_code}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
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
                  <p className="text-gray-900 font-semibold mt-1 text-2xl">₹{(selectedExpense.total_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-gray-900 font-semibold mt-1">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Project</label>
                  <p className="text-gray-900 font-semibold mt-1">{getProjectName(selectedExpense.project_id)}</p>
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
                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted By</label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {selectedExpense.submitted_by ? userMap[selectedExpense.submitted_by] || 'Unknown' : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedExpense.description && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 mt-1">{selectedExpense.description}</p>
                </div>
              )}

              {selectedExpense.status === 'rejected' && selectedExpense.rejection_reason && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-red-800">Rejection Reason</label>
                  <p className="text-red-700 mt-1">{selectedExpense.rejection_reason}</p>
                </div>
              )}

              {/* Documents Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents & Attachments</h3>
                
                {/* Drive Links */}
                <div className="space-y-3 mb-4">
                  {selectedExpense.bill_drive_link && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-900">Bill Document</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewBill(selectedExpense.bill_drive_link!, 'Bill')}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => openDriveLink(selectedExpense.bill_drive_link!)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedExpense.invoice_drive_link && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Receipt className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">Invoice Document</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewBill(selectedExpense.invoice_drive_link!, 'Invoice')}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => openDriveLink(selectedExpense.invoice_drive_link!)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedExpense.receipt_drive_link && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <FileImage className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900">Receipt Document</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewBill(selectedExpense.receipt_drive_link!, 'Receipt')}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => openDriveLink(selectedExpense.receipt_drive_link!)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bucket Files */}
                {bucketFiles.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Uploaded Files (Storage)</h4>
                    <div className="space-y-2">
                      {bucketFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-200 p-2 rounded-lg">
                              <FileImage className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{file.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewBill(file.url, file.name)}
                              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => openDriveLink(file.url)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Open
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedExpense.bill_drive_link && !selectedExpense.invoice_drive_link && !selectedExpense.receipt_drive_link && bucketFiles.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No documents attached to this expense</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bill Preview Modal */}
      {showBillModal && selectedBillUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-6 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold">{billType || 'Document'} Preview</h2>
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setSelectedBillUrl('');
                  setBillType('');
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {selectedBillUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedBillUrl}
                  className="w-full h-[600px] border border-gray-300 rounded-lg"
                  title={billType || 'Document'}
                />
              ) : selectedBillUrl.includes('drive.google.com') ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">This is a Google Drive link. Click below to open in a new tab.</p>
                  <button
                    onClick={() => openDriveLink(selectedBillUrl)}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open in Google Drive
                  </button>
                </div>
              ) : (
                <img
                  src={selectedBillUrl}
                  alt={billType || 'Document'}
                  className="w-full h-auto rounded-lg max-h-[600px] object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '';
                    e.currentTarget.alt = 'Failed to load image';
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Bills;

