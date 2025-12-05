
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Dispatch, SetStateAction, FormEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Building2, MapPin, Phone, Mail, Loader, X, User2, Info, Settings, Eye, EyeOff, Trash2, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { INDIAN_STATES } from '@/constants/indianStates';
import {
  getCSRPartnersWithStats,
  getPartnerStats,
  getCSRPartnerById,
  createCSRPartner,
  updateCSRPartner,
  type CSRPartner,
  type CSRPartnerStats,
  type PartnerStats,
} from '@/services/csrPartnersService';
import { getTollCountForPartner } from '@/services/tollsService';
import { useFilter } from '@/context/useFilter';
import { csrPartnerService } from '@/services/csrPartnerService';
import PasswordViewer from '@/components/PasswordViewer';
import { formatIndianRupee } from '@/utils/currency';

const INITIAL_FORM_STATE = {
  name: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  isCustomState: false,
  hasToll: false,
  poc_password: '',
  confirmPassword: '',
};

const isCustomStateValue = (value: string) => Boolean(value && !INDIAN_STATES.includes(value as typeof INDIAN_STATES[number]));

type PartnerTextFieldKey = 'companyName' | 'contactPerson' | 'email' | 'phone';

const PARTNER_TEXT_FIELDS: Array<{
  label: string;
  key: PartnerTextFieldKey;
  placeholder: string;
  syncName?: boolean;
  type?: string;
}> = [
  { label: 'Company Name', key: 'companyName', placeholder: 'Acme Corp', syncName: true },
  { label: 'Contact Person', key: 'contactPerson', placeholder: 'Jane Doe' },
  { label: 'Email', key: 'email', placeholder: 'jane@example.com', type: 'email' },
  { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
];

const CSRPartnersPage = () => {
  const navigate = useNavigate();
  const { projects, refreshData } = useFilter();
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState<CSRPartnerStats[]>([]);
  const [allPartners, setAllPartners] = useState<CSRPartnerStats[]>([]);
  const [tollCounts, setTollCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<PartnerStats>({
    totalPartners: 0,
    activePartners: 0,
    totalProjects: 0,
    totalBudget: 0,
    totalTolls: 0,
  });
  const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<CSRPartner | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(INITIAL_FORM_STATE);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partnerPendingDeleteId, setPartnerPendingDeleteId] = useState<string | null>(null);
  const [partnerPendingDeleteName, setPartnerPendingDeleteName] = useState('');
  const fetchPartnerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const partnerList = await getCSRPartnersWithStats();
      const partnerStats = await getPartnerStats();
      setAllPartners(partnerList);
      setPartners(partnerList);
      setStats(partnerStats);
      
      // Fetch toll counts for each partner
      const counts: Record<string, number> = {};
      await Promise.all(
        partnerList.map(async (partner) => {
          const count = await getTollCountForPartner(partner.id);
          counts[partner.id] = count;
        })
      );
      setTollCounts(counts);
    } catch (err) {
      setError('Failed to load partner data');
      console.error('Error fetching partner data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setPartners(allPartners);
    } else {
      const filtered = allPartners.filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          partner.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPartners(filtered);
    }
  }, [searchTerm, allPartners]);

  const partnerBudgetSummary = useMemo(() => {
    type BudgetEntry = {
      total: number;
      directBudget: number;
      tollBudgets: Record<string, { total: number; name?: string | null }>;
    };

    const summary = new Map<string, BudgetEntry>();

    projects.forEach((project) => {
      if (!project.csr_partner_id) {
        return;
      }

      const partnerId = project.csr_partner_id;
      const budget = project.total_budget ?? 0;
      if (!summary.has(partnerId)) {
        summary.set(partnerId, { total: 0, directBudget: 0, tollBudgets: {} });
      }

      const entry = summary.get(partnerId)!;
      entry.total += budget;

      if (project.toll_id) {
        const existing = entry.tollBudgets[project.toll_id] || { total: 0, name: project.toll?.toll_name || project.toll?.poc_name };
        existing.total += budget;
        existing.name = project.toll?.toll_name || project.toll?.poc_name || existing.name;
        entry.tollBudgets[project.toll_id] = existing;
      } else {
        entry.directBudget += budget;
      }
    });

    return summary;
  }, [projects]);

  const aggregatedBudgetTotal = useMemo(() => {
    let total = 0;
    partnerBudgetSummary.forEach((entry) => {
      total += entry.total;
    });
    return total;
  }, [partnerBudgetSummary]);

  const filteredPartners = partners;

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

  const localStats = [
    { label: 'Total Partners', value: stats.totalPartners },
    { label: 'Total Subcompany', value: stats.totalTolls },
    { label: 'Total Projects', value: stats.totalProjects },
    {
      label: 'Total Budget',
      value: formatIndianRupee((aggregatedBudgetTotal || stats.totalBudget) || 0),
    },
  ];

  const selectedPartnerBudgetInfo = selectedPartner ? partnerBudgetSummary.get(selectedPartner.id) : undefined;

  const handleAddPartner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.companyName.trim()) {
      setFormError('Please fill in company name.');
      return;
    }
    if (!formData.hasToll && (!formData.contactPerson.trim() || !formData.email.trim() || !formData.phone.trim())) {
      setFormError('Please fill in contact person, email, and phone when subcompanies are not managed separately.');
      return;
    }
    if (formData.poc_password && formData.poc_password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      const payload = buildPartnerPayload(formData);
      await createCSRPartner(payload);
      setIsAddModalOpen(false);
      setFormData({ ...INITIAL_FORM_STATE });
      await fetchPartnerData();
    } catch (err) {
      console.error('Failed to add partner:', err);
      const message = err instanceof Error ? err.message : 'Unable to add partner. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (partnerId: string) => {
    try {
      setDetailsModalOpen(true);
      setDetailsLoading(true);
      setDetailsError(null);
      const partnerDetails = await getCSRPartnerById(partnerId);
      if (!partnerDetails) {
        setDetailsError('Partner details could not be found.');
      }
      setSelectedPartner(partnerDetails);
    } catch (err) {
      console.error('Failed to load partner details:', err);
      setDetailsError('Failed to load partner details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditPartner = async (partnerId: string) => {
    try {
      const partnerDetails = await getCSRPartnerById(partnerId);
      if (!partnerDetails) {
        return;
      }
      const companyName = partnerDetails.company_name || partnerDetails.name || '';
      const partnerState = partnerDetails.state || '';
      setEditFormData({
        name: companyName,
        companyName,
        contactPerson: partnerDetails.contact_person || '',
        email: partnerDetails.email || '',
        phone: partnerDetails.phone || '',
        city: partnerDetails.city || '',
        state: partnerState,
        isCustomState: isCustomStateValue(partnerState),
        hasToll: Boolean(partnerDetails.has_toll),
        poc_password: '',
        confirmPassword: '',
      });
      setSelectedPartner(partnerDetails);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error('Failed to load partner for edit:', err);
    }
  };

  const confirmDeletePartner = async () => {
    if (!partnerPendingDeleteId || deletingPartnerId) return;

    try {
      setDeletingPartnerId(partnerPendingDeleteId);
      const success = await csrPartnerService.deletePartnerCascade(partnerPendingDeleteId);
      if (success) {
        await fetchPartnerData();
        if (selectedPartner?.id === partnerPendingDeleteId) {
          setSelectedPartner(null);
        }
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to delete partner:', err);
      alert('Unable to delete partner.');
    } finally {
      setDeletingPartnerId(null);
      setPartnerPendingDeleteId(null);
      setPartnerPendingDeleteName('');
      setDeleteModalOpen(false);
    }
  };

  const closeDeleteModal = () => {
    if (deletingPartnerId) return;
    setDeleteModalOpen(false);
    setPartnerPendingDeleteId(null);
    setPartnerPendingDeleteName('');
  };

  const handleUpdatePartner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPartner) return;
    if (!editFormData.companyName.trim()) {
      setEditFormError('Please fill in company name.');
      return;
    }
    if (!editFormData.hasToll && (!editFormData.contactPerson.trim() || !editFormData.email.trim() || !editFormData.phone.trim())) {
    setEditFormError('Please fill in contact person, email, and phone when subcompanies are not managed separately.');
      return;
    }
    if (editFormData.poc_password && editFormData.poc_password !== editFormData.confirmPassword) {
      setEditFormError('Passwords do not match.');
      return;
    }

    try {
      setIsEditSubmitting(true);
      setEditFormError(null);
      const payload = buildPartnerPayload(editFormData, false);
      await updateCSRPartner(selectedPartner.id, payload);
      setIsEditModalOpen(false);
      setEditFormData({ ...INITIAL_FORM_STATE });
      setSelectedPartner(null);
      await fetchPartnerData();
    } catch (err) {
      console.error('Failed to update partner:', err);
      const message = err instanceof Error ? err.message : 'Unable to update partner. Please try again.';
      setEditFormError(message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CSR Partners</h1>
            <p className="text-gray-600 mt-2">Manage and track CSR partner organizations</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add Partner</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {localStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search partners by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </motion.div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPartners.length > 0 ? (
          filteredPartners.map((partner, index) => {
            const budgetInfo = partnerBudgetSummary.get(partner.id);
            const partnerBudgetValue = budgetInfo?.total ?? partner.totalBudget ?? 0;

            return (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{partner.name}</h3>
                  <p className="text-sm text-gray-600">{partner.id}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  partner.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {partner.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                {partner.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                {partner.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                {partner.email}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Active Projects</p>
                  <p className="text-xl font-bold text-gray-900">{partner.activeProjects}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Budget</p>
                  <p className="text-xl font-bold text-emerald-600">{formatIndianRupee(partnerBudgetValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Subcompanies</p>
                  <p className="text-xl font-bold text-blue-600">{tollCounts[partner.id] || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleViewDetails(partner.id)}
                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2 rounded-lg transition-colors border border-emerald-100"
              >
                View Details
              </button>
              <button
                onClick={() => handleEditPartner(partner.id)}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-amber-100"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setPartnerPendingDeleteId(partner.id);
                  setPartnerPendingDeleteName(partner.name);
                  setDeleteModalOpen(true);
                }}
                disabled={!!deletingPartnerId}
                className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-red-100 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              {partner.hasToll && (
                <button
                  onClick={() => navigate(`/csr-partners/${partner.id}/tolls`)}
                  className="flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-blue-100"
                >
                  <Settings className="w-4 h-4" />
                  Subcompany
                </button>
              )}
            </div>
          </motion.div>
          );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No partners found
          </div>
        )}
      </div>
      {isAddModalOpen && (
        <AddPartnerModal
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          formError={formError}
          onClose={() => {
            if (!isSubmitting) {
              setIsAddModalOpen(false);
              setFormError(null);
              setFormData({ ...INITIAL_FORM_STATE });
            }
          }}
          onSubmit={handleAddPartner}
        />
      )}

      {detailsModalOpen && (
        <PartnerDetailsModal
          partner={selectedPartner}
          isLoading={detailsLoading}
          error={detailsError}
          budgetTotal={selectedPartnerBudgetInfo?.total ?? 0}
          directBudget={selectedPartnerBudgetInfo?.directBudget ?? 0}
          tollBudgets={selectedPartnerBudgetInfo ? Object.entries(selectedPartnerBudgetInfo.tollBudgets).map(([tollId, info]) => ({
            tollId,
            tollName: info.name || 'Subcompany',
            total: info.total,
          })) : []}
          onClose={() => {
            if (!detailsLoading) {
              setDetailsModalOpen(false);
              setSelectedPartner(null);
              setDetailsError(null);
            }
          }}
        />
      )}

      {isEditModalOpen && (
        <EditPartnerModal
          formData={editFormData}
          setFormData={setEditFormData}
          isSubmitting={isEditSubmitting}
          formError={editFormError}
          onClose={() => {
            if (!isEditSubmitting) {
              setIsEditModalOpen(false);
              setEditFormError(null);
              setEditFormData({ ...INITIAL_FORM_STATE });
              setSelectedPartner(null);
            }
          }}
          onSubmit={handleUpdatePartner}
          currentPassword={selectedPartner?.poc_password ?? null}
        />
      )}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-red-600">Delete CSR Partner</p>
                <h3 className="text-2xl font-bold text-gray-900">Confirm deletion</h3>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close delete modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600">
              Are you sure you want to delete {partnerPendingDeleteName || 'this partner'}?
              This action removes the partner, its subcompanies, and projects from the dashboard.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={!!deletingPartnerId}
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePartner}
                disabled={!!deletingPartnerId}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CSRPartnersPage;

const buildPartnerPayload = (
  values: typeof INITIAL_FORM_STATE,
  includeEmptyPassword = true
): Omit<CSRPartner, 'id' | 'created_at' | 'updated_at'> => {
  const now = new Date().toISOString();
  const fiscalYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  const companyName = values.companyName.trim() || values.name.trim();

  const payload: Omit<CSRPartner, 'id' | 'created_at' | 'updated_at'> = {
    name: companyName,
    company_name: companyName,
    has_toll: values.hasToll,
    registration_number: null,
    pan_number: null,
    gst_number: null,
    contact_person: values.contactPerson.trim(),
    designation: 'CSR Lead',
    email: values.email.trim(),
    phone: values.phone.trim(),
    alternate_phone: '',
    address: '',
    city: values.city.trim(),
    state: values.state.trim(),
    pincode: '',
    website: '',
    logo_drive_link: '',
    mou_drive_link: '',
    budget_allocated: 0,
    budget_utilized: 0,
    budget_pending: 0,
    fiscal_year: fiscalYear,
    agreement_start_date: now,
    agreement_end_date: now,
    payment_terms: 'Net 30',
    billing_cycle: 'Monthly',
    bank_details: {},
    contact_details: {
      contact_person: values.contactPerson.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    },
    documents: {},
    is_active: true,
    metadata: { source: 'dashboard' },
    notes: '',
    created_by: null,
    updated_by: null,
    ...(values.poc_password.trim()
      ? { poc_password: values.poc_password.trim() }
      : includeEmptyPassword
        ? { poc_password: null }
        : {}),
  };
  const trimmedPassword = values.poc_password.trim();
  if (trimmedPassword) {
    payload.poc_password = trimmedPassword;
  } else if (includeEmptyPassword) {
    payload.poc_password = null;
  } else {
    delete payload.poc_password;
  }

  return payload;
};

interface PasswordFieldsProps {
  formData: typeof INITIAL_FORM_STATE;
  setFormData: Dispatch<SetStateAction<typeof INITIAL_FORM_STATE>>;
}

const PasswordFields = ({ formData, setFormData }: PasswordFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <div className="text-sm font-medium text-gray-700">
        Password
        <div className="relative mt-1">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.poc_password}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                poc_password: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Enter password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="text-sm font-medium text-gray-700">
        Confirm Password
        <div className="relative mt-1">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Confirm password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </>
  );
};

interface AddPartnerModalProps {
  formData: typeof INITIAL_FORM_STATE;
  setFormData: Dispatch<SetStateAction<typeof INITIAL_FORM_STATE>>;
  isSubmitting: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const AddPartnerModal = ({ formData, setFormData, isSubmitting, formError, onClose, onSubmit }: AddPartnerModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-medium text-emerald-600">Create CSR Partner</p>
          <h3 className="text-2xl font-bold text-gray-900">Add New Partner</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close modal">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* Has Subcompany Toggle */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <input
            type="checkbox"
            id="hasToll"
            checked={formData.hasToll}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                hasToll: e.target.checked,
              }))
            }
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="hasToll" className="text-sm font-medium text-blue-700">
            This partner has subcompany locations
          </label>
          {formData.hasToll && (
            <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Manage subcompanies after creation
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARTNER_TEXT_FIELDS.map((field) => (
            <label key={field.key} className="text-sm font-medium text-gray-700">
              {field.label}
              <input
                type={field.type || 'text'}
                value={formData[field.key]}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    [field.key]: value,
                    ...(field.syncName ? { name: value } : {}),
                  }));
                }}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={field.placeholder}
              />
            </label>
          ))}
        </div>

        {/* Conditional City/State/Budget - only show if no subcompany */}
        {!formData.hasToll && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="col-span-full text-sm text-gray-600 mb-2">
                Since this partner has no subcompanies, specify location and budget here:
              </p>
              <label className="text-sm font-medium text-gray-700">
                City
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Mumbai"
                />
              </label>
              <div className="text-sm font-medium text-gray-700">
                State
                <select
                  value={formData.isCustomState ? 'custom' : formData.state}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'custom') {
                      setFormData((prev) => ({
                        ...prev,
                        state: '',
                        isCustomState: true,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        state: value,
                        isCustomState: false,
                      }));
                    }
                  }}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                  <option value="custom">Custom...</option>
                </select>
              </div>
            </div>

            {formData.isCustomState && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Custom State Name
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter custom state..."
                  />
                </label>
              </div>
            )}
          </>
        )}

        <PasswordFields formData={formData} setFormData={setFormData} />

        {formData.hasToll && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> City, state, and budget will be managed through individual subcompanies. 
              After creating this partner, use the "Subcompany" button to add subcompany locations.
            </p>
          </div>
        )}

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-60"
          >
            {isSubmitting ? 'Adding…' : 'Add Partner'}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
);

