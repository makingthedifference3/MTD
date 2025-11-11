import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, Eye } from 'lucide-react';
import { bills } from '../mockData';
import { useFilter } from '../context/FilterContext';

interface Bill {
  id: string;
  overview: string;
  date: string;
  status: 'submitted' | 'not-submitted';
  vendor?: string;
  project?: string;
  amount?: number;
  category?: string;
  description?: string;
}

const Bills = () => {
  const [dateRange, setDateRange] = useState('25/10/26 - 26/10/26');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const { selectedPartner, selectedProject } = useFilter();
  
  // Convert mockData bills to UI format and filter
  const formattedBills: Bill[] = bills
    .filter(bill => {
      // Filter by selected partner/project if any
      if (selectedPartner && selectedProject) {
        // Check if bill belongs to selected project
        return bill.id.toLowerCase().includes(selectedProject.toLowerCase());
      }
      return true;
    })
    .map(bill => ({
      id: bill.id,
      overview: 'BILL OVERVIEW',
      date: new Date(bill.billDate).toLocaleDateString('en-GB').replace(/\//g, '/'),
      status: bill.status === 'Submitted' || bill.status === 'Accepted' ? 'submitted' : 'not-submitted',
      vendor: bill.submittedBy,
      project: bill.billName,
      amount: bill.totalAmount,
      category: bill.category,
      description: bill.description
    }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bills Management</h1>
        <p className="text-gray-600 mt-2">Track and manage bill submissions</p>
      </div>

      {/* Date Range Filter and Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <button
            onClick={() => setDateRange(dateRange === '25/10/26 - 26/10/26' ? '27/10/26 - 28/10/26' : '25/10/26 - 26/10/26')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">{dateRange}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <span className="text-sm font-medium">EXPORT</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showExportOptions && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-10">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50">Export PDF</button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50">Export Excel</button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50">Export CSV</button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Bill Overview Cards */}
      <div className="space-y-4">
        {formattedBills.map((bill, index) => (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              {/* Bill Overview Label */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">BILL OVERVIEW</h3>
                <p className="text-sm text-gray-600 mt-1">{bill.overview}</p>
              </div>

              {/* Badges and Button */}
              <div className="flex items-center space-x-3">
                {/* Date Badge */}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  DATE: {bill.date}
                </span>

                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  bill.status === 'submitted' 
                    ? 'bg-pink-300 text-pink-900' 
                    : 'bg-red-400 text-white'
                }`}>
                  {bill.status === 'submitted' ? 'SUBMITTED' : 'NOT SUBMITTED'}
                </span>

                {/* View Button */}
                <button className="flex items-center space-x-2 px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">VIEW</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Bills;
