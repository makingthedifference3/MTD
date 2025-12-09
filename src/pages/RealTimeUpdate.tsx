import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, TrendingUp, Plus, X, Upload } from 'lucide-react';
import { realTimeUpdatesService } from '../services/realTimeUpdatesService';
import type { RealTimeUpdateWithDetails, UpdateStats } from '../services/realTimeUpdatesService';
import { useFilter } from '../context/useFilter';
import { supabase } from '../services/supabaseClient';
import FilterBar from '../components/FilterBar';
import type { Project } from '../services/filterService';
import ReportTable from '../components/ReportTable';
import PhotoEvidence from '../components/PhotoEvidence';
import ReportPageLayout from '../components/ReportPageLayout';

const RealTimeUpdate = () => {
  const { selectedProject, selectedPartner, projects, filteredProjects, csrPartners } = useFilter();
  const [allUpdates, setAllUpdates] = useState<RealTimeUpdateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isDeletingPdf, setIsDeletingPdf] = useState(false);
  const [pdfModal, setPdfModal] = useState<null | { id?: string; url: string; title?: string; updateNo?: string }>(null);
  const [stats, setStats] = useState<UpdateStats>({
    total: 0,
    progress: 0,
    issue: 0,
    achievement: 0,
    milestone: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  });

  // Form state - matching updates folder structure
  const [formData, setFormData] = useState({
    partnerId: selectedPartner || '',
    projectId: selectedProject || '',
    tollId: '',
    updateNo: '',
    date: new Date().toLocaleDateString('en-GB'),
    location: '',
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    tutor: '',
    filledBy: '',
    residentCount: '',
    residents: ['', '', '', '', '', ''],
    activity: '',
    title: '',
    description: '',
    updateType: 'Progress',
    isPublic: true,
    isSentToClient: false,
  });

  const [photos, setPhotos] = useState<Array<{ id: number; url: string; file: File }>>([]);
  const [tolls, setTolls] = useState<Array<{ id: string; toll_name?: string | null; city?: string | null; state?: string | null }>>([]);
  const [pdfContext, setPdfContext] = useState<null | {
    formData: typeof formData;
    photoUrls: string[];
    csrPartnerName?: string;
    projectName?: string;
    projectLogoUrl?: string;
  }>(null);

  // Load updates on mount and when project or partner changes
  useEffect(() => {
    loadUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, selectedPartner]);

  // Load tolls whenever partner changes
  useEffect(() => {
    const loadTolls = async () => {
      if (!formData.partnerId) {
        setTolls([]);
        return;
      }

      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name, city, state')
        .eq('csr_partner_id', formData.partnerId)
        .order('toll_name', { ascending: true });

      if (error) {
        console.error('Error loading tolls', error);
        setTolls([]);
        return;
      }

      setTolls(data || []);
    };

    loadTolls();
  }, [formData.partnerId]);

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.updateNo || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Generate unique update code using timestamp and random number
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const updateCode = `UPDATE-${timestamp}-${random}`;

      // Upload photos to storage if any
      const uploadedPhotos: string[] = [];
      for (const photo of photos) {
        try {
          const fileName = `${Date.now()}-${photo.file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('updates')
            .upload(fileName, photo.file);

          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage
            .from('updates')
            .getPublicUrl(fileName);
          
          uploadedPhotos.push(urlData.publicUrl);
        } catch (error) {
          console.error('Error uploading photo:', error);
        }
      }

      // Insert into Supabase
      const { data: inserted, error } = await supabase
        .from('real_time_updates')
        .insert([
          {
            update_code: updateCode,
            project_id: formData.projectId,
            csr_partner_id: formData.partnerId || null,
            toll_id: formData.tollId || null,
            update_no: formData.updateNo,
            date: formData.date,
            location: formData.location || null,
            day: formData.day || null,
            tutor: formData.tutor || null,
            filled_by: formData.filledBy || null,
            resident_count: formData.residentCount || null,
            residents: formData.residents.filter(r => r.trim() !== ''),
            activity: formData.activity || null,
            photos: uploadedPhotos,
            title: formData.title || null,
            description: formData.description || null,
            update_type: formData.updateType,
            is_public: formData.isPublic,
            is_sent_to_client: formData.isSentToClient,
            pdf_url: null,
          }
        ])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating update:', error);
        alert('Failed to create update: ' + error.message);
        return;
      }

      let generatedPdfUrl: string | null = null;
      if (inserted?.id) {
        generatedPdfUrl = await generateAndUploadPdf({
          updateCode,
          recordId: inserted.id,
          formData,
          photoUrls: uploadedPhotos,
        });
      }

      // Reset form and reload
      setFormData({
        partnerId: selectedPartner || '',
        projectId: selectedProject || '',
        tollId: '',
        updateNo: '',
        date: new Date().toLocaleDateString('en-GB'),
        location: '',
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        tutor: '',
        filledBy: '',
        residentCount: '',
        residents: ['', '', '', '', '', ''],
        activity: '',
        title: '',
        description: '',
        updateType: 'Progress',
        isPublic: true,
        isSentToClient: false,
      });
      setPhotos([]);
      setShowModal(false);
      await loadUpdates();

      if (generatedPdfUrl && inserted?.id) {
        setPdfModal({
          id: inserted.id,
          url: generatedPdfUrl,
          title: formData.title || `Update ${formData.updateNo}`,
          updateNo: formData.updateNo,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setFormData(prev => ({
      ...prev,
      projectId,
      tollId: project?.toll_id || '',
    }));
  };

  const handleResidentChange = (index: number, value: string) => {
    const newResidents = [...formData.residents];
    newResidents[index] = value;
    setFormData(prev => ({ ...prev, residents: newResidents }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map((file, index) => {
        return {
          id: Date.now() + index,
          url: URL.createObjectURL(file),
          file: file
        };
      });
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (id: number) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const loadUpdates = async () => {
    try {
      setLoading(true);
      let data;

      if (selectedProject) {
        // Show updates for selected project
        data = await realTimeUpdatesService.getUpdatesByProject(selectedProject);
      } else if (selectedPartner) {
        // Show updates for selected partner (filtered projects)
        const partnerProjectIds = filteredProjects.map(p => p.id);
        data = await realTimeUpdatesService.getAllUpdates();
        data = data.filter(u => partnerProjectIds.includes(u.project_id));
      } else {
        // Show all updates
        data = await realTimeUpdatesService.getAllUpdates();
      }

      setAllUpdates(data);
      const updateStats = await realTimeUpdatesService.getUpdateStats(data);
      setStats(updateStats);
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatProjectOptionLabel = (project: Project) => {
    const codePart = project.project_code ? `${project.project_code} - ` : '';
    const locationPart = project.location ? ` • ${project.location}` : project.state ? ` • ${project.state}` : '';
    return `${codePart}${project.name}${locationPart}`;
  };

  const getProjectMeta = (projectId?: string) => {
    const project = projects.find(p => p.id === projectId) || filteredProjects.find(p => p.id === projectId);
    if (!project) {
      return {
        name: 'Unknown Project',
        code: 'N/A',
        location: '',
        logoUrl: '',
        partnerId: selectedPartner || null,
      };
    }
    return {
      name: project.name,
      code: project.project_code || 'N/A',
      location: project.location || project.state || '',
      logoUrl: (project as any).logo_url || '',
      partnerId: project.csr_partner_id || null,
    };
  };

  const getCsrPartnerName = (partnerId?: string | null) => {
    if (!partnerId) return 'CSR Partner';
    const partner = csrPartners.find(p => p.id === partnerId);
    return partner?.name || 'CSR Partner';
  };

  const generateAndUploadPdf = async ({
    updateCode,
    recordId,
    formData: currentForm,
    photoUrls,
  }: {
    updateCode: string;
    recordId: string;
    formData: typeof formData;
    photoUrls: string[];
  }): Promise<string | null> => {
    try {
      setIsGeneratingPdf(true);

      // Ensure html2pdf is available
      if (!(window as any).html2pdf) {
        alert('PDF library is still loading, please try again in a moment.');
        return null;
      }

      const projectMeta = getProjectMeta(currentForm.projectId);
      const csrName = getCsrPartnerName(projectMeta.partnerId || currentForm.partnerId);

      // Prepare hidden render context
      setPdfContext({
        formData: currentForm,
        photoUrls,
        csrPartnerName: csrName,
        projectName: projectMeta.name,
        projectLogoUrl: projectMeta.logoUrl,
      });

      // Wait a tick for DOM to render hidden content
      await new Promise(resolve => setTimeout(resolve, 200));

      const element = document.getElementById('pdf-export');
      if (!element) {
        console.error('PDF element not found');
        return null;
      }

      // Use predictable name similar to requested pattern: update_<no>_<timestamp>.pdf
      const filename = `update_${currentForm.updateNo || updateCode}_${Date.now()}.pdf`;

      const opt = {
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          onclone: (clonedDoc: Document) => {
            const pages = clonedDoc.querySelectorAll('.report-page');
            pages.forEach(el => {
              el.classList.remove('shadow-2xl');
              el.classList.remove('mb-8');
            });
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfBlob: Blob = await (window as any).html2pdf().set(opt).from(element).toPdf().output('blob');

      const storagePath = `real_time/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from('MTD_Bills')
        .upload(storagePath, pdfBlob, { contentType: 'application/pdf', upsert: true });

      if (uploadError) {
        console.error('PDF upload failed:', uploadError);
        alert(`PDF upload failed: ${uploadError.message}`);
        return null;
      }

      const { data: urlData } = supabase.storage.from('MTD_Bills').getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;
      if (!publicUrl) {
        alert('Could not resolve public URL for uploaded PDF.');
        return null;
      }
      await supabase
        .from('real_time_updates')
        .update({ pdf_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', recordId);

      return publicUrl;
    } catch (error) {
      console.error('Error generating/uploading PDF:', error);
      alert('Error generating or uploading PDF. Check console for details.');
      return null;
    } finally {
      setIsGeneratingPdf(false);
      setPdfContext(null);
    }
  };

  // Convert updates to display format with priority
  const updates = allUpdates.map((update, index) => {
    const projectCode = update.project_code && update.project_code !== 'N/A' ? update.project_code : undefined;
    const locationLabel = (update as any).location || update.location_name || '';

    return {
      id: update.id,
      type: (update.update_type?.toLowerCase() || 'project') as 'progress' | 'issue' | 'achievement' | 'milestone' | 'project',
      title: update.title || `${update.school_name || update.institution_name || 'Update'} - ${update.update_code}`,
      description: update.description || 'No description provided',
      timestamp: update.days_ago || 'Recently',
      project: update.project_name || 'Unknown Project',
      pdfUrl: update.pdf_url,
      updateNo: update.update_no,
      projectCode,
      location: locationLabel,
      priority: realTimeUpdatesService.getUpdatePriority(index, allUpdates.length),
    };
  });

  const openPdfModal = (update: { id: string; pdfUrl?: string | null; title?: string; updateNo?: string }) => {
    if (!update.pdfUrl) {
      alert('No PDF generated for this update yet.');
      return;
    }
    setPdfModal({ id: update.id, url: update.pdfUrl, title: update.title, updateNo: update.updateNo });
  };

  const extractStoragePath = (publicUrl?: string | null) => {
    if (!publicUrl) return null;
    const parts = publicUrl.split('/MTD_Bills/');
    return parts.length === 2 ? parts[1] : null;
  };

  const handleDeletePdf = async () => {
    if (!pdfModal?.id || !pdfModal.url) return;
    const storagePath = extractStoragePath(pdfModal.url);
    if (!storagePath) {
      alert('Could not determine storage path for this PDF.');
      return;
    }

    try {
      setIsDeletingPdf(true);
      await supabase.storage.from('MTD_Bills').remove([storagePath]);
      await supabase
        .from('real_time_updates')
        .update({ pdf_url: null, updated_at: new Date().toISOString() })
        .eq('id', pdfModal.id);

      setPdfModal(null);
      await loadUpdates();
    } catch (error) {
      console.error('Failed to delete PDF:', error);
      alert('Failed to delete PDF');
    } finally {
      setIsDeletingPdf(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'achievement':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'milestone':
        return <Bell className="w-5 h-5 text-amber-600" />;
      case 'issue':
        return <Activity className="w-5 h-5 text-red-600" />;
      case 'project':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'progress':
        return 'bg-emerald-50 border-emerald-200';
      case 'achievement':
        return 'bg-blue-50 border-blue-200';
      case 'milestone':
        return 'bg-amber-50 border-amber-200';
      case 'issue':
        return 'bg-red-50 border-red-200';
      case 'project':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* FilterBar */}
      <div className="mb-6">
        <FilterBar />
      </div>

      {/* Header with Add Button */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Updates</h1>
          <p className="text-gray-600 mt-2">Live feed of project activities and notifications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Update</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Total Updates</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">High Priority</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.highPriority}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Medium Priority</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.mediumPriority}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Low Priority</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.lowPriority}</h3>
        </motion.div>
      </div>

      {/* Updates Feed */}
      <div className="space-y-4">
        {updates.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${getTypeColor(update.type)} hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => openPdfModal(update)}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                {getTypeIcon(update.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{update.title}</h3>
                    {update.project && (
                      <p className="text-sm text-gray-600 mt-1 flex flex-wrap items-center gap-2">
                        <span>Project: {update.project}</span>
                        {update.projectCode && (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">
                            {update.projectCode}
                          </span>
                        )}
                      </p>
                    )}
                    {update.location && (
                      <p className="text-sm text-gray-500 mt-1">Location: {update.location}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      update.type === 'progress' ? 'bg-emerald-100 text-emerald-700' :
                      update.type === 'achievement' ? 'bg-blue-100 text-blue-700' :
                      update.type === 'milestone' ? 'bg-amber-100 text-amber-700' :
                      update.type === 'issue' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {update.type.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      update.priority === 'high' ? 'bg-red-100 text-red-700' :
                      update.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {update.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{update.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{update.timestamp}</span>
                  {update.pdfUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPdfModal(update);
                      }}
                      className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      View PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Update Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Update</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddUpdate} className="space-y-4">
                {/* CSR Partner Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CSR Partner
                  </label>
                  <select
                    value={formData.partnerId}
                    onChange={(e) => {
                      setFormData({ ...formData, partnerId: e.target.value, projectId: '' });
                    }}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white"
                  >
                    <option value="">All Partners</option>
                    {csrPartners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white"
                    required
                  >
                    <option value="">Select a project</option>
                    {formData.partnerId
                      ? projects
                          .filter(p => p.csr_partner_id === formData.partnerId)
                          .map((project) => (
                            <option key={project.id} value={project.id}>
                              {formatProjectOptionLabel(project)}
                            </option>
                          ))
                      : projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {formatProjectOptionLabel(project)}
                          </option>
                        ))
                    }
                  </select>
                </div>

                {/* Toll Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subcompany (Toll)
                  </label>
                  <select
                    value={formData.tollId}
                    onChange={(e) => setFormData({ ...formData, tollId: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white"
                  >
                    <option value="">Select a toll (optional)</option>
                    {tolls.map((toll) => (
                      <option key={toll.id} value={toll.id}>
                        {toll.toll_name || 'Toll'}{toll.city ? ` • ${toll.city}` : ''}{toll.state ? `, ${toll.state}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Update No and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Update No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.updateNo}
                      onChange={(e) => setFormData({ ...formData, updateNo: e.target.value })}
                      placeholder="e.g., 22"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Day and Resident Count */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Day
                    </label>
                    <input
                      type="text"
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      placeholder="e.g., Wednesday"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resident Count
                    </label>
                    <input
                      type="text"
                      value={formData.residentCount}
                      onChange={(e) => setFormData({ ...formData, residentCount: e.target.value })}
                      placeholder="e.g., 3"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <textarea
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Padatola Village, Gadchiroli, Maharashtra"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                    rows={2}
                  />
                </div>

                {/* Tutor and Filled By */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tutor
                    </label>
                    <input
                      type="text"
                      value={formData.tutor}
                      onChange={(e) => setFormData({ ...formData, tutor: e.target.value })}
                      placeholder="e.g., Pooja Usandi"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Filled By
                    </label>
                    <input
                      type="text"
                      value={formData.filledBy}
                      onChange={(e) => setFormData({ ...formData, filledBy: e.target.value })}
                      placeholder="e.g., Riyola Dsouza"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                </div>

                {/* Residents (Max 6) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Residents (Max 6)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.residents.map((resident, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Resident ${idx + 1}`}
                        value={resident}
                        onChange={(e) => handleResidentChange(idx, e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Activity
                  </label>
                  <textarea
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    placeholder="Describe the activities conducted..."
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                    rows={4}
                  />
                </div>

                {/* Optional Title & Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., LAJJA Kit Distribution Drive"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional description..."
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                    rows={3}
                  />
                </div>

                {/* Update Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Update Type
                  </label>
                  <select
                    value={formData.updateType}
                    onChange={(e) => setFormData({ ...formData, updateType: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white"
                  >
                    <option value="Progress">Progress</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Issue">Issue</option>
                  </select>
                </div>

                {/* Photo Upload */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Photos
                  </label>
                  <div className="flex gap-4 items-start">
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {photos.map(p => (
                        <div key={p.id} className="relative w-24 h-24 border-2 rounded-xl overflow-hidden group">
                          <img src={p.url} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(p.id)}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Make Public</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSentToClient}
                      onChange={(e) => setFormData({ ...formData, isSentToClient: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Send to Client</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || isGeneratingPdf}
                    className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    {submitting || isGeneratingPdf ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{isGeneratingPdf ? 'Generating PDF...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Create Update</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* PDF Viewer Modal */}
        <AnimatePresence>
          {pdfModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setPdfModal(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div>
                    <div className="text-sm text-gray-500">{pdfModal.updateNo ? `Update ${pdfModal.updateNo}` : 'Real-Time Update'}</div>
                    <div className="text-lg font-semibold text-gray-900">{pdfModal.title || 'Generated PDF'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDeletePdf}
                      disabled={isDeletingPdf}
                      className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 disabled:text-gray-400"
                    >
                      {isDeletingPdf ? 'Deleting…' : 'Delete PDF'}
                    </button>
                    <a
                      href={pdfModal.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Open in New Tab
                    </a>
                    <button
                      type="button"
                      onClick={() => setPdfModal(null)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50">
                  <iframe
                    src={pdfModal.url}
                    title={pdfModal.title || 'Real-Time Update PDF'}
                    className="w-full h-full rounded-b-2xl"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Hidden PDF render target */}
      {pdfContext && (
        <div id="pdf-export" className="absolute -left-[9999px] top-0 w-[210mm]" aria-hidden>
          <ReportPageLayout>
            <ReportTable
              data={{
                updateNo: pdfContext.formData.updateNo,
                date: pdfContext.formData.date,
                location: pdfContext.formData.location,
                day: pdfContext.formData.day,
                tutor: pdfContext.formData.tutor,
                filledBy: pdfContext.formData.filledBy,
                residentCount: pdfContext.formData.residentCount,
                residents: pdfContext.formData.residents,
                activity: pdfContext.formData.activity,
              }}
            />
            {/* Photos: first page 2, additional pages 4 each */}
            {(() => {
              const page1 = pdfContext.photoUrls.slice(0, 2).map((url, idx) => ({ id: idx, url }));
              const remaining = pdfContext.photoUrls.slice(2);
              const chunks: string[][] = [];
              for (let i = 0; i < remaining.length; i += 4) {
                chunks.push(remaining.slice(i, i + 4));
              }
              return (
                <>
                  <PhotoEvidence photos={page1} isFullPageGrid={false} />
                  {chunks.map((chunk, idx) => (
                    <ReportPageLayout key={idx}>
                      <div className="grow flex flex-col h-full">
                        <div className="font-bold text-center mb-2 border-b-2 border-black pb-1">Additional Evidence</div>
                        <PhotoEvidence
                          photos={chunk.map((url, j) => ({ id: j, url }))}
                          isFullPageGrid
                        />
                      </div>
                    </ReportPageLayout>
                  ))}
                </>
              );
            })()}
          </ReportPageLayout>
        </div>
      )}
    </div>
  );
};

export default RealTimeUpdate;
