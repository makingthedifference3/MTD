import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Eye } from 'lucide-react';

interface MediaItem {
  id: string;
  heading: string;
  type: 'image' | 'video' | 'document';
  project: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  url: string;
  link?: string;
  format: string;
  newsChannel?: string;
  category?: string; // 'geo-tagged' | 'event' | 'general'
}

const Media = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterNewsChannel, setFilterNewsChannel] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  
  const [mediaItems] = useState<MediaItem[]>([
    { 
      id: 'M001', 
      heading: 'Community Health Camp Coverage', 
      type: 'image', 
      project: 'Community Center', 
      uploadedBy: 'John Doe', 
      uploadDate: '2024-06-15', 
      size: '2.4 MB', 
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
      link: 'https://example.com/media1',
      format: 'JPG',
      newsChannel: 'Zee News',
      category: 'geo-tagged'
    },
    { 
      id: 'M002', 
      heading: 'Education Drive Launch Event', 
      type: 'video', 
      project: 'Education Drive', 
      uploadedBy: 'Jane Smith', 
      uploadDate: '2024-06-14', 
      size: '45.2 MB', 
      url: '',
      link: 'https://youtube.com/watch?v=example',
      format: 'MP4',
      newsChannel: 'NDTV',
      category: 'event'
    },
    { 
      id: 'M003', 
      heading: 'Health Camp Success Story', 
      type: 'image', 
      project: 'Health Camp', 
      uploadedBy: 'Mike Johnson', 
      uploadDate: '2024-06-13', 
      size: '1.2 MB', 
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
      link: 'https://example.com/media3',
      format: 'PNG',
      newsChannel: 'India Today',
      category: 'geo-tagged'
    },
    { 
      id: 'M004', 
      heading: 'Water Conservation Initiative', 
      type: 'image', 
      project: 'Clean Water', 
      uploadedBy: 'Sarah Williams', 
      uploadDate: '2024-06-12', 
      size: '3.1 MB', 
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
      link: 'https://example.com/media4',
      format: 'JPG',
      newsChannel: 'Aaj Tak',
      category: 'event'
    },
  ]);

  const filteredMedia = mediaItems.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesChannel = filterNewsChannel === 'all' || item.newsChannel === filterNewsChannel;
    return matchesType && matchesChannel;
  });

  const stats = [
    { label: 'Total Files', value: mediaItems.length },
    { label: 'Images', value: mediaItems.filter(m => m.type === 'image').length },
    { label: 'Videos', value: mediaItems.filter(m => m.type === 'video').length },
    { label: 'Geo-Tagged', value: mediaItems.filter(m => m.category === 'geo-tagged').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Heading</h1>
            <p className="text-gray-600 mt-2">Manage media articles, news coverage and uploads</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-emerald-50 transition-colors">
              <LinkIcon className="w-5 h-5" />
              <span>LINK</span>
            </button>
            <button className="bg-white border-2 border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              FORMAT
            </button>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg">
              <Upload className="w-5 h-5" />
              <span>UPLOAD</span>
            </button>
          </div>
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

      {/* Filter - Enhanced with News Channel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Media Heading Filter</label>
            <select
              value={filterNewsChannel}
              onChange={(e) => setFilterNewsChannel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-amber-50 font-medium"
            >
              <option value="all">All News Channels</option>
              <option value="Zee News">Zee News</option>
              <option value="NDTV">NDTV</option>
              <option value="India Today">India Today</option>
              <option value="Aaj Tak">Aaj Tak</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Media Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* List of Media Articles */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">LIST OF MEDIA ARTICLE</h2>
        <div className="space-y-4">
          {filteredMedia.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-full font-bold text-lg flex-1 max-w-2xl">
                      HEADING {item.category === 'geo-tagged' ? '(GEO TAGGED)' : item.category === 'event' ? '(EVENT)' : ''}
                    </div>
                    {item.newsChannel && (
                      <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                        {item.newsChannel}
                      </span>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 font-semibold mb-2">{item.heading}</p>
                    {item.link && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <LinkIcon className="w-4 h-4" />
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {item.link}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span>Date: {item.uploadDate}</span>
                      <span>•</span>
                      <span>Format: {item.format}</span>
                      <span>•</span>
                      <span>Size: {item.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button 
                    onClick={() => setSelectedMedia(selectedMedia === item.id ? null : item.id)}
                    className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    VIEW MORE
                  </button>
                  <button className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors">
                    FORMAT
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              {selectedMedia === item.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Project:</p>
                      <p className="text-gray-900">{item.project}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Uploaded By:</p>
                      <p className="text-gray-900">{item.uploadedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Type:</p>
                      <p className="text-gray-900 capitalize">{item.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Category:</p>
                      <p className="text-gray-900 capitalize">{item.category}</p>
                    </div>
                  </div>
                  {item.url && (
                    <div className="mt-4">
                      <img src={item.url} alt={item.heading} className="w-full max-h-64 object-cover rounded-lg" />
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Media;
