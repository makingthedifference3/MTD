import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, Eye } from 'lucide-react';
import { getAllBills, type Bill } from '@/services/billsService';
import { useFilter } from '../context/useFilter';

interface DisplayBill extends Bill {
  overview: string;
  displayStatus: 'submitted' | 'not-submitted';
}

const Bills = () => {
  const [dateRange, setDateRange] = useState('25/10/26 - 26/10/26');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [bills, setBills] = useState<DisplayBill[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedProject } = useFilter();

  // Fetch bills from database
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const billsData = await getAllBills();
        
        // Transform database bills to display format
        const displayBills: DisplayBill[] = billsData.map(bill => ({
          ...bill,
          overview: bill.bill_overview || 'BILL OVERVIEW',
          displayStatus: 
            bill.status === 'approved' || bill.status === 'paid' 
              ? 'submitted' 
              : 'not-submitted'
        }));

        // Filter by selected project if applicable
        const filteredBills = displayBills.filter(bill => {
          if (selectedProject && bill.project_id) {
            return bill.project_id === selectedProject;
          }
          return true;
        });

        setBills(filteredBills);
      } catch (err) {
        console.error('Error loading bills:', err);
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [selectedProject]);

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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600">Loading bills...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl">
            <p className="text-gray-600">No bills found</p>
          </div>
        ) : (
          bills.map((bill, index) => (
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
                  <p className="text-sm text-gray-600 mt-1">{bill.bill_number || bill.bill_code}</p>
                </div>

                {/* Badges and Button */}
                <div className="flex items-center space-x-3">
                  {/* Date Badge */}
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    DATE: {bill.date ? new Date(bill.date).toLocaleDateString('en-GB') : 'N/A'}
                  </span>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bill.displayStatus === 'submitted'
                      ? 'bg-pink-300 text-pink-900'
                      : 'bg-red-400 text-white'
                  }`}>
                    {bill.displayStatus === 'submitted' ? 'SUBMITTED' : 'NOT SUBMITTED'}
                  </span>

                  {/* View Button */}
                  <button className="flex items-center space-x-2 px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">VIEW</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bills;
