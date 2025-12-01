import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Loader, FileText, Star, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react';
import { type Task } from '@/services/tasksService';
import { getUserById } from '@/services/usersService';
import { projectService } from '@/services/projectService';
import { supabase } from '@/services/supabaseClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Performance status types
type PerformanceStatus = 'early' | 'on_time' | 'late' | 'pending' | 'no_due_date';

interface TaskWithUser extends Task {
  assignedByName?: string;
  assignedToName?: string;
  projectName?: string;
  csrPartnerName?: string;
  csrPartnerId?: string;
  performanceStatus?: PerformanceStatus;
  daysVariance?: number; // positive = early, negative = late
  activityDate?: string;
  activityLabel?: string;
}

const getTodayString = () => new Date().toISOString().split('T')[0];
const getStartOfMonthString = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
};
const clampDateToToday = (value: string) => {
  const today = getTodayString();
  return value > today ? today : value;
};
const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};
const formatDateSectionLabel = (dateKey: string) => {
  if (dateKey === 'No Date') {
    return 'No Activity Date';
  }
  const parsed = new Date(dateKey);
  if (Number.isNaN(parsed.getTime())) {
    return 'Invalid Date';
  }
  const todayKey = getTodayString();
  const yesterdayKey = getYesterdayString();
  const formattedDate = parsed.toLocaleDateString();
  const dayName = parsed.toLocaleDateString(undefined, { weekday: 'long' });
  if (dateKey === todayKey) {
    return `Today · ${dayName} · ${formattedDate}`;
  }
  if (dateKey === yesterdayKey) {
    return `Yesterday · ${dayName} · ${formattedDate}`;
  }
  return `${dayName} · ${formattedDate}`;
};

