import { motion } from 'framer-motion';
import { Plus, Newspaper } from 'lucide-react';
import { mediaArticles } from '../mockData';

const ArticlePage = () => {
  const articles = mediaArticles.filter(m => m.type === 'article');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Article</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Article</span>
        </motion.button>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add News Article</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Article Heading" />
          <input type="date" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Date" />
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="Article Link" />
          <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg" placeholder="News Channel" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2">
            <option>Select Format</option>
            <option>Article</option>
            <option>Blog Post</option>
            <option>Press Release</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">Upload</button>
        </div>
      </div>

      {/* Articles List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">List of Media Articles</h3>
        <div className="space-y-4">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Newspaper className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{article.heading}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">News Channel</p>
                      <p className="font-medium text-gray-900">{article.newsChannel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">{new Date(article.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Format</p>
                      <p className="font-medium text-gray-900">{article.format}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors">
                      View More
                    </a>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
                      Format
                    </button>
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

export default ArticlePage;
