import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Building2, MapPin, Phone, Mail } from 'lucide-react';

interface CSRPartner {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  activeProjects: number;
  totalBudget: number;
  status: 'active' | 'inactive';
}

const CSRPartnersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partners] = useState<CSRPartner[]>([
    { id: 'P001', name: 'Green Earth Foundation', location: 'Mumbai', contactPerson: 'Raj Kumar', phone: '+91 98765 43210', email: 'raj@greenearth.org', activeProjects: 8, totalBudget: 850000, status: 'active' },
    { id: 'P002', name: 'Education First Trust', location: 'Delhi', contactPerson: 'Priya Sharma', phone: '+91 98765 43211', email: 'priya@edufirst.org', activeProjects: 12, totalBudget: 1200000, status: 'active' },
    { id: 'P003', name: 'Healthcare Alliance', location: 'Bangalore', contactPerson: 'Amit Patel', phone: '+91 98765 43212', email: 'amit@healthalliance.org', activeProjects: 5, totalBudget: 600000, status: 'active' },
    { id: 'P004', name: 'Clean Water Initiative', location: 'Chennai', contactPerson: 'Sarah Williams', phone: '+91 98765 43213', email: 'sarah@cleanwater.org', activeProjects: 3, totalBudget: 450000, status: 'inactive' },
  ]);

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Partners', value: partners.length },
    { label: 'Active Partners', value: partners.filter(p => p.status === 'active').length },
    { label: 'Total Projects', value: partners.reduce((sum, p) => sum + p.activeProjects, 0) },
    { label: 'Total Budget', value: `₹${(partners.reduce((sum, p) => sum + p.totalBudget, 0) / 1000000).toFixed(1)}M` },
  ];

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
        {stats.map((stat, index) => (
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
        {filteredPartners.map((partner, index) => (
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
        ))}
      </div>
    </div>
  );
};

export default CSRPartnersPage;
