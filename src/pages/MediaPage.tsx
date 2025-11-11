import { motion } from 'framer-motion';
import { Plus, Video, Image as ImageIcon } from 'lucide-react';
import { mediaArticles } from '../mockData';

const MediaPage = () => {
  const mediaItems = mediaArticles.filter(m => m.type === 'photo' || m.type === 'video');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Media</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Upload Media</span>
        </motion.button>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Photo/Video</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Media Heading" />
          <input type="date" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Date" />
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Drive Link" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>Select Format</option>
            <option>JPEG</option>
            <option>PNG</option>
            <option>MP4</option>
            <option>MOV</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">Upload</button>
        </div>
      </div>

      {/* Media List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">List of Media Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="bg-emerald-50 p-8 flex items-center justify-center">
                {item.type === 'video' ? (
                  <Video className="w-16 h-16 text-emerald-600" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-emerald-600" />
                )}
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-800 mb-2">{item.heading}</h4>
                <div className="space-y-1 mb-4">
                  <p className="text-xs text-gray-500">Date: {new Date(item.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Format: {item.format}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-center text-sm font-medium transition-colors">
                    View More
                  </a>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
                    Format
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaPage;
