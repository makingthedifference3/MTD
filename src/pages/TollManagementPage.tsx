import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormEvent, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Building2, MapPin, Phone, Mail, Loader, X, 
  User2, IndianRupee, Edit, Trash2, CheckCircle, Eye, EyeOff 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCSRPartnerById, type CSRPartner } from '@/services/csrPartnersService';
import { 
  getTollsByPartnerId, 
  createToll, 
  updateToll, 
  deleteToll,
  type Toll, 
  type CreateTollInput, 
  type UpdateTollInput 
} from '@/services/tollsService';
import { useFilter } from '@/context/useFilter';
import { INDIAN_STATES } from '@/constants/indianStates';
import PasswordViewer from '@/components/PasswordViewer';
import { formatIndianRupee } from '@/utils/currency';

const INITIAL_TOLL_FORM = {
  toll_name: '',
  poc_name: '',
  contact_number: '',
  email_id: '',
  city: '',
  state: '',
  isCustomState: false,
  poc_password: '',
  confirmPassword: '',
};

const isCustomStateValue = (value: string) =>
  Boolean(value && !INDIAN_STATES.includes(value as typeof INDIAN_STATES[number]));

const TollManagementPage = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams<{ partnerId: string }>();
  const { projects } = useFilter();
  
  const [partner, setPartner] = useState<CSRPartner | null>(null);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedToll, setSelectedToll] = useState<Toll | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_TOLL_FORM);
  
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tollToDelete, setTollToDelete] = useState<Toll | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const partnerProjects = useMemo(() => {
    if (!partnerId) {
      return [];
    }

    return projects.filter((project) => project.csr_partner_id === partnerId);
  }, [projects, partnerId]);

  const partnerBudgetTotal = useMemo(() => {
    return partnerProjects.reduce((sum, project) => sum + (project.total_budget || 0), 0);
  }, [partnerProjects]);

  const tollBudgetMap = useMemo(() => {
    const map = new Map<string, number>();
    partnerProjects.forEach((project) => {
      if (!project.toll_id) {
        return;
      }

      const nextValue = (map.get(project.toll_id) || 0) + (project.total_budget || 0);
      map.set(project.toll_id, nextValue);
    });
    return map;
  }, [partnerProjects]);

  const fetchData = useCallback(async () => {
    if (!partnerId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [partnerData, tollsData] = await Promise.all([
        getCSRPartnerById(partnerId),
        getTollsByPartnerId(partnerId),
      ]);
      
      setPartner(partnerData);
      setTolls(tollsData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToll = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.toll_name.trim() || !formData.poc_name.trim() || !partnerId) {
      setFormError('Please fill in both the toll name and POC name.');
      return;
    }

    // Validate passwords match if password is provided
    if (formData.poc_password && formData.poc_password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload: CreateTollInput = {
        csr_partner_id: partnerId,
        toll_name: formData.toll_name.trim(),
        poc_name: formData.poc_name.trim(),
        contact_number: formData.contact_number.trim() || undefined,
        email_id: formData.email_id.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        is_active: true,
      };

      const trimmedPassword = formData.poc_password.trim();
      if (trimmedPassword) {
        payload.poc_password = trimmedPassword;
      }

      await createToll(payload);
      setIsAddModalOpen(false);
      setFormData({ ...INITIAL_TOLL_FORM });
      await fetchData();
    } catch (err) {
      console.error('Failed to create toll:', err);
      const message = err instanceof Error ? err.message : 'Unable to create toll. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditToll = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.toll_name.trim() || !formData.poc_name.trim() || !selectedToll) {
      setFormError('Please fill in both the toll name and POC name.');
      return;
    }

    // Validate passwords match if password is provided
    if (formData.poc_password && formData.poc_password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload: UpdateTollInput = {
        toll_name: formData.toll_name.trim(),
        poc_name: formData.poc_name.trim(),
        contact_number: formData.contact_number.trim() || undefined,
        email_id: formData.email_id.trim() || undefined,
        city: formData.city.trim() || undefined,
      };

      const trimmedPassword = formData.poc_password.trim();
      if (trimmedPassword) {
        payload.poc_password = trimmedPassword;
      }

      await updateToll(selectedToll.id, payload);
      setIsEditModalOpen(false);
      setSelectedToll(null);
      setFormData({ ...INITIAL_TOLL_FORM });
      await fetchData();
    } catch (err) {
      console.error('Failed to update toll:', err);
      const message = err instanceof Error ? err.message : 'Unable to update toll. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteToll = async () => {
    if (!tollToDelete) return;

    try {
      setIsDeleting(true);
      await deleteToll(tollToDelete.id);
      setDeleteConfirmOpen(false);
      setTollToDelete(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete toll:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (toll: Toll) => {
    setSelectedToll(toll);
    const tollState = toll.state || '';
    setFormData({
      toll_name: toll.toll_name || '',
      poc_name: toll.poc_name,
      contact_number: toll.contact_number || '',
      email_id: toll.email_id || '',
      city: toll.city || '',
      state: tollState,
      isCustomState: isCustomStateValue(tollState),
      poc_password: '',
      confirmPassword: '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteConfirm = (toll: Toll) => {
    setTollToDelete(toll);
    setDeleteConfirmOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Partner not found'}
        </div>
        <button
          onClick={() => navigate('/csr-partners')}
          className="mt-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CSR Partners
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/csr-partners')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CSR Partners
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{partner.name}</h1>
                <p className="text-gray-600">{partner.company_name}</p>
              </div>
            </div>
            <p className="text-gray-600 mt-2">Manage subcompanies for this CSR partner</p>
          </div>
          <button
            onClick={() => {
              setFormData({ ...INITIAL_TOLL_FORM });
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add Toll</span>
          </button>
        </div>
      </div>

      {/* Partner Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">Partner Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <User2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-500">Contact Person</p>
              <p className="font-medium text-gray-900">{partner.contact_person}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{partner.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{partner.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium text-gray-900">{[partner.city, partner.state].filter(Boolean).join(', ') || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-500">Budget Allocated</p>
              <p className="font-medium text-gray-900">{formatIndianRupee(partnerBudgetTotal)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tolls Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Total Tolls</p>
          <h3 className="text-3xl font-bold text-gray-900">{tolls.length}</h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Total Budget</p>
          <h3 className="text-3xl font-bold text-emerald-600">
            {formatIndianRupee(partnerBudgetTotal)}
          </h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Active Tolls</p>
          <h3 className="text-3xl font-bold text-blue-600">{tolls.filter(t => t.is_active).length}</h3>
        </motion.div>
      </div>

      {/* Tolls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tolls.length > 0 ? (
          tolls.map((toll, index) => (
            <motion.div
              key={toll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{toll.toll_name || toll.poc_name}</h3>
                    <p className="text-sm text-gray-600">POC: {toll.poc_name}</p>
                    <p className="text-sm text-gray-600">{[toll.city, toll.state].filter(Boolean).join(', ') || 'No location'}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    toll.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {toll.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {toll.contact_number && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-blue-600" />
                    {toll.contact_number}
                  </div>
                )}
                {toll.email_id && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                    {toll.email_id}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <IndianRupee className="w-4 h-4 mr-2 text-blue-600" />
                  Budget: {formatIndianRupee(tollBudgetMap.get(toll.id) ?? 0)}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                <PasswordViewer
                  label="POC Password"
                  password={toll.poc_password ?? null}
                  description="Click the eye icon to reveal the stored password."
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(toll)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 rounded-lg transition-colors border border-blue-100"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => openDeleteConfirm(toll)}
                  className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No tolls added yet</p>
            <p className="text-gray-400 text-sm">Click "Add Toll" to create your first subcompany</p>
          </div>
        )}
      </div>

      {/* Add Toll Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <TollFormModal
            title="Add New Toll"
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            formError={formError}
            onClose={() => {
              if (!isSubmitting) {
                setIsAddModalOpen(false);
                setFormError(null);
                setFormData({ ...INITIAL_TOLL_FORM });
              }
            }}
            onSubmit={handleAddToll}
          />
        )}
      </AnimatePresence>

      {/* Edit Toll Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <TollFormModal
            title="Edit Toll"
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            formError={formError}
            onClose={() => {
              if (!isSubmitting) {
                setIsEditModalOpen(false);
                setSelectedToll(null);
                setFormError(null);
                setFormData({ ...INITIAL_TOLL_FORM });
              }
            }}
            onSubmit={handleEditToll}
            currentPassword={selectedToll?.poc_password ?? null}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && tollToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Toll</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-semibold">{tollToDelete.poc_name}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDeleteConfirmOpen(false);
                      setTollToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteToll}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-60"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TollManagementPage;

// Toll Form Modal Component
interface TollFormModalProps {
  title: string;
  formData: typeof INITIAL_TOLL_FORM;
  setFormData: Dispatch<SetStateAction<typeof INITIAL_TOLL_FORM>>;
  isSubmitting: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  currentPassword?: string | null;
}

const TollFormModal = ({
  title,
  formData,
  setFormData,
  isSubmitting,
  formError,
  onClose,
  onSubmit,
  currentPassword,
}: TollFormModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto"
      >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-medium text-blue-600">Toll / Subcompany</p>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close modal">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            Toll / Subcompany Name *
            <input
              type="text"
              value={formData.toll_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  toll_name: e.target.value,
                }))
              }
              required
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="North South Tollways"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            POC Name (Point of Contact) *
            <input
              type="text"
              value={formData.poc_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  poc_name: e.target.value,
                }))
              }
              required
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Contact Number
            <input
              type="text"
              value={formData.contact_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact_number: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+91 98765 43210"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Email ID
            <input
              type="email"
              value={formData.email_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email_id: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </label>
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
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mumbai"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            State
            <select
              value={formData.isCustomState ? 'custom' : formData.state}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  state: value === 'custom' ? '' : value,
                  isCustomState: value === 'custom',
                }));
              }}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
              <option value="custom">Custom...</option>
            </select>
          </label>

          {formData.isCustomState && (
            <label className="text-sm font-medium text-gray-700">
              Custom State
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    state: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter custom state"
              />
            </label>
          )}

          {currentPassword !== undefined && (
            <div className="md:col-span-2">
              <PasswordViewer
                label="Current POC Password"
                password={currentPassword}
                description="Leave this field untouched unless you need to update the existing password."
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              />
            </div>
          )}
          
          {/* Password Fields */}
          <div className="text-sm font-medium text-gray-700">
            POC Password
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.poc_password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    poc_password: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

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
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-60 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save Toll
              </>
            )}
          </button>
        </div>
      </form>
      </motion.div>
    </motion.div>
  );
};
