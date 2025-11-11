import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, User } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  category: string;
  status: 'published' | 'draft' | 'pending';
  excerpt: string;
  readTime: string;
}

const Article = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [articles] = useState<Article[]>([
    { id: 'ART001', title: 'Community Center Project Success Story', author: 'John Doe', publishDate: '2024-06-15', category: 'Project Update', status: 'published', excerpt: 'A detailed look at how the community center project transformed local lives...', readTime: '5 min' },
    { id: 'ART002', title: 'Education Drive: Reaching 10,000 Students', author: 'Jane Smith', publishDate: '2024-06-14', category: 'Impact Story', status: 'published', excerpt: 'Our education initiative has reached a major milestone with 10,000 students...', readTime: '4 min' },
    { id: 'ART003', title: 'Health Camp Planning Guide', author: 'Mike Johnson', publishDate: '2024-06-13', category: 'Guide', status: 'draft', excerpt: 'Best practices and lessons learned from organizing successful health camps...', readTime: '7 min' },
    { id: 'ART004', title: 'CSR Best Practices 2024', author: 'Sarah Williams', publishDate: '2024-06-12', category: 'Research', status: 'pending', excerpt: 'Latest trends and best practices in corporate social responsibility...', readTime: '8 min' },
  ]);

  const filteredArticles = articles.filter(article => 
    filterStatus === 'all' || article.status === filterStatus
  );

  const stats = [
    { label: 'Total Articles', value: articles.length },
    { label: 'Published', value: articles.filter(a => a.status === 'published').length },
    { label: 'Drafts', value: articles.filter(a => a.status === 'draft').length },
    { label: 'Pending', value: articles.filter(a => a.status === 'pending').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-600 mt-2">Manage project articles and blog posts</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
            <Plus className="w-5 h-5" />
            <span>New Article</span>
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

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
      >
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Articles</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="pending">Pending Review</option>
        </select>
      </motion.div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xs text-gray-600">{article.category}</span>
                  <h3 className="font-bold text-gray-900 text-lg">{article.title}</h3>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                article.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                article.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {article.status.toUpperCase()}
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{article.publishDate}</span>
              </div>
              <span className="text-emerald-600 font-medium">{article.readTime} read</span>
            </div>

            <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 rounded-lg transition-colors">
              {article.status === 'published' ? 'View Article' : 'Edit Draft'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Article;
