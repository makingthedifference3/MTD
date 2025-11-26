import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, FileText, X, Loader, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';

interface UtilizationCertificate {
  id: string;
  certificate_code: string;
  csr_partner_id: string;
  project_id: string;
  certificate_heading?: string;
  certificate_type?: string;
  period_from?: string;
  period_to?: string;
  certificate_drive_link?: string;
  format_type?: string;
  status?: string;
  created_at: string;
  csr_partners?: { name: string };
  projects?: { name: string; project_code: string };
}

interface CSRPartner {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  project_code: string;
}

const UtilizationCertificatePage = () => {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<UtilizationCertificate[]>([]);
  const [csrPartners, setCSRPartners] = useState<CSRPartner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const [newCertificate, setNewCertificate] = useState({
    certificate_heading: '',
    certificate_drive_link: '',
    format_type: 'PDF',
    csr_partner_id: '',
    project_id: '',
    certificate_type: 'Quarterly',
    period_from: '',
    period_to: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch certificates with partner and project names
      const { data: certsData, error: certsError } = await supabase
        .from('utilization_certificates')
        .select(`
          *,
          csr_partners(name),
          projects(name, project_code)
        `)
        .order('created_at', { ascending: false });

      if (certsError) throw certsError;
      setCertificates(certsData || []);

      // Fetch CSR Partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('csr_partners')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (partnersError) throw partnersError;
      setCSRPartners(partnersData || []);

      // Fetch Projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, project_code')
        .eq('is_active', true)
        .order('name');

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCertificate.certificate_heading || !newCertificate.csr_partner_id || !newCertificate.project_id) {
      alert('Please fill in all required fields (Certificate Heading, CSR Partner, and Project)');
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to upload certificates');
      return;
    }

    try {
      setUploading(true);

      const certificateCode = `UC-${Date.now()}`;
      
      const { error } = await supabase
        .from('utilization_certificates')
        .insert([{
          certificate_code: certificateCode,
          certificate_heading: newCertificate.certificate_heading,
          certificate_drive_link: newCertificate.certificate_drive_link || null,
          format_type: newCertificate.format_type || null,
          csr_partner_id: newCertificate.csr_partner_id,
          project_id: newCertificate.project_id,
          certificate_type: newCertificate.certificate_type,
          period_from: newCertificate.period_from || null,
          period_to: newCertificate.period_to || null,
          status: 'draft',
          created_by: currentUser.id,
        }]);

      if (error) throw error;

      // Reset form
      setNewCertificate({
        certificate_heading: '',
        certificate_drive_link: '',
        format_type: 'PDF',
        csr_partner_id: '',
        project_id: '',
        certificate_type: 'Quarterly',
        period_from: '',
        period_to: '',
      });

      setShowUploadForm(false);
      alert('Certificate uploaded successfully!');
      loadData();
      
    } catch (error) {
      console.error('Error uploading certificate:', error);
      alert('Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Utilization Certificate</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          {showUploadForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span className="font-medium">{showUploadForm ? 'Cancel' : 'Upload Certificate'}</span>
        </motion.button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Certificate</h3>
          <form onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newCertificate.certificate_heading}
                onChange={(e) => setNewCertificate({ ...newCertificate, certificate_heading: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2"
                placeholder="Certificate Heading *"
                required
              />
              
              <input
                type="url"
                value={newCertificate.certificate_drive_link}
                onChange={(e) => setNewCertificate({ ...newCertificate, certificate_drive_link: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2"
                placeholder="Drive Link (Optional)"
              />

              <select
                value={newCertificate.format_type}
                onChange={(e) => setNewCertificate({ ...newCertificate, format_type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="PDF">PDF</option>
                <option value="Word Document">Word Document</option>
                <option value="Excel Sheet">Excel Sheet</option>
                <option value="Image">Image</option>
              </select>

              <select
                value={newCertificate.certificate_type}
                onChange={(e) => setNewCertificate({ ...newCertificate, certificate_type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Annual">Annual</option>
                <option value="Project-Specific">Project-Specific</option>
              </select>

              <select
                value={newCertificate.csr_partner_id}
                onChange={(e) => setNewCertificate({ ...newCertificate, csr_partner_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select CSR Partner *</option>
                {csrPartners.map(partner => (
                  <option key={partner.id} value={partner.id}>{partner.name}</option>
                ))}
              </select>

              <select
                value={newCertificate.project_id}
                onChange={(e) => setNewCertificate({ ...newCertificate, project_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Project *</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.project_code} - {project.name}</option>
                ))}
              </select>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Period</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From Date</label>
                    <input
                      type="date"
                      value={newCertificate.period_from}
                      onChange={(e) => setNewCertificate({ ...newCertificate, period_from: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To Date</label>
                    <input
                      type="date"
                      value={newCertificate.period_to}
                      onChange={(e) => setNewCertificate({ ...newCertificate, period_to: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Upload</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Certificates List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Uploaded Certificates ({certificates.length})
        </h3>
        
        {certificates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No certificates uploaded yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "Upload Certificate" to add your first certificate</p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <FileText className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{cert.certificate_heading || 'Untitled Certificate'}</h4>
                    {(cert.csr_partners?.name || cert.projects?.name) && (
                      <p className="text-sm text-gray-600 mb-3">
                        {cert.csr_partners?.name && <span className="font-medium">{cert.csr_partners.name}</span>}
                        {cert.csr_partners?.name && cert.projects?.name && <span className="mx-2">•</span>}
                        {cert.projects?.name && <span>{cert.projects.project_code} - {cert.projects.name}</span>}
                      </p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Upload Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(cert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Format</p>
                        <p className="font-medium text-gray-900">{cert.format_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">{cert.certificate_type || 'N/A'}</p>
                      </div>
                    </div>
                    {(cert.period_from || cert.period_to) && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500">Period</p>
                        <p className="font-medium text-gray-900">
                          {cert.period_from ? new Date(cert.period_from).toLocaleDateString() : 'N/A'} - {cert.period_to ? new Date(cert.period_to).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    )}
                    <a
                      href={cert.certificate_drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!cert.certificate_drive_link || cert.certificate_drive_link === '') {
                          e.preventDefault();
                          alert('No download link available');
                        }
                      }}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>View Certificate</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UtilizationCertificatePage;