interface EditPartnerModalProps {
  formData: typeof INITIAL_FORM_STATE;
  setFormData: Dispatch<SetStateAction<typeof INITIAL_FORM_STATE>>;
  isSubmitting: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  currentPassword?: string | null;
}

const EditPartnerModal = ({ formData, setFormData, isSubmitting, formError, onClose, onSubmit, currentPassword }: EditPartnerModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-amber-100 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-medium text-amber-600">Edit CSR Partner</p>
          <h3 className="text-2xl font-bold text-gray-900">Update Partner Details</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close modal">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* Has Toll Toggle */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <input
            type="checkbox"
            id="editHasToll"
            checked={formData.hasToll}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                hasToll: e.target.checked,
              }))
            }
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="editHasToll" className="text-sm font-medium text-blue-700">
            This partner has subcompany locations
          </label>
          {formData.hasToll && (
            <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Manage subcompanies separately
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARTNER_TEXT_FIELDS.map((field) => (
            <label key={field.key} className="text-sm font-medium text-gray-700">
              {field.label}
              <input
                type={field.type || 'text'}
                value={formData[field.key]}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    [field.key]: value,
                    ...(field.syncName ? { name: value } : {}),
                  }));
                }}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={field.placeholder}
              />
            </label>
          ))}
        </div>

        {/* Conditional City/State/Budget - only show if no subcompany */}
        {!formData.hasToll && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="col-span-full text-sm text-gray-600 mb-2">
              Since this partner has no subcompanies, specify location and budget here:
            </p>
            <label className="text-sm font-medium text-gray-700">
              City
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Mumbai"
              />
            </label>
            <div className="text-sm font-medium text-gray-700">
              State
              <select
                value={formData.isCustomState ? 'custom' : formData.state}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    setFormData((prev) => ({
                      ...prev,
                      state: '',
                      isCustomState: true,
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      state: value,
                      isCustomState: false,
                    }));
                  }
                }}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </div>
            </div>

            {formData.isCustomState && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-gray-700">
                Custom State Name
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter custom state..."
                />
              </label>
            </div>
            )}
          </>
        )}

        {currentPassword !== undefined && (
          <PasswordViewer
            label="Current Partner Password"
            password={currentPassword}
            description="Leave the fields below empty to keep it unchanged."
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          />
        )}

        <PasswordFields formData={formData} setFormData={setFormData} />

        {formData.hasToll && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> City, state, and budget are managed through individual subcompanies. 
              Use the "Subcompany" button on the partner card to manage subcompany locations.
            </p>
          </div>
        )}

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
);

