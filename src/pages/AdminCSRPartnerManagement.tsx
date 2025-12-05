import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Building2, MapPin, DollarSign, Users } from 'lucide-react';
import { useFilter } from '../context/useFilter';
import { useDelayedUndoAction } from '../hooks/useDelayedUndoAction';
import { csrPartnerService, type CSRPartner, type CSRPartnerToll } from '../services/csrPartnerService';
import PasswordViewer from '../components/PasswordViewer';

const AdminCSRPartnerManagement = () => {
  const [csrPartners, setCSRPartners] = useState<CSRPartner[]>([]);
  const [tolls, setTolls] = useState<{ [key: string]: CSRPartnerToll[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<CSRPartner | null>(null);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showTollForm, setShowTollForm] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    city: '',
    state: '',
  });
  const [tollFormData, setTollFormData] = useState({
    poc_name: '',
    contact_number: '',
    email_id: '',
    city: '',
    state: '',
    budget_allocation: '',
  });
  const { refreshData } = useFilter();
  const { pendingActions, scheduleAction, undoAction, isPending } = useDelayedUndoAction(10000);

  // Load CSR Partners
  useEffect(() => {
    loadCSRPartners();
  }, []);

  const loadCSRPartners = async () => {
    setLoading(true);
    try {
      const partners = await csrPartnerService.getAllPartners();
      setCSRPartners(partners);

      // Load tolls for each partner
      const tollsData: { [key: string]: CSRPartnerToll[] } = {};
      for (const partner of partners) {
        tollsData[partner.id] = await csrPartnerService.getTollsByPartner(partner.id);
      }
      setTolls(tollsData);
    } catch (error) {
      console.error('Error loading CSR partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePartnerDelete = (partner: CSRPartner) => {
    if (isPending('partner', partner.id)) return;

    scheduleAction('partner', partner.id, `CSR Partner: ${partner.company_name || partner.id}`, async () => {
      const success = await csrPartnerService.deletePartnerCascade(partner.id);
      if (!success) return;
      setSelectedPartner((current) => (current?.id === partner.id ? null : current));
      setTolls((current) => {
        if (partner.id in current) {
          const next = { ...current };
          delete next[partner.id];
          return next;
        }
        return current;
      });
      await loadCSRPartners();
      await refreshData();
    });
  };

  const handleScheduleTollDelete = (partner: CSRPartner, toll: CSRPartnerToll) => {
    if (isPending('toll', toll.id)) return;

    scheduleAction('toll', toll.id, `Toll: ${toll.poc_name || toll.toll_name || toll.id}`, async () => {
      const success = await csrPartnerService.deleteToll(toll.id);
      if (!success) return;
      await loadCSRPartners();
      await refreshData();
    });
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPartner = await csrPartnerService.createPartner({
        company_name: formData.company_name,
        city: formData.city,
        state: formData.state,

        is_active: true,
      });

      if (newPartner) {
        setCSRPartners([...csrPartners, newPartner]);
        setTolls({ ...tolls, [newPartner.id]: [] });
        setFormData({ company_name: '', city: '', state: '' });
        setShowPartnerForm(false);
        alert('CSR Partner added successfully!');
      }
    } catch (error) {
      console.error('Error adding partner:', error);
      alert('Failed to add CSR Partner');
    }
  };

  const handleAddToll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;

    try {
      const newToll = await csrPartnerService.createToll({
        csr_partner_id: selectedPartner.id,
        poc_name: tollFormData.poc_name,
        contact_number: tollFormData.contact_number,
        email_id: tollFormData.email_id,
        city: tollFormData.city,
        state: tollFormData.state,
        budget_allocation: parseFloat(tollFormData.budget_allocation) || 0,
        is_active: true,
      });

      if (newToll) {
        const updatedTolls = tolls[selectedPartner.id] || [];
        setTolls({
          ...tolls,
          [selectedPartner.id]: [...updatedTolls, newToll],
        });
        setTollFormData({
          poc_name: '',
          contact_number: '',
          email_id: '',
          city: '',
          state: '',
          budget_allocation: '',
        });
        setShowTollForm(false);
        alert('Toll added successfully!');
      }
    } catch (error) {
      console.error('Error adding toll:', error);
      alert('Failed to add toll');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">CSR Partner Management</h1>
              <p className="text-gray-600 mt-2">Manage CSR partners and their toll operations</p>
            </div>
            <button
              onClick={() => setShowPartnerForm(!showPartnerForm)}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Partner</span>
            </button>
          </div>
        </motion.div>

        {pendingActions.length > 0 && (
          <div className="mb-6 space-y-3">
            {pendingActions.map((action) => {
              const entityLabel = action.entityType === 'partner' ? 'CSR Partner' : 'Toll';
              const secondsLeft = Math.max(0, Math.ceil((action.expiresAt - Date.now()) / 1000));
              return (
                <div
                  key={action.key}
                  className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800"
                >
                  <div>
                    <p className="font-semibold">{entityLabel} deletion scheduled</p>
                    <p className="text-xs text-amber-600">
                      {action.label} — undo within {secondsLeft}s
                    </p>
                  </div>
                  <button
                    onClick={() => undoAction(action.key)}
                    className="px-3 py-1 rounded-lg bg-white border border-amber-200 text-amber-700 font-semibold"
                  >
                    Undo
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Partner Form */}
        {showPartnerForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-emerald-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add New CSR Partner</h2>
            <form onSubmit={handleAddPartner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company Name *"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <input
                  type="text"
                  placeholder="City *"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <input
                  type="text"
                  placeholder="State *"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPartnerForm(false)}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                >
                  Add Partner
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* CSR Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {csrPartners.map((partner) => {
            const pendingEntry = pendingActions.find((entry) => entry.key === `partner:${partner.id}`);
            const pendingSecondsLeft = pendingEntry
              ? Math.max(0, Math.ceil((pendingEntry.expiresAt - Date.now()) / 1000))
              : 0;

            return (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => {
                  if (isPending('partner', partner.id)) return;
                  setSelectedPartner(selectedPartner?.id === partner.id ? null : partner);
                }}
                className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                  selectedPartner?.id === partner.id
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit
                      }}
                      className="px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-1 text-sm text-gray-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSchedulePartnerDelete(partner);
                      }}
                      className="px-3 py-2 hover:bg-red-50 rounded-lg flex items-center gap-1 text-sm text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.company_name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{partner.city}, {partner.state}</span>
                  </div>
                </div>

                {selectedPartner?.id === partner.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t border-emerald-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Tolls/Sub-offices ({tolls[partner.id]?.length || 0})</span>
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTollForm(true);
                        }}
                        className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Toll</span>
                      </button>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 mb-4">
                      <PasswordViewer
                        label="Partner Password"
                        password={partner.poc_password ?? null}
                        description="Existing password for partner access settings"
                        className="text-sm"
                      />
                    </div>

                    {showTollForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 rounded-xl p-4 mb-4"
                      >
                        <form onSubmit={handleAddToll} className="space-y-3">
                          <input
                            type="text"
                            placeholder="POC Name *"
                            value={tollFormData.poc_name}
                            onChange={(e) => setTollFormData({ ...tollFormData, poc_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Contact"
                              value={tollFormData.contact_number}
                              onChange={(e) => setTollFormData({ ...tollFormData, contact_number: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={tollFormData.email_id}
                              onChange={(e) => setTollFormData({ ...tollFormData, email_id: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="City"
                              value={tollFormData.city}
                              onChange={(e) => setTollFormData({ ...tollFormData, city: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={tollFormData.state}
                              onChange={(e) => setTollFormData({ ...tollFormData, state: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <input
                            type="number"
                            placeholder="Budget Allocation"
                            value={tollFormData.budget_allocation}
                            onChange={(e) => setTollFormData({ ...tollFormData, budget_allocation: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowTollForm(false)}
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {tolls[partner.id]?.length > 0 ? (
                      <div className="space-y-2">
                        {tolls[partner.id].map((toll) => {
                          const pendingEntry = pendingActions.find((entry) => entry.key === `toll:${toll.id}`);
                          const secondsLeft = pendingEntry
                            ? Math.max(0, Math.ceil((pendingEntry.expiresAt - Date.now()) / 1000))
                            : 0;
                          return (
                            <div key={toll.id} className="relative bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{toll.poc_name}</p>
                                  <p className="text-xs text-gray-500">{toll.city}, {toll.state}</p>
                                  {toll.contact_number && (
                                    <p className="text-xs text-gray-600">{toll.contact_number}</p>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleScheduleTollDelete(partner, toll);
                                  }}
                                  className="p-1 hover:bg-red-100 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                              <div className="mt-3">
                                <PasswordViewer
                                  label="Toll Password"
                                  password={toll.poc_password ?? null}
                                  description="Stored password for this toll's POC"
                                  className="rounded-2xl border border-gray-200 bg-gray-50 p-3"
                                />
                              </div>
                              {toll.budget_allocation > 0 && (
                                <div className="mt-2 flex items-center space-x-1 text-xs text-emerald-600">
                                  <DollarSign className="w-3 h-3" />
                                  <span>Budget: {toll.budget_allocation.toLocaleString()}</span>
                                </div>
                              )}
                              {pendingEntry && (
                                <div className="pointer-events-none absolute inset-0 rounded-lg bg-white/80 flex flex-col items-center justify-center gap-1 text-amber-700 text-center px-3">
                                  <p className="text-xs font-semibold">Deletion queued</p>
                                  <p className="text-[11px] text-amber-600">{secondsLeft}s left • Undo above</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No tolls added yet</p>
                    )}
                  </motion.div>
                )}
                {pendingEntry && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/80 flex flex-col items-center justify-center gap-1 text-amber-700 text-center px-4">
                    <p className="text-sm font-semibold">Deletion queued</p>
                    <p className="text-xs text-amber-600">{pendingSecondsLeft}s left • Undo above</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {csrPartners.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No CSR Partners found. Add your first partner to get started.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminCSRPartnerManagement;
