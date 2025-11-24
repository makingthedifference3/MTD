import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader, X } from 'lucide-react';
import {
  getAllDataEntryForms,
  createDataEntryForm,
  getDataEntryFormStats,
  type DataEntryForm,
} from '@/services/dataEntryFormsService';

interface FormEntry {
  id: string;
  name: string;
  schoolName: string;
  date: string;
  formType: string;
}

const DataEntryPage = () => {
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({ totalForms: 0, draftForms: 0, submittedForms: 0, verifiedForms: 0 });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    schoolName: '',
    formType: 'Survey',
  });

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const forms = await getAllDataEntryForms();
        const formStats = await getDataEntryFormStats();
        
        // Transform to FormEntry display format
        const transformedEntries: FormEntry[] = forms.map((form) => ({
          id: form.id,
          name: form.form_name || 'Untitled Form',
          schoolName: form.school_name || 'N/A',
          date: form.date,
          formType: form.form_type || 'Survey',
        }));

        setEntries(transformedEntries);
        setStats(formStats);
      } catch (err) {
        setError('Failed to load data entries');
        console.error('Error fetching entries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleSaveEntry = async () => {
    try {
      if (!formData.name || !formData.schoolName) {
        alert('Please fill in all required fields');
        return;
      }

      const newEntry: Omit<DataEntryForm, 'id' | 'created_at' | 'updated_at'> = {
        form_code: `FORM-${Date.now()}`,
        project_id: '00000000-0000-0000-0000-000000000000', // Replace with actual project ID
        form_name: formData.name,
        form_type: formData.formType as 'Survey' | 'Assessment' | 'Feedback' | 'Registration',
        date: formData.date,
        school_name: formData.schoolName,
        location: formData.schoolName,
        institution_name: formData.schoolName,
        template_id: null,
        pre_form_data: {},
        post_form_data: {},
        responses: {},
        respondent_name: '',
        respondent_type: '',
        respondent_count: 0,
        filled_form_drive_link: '',
        scanned_form_drive_link: '',
        submitted_by: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID
        verified_by: null,
        status: 'draft',
        notes: '',
        metadata: {},
        created_by: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID
      };

      const result = await createDataEntryForm(newEntry);
      if (result) {
        setEntries([
          ...entries,
          {
            id: result.id,
            name: result.form_name,
            schoolName: result.school_name,
            date: result.date,
            formType: result.form_type,
          },
        ]);
        setFormData({ name: '', date: new Date().toISOString().split('T')[0], schoolName: '', formType: 'Survey' });
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error saving entry:', err);
      alert('Failed to save entry');
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Data Entry</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Entry</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Total Forms</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalForms}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-500">{stats.draftForms}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Submitted</p>
          <p className="text-2xl font-bold text-amber-600">{stats.submittedForms}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Verified</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.verifiedForms}</p>
        </div>
      </div>

      {/* Entry Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Create Data Entry</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Form Name"
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="School Name"
            />
            <div className="md:col-span-2 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="formType"
                  value="Survey"
                  checked={formData.formType === 'Survey'}
                  onChange={(e) => setFormData({ ...formData, formType: e.target.value })}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Survey</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="formType"
                  value="Assessment"
                  checked={formData.formType === 'Assessment'}
                  onChange={(e) => setFormData({ ...formData, formType: e.target.value })}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Assessment</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="formType"
                  value="Feedback"
                  checked={formData.formType === 'Feedback'}
                  onChange={(e) => setFormData({ ...formData, formType: e.target.value })}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Feedback</span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEntry}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Save Entry
            </button>
          </div>
        </motion.div>
      )}

      {/* Entries List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Entries</h3>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{entry.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">School</p>
                        <p className="font-medium text-gray-900">{entry.schoolName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Form Type</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            entry.formType === 'Survey' || entry.formType === 'Pre Form'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {entry.formType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-semibold">No entries found</p>
            <p className="text-sm mt-2">Create a new entry to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataEntryPage;
