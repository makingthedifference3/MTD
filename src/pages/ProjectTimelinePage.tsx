import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, CheckCircle2, Clock, Loader, Trash2, Edit2, X, Save,
  ChevronRight, Target, BarChart3, FolderKanban, Check, Circle,
  ArrowLeft, Building2, MapPin
} from 'lucide-react';
import { useFilter } from '../context/useFilter';
import type { Project } from '../services/filterService';
import type { Toll } from '../services/tollsService';
import { supabase } from '../services/supabaseClient';
import {
  type ProjectActivity,
  type ProjectActivityWithDetails,
  type ActivityStats,
  getActivitiesByProject,
  getActivityStats,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityItems,
  createActivityItem,
  toggleItemCompletion,
  deleteActivityItem,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
} from '../services/projectActivitiesService';

const ProjectTimelinePage = () => {
  const { 
    csrPartners, 
    filteredProjects, 
    tolls,
    selectedPartner,
    selectedToll,
    selectedProject: _selectedProject,
    setSelectedPartner,
    setSelectedToll,
    setSelectedProject,
    isLoading: filtersLoading,
  } = useFilter();
  
  // Use _selectedProject if needed for filter sync
  void _selectedProject;
  
  // View mode: partners -> tolls -> folders -> projects -> activities
  const [viewMode, setViewMode] = useState<'partners' | 'tolls' | 'folders' | 'projects' | 'activities'>('partners');
  const [selectedPartnerData, setSelectedPartnerData] = useState<{ id: string; name: string } | null>(null);
  const [selectedTollData, setSelectedTollData] = useState<Toll | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedProjectData, setSelectedProjectData] = useState<Project | null>(null);
  
  // Activities state
  const [activities, setActivities] = useState<ProjectActivityWithDetails[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    onHold: 0,
    overallCompletion: 0,
  });
  const [loading, setLoading] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ProjectActivityWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as ProjectActivity['priority'],
    start_date: '',
    end_date: '',
    responsible_person: '',
  });
  
  // Team members state
  const [teamMembers, setTeamMembers] = useState<Array<{ user_id: string; full_name: string; role: string }>>([]);
  
  // Description items (checkable points)
  const [descriptionItems, setDescriptionItems] = useState<{ text: string; isCompleted: boolean }[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  // Get tolls for selected partner
  const partnerTolls = tolls.filter(t => t.csr_partner_id === selectedPartner);

  // Get projects for selected partner/toll
  const getProjectsForView = useCallback(() => {
    if (selectedToll) {
      return filteredProjects.filter(p => p.toll_id === selectedToll);
    }
    if (selectedPartner) {
      return filteredProjects.filter(p => p.csr_partner_id === selectedPartner);
    }
    return [];
  }, [filteredProjects, selectedPartner, selectedToll]);

  // Group projects by name (similar to PMDashboard)
  const groupedProjects = useCallback(() => {
    const projectsToGroup = getProjectsForView();
    const grouped = projectsToGroup.reduce<Record<string, {
      projects: Project[];
      activeCount: number;
      completedCount: number;
    }>>((acc, project) => {
      const key = (project.name || 'Untitled Project').trim();
      if (!acc[key]) {
        acc[key] = {
          projects: [],
          activeCount: 0,
          completedCount: 0,
        };
      }

      acc[key].projects.push(project);
      if (project.status === 'completed') {
        acc[key].completedCount += 1;
      } else {
        acc[key].activeCount += 1;
      }

      return acc;
    }, {});

    return Object.entries(grouped).map(([name, data]) => ({
      name,
      ...data,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [getProjectsForView]);

  // Fetch team members for the selected project
  const fetchTeamMembers = useCallback(async () => {
    if (!selectedProjectData) return;
    
    try {
      const { data, error } = await supabase
        .from('project_team_members')
        .select(`
          user_id,
          role,
          roles,
          users!project_team_members_user_id_fkey(full_name)
        `)
        .eq('project_id', selectedProjectData.id)
        .eq('is_active', true);
      
      if (error) throw error;
      
      const members = data?.map(member => {
        // Get role from either the 'role' field or first item in 'roles' array
        let displayRole = member.role || 'Team Member';
        if (!member.role && member.roles && Array.isArray(member.roles) && member.roles.length > 0) {
          // Convert role to proper display format (e.g., "project_manager" -> "Project Manager")
          displayRole = member.roles[0]
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        
        return {
          user_id: member.user_id,
          full_name: (member.users as any).full_name,
          role: displayRole
        };
      }) || [];
      
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    }
  }, [selectedProjectData]);

  // Load activities when project is selected
  const loadActivities = useCallback(async () => {
    if (!selectedProjectData) return;
    
    setLoading(true);
    try {
      const data = await getActivitiesByProject(selectedProjectData.id);
      const activityStats = await getActivityStats(selectedProjectData.id);
      setActivities(data);
      setStats(activityStats);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectData]);

  useEffect(() => {
    if (viewMode === 'activities' && selectedProjectData) {
      loadActivities();
      fetchTeamMembers();
    }
  }, [viewMode, selectedProjectData, loadActivities, fetchTeamMembers]);

  // Handle partner click
  const handlePartnerClick = (partner: { id: string; name: string }) => {
    setSelectedPartnerData(partner);
    setSelectedPartner(partner.id);
    
    // Check if partner has tolls
    const partnerHasTolls = tolls.some(t => t.csr_partner_id === partner.id);
    if (partnerHasTolls) {
      setViewMode('tolls');
    } else {
      setViewMode('folders');
    }
  };

  // Handle toll click
  const handleTollClick = (toll: Toll) => {
    setSelectedTollData(toll);
    setSelectedToll(toll.id);
    setViewMode('folders');
  };

  // Handle folder click
  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    setViewMode('projects');
  };

  // Handle project click
  const handleProjectClick = (project: Project) => {
    setSelectedProjectData(project);
    setSelectedProject(project.id);
    setViewMode('activities');
  };

  // Handle back navigation
  const handleBack = () => {
    if (viewMode === 'activities') {
      setViewMode('projects');
      setSelectedProjectData(null);
      setSelectedProject(null);
      setActivities([]);
    } else if (viewMode === 'projects') {
      if (selectedFolder) {
        setViewMode('folders');
        setSelectedFolder(null);
      } else if (selectedTollData) {
        setViewMode('tolls');
        setSelectedTollData(null);
        setSelectedToll(null);
      } else {
        setViewMode('partners');
        setSelectedPartnerData(null);
        setSelectedPartner(null);
      }
    } else if (viewMode === 'folders') {
      if (selectedTollData) {
        setViewMode('tolls');
      } else {
        setViewMode('partners');
      }
      setSelectedFolder(null);
    } else if (viewMode === 'tolls') {
      setViewMode('partners');
      setSelectedPartnerData(null);
      setSelectedPartner(null);
      setSelectedTollData(null);
      setSelectedToll(null);
    }
  };

  // Toggle activity expansion
  const toggleExpand = (activityId: string) => {
    setExpandedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }
      return next;
    });
  };

  // Open add modal
  const handleAddActivity = () => {
    setEditingActivity(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      start_date: '',
      end_date: '',
      responsible_person: '',
    });
    setDescriptionItems([]);
    setNewItemText('');
    setShowModal(true);
  };

  // Open edit modal
  const handleEditActivity = async (activity: ProjectActivityWithDetails) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description || '',
      priority: activity.priority,
      start_date: activity.start_date || '',
      end_date: activity.end_date || '',
      responsible_person: activity.responsible_person || '',
    });
    
    const items = await getActivityItems(activity.id);
    setDescriptionItems(items.map((item) => ({ text: item.item_text, isCompleted: item.is_completed })));
    setNewItemText('');
    setShowModal(true);
  };

  // Add description item
  const handleAddDescriptionItem = () => {
    if (!newItemText.trim()) return;
    setDescriptionItems([...descriptionItems, { text: newItemText.trim(), isCompleted: false }]);
    setNewItemText('');
    setEditingItemIndex(null);
    setEditingItemText('');
  };

  // Remove description item
  const handleRemoveDescriptionItem = (index: number) => {
    setDescriptionItems(descriptionItems.filter((_, i) => i !== index));
    if (editingItemIndex === index) {
      setEditingItemIndex(null);
      setEditingItemText('');
    }
  };

  // Toggle item in form
  const handleToggleFormItem = (index: number) => {
    setDescriptionItems(descriptionItems.map((item, i) => 
      i === index ? { ...item, isCompleted: !item.isCompleted } : item
    ));
    if (editingItemIndex === index) {
      // Preserve text but toggle completion while editing
      setEditingItemText(descriptionItems[index]?.text || '');
    }
  };

  const handleStartEditingItem = (index: number) => {
    setEditingItemIndex(index);
    setEditingItemText(descriptionItems[index]?.text || '');
  };

  const handleCancelEditingItem = () => {
    setEditingItemIndex(null);
    setEditingItemText('');
  };

  const handleSaveEditingItem = () => {
    if (editingItemIndex === null) return;
    if (!editingItemText.trim()) {
      // prevent empty values
      return;
    }
    setDescriptionItems(descriptionItems.map((item, i) => (
      i === editingItemIndex ? { ...item, text: editingItemText.trim() } : item
    )));
    setEditingItemIndex(null);
    setEditingItemText('');
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectData || !selectedPartnerData) {
      alert('Please select a partner and project first');
      return;
    }

    setIsSubmitting(true);
    try {
      const activityData = {
        project_id: selectedProjectData.id,
        csr_partner_id: selectedPartnerData.id,
        toll_id: selectedTollData?.id || selectedProjectData.toll_id || undefined,
        title: formData.title,
        description: formData.description,
        section: 'General',
        section_order: 1,
        activity_order: 1,
        priority: formData.priority,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        responsible_person: formData.responsible_person || undefined,
        status: 'not_started' as const,
        completion_percentage: 0,
        is_active: true,
      };

      let savedActivity: ProjectActivity | null = null;

      if (editingActivity) {
        savedActivity = await updateActivity(editingActivity.id, activityData);
        
        if (savedActivity && editingActivity.items) {
          for (const item of editingActivity.items) {
            await deleteActivityItem(item.id);
          }
        }
      } else {
        savedActivity = await createActivity(activityData);
      }

      if (savedActivity && descriptionItems.length > 0) {
        for (let i = 0; i < descriptionItems.length; i++) {
          await createActivityItem({
            activity_id: savedActivity.id,
            item_text: descriptionItems[i].text,
            item_order: i + 1,
            is_completed: descriptionItems[i].isCompleted,
          });
        }
      }

      setShowModal(false);
      await loadActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete activity
  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      await deleteActivity(activityId);
      await loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  // Toggle item completion (inline)
  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    try {
      await toggleItemCompletion(itemId, !isCompleted);
      await loadActivities();
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  // Get breadcrumb text
  const getBreadcrumb = () => {
    const parts = ['Project Timeline'];
    if (selectedPartnerData) parts.push(selectedPartnerData.name);
    if (selectedTollData) parts.push(selectedTollData.toll_name || selectedTollData.poc_name || 'Subcompany');
    if (selectedFolder) parts.push(selectedFolder);
    if (selectedProjectData) {
      const locationLabel = selectedProjectData.location?.trim();
      const projectLabel = locationLabel
        ? `${selectedProjectData.name} (${locationLabel})`
        : selectedProjectData.name;
      parts.push(projectLabel);
    }
    return parts.join(' → ');
  };

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
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent">
                  Project Timeline
                </h1>
                <p className="text-gray-600 mt-1 font-medium">{getBreadcrumb()}</p>
              </div>
            </div>
            
            {viewMode === 'activities' && (
              <button
                onClick={handleAddActivity}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-emerald-500/30"
              >
                <Plus className="w-5 h-5" />
                <span>Add Activity</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

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
            {filtersLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-gray-600 font-semibold">Loading partners...</p>
              </div>
            ) : csrPartners.length === 0 ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
                <p className="text-amber-800 font-semibold text-lg">No CSR Partners found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {csrPartners.map((partner, index) => {
                  const partnerProjectCount = filteredProjects.filter(p => p.csr_partner_id === partner.id).length;
                  const partnerHasTolls = tolls.some(t => t.csr_partner_id === partner.id);
                  
                  return (
                    <motion.button
                      key={partner.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handlePartnerClick({ id: partner.id, name: partner.name })}
                      className="group relative text-left"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"></div>
                      
                      <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                        
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                            <Building2 className="w-6 h-6 text-emerald-600" />
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{partner.name}</h3>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <FolderKanban className="w-4 h-4" />
                            <span>{partnerProjectCount} Projects</span>
                          </div>
                          {partnerHasTolls && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <MapPin className="w-4 h-4" />
                              <span>Has Subcompanies</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* SUBCOMPANIES VIEW */}
        {viewMode === 'tolls' && (
          <motion.div
            key="tolls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {partnerTolls.map((toll, index) => {
                const tollProjectCount = filteredProjects.filter(p => p.toll_id === toll.id).length;
                
                return (
                  <motion.button
                    key={toll.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleTollClick(toll)}
                    className="group relative text-left"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"></div>
                    
                    <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                          <MapPin className="w-6 h-6 text-emerald-600" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {toll.toll_name || toll.poc_name || 'Unnamed Subcompany'}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FolderKanban className="w-4 h-4" />
                        <span>{tollProjectCount} Projects</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* FOLDERS VIEW */}
        {viewMode === 'folders' && (
          <motion.div
            key="folders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {groupedProjects().length === 0 ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
                <p className="text-amber-800 font-semibold text-lg">No Projects found</p>
                <p className="text-amber-700 mt-2">No projects available for the selected partner/subcompany</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedProjects().map((folder, index) => (
                  <motion.button
                    key={folder.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleFolderClick(folder.name)}
                    className="group relative text-left"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"></div>
                    
                    <div className="relative bg-white border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                          <FolderKanban className="w-6 h-6 text-blue-600" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                        {folder.name}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FolderKanban className="w-4 h-4" />
                          <span>{folder.projects.length} {folder.projects.length === 1 ? 'Project' : 'Projects'}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          {folder.activeCount > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium">
                              {folder.activeCount} Active
                            </span>
                          )}
                          {folder.completedCount > 0 && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
                              {folder.completedCount} Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* PROJECTS VIEW */}
        {viewMode === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const projectsToShow = selectedFolder 
                ? getProjectsForView().filter(p => (p.name || 'Untitled Project').trim() === selectedFolder)
                : getProjectsForView();
              
              if (projectsToShow.length === 0) {
                return (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
                    <p className="text-amber-800 font-semibold text-lg">No Projects found</p>
                    <p className="text-amber-700 mt-2">No projects available for the selected folder</p>
                  </div>
                );
              }
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectsToShow.map((project, index) => (
                    <motion.button
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    onClick={() => handleProjectClick(project)}
                    className="group relative text-left"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"></div>
                    
                    <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                          <FolderKanban className="w-6 h-6 text-emerald-600" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{project.name}</h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </div>
                      
                      {project.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{project.location}</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* ACTIVITIES VIEW */}
        {viewMode === 'activities' && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <FolderKanban className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Completed</p>
                    <h3 className="text-2xl font-bold text-emerald-600">{stats.completed}</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">In Progress</p>
                    <h3 className="text-2xl font-bold text-amber-600">{stats.inProgress}</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Circle className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Not Started</p>
                    <h3 className="text-2xl font-bold text-gray-600">{stats.notStarted}</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Target className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Progress</p>
                    <h3 className="text-2xl font-bold text-emerald-600">{stats.overallCompletion}%</h3>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Activities List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-gray-600 font-semibold">Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Activities Yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first activity for this project</p>
                <button
                  onClick={handleAddActivity}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add First Activity</span>
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Activities Header */}
                <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Activities</h3>
                        <p className="text-sm text-gray-600">
                          {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">
                        {stats.overallCompletion}% Complete
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${stats.overallCompletion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activities List */}
                <div className="divide-y divide-gray-100">
                  {activities.map((activity) => {
                    const isExpanded = expandedActivities.has(activity.id);
                    const items = activity.items || [];
                    const completedItems = items.filter((i) => i.is_completed).length;
                    const totalItems = items.length;
                    const itemsProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                    return (
                      <div key={activity.id} className="p-4">
                        {/* Activity Header */}
                        <div
                          className="flex items-start space-x-4 cursor-pointer"
                          onClick={() => toggleExpand(activity.id)}
                        >
                          <button className="mt-1 p-1 hover:bg-gray-100 rounded transition-colors">
                            <ChevronRight
                              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            />
                          </button>

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-gray-900">{activity.title}</h4>
                                {activity.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
                                )}
                                <div className="flex items-center space-x-3 mt-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[activity.status].bgColor} ${STATUS_CONFIG[activity.status].textColor}`}>
                                    {STATUS_CONFIG[activity.status].label}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[activity.priority].bgColor} ${PRIORITY_CONFIG[activity.priority].textColor}`}>
                                    {PRIORITY_CONFIG[activity.priority].label}
                                  </span>
                                  {totalItems > 0 && (
                                    <span className="text-xs text-gray-500">
                                      {completedItems}/{totalItems} tasks ({itemsProgress}%)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleEditActivity(activity)}
                                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {totalItems > 0 && (
                              <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all"
                                  style={{ width: `${itemsProgress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Content - Checkable Items */}
                        <AnimatePresence>
                          {isExpanded && items.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="ml-10 mt-4 space-y-2"
                            >
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                                    item.is_completed
                                      ? 'bg-emerald-50 border-emerald-200'
                                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  <button
                                    onClick={() => handleToggleItem(item.id, item.is_completed)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                      item.is_completed
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-gray-300 hover:border-emerald-500'
                                    }`}
                                  >
                                    {item.is_completed && <Check className="w-4 h-4" />}
                                  </button>
                                  <span
                                    className={`flex-1 ${
                                      item.is_completed ? 'text-gray-500 line-through' : 'text-gray-700'
                                    }`}
                                  >
                                    {item.item_text}
                                  </span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {isExpanded && items.length === 0 && (
                          <div className="ml-10 mt-4 p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-gray-500 text-sm">No task items. Edit activity to add checkable tasks.</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Activity Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    placeholder="Enter activity title"
                    required
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectActivity['priority'] })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    placeholder="Enter activity description"
                    rows={2}
                  />
                </div>

                {/* Checkable Description Items */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Items (Checkable Points)
                  </label>
                  <div className="space-y-2 mb-3">
                    {descriptionItems.map((item, index) => {
                      const isEditing = editingItemIndex === index;
                      return (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-lg border ${
                            item.isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleFormItem(index)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              item.isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-gray-300 hover:border-emerald-500'
                            }`}
                          >
                            {item.isCompleted && <Check className="w-4 h-4" />}
                          </button>
                          {isEditing ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingItemText}
                              onChange={(e) => setEditingItemText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEditingItem();
                                } else if (e.key === 'Escape') {
                                  handleCancelEditingItem();
                                }
                              }}
                              className="flex-1 px-3 py-2 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm"
                            />
                          ) : (
                            <span
                              className={`flex-1 ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                            >
                              {item.text}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={handleSaveEditingItem}
                                  className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                                  title="Save"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditingItem}
                                  className="p-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEditingItem(index)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveDescriptionItem(index)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Add new item */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDescriptionItem();
                        }
                      }}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                      placeholder="Add a task item..."
                    />
                    <button
                      type="button"
                      onClick={handleAddDescriptionItem}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                </div>

                {/* Responsible Person */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Responsible Person
                  </label>
                  <select
                    value={formData.responsible_person}
                    onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-900 font-medium"
                  >
                    <option value="" className="text-gray-500">Select a team member</option>
                    {teamMembers.map((member) => (
                      <option 
                        key={member.user_id} 
                        value={`${member.full_name} : ${member.role}`}
                        className="text-gray-900 py-2"
                      >
                        {member.full_name} : {member.role}
                      </option>
                    ))}
                  </select>
                  {teamMembers.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">No team members assigned to this project yet.</p>
                  )}
                </div>
              </form>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-xl font-medium flex items-center space-x-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingActivity ? 'Update' : 'Create'} Activity</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectTimelinePage;

