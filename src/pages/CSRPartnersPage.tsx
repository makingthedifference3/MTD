import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Building2, MapPin, Phone, Mail, Loader } from 'lucide-react';
import { getCSRPartnersWithStats, getPartnerStats, type CSRPartnerStats, type PartnerStats } from '@/services/csrPartnersService';

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

  useEffect(() => {
    const fetchPartnerData = async () => {
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
    };

    fetchPartnerData();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CSR Partners</h1>
            <p className="text-gray-600 mt-2">Manage and track CSR partner organizations</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium {
                partner.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
              }`}>
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

            <button className="w-full mt-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 rounded-lg transition-colors">
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
    </div>
  );
};

export default CSRPartnersPage;