interface PartnerDetailsModalProps {
  partner: CSRPartner | null;
  isLoading: boolean;
  error: string | null;
  budgetTotal: number;
  directBudget: number;
  tollBudgets: Array<{ tollId: string; tollName: string; total: number }>;
  onClose: () => void;
}

const PartnerDetailsModal = ({ partner, isLoading, error, budgetTotal, directBudget, tollBudgets, onClose }: PartnerDetailsModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-medium text-emerald-600">Partner Profile</p>
          <h3 className="text-2xl font-bold text-gray-900">Details</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close details">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!isLoading && !error && partner && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white shadow-inner">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{partner.company_name || partner.name}</h4>
              </div>
              <span
                className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                  partner.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {partner.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow icon={<User2 className="w-4 h-4" />} label="Contact" value={partner.contact_person} />
              <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={partner.email} />
              <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone" value={partner.phone} />
              <DetailRow
                icon={<MapPin className="w-4 h-4" />}
                label="Location"
                value={[partner.city, partner.state].filter(Boolean).join(', ') || '—'}
              />
              <DetailRow
                icon={<Info className="w-4 h-4" />}
                label="Project Budget"
                value={formatIndianRupee(budgetTotal || 0)}
              />
            </div>

            <DetailPasswordRow password={partner.poc_password} />

            {partner.notes && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
                <p className="text-sm text-gray-600">{partner.notes}</p>
              </div>
            )}

            {(directBudget > 0 || tollBudgets.length > 0) && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Budget Breakdown</p>
                <div className="space-y-2">
                  {directBudget > 0 && (
                    <BudgetBreakdownRow label="Direct Projects" amount={directBudget} />
                  )}
                  {tollBudgets.map((toll) => (
                    <BudgetBreakdownRow key={toll.tollId} label={toll.tollName} amount={toll.total} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  </div>
);

const DetailRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || '—'}</p>
    </div>
  </div>
);

const BudgetBreakdownRow = ({ label, amount }: { label: string; amount: number }) => (
  <div className="flex items-center justify-between text-sm text-gray-700">
    <span>{label}</span>
    <span className="font-semibold text-gray-900">{formatIndianRupee(amount)}</span>
  </div>
);

const DetailPasswordRow = ({ password }: { password?: string | null }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
      <Key className="w-4 h-4" />
    </div>
    <PasswordViewer
      label="Partner Password"
      password={password ?? null}
      className="flex-1"
      labelClassName="text-xs uppercase tracking-wide text-gray-500"
    />
  </div>
);