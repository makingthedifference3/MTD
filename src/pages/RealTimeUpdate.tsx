
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText } from 'lucide-react';
import { useFilter } from '../context/useFilter';
import { supabase } from '../services/supabaseClient';
import FilterBar from '../components/FilterBar';

const RealTimeUpdate = () => {
  const { selectedProject, selectedPartner, selectedToll, projects, filteredProjects, csrPartners } = useFilter();
  const [loading, setLoading] = useState(true);
  const [isDeletingPdf, setIsDeletingPdf] = useState(false);
  const [pdfModal, setPdfModal] = useState<null | { id?: string; url: string; title?: string; updateNo?: string }>(null);

  // PDF Upload Modal State
  const [showPdfUploadModal, setShowPdfUploadModal] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadedReports, setUploadedReports] = useState<Array<{
    id: string;
    date_of_report: string;
    csr_id: string;
    toll_id: string;
    project_id: string;
    pdf_link: string;
    update_number: number;
    csr_name?: string;
    toll_name?: string;
    project_name?: string;
    project_code?: string;
  }>>([]);
  const [pdfUploadForm, setPdfUploadForm] = useState({
    csrPartnerId: '',
    tollId: '',
    projectId: '',
    updateNumber: 1,
    pdfFile: null as File | null,
  });
  const [lastUpdateNumber, setLastUpdateNumber] = useState<number | null>(null);
  const [tolls, setTolls] = useState<Array<{ id: string; toll_name?: string | null; city?: string | null; state?: string | null }>>([]);

  // Load uploaded reports on mount and when filters change
  useEffect(() => {
    console.log('🔄 useEffect triggered - Loading uploaded reports...');
    console.log('📌 Current filters:', { selectedProject, selectedPartner, selectedToll });
    loadUploadedReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, selectedPartner, selectedToll]);

  // Load tolls whenever partner changes for PDF upload form
  useEffect(() => {
    const loadTolls = async () => {
      const partnerId = pdfUploadForm.csrPartnerId;
      if (!partnerId) {
        setTolls([]);
        return;
      }

      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name, city, state')
        .eq('csr_partner_id', partnerId)
        .order('toll_name', { ascending: true });

      if (error) {
        console.error('Error loading tolls', error);
        setTolls([]);
        return;
      }

      setTolls(data || []);
    };

    loadTolls();
  }, [pdfUploadForm.csrPartnerId]);

  const loadUploadedReports = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('real_time_temp')
        .select('*');

      // Apply filters based on selected project, partner, or toll
      if (selectedProject) {
        query = query.eq('project_id', selectedProject);
      } else if (selectedToll) {
        // Filter by toll (subcompany) ID
        query = query.eq('toll_id', selectedToll);
      } else if (selectedPartner) {
        // Filter by CSR partner ID directly
        query = query.eq('csr_id', selectedPartner);
      }
      // If no filters, show all reports

      const { data, error } = await query.order('update_number', { ascending: false });

      if (error) {
        console.error('Error loading uploaded reports:', error);
        throw error;
      }

      console.log('📊 Loaded reports from database:', data?.length || 0, 'reports');
      console.log('🔍 Applied filters:', { selectedProject, selectedPartner });
      console.log('📄 Raw data:', data);

      if (!data || data.length === 0) {
        setUploadedReports([]);
        return;
      }

      // Get unique IDs for batch fetching
      const projectIds = [...new Set(data.map(item => item.project_id))];
      const csrIds = [...new Set(data.map(item => item.csr_id))];
      const tollIds = [...new Set(data.map(item => item.toll_id))];

      // Fetch all required data in parallel
      const [projectsResult, partnersResult, tollsResult] = await Promise.all([
        supabase.from('projects').select('id, name, project_code').in('id', projectIds),
        supabase.from('csr_partners').select('id, name').in('id', csrIds),
        supabase.from('csr_partner_tolls').select('id, toll_name').in('id', tollIds),
      ]);

      console.log('📦 Fetched enrichment data:', {
        projects: projectsResult.data?.length || 0,
        partners: partnersResult.data?.length || 0,
        tolls: tollsResult.data?.length || 0,
      });

      // Create lookup maps for faster access
      const projectsMap = new Map(projectsResult.data?.map(p => [p.id, p]) || []);
      const partnersMap = new Map(partnersResult.data?.map(p => [p.id, p]) || []);
      const tollsMap = new Map(tollsResult.data?.map(t => [t.id, t]) || []);

      // Enrich the data
      const enriched = data.map(item => {
        const project = projectsMap.get(item.project_id);
        const partner = partnersMap.get(item.csr_id);
        const toll = tollsMap.get(item.toll_id);

        return {
          id: item.id,
          date_of_report: item.date_of_report,
          csr_id: item.csr_id,
          toll_id: item.toll_id,
          project_id: item.project_id,
          pdf_link: item.pdf_link,
          update_number: item.update_number,
          csr_name: partner?.name || 'Unknown Partner',
          toll_name: toll?.toll_name || 'Unknown Toll',
          project_name: project?.name || 'Unknown Project',
          project_code: project?.project_code || 'N/A',
        };
      });

      console.log('✅ Enriched reports:', enriched.length, 'reports ready to display');
      console.log('📋 Sample enriched report:', enriched[0]);
      setUploadedReports(enriched);
    } catch (error) {
      console.error('❌ Error loading uploaded reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractStoragePath = (publicUrl?: string | null) => {
    if (!publicUrl) return null;
    const parts = publicUrl.split('/MTD_Bills/');
    return parts.length === 2 ? parts[1] : null;
  };

  const getInlineUrl = async (storagePath: string) => {
    try {
      // Try to get a signed URL with inline content-disposition
      const { data, error } = await supabase.storage
        .from('MTD_Bills')
        .createSignedUrl(storagePath, 3600, {
          download: false, // This should prevent download and allow inline viewing
        });
      
      if (error) {
        console.error('Error creating signed URL:', error);
        // Fallback to public URL
        const { data: publicData } = supabase.storage
          .from('MTD_Bills')
          .getPublicUrl(storagePath);
        return publicData.publicUrl;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error in getInlineUrl:', error);
      // Fallback to public URL
      const { data: publicData } = supabase.storage
        .from('MTD_Bills')
        .getPublicUrl(storagePath);
      return publicData.publicUrl;
    }
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
        .from('real_time_temp')
        .delete()
        .eq('id', pdfModal.id);

      setPdfModal(null);
      await loadUploadedReports();
    } catch (error) {
      console.error('Failed to delete PDF:', error);
      alert('Failed to delete PDF');
    } finally {
      setIsDeletingPdf(false);
    }
  };

  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfUploadForm.csrPartnerId || !pdfUploadForm.tollId || !pdfUploadForm.projectId || !pdfUploadForm.pdfFile) {
      alert('Please fill in all required fields and select a PDF file');
      return;
    }

    try {
      setUploadingPdf(true);

      // Get project and toll names for filename
      const project = projects.find(p => p.id === pdfUploadForm.projectId);
      const toll = tolls.find(t => t.id === pdfUploadForm.tollId);
      
      const projectName = project?.name || 'project';
      const tollName = toll?.toll_name || 'toll';
      const updateNum = pdfUploadForm.updateNumber;

      // Create filename: project_name:subcompany_name:update_number.pdf
      const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${sanitize(projectName)}_${sanitize(tollName)}_${updateNum}.pdf`;
      const storagePath = `real_time/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('MTD_Bills')
        .upload(storagePath, pdfUploadForm.pdfFile, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('MTD_Bills')
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // Insert into real_time_temp table
      const { error: insertError } = await supabase
        .from('real_time_temp')
        .insert([
          {
            csr_id: pdfUploadForm.csrPartnerId,
            toll_id: pdfUploadForm.tollId,
            project_id: pdfUploadForm.projectId,
            pdf_link: publicUrl,
            update_number: pdfUploadForm.updateNumber,
          }
        ]);

      if (insertError) throw insertError;

      // Reset form and reload
      setPdfUploadForm({
        csrPartnerId: '',
        tollId: '',
        projectId: '',
        updateNumber: 1,
        pdfFile: null,
      });
      setShowPdfUploadModal(false);
      await loadUploadedReports();
      alert('PDF uploaded successfully!');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF: ' + (error as any).message);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handlePdfUploadCsrChange = (csrId: string) => {
    setPdfUploadForm({
      ...pdfUploadForm,
      csrPartnerId: csrId,
      tollId: '',
      projectId: '',
    });
  };

  const handlePdfUploadTollChange = (tollId: string) => {
    setPdfUploadForm({
      ...pdfUploadForm,
      tollId,
      projectId: '',
    });
  };

  const handlePdfUploadProjectChange = async (projectId: string) => {
    setPdfUploadForm({
      ...pdfUploadForm,
      projectId,
    });

    // Fetch last update number for this project
    if (projectId) {
      try {
        const { data, error } = await supabase
          .from('real_time_temp')
          .select('update_number')
          .eq('project_id', projectId)
          .order('update_number', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setLastUpdateNumber(data[0].update_number);
        } else {
          setLastUpdateNumber(null);
        }
      } catch (error) {
        console.error('Error fetching last update number:', error);
        setLastUpdateNumber(null);
      }
    } else {
      setLastUpdateNumber(null);
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

      {/* Header with Add Buttons */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Updates</h1>
          <p className="text-gray-600 mt-2">Live feed of project activities and notifications</p>
        </div>
        <button
          onClick={() => setShowPdfUploadModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span>Upload PDF</span>
        </button>
      </div>

      {/* Uploaded PDF Reports Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Uploaded PDF Reports 
          <span className="ml-3 text-sm font-normal text-gray-500">
            ({uploadedReports.length} {uploadedReports.length === 1 ? 'report' : 'reports'})
          </span>
        </h2>
        {uploadedReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border-2 border-blue-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Update #{report.update_number}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{report.project_name}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Code:</span>
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">
                      {report.project_code}
                    </span>
                  </p>
                  <p><span className="font-medium">Partner:</span> {report.csr_name}</p>
                  <p><span className="font-medium">Subcompany:</span> {report.toll_name}</p>
                </div>
                <button
                  onClick={async () => {
                    const storagePath = extractStoragePath(report.pdf_link);
                    if (storagePath) {
                      const inlineUrl = await getInlineUrl(storagePath);
                      setPdfModal({
                        id: report.id,
                        url: inlineUrl,
                        title: `${report.project_name} - Update ${report.update_number}`,
                        updateNo: report.update_number.toString(),
                      });
                    } else {
                      // Fallback to original URL
                      setPdfModal({
                        id: report.id,
                        url: report.pdf_link,
                        title: `${report.project_name} - Update ${report.update_number}`,
                        updateNo: report.update_number.toString(),
                      });
                    }
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  View PDF
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No uploaded PDF reports yet</p>
            <p className="text-sm text-gray-500 mt-1">Click "Upload PDF" to add reports</p>
          </div>
        )}
      </div>

        {/* PDF Upload Modal */}
        <AnimatePresence>
          {showPdfUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
              onClick={() => setShowPdfUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Upload PDF Report</h2>
                  <button
                    onClick={() => setShowPdfUploadModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handlePdfUpload} className="space-y-4">
                  {/* CSR Partner Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CSR Partner <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={pdfUploadForm.csrPartnerId}
                      onChange={(e) => handlePdfUploadCsrChange(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                      required
                    >
                      <option value="">Select CSR Partner</option>
                      {csrPartners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcompany (Toll) Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subcompany <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={pdfUploadForm.tollId}
                      onChange={(e) => handlePdfUploadTollChange(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                      disabled={!pdfUploadForm.csrPartnerId}
                      required
                    >
                      <option value="">Select Subcompany</option>
                      {tolls.map((toll) => (
                        <option key={toll.id} value={toll.id}>
                          {toll.toll_name || 'Toll'}{toll.city ? ` (${toll.city})` : ''}
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
                      value={pdfUploadForm.projectId}
                      onChange={(e) => handlePdfUploadProjectChange(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                      disabled={!pdfUploadForm.tollId}
                      required
                    >
                      <option value="">Select Project</option>
                      {projects
                        .filter(p => p.toll_id === pdfUploadForm.tollId)
                        .map((project) => {
                          const location = project.location || project.state || '';
                          const code = project.project_code || 'N/A';
                          return (
                            <option key={project.id} value={project.id}>
                              {project.name} {location ? `(${location})` : ''} : {code}
                            </option>
                          );
                        })}
                    </select>
                    {lastUpdateNumber !== null && pdfUploadForm.projectId && (
                      <p className="mt-2 text-sm text-blue-600 font-medium">
                        💡 Last update for this project: #{lastUpdateNumber}
                      </p>
                    )}
                    {lastUpdateNumber === null && pdfUploadForm.projectId && (
                      <p className="mt-2 text-sm text-gray-500">
                        ℹ️ This is the first update for this project
                      </p>
                    )}
                  </div>

                  {/* Update Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Update Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={pdfUploadForm.updateNumber}
                      onChange={(e) => setPdfUploadForm({ ...pdfUploadForm, updateNumber: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      required
                    />
                  </div>

                  {/* PDF Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      PDF File <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPdfUploadForm({ ...pdfUploadForm, pdfFile: file });
                          }
                        }}
                        className="hidden"
                        id="pdf-upload-input"
                        required
                      />
                      <label
                        htmlFor="pdf-upload-input"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {pdfUploadForm.pdfFile ? pdfUploadForm.pdfFile.name : 'Click to upload PDF'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">PDF files only</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPdfUploadModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingPdf}
                      className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      {uploadingPdf ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span>Upload PDF</span>
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
                <div className="flex-1 bg-gray-50 overflow-hidden p-4">
                  <object
                    data={pdfModal.url}
                    type="application/pdf"
                    className="w-full h-full rounded-lg"
                  >
                    <iframe
                      src={`${pdfModal.url}#view=FitH`}
                      title={pdfModal.title || 'Real-Time Update PDF'}
                      className="w-full h-full rounded-lg border-0"
                    >
                      <p className="text-center p-8">
                        Unable to display PDF. 
                        <a 
                          href={pdfModal.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:underline ml-2"
                        >
                          Click here to open in new tab
                        </a>
                      </p>
                    </iframe>
                  </object>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default RealTimeUpdate;
