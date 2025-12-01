import { useState, useEffect, useMemo } from 'react';
import type { CertificateWithRelations } from '../services/utilizationCertificateService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Download, FileText, X, Loader, CheckCircle2, Eye, Trash2,
  Send, Check, Clock, AlertCircle, Filter, XCircle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';
import { utilizationCertificateService } from '../services/utilizationCertificateService';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface CSRPartner {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  project_code: string;
}

interface NewCertificateForm {
  certificate_heading: string;
  certificate_drive_link: string;
  annexure_drive_link: string;
  format_type: string;
  csr_partner_id: string;
  project_id: string;
  certificate_type: string;
  period_from: string;
  period_to: string;
  fiscal_year: string;
  total_amount: string;
  utilized_amount: string;
  notes: string;
}

const UtilizationCertificatePage = () => {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<CertificateWithRelations[]>([]);
  const [csrPartners, setCSRPartners] = useState<CSRPartner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateWithRelations | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [partnerFilter, setPartnerFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const [newCertificate, setNewCertificate] = useState<NewCertificateForm>({
    certificate_heading: '',
    certificate_drive_link: '',
    annexure_drive_link: '',
    format_type: 'PDF',
    csr_partner_id: '',
    project_id: '',
    certificate_type: 'Quarterly',
    period_from: '',
    period_to: '',
    fiscal_year: '',
    total_amount: '',
    utilized_amount: '',
    notes: '',
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [certs, partners, projectsData] = await Promise.all([
        utilizationCertificateService.getAllCertificates(),
        fetchCSRPartners(),
        fetchProjects(),
      ]);

      setCertificates(certs);
      setCSRPartners(partners);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCSRPartners = async (): Promise<CSRPartner[]> => {
    const { data } = await supabase
      .from('csr_partners')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    return data || [];
  };

  const fetchProjects = async (): Promise<Project[]> => {
    const { data } = await supabase
      .from('projects')
      .select('id, name, project_code')
      .eq('is_active', true)
      .order('name');
    return data || [];
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCertificate.certificate_heading || !newCertificate.csr_partner_id || !newCertificate.project_id) {
      alert('Please fill required fields');
      return;
    }

    try {
      const certificateData = {
        certificate_code: utilizationCertificateService.generateCertificateCode(),
        certificate_heading: newCertificate.certificate_heading,
        certificate_drive_link: newCertificate.certificate_drive_link || undefined,
        annexure_drive_link: newCertificate.annexure_drive_link || undefined,
        format_type: newCertificate.format_type,
        csr_partner_id: newCertificate.csr_partner_id,
        project_id: newCertificate.project_id,
        certificate_type: (newCertificate.certificate_type || 'Annual') as 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Project Completion' | 'Project-Specific',
        period_from: newCertificate.period_from || undefined,
        period_to: newCertificate.period_to || undefined,
        fiscal_year: newCertificate.fiscal_year || undefined,
        total_amount: newCertificate.total_amount ? parseFloat(newCertificate.total_amount) : undefined,
        utilized_amount: newCertificate.utilized_amount ? parseFloat(newCertificate.utilized_amount) : undefined,
        notes: newCertificate.notes || undefined,
        status: 'draft' as const,
        created_by: currentUser?.id,
      };

      await utilizationCertificateService.createCertificate(certificateData);

      setNewCertificate({
        certificate_heading: '',
        certificate_drive_link: '',
        annexure_drive_link: '',
        format_type: 'PDF',
        csr_partner_id: '',
        project_id: '',
        certificate_type: 'Quarterly',
        period_from: '',
        period_to: '',
        fiscal_year: '',
        total_amount: '',
        utilized_amount: '',
        notes: '',
      });

      setShowUploadForm(false);
      await loadAllData();
    } catch (error) {
      console.error('Error creating certificate:', error);
      alert('Failed to create certificate');
    }
  };

  const handleUpdateStatus = async (certId: string, newStatus: string) => {
    try {
      const statusValue = (newStatus || 'draft') as 'draft' | 'pending' | 'approved' | 'rejected';
      await utilizationCertificateService.updateStatus(certId, statusValue, currentUser?.id);
      await loadAllData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleMarkSent = async (certId: string) => {
    try {
      await utilizationCertificateService.markAsSentToPartner(certId);
      await loadAllData();
    } catch (error) {
      console.error('Error marking as sent:', error);
      alert('Failed to mark as sent');
    }
  };

  const handleMarkAcknowledged = async (certId: string) => {
    try {
      await utilizationCertificateService.markAsAcknowledged(certId);
      await loadAllData();
    } catch (error) {
      console.error('Error marking as acknowledged:', error);
      alert('Failed to mark as acknowledged');
    }
  };

  const handleDelete = async (certId: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await utilizationCertificateService.deleteCertificate(certId);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert('Failed to delete certificate');
    }
  };

  const exportToExcel = () => {
    if (filteredCertificates.length === 0) {
      alert('No certificates to export');
      return;
    }

    const data = filteredCertificates.map(cert => ({
      'Certificate Code': cert.certificate_code,
      'Heading': cert.certificate_heading,
      'Partner': cert.csr_partners?.name || 'N/A',
      'Project': cert.projects?.name || 'N/A',
      'Type': cert.certificate_type,
      'Period From': cert.period_from ? new Date(cert.period_from).toLocaleDateString() : '',
      'Period To': cert.period_to ? new Date(cert.period_to).toLocaleDateString() : '',
      'Total Amount': cert.total_amount || 0,
      'Utilized Amount': cert.utilized_amount || 0,
      'Status': cert.status,
      'Sent to Partner': cert.sent_to_partner ? 'Yes' : 'No',
      'Acknowledged': cert.acknowledged ? 'Yes' : 'No',
      'Notes': cert.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Certificates');
    XLSX.writeFile(wb, 'utilization-certificates.xlsx');
  };

  const exportToPDF = () => {
    if (filteredCertificates.length === 0) {
      alert('No certificates to export');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    doc.setFontSize(16);
    doc.text('Utilization Certificates Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    filteredCertificates.forEach((cert, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('', 'bold');
      doc.text(`${index + 1}. ${cert.certificate_heading}`, 15, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('', 'normal');
      doc.text(`Code: ${cert.certificate_code} | Status: ${cert.status}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Partner: ${cert.csr_partners?.name || 'N/A'} | Project: ${cert.projects?.name || 'N/A'}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Type: ${cert.certificate_type} | Amount: ₹${cert.total_amount || 0}`, 15, yPosition);
      yPosition += 10;
    });

    doc.save('utilization-certificates.pdf');
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = searchQuery ? cert.certificate_heading?.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchesStatus = statusFilter ? cert.status === statusFilter : true;
      const matchesPartner = partnerFilter ? cert.csr_partner_id === partnerFilter : true;
      const matchesType = typeFilter ? cert.certificate_type === typeFilter : true;
      return matchesSearch && matchesStatus && matchesPartner && matchesType;
    });
  }, [certificates, searchQuery, statusFilter, partnerFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: certificates.length,
      draft: certificates.filter(c => c.status === 'draft').length,
      pending: certificates.filter(c => c.status === 'pending').length,
      approved: certificates.filter(c => c.status === 'approved').length,
      sent: certificates.filter(c => c.sent_to_partner).length,
      acknowledged: certificates.filter(c => c.acknowledged).length,
    };
  }, [certificates]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Utilization Certificates</h1>
          <p className="text-gray-600">Manage and track all utilization certificates for CSR projects</p>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'from-blue-500 to-blue-600' },
            { label: 'Draft', value: stats.draft, icon: Clock, color: 'from-gray-500 to-gray-600' },
            { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'from-green-500 to-green-600' },
            { label: 'Sent', value: stats.sent, icon: Send, color: 'from-purple-500 to-purple-600' },
            { label: 'Acknowledged', value: stats.acknowledged, icon: Check, color: 'from-indigo-500 to-indigo-600' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-linear-to-br ${stat.color} rounded-lg p-4 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="w-12 h-12 opacity-30" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Form Section */}
        <AnimatePresence>
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Create New Certificate</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateCertificate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Certificate Heading */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Heading *</label>
                    <input
                      type="text"
                      required
                      value={newCertificate.certificate_heading}
                      onChange={(e) => setNewCertificate({...newCertificate, certificate_heading: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., CSR Project Utilization Certificate"
                    />
                  </div>

                  {/* CSR Partner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CSR Partner *</label>
                    <select
                      required
                      value={newCertificate.csr_partner_id}
                      onChange={(e) => setNewCertificate({...newCertificate, csr_partner_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Partner</option>
                      {csrPartners.map(partner => (
                        <option key={partner.id} value={partner.id}>{partner.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Project */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                    <select
                      required
                      value={newCertificate.project_id}
                      onChange={(e) => setNewCertificate({...newCertificate, project_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Certificate Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Type</label>
                    <select
                      value={newCertificate.certificate_type}
                      onChange={(e) => setNewCertificate({...newCertificate, certificate_type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Quarterly">Quarterly</option>
                      <option value="Half-Yearly">Half-Yearly</option>
                      <option value="Annual">Annual</option>
                      <option value="Project Completion">Project Completion</option>
                      <option value="Project-Specific">Project-Specific</option>
                    </select>
                  </div>

                  {/* Period From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period From</label>
                    <input
                      type="date"
                      value={newCertificate.period_from}
                      onChange={(e) => setNewCertificate({...newCertificate, period_from: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Period To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period To</label>
                    <input
                      type="date"
                      value={newCertificate.period_to}
                      onChange={(e) => setNewCertificate({...newCertificate, period_to: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Total Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCertificate.total_amount}
                      onChange={(e) => setNewCertificate({...newCertificate, total_amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Utilized Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Utilized Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCertificate.utilized_amount}
                      onChange={(e) => setNewCertificate({...newCertificate, utilized_amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Certificate Drive Link */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Drive Link</label>
                    <input
                      type="url"
                      value={newCertificate.certificate_drive_link}
                      onChange={(e) => setNewCertificate({...newCertificate, certificate_drive_link: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  {/* Annexure Drive Link */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Annexure Drive Link</label>
                    <input
                      type="url"
                      value={newCertificate.annexure_drive_link}
                      onChange={(e) => setNewCertificate({...newCertificate, annexure_drive_link: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={newCertificate.notes}
                      onChange={(e) => setNewCertificate({...newCertificate, notes: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    Create Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters & Actions
            </h2>
            {!showUploadForm && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" /> New Certificate
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search by heading..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Partner Filter */}
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Partners</option>
              {csrPartners.map(partner => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Annual">Annual</option>
              <option value="Project Completion">Project Completion</option>
              <option value="Project-Specific">Project-Specific</option>
            </select>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition text-sm"
              >
                <FileText className="w-4 h-4" /> Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition text-sm"
              >
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredCertificates.length} of {certificates.length} certificates
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading certificates...</span>
          </div>
        )}

        {/* Certificates Grid */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-4"
          >
            {filteredCertificates.length > 0 ? (
              filteredCertificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    {/* Certificate Info */}
                    <div>
                      <p className="text-xs text-gray-500">Code: {cert.certificate_code}</p>
                      <p className="font-semibold text-gray-800 truncate">{cert.certificate_heading}</p>
                      <p className="text-sm text-gray-600">{cert.csr_partners?.name}</p>
                    </div>

                    {/* Type & Amount */}
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-medium text-gray-800">{cert.certificate_type}</p>
                      <p className="text-sm text-gray-600">₹{cert.total_amount || 0}</p>
                    </div>

                    {/* Period */}
                    <div>
                      <p className="text-xs text-gray-500">Period</p>
                      <p className="text-sm text-gray-800">
                        {cert.period_from ? new Date(cert.period_from).toLocaleDateString() : '-'} to {cert.period_to ? new Date(cert.period_to).toLocaleDateString() : '-'}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusBadgeColor(cert.status)}`}>
                        {getStatusIcon(cert.status)}
                        <span className="capitalize">{cert.status}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedCertificate(cert);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <select
                        value=""
                        onChange={(e) => handleUpdateStatus(cert.id, e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Update Status</option>
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      {!cert.sent_to_partner && (
                        <button
                          onClick={() => handleMarkSent(cert.id)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                          title="Mark as Sent"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      {cert.sent_to_partner && !cert.acknowledged && (
                        <button
                          onClick={() => handleMarkAcknowledged(cert.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                          title="Mark as Acknowledged"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(cert.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No certificates found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or create a new certificate</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedCertificate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
              >
                <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{selectedCertificate.certificate_heading}</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white hover:bg-blue-800 p-1 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Certificate Code</p>
                      <p className="font-medium text-gray-800">{selectedCertificate.certificate_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Status</p>
                      <p className={`font-medium inline-block px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(selectedCertificate.status)}`}>
                        {selectedCertificate.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Partner</p>
                      <p className="font-medium text-gray-800">{selectedCertificate.csr_partners?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Project</p>
                      <p className="font-medium text-gray-800">{selectedCertificate.projects?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Type</p>
                      <p className="font-medium text-gray-800">{selectedCertificate.certificate_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                      <p className="font-medium text-gray-800">₹{selectedCertificate.total_amount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Period From</p>
                      <p className="font-medium text-gray-800">
                        {selectedCertificate.period_from ? new Date(selectedCertificate.period_from).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Period To</p>
                      <p className="font-medium text-gray-800">
                        {selectedCertificate.period_to ? new Date(selectedCertificate.period_to).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>

                  {selectedCertificate.certificate_drive_link && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-2">Certificate Link</p>
                      <a
                        href={selectedCertificate.certificate_drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Open Certificate
                      </a>
                    </div>
                  )}

                  {selectedCertificate.notes && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-2">Notes</p>
                      <p className="text-gray-700">{selectedCertificate.notes}</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-6 border-t flex gap-4">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                  >
                    Close
                  </button>
                  {selectedCertificate.certificate_drive_link && (
                    <a
                      href={selectedCertificate.certificate_drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition text-center flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UtilizationCertificatePage;
