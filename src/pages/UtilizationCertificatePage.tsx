import { motion } from 'framer-motion';
import { Plus, Download, FileText } from 'lucide-react';
import { utilizationCertificates } from '../mockData';

const UtilizationCertificatePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Utilization Certificate</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Upload Certificate</span>
        </motion.button>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Certificate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" placeholder="Certificate Headline" />
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Drive Link" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>Select Format</option>
            <option>PDF</option>
            <option>Word Document</option>
            <option>Excel Sheet</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">Upload</button>
        </div>
      </div>

      {/* Certificates List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Certificates</h3>
        <div className="space-y-4">
          {utilizationCertificates.map((cert, index) => (
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
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{cert.headline}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Upload Date</p>
                      <p className="font-medium text-gray-900">{new Date(cert.uploadDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Format</p>
                      <p className="font-medium text-gray-900">{cert.format}</p>
                    </div>
                  </div>
                  <a
                    href={cert.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Certificate</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UtilizationCertificatePage;
