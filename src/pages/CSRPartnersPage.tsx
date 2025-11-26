import { useState, useEffect, useCallback } from 'react';
import type { Dispatch, SetStateAction, FormEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Building2, MapPin, Phone, Mail, Loader, X, User2, Globe, Info } from 'lucide-react';
import {
  getCSRPartnersWithStats,
  getPartnerStats,
  getCSRPartnerById,
  createCSRPartner,
  type CSRPartner,
  type CSRPartnerStats,
  type PartnerStats,
} from '@/services/csrPartnersService';

const INITIAL_FORM_STATE = {
  name: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  budget: '',
  status: 'active',
  website: '',
};

const CSRPartnersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState<CSRPartnerStats[]>([]);
  const [allPartners, setAllPartners] = useState<CSRPartnerStats[]>([]);
  const [stats, setStats] = useState<PartnerStats>({
    totalPartners: 0,
    activePartners: 0,
    totalProjects: 0,
    totalBudget: 0,
  });
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

  const fetchPartnerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const partnerList = await getCSRPartnersWithStats();
      const partnerStats = await getPartnerStats();
      setAllPartners(partnerList);
      setPartners(partnerList);
      setStats(partnerStats);
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
    { label: 'Active Partners', value: stats.activePartners },
    { label: 'Total Projects', value: stats.totalProjects },
    { label: 'Total Budget', value: `₹${(stats.totalBudget / 1000000).toFixed(1)}M` },
  ];

  const filteredPartners = partners;

  const handleAddPartner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.email) {
      setFormError('Please fill in partner name, contact person, and email.');
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
          filteredPartners.map((partner, index) => (
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Active Projects</p>
                  <p className="text-xl font-bold text-gray-900">{partner.activeProjects}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Budget</p>
                  <p className="text-xl font-bold text-emerald-600">₹{(partner.totalBudget / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleViewDetails(partner.id)}
              className="w-full mt-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2 rounded-lg transition-colors border border-emerald-100"
            >
              View Details
            </button>
          </motion.div>
          ))
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
          onClose={() => {
            if (!detailsLoading) {
              setDetailsModalOpen(false);
              setSelectedPartner(null);
              setDetailsError(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default CSRPartnersPage;

const buildPartnerPayload = (values: typeof INITIAL_FORM_STATE): Omit<CSRPartner, 'id' | 'created_at' | 'updated_at'> => {
  const now = new Date().toISOString();
  const fiscalYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  const budgetValue = Number(values.budget) || 0;
  const website = values.website.trim();

  return {
    name: values.name.trim(),
    company_name: values.companyName.trim() || values.name.trim(),
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
    website,
    logo_drive_link: '',
    mou_drive_link: '',
    budget_allocated: budgetValue,
    budget_utilized: 0,
    budget_pending: budgetValue,
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
    is_active: values.status === 'active',
    metadata: { source: 'dashboard' },
    notes: '',
    created_by: null,
    updated_by: null,
  };
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
      className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-emerald-100"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Partner Name', key: 'name', placeholder: 'Acme Foundation' },
            { label: 'Company Name', key: 'companyName', placeholder: 'Acme Corp' },
            { label: 'Contact Person', key: 'contactPerson', placeholder: 'Jane Doe' },
            { label: 'Email', key: 'email', placeholder: 'jane@example.com', type: 'email' },
            { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
            { label: 'City', key: 'city', placeholder: 'Mumbai' },
            { label: 'State', key: 'state', placeholder: 'Maharashtra' },
            { label: 'Website', key: 'website', placeholder: 'https://acme.org' },
          ].map((field) => (
            <label key={field.key} className="text-sm font-medium text-gray-700">
              {field.label}
              <input
                type={field.type || 'text'}
                value={(formData as Record<string, string>)[field.key]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                required={field.key !== 'companyName'}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={field.placeholder}
              />
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            Budget (₹)
            <input
              type="number"
              value={formData.budget}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  budget: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="5000000"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Status
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
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
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-60"
          >
            {isSubmitting ? 'Adding…' : 'Add Partner'}
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
  onClose: () => void;
}

const PartnerDetailsModal = ({ partner, isLoading, error, onClose }: PartnerDetailsModalProps) => (
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
                <h4 className="text-xl font-bold text-gray-900">{partner.name}</h4>
                <p className="text-sm text-gray-600">{partner.company_name}</p>
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
              <DetailRow icon={<Globe className="w-4 h-4" />} label="Website" value={partner.website || '—'} />
              <DetailRow
                icon={<Info className="w-4 h-4" />}
                label="Budget Allocated"
                value={`₹${(partner.budget_allocated || 0).toLocaleString()}`}
              />
            </div>

            {partner.notes && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
                <p className="text-sm text-gray-600">{partner.notes}</p>
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