const DailyReportPage = () => {
  const [dateRange, setDateRange] = useState({ start: getStartOfMonthString(), end: getTodayString() });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; project_code: string; csr_partner_id: string; toll_id?: string }>>([]);
  const [csrPartners, setCsrPartners] = useState<Array<{ id: string; name: string; has_toll: boolean }>>([]);
  const [tolls, setTolls] = useState<Array<{ id: string; toll_name: string }>>([]);
  
  // Filters
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCsrPartner, setSelectedCsrPartner] = useState<string>('');
  const [selectedToll, setSelectedToll] = useState<string>('');
  const [selectedPerformance, setSelectedPerformance] = useState<string>('');
  const [hasToll, setHasToll] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<Array<{ id: string; name: string; project_code: string; toll_id?: string }>>([]);

  // Calculate performance status based on due date and completion date
  const calculatePerformanceStatus = (task: Task): { status: PerformanceStatus; daysVariance: number } => {
    if (!task.due_date) {
      return { status: 'no_due_date', daysVariance: 0 };
    }

    if (task.status !== 'completed') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { status: 'pending', daysVariance: daysUntilDue };
    }

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const completedDate = new Date(task.completed_date || task.updated_at || new Date());
    completedDate.setHours(0, 0, 0, 0);

    const daysVariance = Math.ceil((dueDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysVariance > 0) {
      return { status: 'early', daysVariance };
    } else if (daysVariance === 0) {
      return { status: 'on_time', daysVariance: 0 };
    } else {
      return { status: 'late', daysVariance };
    }
  };

  // Get performance badge details
  const getPerformanceBadge = (status: PerformanceStatus, daysVariance: number) => {
    switch (status) {
      case 'early':
        return {
          icon: Star,
          label: `🌟 Excellent (${daysVariance} day${daysVariance !== 1 ? 's' : ''} early)`,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-300',
        };
      case 'on_time':
        return {
          icon: CheckCircle,
          label: '✅ On Time',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300',
        };
      case 'late':
        return {
          icon: AlertTriangle,
          label: `⚠️ Delayed (${Math.abs(daysVariance)} day${Math.abs(daysVariance) !== 1 ? 's' : ''} late)`,
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-300',
        };
      case 'pending':
        return {
          icon: Clock,
          label: daysVariance >= 0 
            ? `⏳ Pending (${daysVariance} day${daysVariance !== 1 ? 's' : ''} left)`
            : `⏳ Overdue (${Math.abs(daysVariance)} day${Math.abs(daysVariance) !== 1 ? 's' : ''})`,
          bgColor: daysVariance >= 0 ? 'bg-amber-100' : 'bg-orange-100',
          textColor: daysVariance >= 0 ? 'text-amber-700' : 'text-orange-700',
          borderColor: daysVariance >= 0 ? 'border-amber-300' : 'border-orange-300',
        };
      case 'no_due_date':
      default:
        return {
          icon: Clock,
          label: '📅 No Due Date',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
        };
    }
  };

  // Fetch CSR Partners with has_toll field
  const fetchCsrPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('csr_partners')
        .select('id, name, has_toll')
        .eq('is_active', true);
      if (error) throw error;
      setCsrPartners(data || []);
    } catch (error) {
      console.error('Error fetching CSR partners:', error);
      setCsrPartners([]);
    }
  };

  // Fetch Tolls for selected CSR Partner
  const fetchTollsForPartner = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true);
      if (error) throw error;
      setTolls(data || []);
    } catch (error) {
      console.error('Error fetching tolls:', error);
      setTolls([]);
    }
  };

  // Fetch Projects for selected CSR Partner (and optionally Toll)
  const fetchProjectsForPartner = async (partnerId: string, tollId?: string) => {
    try {
      let query = supabase
        .from('projects')
        .select('id, name, project_code, toll_id')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true);
      
      if (tollId) {
        query = query.eq('toll_id', tollId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setFilteredProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setFilteredProjects([]);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const projectList = await projectService.getAllProjects();
      setProjects(projectList.map(p => ({ id: p.id, name: p.name, project_code: p.project_code, csr_partner_id: p.csr_partner_id })));

      // Fetch CSR Partners with has_toll
      await fetchCsrPartners();
    };
    fetchInitialData();
  }, []);

  // Handle CSR Partner change - fetch tolls and projects
  useEffect(() => {
    if (selectedCsrPartner) {
      const partner = csrPartners.find(p => p.id === selectedCsrPartner);
      const partnerHasToll = partner?.has_toll || false;
      setHasToll(partnerHasToll);
      
      if (partnerHasToll) {
        fetchTollsForPartner(selectedCsrPartner);
      } else {
        setTolls([]);
        setSelectedToll('');
        fetchProjectsForPartner(selectedCsrPartner);
      }
      setSelectedProject('');
    } else {
      setHasToll(false);
      setTolls([]);
      setSelectedToll('');
      setFilteredProjects([]);
      setSelectedProject('');
    }
  }, [selectedCsrPartner, csrPartners]);

  // Handle Toll change - fetch projects for toll
  useEffect(() => {
    if (selectedCsrPartner && selectedToll) {
      fetchProjectsForPartner(selectedCsrPartner, selectedToll);
      setSelectedProject('');
    } else if (selectedCsrPartner && !hasToll) {
      // If no toll required, projects already loaded
    }
  }, [selectedToll, selectedCsrPartner, hasToll]);

  const fetchTasksData = useCallback(async (range?: { start: string; end: string }) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all tasks (not just completed) to show to-do list with performance tracking
      const { data: allTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('updated_at', { ascending: false });

      if (tasksError) throw tasksError;

      const activeRange = range ?? dateRange;
      // Filter by date range using due_date, completed_date, or updated_at
      const filteredTasks = (allTasks || []).filter((task) => {
        // Check if task falls within date range based on due_date or completed_date
        const dueDate = task.due_date;
        const completedDate = task.completed_date;
        const updatedDate = task.updated_at?.split('T')[0];
        
        // Include if due_date, completed_date, or updated_at falls in range
        const dateToCheck = completedDate || dueDate || updatedDate;
        if (!dateToCheck) return false;
        
        return dateToCheck >= activeRange.start && dateToCheck <= activeRange.end;
      });
      
      // Fetch user names, project names, and CSR partner info
      const tasksWithDetails = await Promise.all(
        filteredTasks.map(async (task) => {
          let assignedByName = 'N/A';
          let assignedToName = 'N/A';
          let projectName = 'N/A';
          let csrPartnerName = 'N/A';
          let csrPartnerId = '';
          const activityBase = task.completed_date || task.updated_at || task.due_date;
          const activityDate = activityBase ? activityBase.split('T')[0] : undefined;
          const activityLabel = activityDate
            ? (task.completed_date ? `Completed on ${new Date(activityDate).toLocaleDateString()}` : `Progress on ${new Date(activityDate).toLocaleDateString()}`)
            : 'No activity date';
          
          if (task.assigned_by) {
            const user = await getUserById(task.assigned_by);
            assignedByName = user?.full_name || 'Unknown';
          }
          
          if (task.assigned_to) {
            const user = await getUserById(task.assigned_to);
            assignedToName = user?.full_name || 'Unknown';
          }

          if (task.project_id) {
            const project = await projectService.getProjectById(task.project_id);
            projectName = project?.name || 'Unknown Project';
            csrPartnerId = project?.csr_partner_id || '';
            
            // Get CSR Partner name
            if (csrPartnerId) {
              const partner = csrPartners.find(p => p.id === csrPartnerId);
              csrPartnerName = partner?.name || 'Unknown Partner';
            }
          }

          // Calculate performance status
          const { status: performanceStatus, daysVariance } = calculatePerformanceStatus(task);
          
          return {
            ...task,
            assignedByName,
            assignedToName,
            projectName,
            csrPartnerName,
            csrPartnerId,
            performanceStatus,
            daysVariance,
            activityDate,
            activityLabel,
          };
        })
      );
          const sortedTasks = [...tasksWithDetails].sort((a, b) => {
            const aTime = a.activityDate ? new Date(a.activityDate).getTime() : 0;
            const bTime = b.activityDate ? new Date(b.activityDate).getTime() : 0;
            return bTime - aTime;
          });
      
      setTasks(sortedTasks);
      setFilteredTasks(sortedTasks);
    } catch (err) {
      setError('Failed to load task data');
      console.error('Error fetching task data:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, csrPartners]);

  useEffect(() => {
    fetchTasksData();
  }, [fetchTasksData]);

  // Apply filters whenever filter values or tasks change
  const sortByActivityDate = (list: TaskWithUser[]) => {
    return [...list].sort((a, b) => {
      const aTime = a.activityDate ? new Date(a.activityDate).getTime() : 0;
      const bTime = b.activityDate ? new Date(b.activityDate).getTime() : 0;
      return bTime - aTime;
    });
  };

  useEffect(() => {
    let result = [...tasks];

    // Filter by CSR Partner
    if (selectedCsrPartner) {
      result = result.filter(task => task.csrPartnerId === selectedCsrPartner);
    }

    // Filter by Project
    if (selectedProject) {
      result = result.filter(task => task.project_id === selectedProject);
    }

    // Filter by Performance Status
    if (selectedPerformance) {
      result = result.filter(task => task.performanceStatus === selectedPerformance);
    }

    setFilteredTasks(sortByActivityDate(result));
  }, [tasks, selectedProject, selectedCsrPartner, selectedPerformance]);

  const handleApplyDateRange = () => {
    const clampedEnd = clampDateToToday(dateRange.end);
    const newRange = { start: dateRange.start, end: clampedEnd };
    setDateRange(newRange);
    fetchTasksData(newRange);
  };

  const handleClearFilters = () => {
    setSelectedProject('');
    setSelectedCsrPartner('');
    setSelectedToll('');
    setSelectedPerformance('');
    setHasToll(false);
    setTolls([]);
    setFilteredProjects([]);
  };

  // Handle card click to filter by performance
  const handleCardClick = (performanceType: string) => {
    if (selectedPerformance === performanceType) {
      setSelectedPerformance('');
    } else {
      setSelectedPerformance(performanceType);
    }
  };

  const groupedTasks = useMemo(() => {
    const map = new Map<string, TaskWithUser[]>();
    filteredTasks.forEach((task) => {
      const key = task.activityDate || 'No Date';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(task);
    });
    return map;
  }, [filteredTasks]);
  const groupedEntries = useMemo(() => Array.from(groupedTasks.entries()), [groupedTasks]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Daily Task Report - To-Do List', 14, 20);
    
    // Add date range
    doc.setFontSize(11);
    doc.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 14, 30);
    
    // Add filter info
    let filterText = 'Filters: ';
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      filterText += `Project: ${project?.name || 'N/A'}, `;
    }
    if (selectedCsrPartner) {
      const partner = csrPartners.find(p => p.id === selectedCsrPartner);
      filterText += `CSR Partner: ${partner?.name || 'N/A'}, `;
    }
    if (selectedPerformance) {
      filterText += `Performance: ${selectedPerformance}, `;
    }
    if (filterText !== 'Filters: ') {
      doc.text(filterText.slice(0, -2), 14, 38);
    }
    
    // Prepare table data with performance info
    const tableData = filteredTasks.map((task) => {
      const badge = getPerformanceBadge(task.performanceStatus || 'no_due_date', task.daysVariance || 0);
      return [
        task.title,
        task.projectName || 'N/A',
        task.csrPartnerName || 'N/A',
        task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
        task.completed_date ? new Date(task.completed_date).toLocaleDateString() : 'N/A',
        task.status.replace(/_/g, ' ').toUpperCase(),
        badge.label.replace(/[🌟✅⚠️⏳📅]/g, '').trim(),
        task.assignedToName || 'N/A',
      ];
    });
    
    // Add table
    autoTable(doc, {
      head: [['Task Name', 'Project', 'CSR Partner', 'Due Date', 'Completed', 'Status', 'Performance', 'Assigned To']],
      body: tableData,
      startY: selectedProject || selectedCsrPartner || selectedPerformance ? 45 : 40,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [16, 185, 129] },
    });
    
    doc.save(`daily-report-${dateRange.start}-to-${dateRange.end}.pdf`);
    setShowExportOptions(false);
  };

  const handleExportExcel = () => {
    const exportData = filteredTasks.map((task) => {
      const badge = getPerformanceBadge(task.performanceStatus || 'no_due_date', task.daysVariance || 0);
      return {
        'Task Name': task.title,
        'Description': task.description || '',
        'Project': task.projectName || 'N/A',
        'CSR Partner': task.csrPartnerName || 'N/A',
        'Due Date': task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
        'Completed Date': task.completed_date ? new Date(task.completed_date).toLocaleDateString() : 'N/A',
        'Status': task.status.replace(/_/g, ' ').toUpperCase(),
        'Performance': badge.label.replace(/[🌟✅⚠️⏳📅]/g, '').trim(),
        'Days Variance': task.daysVariance || 0,
        'Assigned To': task.assignedToName || 'N/A',
        'Assigned By': task.assignedByName || 'N/A',
        'Priority': task.priority || 'N/A',
        'Completion %': task.completion_percentage || 0,
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
    XLSX.writeFile(wb, `daily-report-${dateRange.start}-to-${dateRange.end}.xlsx`);
    setShowExportOptions(false);
  };

  const handleExportCSV = () => {
    const exportData = filteredTasks.map((task) => {
      const badge = getPerformanceBadge(task.performanceStatus || 'no_due_date', task.daysVariance || 0);
      return {
        'Task Name': task.title,
        'Description': task.description || '',
        'Project': task.projectName || 'N/A',
        'CSR Partner': task.csrPartnerName || 'N/A',
        'Due Date': task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
        'Completed Date': task.completed_date ? new Date(task.completed_date).toLocaleDateString() : 'N/A',
        'Status': task.status.replace(/_/g, ' ').toUpperCase(),
        'Performance': badge.label.replace(/[🌟✅⚠️⏳📅]/g, '').trim(),
        'Days Variance': task.daysVariance || 0,
        'Assigned To': task.assignedToName || 'N/A',
        'Assigned By': task.assignedByName || 'N/A',
        'Priority': task.priority || 'N/A',
        'Completion %': task.completion_percentage || 0,
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `daily-report-${dateRange.start}-to-${dateRange.end}.csv`;
    link.click();
    setShowExportOptions(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'Completed':
      case 'COMPLETED':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'in_progress':
      case 'In Progress':
      case 'INPROGRESS':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'not_started':
      case 'Not Started':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Report - To-Do List</h1>
          <p className="text-gray-600 mt-2">
            Sorted from today backwards, showing tasks completed or progressed on each date.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>EXPORT</span>
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <button 
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                >
                  Export as PDF
                </button>
                <button 
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  Export as Excel
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
                >
                  Export as CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filter by Date Range</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-32 focus:outline-none font-medium"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: clampDateToToday(e.target.value) }))}
                className="w-32 focus:outline-none font-medium"
              />
            </div>
            <button onClick={handleApplyDateRange} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium">
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section - CSR Partner, Toll, Project, Performance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* CSR Partner Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CSR Partner</label>
            <select
              value={selectedCsrPartner}
              onChange={(e) => setSelectedCsrPartner(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All CSR Partners</option>
              {csrPartners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toll Filter - Conditional */}
          {hasToll && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Toll</label>
              <select
                value={selectedToll}
                onChange={(e) => setSelectedToll(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Tolls</option>
                {tolls.map((toll) => (
                  <option key={toll.id} value={toll.id}>
                    {toll.toll_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Projects</option>
              {(selectedCsrPartner ? filteredProjects : projects).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_code} - {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Performance Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Performance</label>
            <select
              value={selectedPerformance}
              onChange={(e) => setSelectedPerformance(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Performance</option>
              <option value="early">🌟 Excellent (Early)</option>
              <option value="on_time">✅ On Time</option>
              <option value="late">⚠️ Delayed (Late)</option>
              <option value="pending">⏳ Pending</option>
              <option value="no_due_date">📅 No Due Date</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Performance Summary Stats - Clickable */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div 
            onClick={() => handleCardClick('early')}
            className={`rounded-lg p-4 text-center border cursor-pointer transition-all hover:shadow-md ${
              selectedPerformance === 'early' 
                ? 'bg-green-200 border-green-400 ring-2 ring-green-500' 
                : 'bg-green-50 border-green-200 hover:bg-green-100'
            }`}
          >
            <div className="text-2xl font-bold text-green-700">
              {filteredTasks.filter(t => t.performanceStatus === 'early').length}
            </div>
            <div className="text-sm text-green-600">🌟 Excellent</div>
          </div>
          <div 
            onClick={() => handleCardClick('on_time')}
            className={`rounded-lg p-4 text-center border cursor-pointer transition-all hover:shadow-md ${
              selectedPerformance === 'on_time' 
                ? 'bg-blue-200 border-blue-400 ring-2 ring-blue-500' 
                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <div className="text-2xl font-bold text-blue-700">
              {filteredTasks.filter(t => t.performanceStatus === 'on_time').length}
            </div>
            <div className="text-sm text-blue-600">✅ On Time</div>
          </div>
          <div 
            onClick={() => handleCardClick('late')}
            className={`rounded-lg p-4 text-center border cursor-pointer transition-all hover:shadow-md ${
              selectedPerformance === 'late' 
                ? 'bg-red-200 border-red-400 ring-2 ring-red-500' 
                : 'bg-red-50 border-red-200 hover:bg-red-100'
            }`}
          >
            <div className="text-2xl font-bold text-red-700">
              {filteredTasks.filter(t => t.performanceStatus === 'late').length}
            </div>
            <div className="text-sm text-red-600">⚠️ Delayed</div>
          </div>
          <div 
            onClick={() => handleCardClick('pending')}
            className={`rounded-lg p-4 text-center border cursor-pointer transition-all hover:shadow-md ${
              selectedPerformance === 'pending' 
                ? 'bg-amber-200 border-amber-400 ring-2 ring-amber-500' 
                : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <div className="text-2xl font-bold text-amber-700">
              {filteredTasks.filter(t => t.performanceStatus === 'pending').length}
            </div>
            <div className="text-sm text-amber-600">⏳ Pending</div>
          </div>
          <div 
            onClick={() => handleCardClick('no_due_date')}
            className={`rounded-lg p-4 text-center border cursor-pointer transition-all hover:shadow-md ${
              selectedPerformance === 'no_due_date' 
                ? 'bg-gray-200 border-gray-400 ring-2 ring-gray-500' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="text-2xl font-bold text-gray-700">
              {filteredTasks.filter(t => t.performanceStatus === 'no_due_date').length}
            </div>
            <div className="text-sm text-gray-600">📅 No Due Date</div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>

      {/* Task List - Card Style */}
      <div className="space-y-6">
        {groupedEntries.length > 0 ? (
          groupedEntries.map(([dateKey, tasksForDate]) => (
            <div key={dateKey} className="space-y-4">
              <div className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {formatDateSectionLabel(dateKey)}
              </div>
              <div className="space-y-4">
                {tasksForDate.map((task, index) => {
                  const performanceBadge = getPerformanceBadge(task.performanceStatus || 'no_due_date', task.daysVariance || 0);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${performanceBadge.bgColor} ${performanceBadge.textColor} border ${performanceBadge.borderColor}`}>
                            {performanceBadge.label}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}
                        {task.activityLabel && (
                          <p className="text-xs text-gray-500 mb-3">{task.activityLabel}</p>
                        )}
                        <div className="flex items-center flex-wrap gap-4 mb-4">
                          {task.projectName && (
                            <p className="text-sm text-teal-600 font-medium">
                              <FileText className="w-4 h-4 inline mr-1" />
                              Project: {task.projectName}
                            </p>
                          )}
                          {task.csrPartnerName && task.csrPartnerName !== 'N/A' && (
                            <p className="text-sm text-purple-600 font-medium">
                              🏢 CSR Partner: {task.csrPartnerName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-4 mb-4 text-sm text-gray-500">
                          {task.due_date && (
                            <span>📅 Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                          {task.completed_date && (
                            <span>✅ Completed: {new Date(task.completed_date).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-3">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(task.status)}`}>
                            {task.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">ASSIGNED BY:</span>
                            <span className="px-4 py-2 bg-white border-2 border-gray-900 rounded-full text-sm font-bold">
                              {task.assignedByName || 'N/A'}
                            </span>
                          </div>
                          {task.assignedToName && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500">ASSIGNED TO:</span>
                              <span className="px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-300 rounded-full text-sm font-bold">
                                {task.assignedToName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No tasks found for the selected filters</p>
            <p className="text-sm">Try adjusting your date range or filters</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default DailyReportPage;
