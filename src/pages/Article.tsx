import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, User } from 'lucide-react';
import { getAllArticles, getArticleStats,type MediaArticle, type ArticleStats } from '@/services/mediaArticleService';
import { useNavigate } from 'react-router-dom';

const Article = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [articles, setArticles] = useState<MediaArticle[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
  });

  // Fetch articles and statistics from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, statsData] = await Promise.all([
          getAllArticles(),
          getArticleStats(),
        ]);

        setArticles(articlesData);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading articles:', err);
        // Fallback to empty arrays
        setArticles([]);
        setStats({ total: 0, published: 0, draft: 0, pending: 0 });
      }
    };

    fetchData();
  }, []);

  // Filter articles based on selected status
  const getArticleStatus = (article: MediaArticle): 'published' | 'draft' | 'pending' => {
    if (article.is_public && article.approved_by) return 'published';
    if (!article.is_public && !article.approved_by) return 'draft';
    return 'pending';
  };

  const filteredArticles = articles.filter(article => {
    if (filterStatus === 'all') return true;
    return getArticleStatus(article) === filterStatus;
  });

  const statsDisplay = [
    { label: 'Total Articles', value: stats.total },
    { label: 'Published', value: stats.published },
    { label: 'Drafts', value: stats.draft },
    { label: 'Pending', value: stats.pending },
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
          <button 
            onClick={() => navigate('/article')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat, index) => (
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
        {filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600">No articles found</p>
          </div>
        ) : (
          filteredArticles.map((article, index) => {
            const status = getArticleStatus(article);
            const authorName = article.reporter_name || article.created_by || 'Unknown';
            const publishDate = article.publication_date || article.created_at?.split('T')[0] || 'N/A';
            const excerpt = article.description || 'No description available';
            const category = article.category || 'Uncategorized';

            return (
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
                      <span className="text-xs text-gray-600">{category}</span>
                      <h3 className="font-bold text-gray-900 text-lg">{article.title}</h3>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                    status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {status.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{excerpt}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>{authorName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{publishDate}</span>
                  </div>
                  {article.views_count && (
                    <span className="text-emerald-600 font-medium">{article.views_count} views</span>
                  )}
                </div>

                <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 rounded-lg transition-colors">
                  {status === 'published' ? 'View Article' : 'Edit Draft'}
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Article;
