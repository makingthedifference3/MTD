import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { dataEntries } from '../mockData';

const DataEntryPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Data Entry</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Entry</span>
        </motion.button>
      </div>

      {/* Entry Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Data Entry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Name" />
          <input type="date" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Date" />
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" placeholder="School Name" />
          <div className="md:col-span-2 flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="radio" name="formType" value="pre" className="w-4 h-4" />
              <span className="text-gray-700">Pre Form</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="formType" value="post" className="w-4 h-4" />
              <span className="text-gray-700">Post Form</span>
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
          <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">Cancel</button>
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">Save Entry</button>
        </div>
      </div>

      {/* Entries List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Entries</h3>
        <div className="space-y-4">
          {dataEntries.map((entry, index) => (
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
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${entry.formType === 'Pre Form' ? 'bg-emerald-50 text-emerald-700' : 'bg-green-100 text-green-700'}`}>
                        {entry.formType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataEntryPage;
