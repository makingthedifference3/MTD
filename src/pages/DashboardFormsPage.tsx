import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Camera, ChevronDown, Eye, Edit, Loader } from 'lucide-react';
import { getDataEntryFormsWithDetails, type DocumentForm } from '@/services/dataEntryFormsService';

interface BeneficiaryCount {
  current: number;
  target: number;
  location: string;
}

const DashboardFormsPage = () => {
  const [beneficiaryCount, setBeneficiaryCount] = useState<BeneficiaryCount>({
    current: 200,
    target: 5000,
    location: 'Overall'
  });

  const [documents, setDocuments] = useState<DocumentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTestFormat, setShowTestFormat] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        setError(null);
        const forms = await getDataEntryFormsWithDetails();
        setDocuments(forms);
      } catch (err) {
        setError('Failed to load form data');
        console.error('Error fetching forms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, []);

  const incrementCount = () => {
    if (beneficiaryCount.current < beneficiaryCount.target) {
      setBeneficiaryCount({ ...beneficiaryCount, current: beneficiaryCount.current + 1 });
    }
  };

  const decrementCount = () => {
    if (beneficiaryCount.current > 0) {
      setBeneficiaryCount({ ...beneficiaryCount, current: beneficiaryCount.current - 1 });
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Forms</h1>
            <p className="text-gray-600 mt-2">Manage documents, forms and beneficiary data</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg">
            <Plus className="w-5 h-5" />
            <span>New Form</span>
          </button>
        </div>
      </div>

      {/* Beneficiary Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">No. of Beneficiary</h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{beneficiaryCount.current}/{beneficiaryCount.target}</p>
                <p className="text-sm text-gray-600 mt-2">Current / Target</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={incrementCount}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>ADD</span>
                </button>
                <button
                  onClick={decrementCount}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-md"
                >
                  <Minus className="w-5 h-5" />
                  <span>MINUS</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium">
              <option value="overall">Overall</option>
              <option value="mumbai">Mumbai</option>
              <option value="delhi">Delhi</option>
              <option value="bangalore">Bangalore</option>
            </select>
            <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
              <p className="text-sm font-bold text-gray-700">COUNT</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Document Forms List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Document Forms</h2>
          <button
            onClick={() => setShowTestFormat(!showTestFormat)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            {showTestFormat ? 'Hide' : 'Show'} Test Format
          </button>
        </div>

        {/* Test Format Table */}
        {showTestFormat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">TEST FORMAT</h3>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-700 border-r border-gray-200">DATE:</td>
                  <td className="p-4 border-r border-gray-200"></td>
                  <td className="p-4 font-semibold text-gray-700 border-r border-gray-200">UPDATE NUMBER:</td>
                  <td className="p-4 border-r border-gray-200"></td>
                  <td className="p-4 font-semibold text-gray-700 border-r border-gray-200">DOCUMENT NUMBER:</td>
                  <td className="p-4"></td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-700 border-r border-gray-200" colSpan={3}>SCHOOL NAME:</td>
                  <td className="p-4" colSpan={3}></td>
                  <td className="p-4 font-semibold text-gray-700 border-l border-gray-200" colSpan={2}>ADDRESS:</td>
                  <td className="p-4"></td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-700" colSpan={6}>DESCRIPTION:</td>
                </tr>
                <tr>
                  <td className="p-4 text-center border-r border-gray-200" colSpan={2}>IMAGE 1</td>
                  <td className="p-4 text-center border-r border-gray-200" colSpan={2}>IMAGE 2</td>
                  <td className="p-4 text-center" colSpan={2}>IMAGE 3</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Document Cards */}
        {documents.length > 0 ? (
          documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              {/* Document Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h3 className="text-xl font-bold text-gray-900">DOCUMENT HEADING</h3>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                    UPDATE NUMBER
                  </span>
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                    DATE
                  </span>
                  <span className="w-3 h-3 bg-gray-900 rounded-full"></span>
                  <span className="px-4 py-2 bg-white border-2 border-gray-900 rounded-full text-sm font-medium">
                    FORMAT
                  </span>
                </div>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Document Heading:</p>
                  <p className="text-gray-900">{doc.documentHeading}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Update Number:</p>
                  <p className="text-gray-900">{doc.updateNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Date:</p>
                  <p className="text-gray-900">{doc.date}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Document Number:</p>
                  <p className="text-gray-900">{doc.documentNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-600 mb-1">School Name:</p>
                  <p className="text-gray-900">{doc.schoolName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Address:</p>
                  <p className="text-gray-900">{doc.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Description:</p>
                  <p className="text-gray-900">{doc.description}</p>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-600 mb-3">Attached Images:</p>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:border-emerald-500 transition-colors cursor-pointer">
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Image {num}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex gap-3">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>FORMAT</option>
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>Word</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2">
                    <option>CLIENT</option>
                    <option>Health Foundation</option>
                    <option>Education Trust</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-white border-2 border-emerald-500 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    EDIT
                  </button>
                  <button className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    VIEW MORE
                  </button>
                </div>
              </div>

              {/* Admin Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedDocument(selectedDocument === doc.id ? null : doc.id)}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-colors shadow-lg flex items-center gap-2"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${selectedDocument === doc.id ? 'rotate-180' : ''}`} />
                  ADMIN
                </button>
              </div>

              {/* Expandable Admin Section */}
              {selectedDocument === doc.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-50 rounded-lg p-4 mt-4"
                >
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Admin:</span> {doc.admin}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-semibold">Client:</span> {doc.client}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-semibold">No forms found</p>
            <p className="text-sm mt-2">Start by creating a new form to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFormsPage;
