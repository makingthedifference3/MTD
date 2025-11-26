import { motion } from 'framer-motion';
import { IndianRupee, Loader, TrendingUp, TrendingDown, Building2, FolderKanban } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectService, type Project } from '@/services/projectService';
import { getAllCSRPartners, type CSRPartner } from '@/services/csrPartnersService';

interface ProjectBudget {
  id: string;
  projectName: string;
  projectCode: string;
  csrPartnerName: string;
  allocatedAmount: number;
  utilizedAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
}

interface BudgetStats {
  totalAllocated: number;
  totalUtilized: number;
  totalAvailable: number;
  overallUtilizationPercentage: number;
}

const CSRBudgetPage = () => {
  const [projectBudgets, setProjectBudgets] = useState<ProjectBudget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<ProjectBudget[]>([]);
  const [stats, setStats] = useState<BudgetStats>({
    totalAllocated: 0,
    totalUtilized: 0,
    totalAvailable: 0,
    overallUtilizationPercentage: 0,
  });
  const [csrPartners, setCsrPartners] = useState<CSRPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; project: ProjectBudget | null; type: 'allocated' | 'utilized' | null }>({ 
    open: false, 
    project: null, 
    type: null 
  });
  const [adjustAmount, setAdjustAmount] = useState<string>('');

  useEffect(() => {
    fetchBudgetData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedPartner, selectedProject, projectBudgets]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch projects and CSR partners
      const [projects, partners] = await Promise.all([
        projectService.getAllProjects(),
        getAllCSRPartners(),
      ]);

      setCsrPartners(partners);

      // Create a map of CSR partner names
      const partnerMap = new Map(partners.map(p => [p.id, p.name]));

      // Transform projects into budget data
      const budgets: ProjectBudget[] = projects.map(project => ({
        id: project.id,
        projectName: project.name,
        projectCode: project.project_code,
        csrPartnerName: partnerMap.get(project.csr_partner_id) || 'Unknown Partner',
        allocatedAmount: project.total_budget || 0,
        utilizedAmount: project.utilized_budget || 0,
        remainingAmount: (project.total_budget || 0) - (project.utilized_budget || 0),
        utilizationPercentage: project.total_budget > 0 
          ? Math.round((project.utilized_budget / project.total_budget) * 100) 
          : 0,
      }));

      setProjectBudgets(budgets);
      calculateStats(budgets);
    } catch (err) {
      setError('Failed to load budget data');
      console.error('Error fetching budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (budgets: ProjectBudget[]) => {
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
    const totalUtilized = budgets.reduce((sum, b) => sum + b.utilizedAmount, 0);
    const totalAvailable = totalAllocated - totalUtilized;
    const overallUtilizationPercentage = totalAllocated > 0 
      ? Math.round((totalUtilized / totalAllocated) * 100) 
      : 0;

    setStats({
      totalAllocated,
      totalUtilized,
      totalAvailable,
      overallUtilizationPercentage,
    });
  };

  const applyFilters = () => {
    let filtered = [...projectBudgets];

    if (selectedPartner !== 'all') {
      filtered = filtered.filter(b => {
        const partner = csrPartners.find(p => p.name === selectedPartner);
        return partner && b.csrPartnerName === partner.name;
      });
    }

    if (selectedProject !== 'all') {
      filtered = filtered.filter(b => b.id === selectedProject);
    }

    setFilteredBudgets(filtered);
    calculateStats(filtered);
  };

  const handleAdjustBudget = async () => {
    if (!adjustModal.project || !adjustModal.type || !adjustAmount) return;

    try {
      const amount = parseFloat(adjustAmount);
      if (isNaN(amount)) {
        alert('Please enter a valid amount');
        return;
      }

      const project = adjustModal.project;
      const updates: Partial<Project> = {};

      if (adjustModal.type === 'allocated') {
        const newAllocated = project.allocatedAmount + amount;
        updates.total_budget = newAllocated;
        updates.completion_percentage = newAllocated > 0 
          ? Math.round(Math.min((project.utilizedAmount / newAllocated) * 100, 100))
          : 0;
      } else if (adjustModal.type === 'utilized') {
        const newUtilized = project.utilizedAmount + amount;
        updates.utilized_budget = newUtilized;
        updates.completion_percentage = project.allocatedAmount > 0 
          ? Math.round(Math.min((newUtilized / project.allocatedAmount) * 100, 100))
          : 0;
      }

      await projectService.updateProject(project.id, updates);

      // Refresh data
      await fetchBudgetData();

      // Close modal
      setAdjustModal({ open: false, project: null, type: null });
      setAdjustAmount('');
    } catch (err) {
      console.error('Error adjusting budget:', err);
      alert('Failed to adjust budget');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const displayBudgets = filteredBudgets.length > 0 ? filteredBudgets : projectBudgets;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">CSR Budget Utilization</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CSR Partner Filter */}
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-teal-600" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">CSR Partner</label>
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Overall (All Partners)</option>
                {csrPartners.map(partner => (
                  <option key={partner.id} value={partner.name}>{partner.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-3">
            <FolderKanban className="w-5 h-5 text-teal-600" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={selectedPartner === 'all' && projectBudgets.length === 0}
              >
                <option value="all">Select Partner First</option>
                {displayBudgets.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.projectCode} - {project.projectName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-600 font-semibold">Total Allocated</p>
            <IndianRupee className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">₹{(stats.totalAllocated / 100000).toFixed(2)}L</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-emerald-600 font-semibold">Total Utilized</p>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900">₹{(stats.totalUtilized / 100000).toFixed(2)}L</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-600 font-semibold">Total Available</p>
            <TrendingDown className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">₹{(stats.totalAvailable / 100000).toFixed(2)}L</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-600 font-semibold">Utilization Rate</p>
            <div className="text-purple-600 font-bold">{stats.overallUtilizationPercentage}%</div>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-3 mt-3">
            <div
              className="bg-purple-600 rounded-full h-3 transition-all duration-500"
              style={{ width: `${stats.overallUtilizationPercentage}%` }}
            ></div>
          </div>
        </motion.div>
      </div>

      {/* Project Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayBudgets.length > 0 ? (
          displayBudgets.map((budget, index) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{budget.projectName}</h3>
                  <p className="text-xs text-gray-500">{budget.projectCode}</p>
                  <p className="text-xs text-teal-600 font-medium mt-1">{budget.csrPartnerName}</p>
                </div>
                <IndianRupee className="w-6 h-6 text-emerald-500" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Allocated</span>
                  <span className="font-bold text-gray-900">₹{(budget.allocatedAmount / 100000).toFixed(2)}L</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Utilized</span>
                  <span className="font-bold text-emerald-600">₹{(budget.utilizedAmount / 100000).toFixed(2)}L</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="font-bold text-green-600">₹{(budget.remainingAmount / 100000).toFixed(2)}L</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className={`rounded-full h-2 transition-all duration-500 ${
                      budget.utilizationPercentage > 80 ? 'bg-red-500' :
                      budget.utilizationPercentage > 60 ? 'bg-yellow-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(budget.utilizationPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">{budget.utilizationPercentage}% Utilized</p>

                {/* Adjustment Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setAdjustModal({ open: true, project: budget, type: 'allocated' })}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <IndianRupee className="w-3 h-3" />
                    Adjust Budget
                  </button>
                  <button 
                    onClick={() => setAdjustModal({ open: true, project: budget, type: 'utilized' })}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Adjust Used
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <IndianRupee className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No budget data available</p>
            <p className="text-sm">Please select a partner or project to view budget information</p>
          </div>
        )}
      </div>

      {/* Adjust Budget Modal */}
      {adjustModal.open && adjustModal.project && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {adjustModal.type === 'allocated' ? 'Adjust Allocated Budget' : 'Adjust Utilized Budget'}
            </h3>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Project: <span className="font-semibold text-gray-900">{adjustModal.project.projectName}</span></p>
              <p className="text-sm text-gray-600 mb-2">Current {adjustModal.type === 'allocated' ? 'Allocated' : 'Utilized'}: 
                <span className="font-semibold text-gray-900"> ₹{((adjustModal.type === 'allocated' ? adjustModal.project.allocatedAmount : adjustModal.project.utilizedAmount) / 100000).toFixed(2)}L</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to {adjustAmount.startsWith('-') ? 'Decrease' : 'Increase'} (₹)
              </label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter amount (use negative for decrease)"
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: Enter a negative number (e.g., -50000) to decrease
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setAdjustModal({ open: false, project: null, type: null });
                  setAdjustAmount('');
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustBudget}
                className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
              >
                Apply Adjustment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CSRBudgetPage;
