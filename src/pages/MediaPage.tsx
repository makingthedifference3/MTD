import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Video, Image as ImageIcon, Eye, Trash2, Download, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import {
  getAllArticles,
  getArticleStats,
  deleteArticle,
  createArticle,
  getArticlesByMediaType,
  incrementViewsCount,
} from '@/services/mediaArticleService';
import type { MediaArticle, ArticleStats } from '@/services/mediaArticleService';

interface MediaItem extends MediaArticle {
  newsChannel?: string;
}

const MediaPage = () => {
  const { currentUser } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterNewsChannel, setFilterNewsChannel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<ArticleStats>({ total: 0, published: 0, draft: 0, pending: 0 });
  
  // Form state for creating new media
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    media_type: 'photo' as 'photo' | 'video' | 'document' | 'pdf' | 'newspaper_cutting' | 'certificate' | 'report',
    category: '',
    drive_link: '',
    news_channel: '',
    project_id: '',
  });

  // Load media articles on component mount
  useEffect(() => {
    const loadMediaData = async () => {
      setIsLoading(true);
      try {
        const articles = await getAllArticles();
        const formattedArticles: MediaItem[] = articles.map(article => ({
          ...article,
          newsChannel: article.sub_category || 'General',
        }));
        setMediaItems(formattedArticles);
        const articleStats = await getArticleStats();
        setStats(articleStats);
      } catch (error) {
        console.error('Error loading media articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMediaData();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    const applyFilters = async () => {
      setIsLoading(true);
      try {
        let filtered = await getAllArticles();

        if (filterType !== 'all') {
          filtered = await getArticlesByMediaType(filterType);
        }

        if (filterNewsChannel !== 'all' && filtered.length > 0) {
          const channelFiltered = filtered.filter(item => item.sub_category === filterNewsChannel);
          filtered = channelFiltered;
        }

        if (filterCategory !== 'all' && filtered.length > 0) {
          const categoryFiltered = filtered.filter(item => item.category === filterCategory);
          filtered = categoryFiltered;
        }

        const formattedArticles: MediaItem[] = filtered.map(article => ({
          ...article,
          newsChannel: article.sub_category || 'General',
        }));
        setMediaItems(formattedArticles);
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    applyFilters();
  }, [filterType, filterNewsChannel, filterCategory]);

  // Handle upload form submission
  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.title || !uploadForm.drive_link || !uploadForm.project_id) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      await createArticle({
        media_code: `MEDIA-${Date.now()}`,
        title: uploadForm.title,
        description: uploadForm.description,
        media_type: uploadForm.media_type,
        category: uploadForm.category,
        sub_category: uploadForm.news_channel,
        drive_link: uploadForm.drive_link,
        is_public: true,
        project_id: uploadForm.project_id as unknown as string,
        uploaded_by: currentUser?.id as unknown as string,
        created_by: currentUser?.id as unknown as string,
      });

      // Reset form and reload data
      setUploadForm({
        title: '',
        description: '',
        media_type: 'photo',
        category: '',
        drive_link: '',
        news_channel: '',
        project_id: '',
      });
      setShowUploadForm(false);
      
      const articles = await getAllArticles();
      const formattedArticles: MediaItem[] = articles.map(article => ({
        ...article,
        newsChannel: article.sub_category || 'General',
      }));
      setMediaItems(formattedArticles);
      
      alert('Media uploaded successfully!');
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete with confirmation
  const handleDeleteMedia = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      try {
        await deleteArticle(id);
        setMediaItems(mediaItems.filter(item => item.id !== id));
        alert('Media deleted successfully!');
      } catch (error) {
        console.error('Error deleting media:', error);
        alert('Failed to delete media. Please try again.');
      }
    }
  };

  // Handle view increment
  const handleViewMedia = async (id: string, link: string) => {
    try {
      await incrementViewsCount(id);
      window.open(link, '_blank');
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const mediaTypeOptions = ['photo', 'video', 'document', 'pdf', 'newspaper_cutting', 'certificate', 'report'];
  const newsChannelOptions = ['News Channel', 'Social Media', 'Internal Updates', 'Client Reports', 'General'];
  const categoryOptions = ['Project Updates', 'Training', 'Events', 'Documentation', 'Impact'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Media Management</h2>
        <motion.button
          onClick={() => setShowUploadForm(!showUploadForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Upload Media</span>
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-600 text-sm">Total Items</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.total}</p>
        </motion.div>
        <motion.div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-600 text-sm">Published</p>
          <p className="text-3xl font-bold text-blue-600">{stats.published}</p>
        </motion.div>
        <motion.div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-600 text-sm">Draft</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
        </motion.div>
        <motion.div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              {mediaTypeOptions.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">News Channel</label>
            <select
              value={filterNewsChannel}
              onChange={(e) => setFilterNewsChannel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Channels</option>
              {newsChannelOptions.map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Media</h3>
          <form onSubmit={handleUploadMedia} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Media Title *"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={uploadForm.media_type}
                onChange={(e) => setUploadForm({...uploadForm, media_type: e.target.value as 'photo' | 'video' | 'document' | 'pdf' | 'newspaper_cutting' | 'certificate' | 'report'})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {mediaTypeOptions.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Category"
                value={uploadForm.category}
                onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={uploadForm.news_channel}
                onChange={(e) => setUploadForm({...uploadForm, news_channel: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Channel</option>
                {newsChannelOptions.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Drive Link *"
                value={uploadForm.drive_link}
                onChange={(e) => setUploadForm({...uploadForm, drive_link: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Project ID *"
                value={uploadForm.project_id}
                onChange={(e) => setUploadForm({...uploadForm, project_id: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <textarea
              placeholder="Description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Media List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Media Articles ({mediaItems.length})</h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-500">Loading media...</div>
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg">No media items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-emerald-50 p-8 flex items-center justify-center">
                  {item.media_type === 'video' ? (
                    <Video className="w-16 h-16 text-emerald-600" />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-emerald-600" />
                  )}
                </div>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="space-y-1 mb-4">
                    <p className="text-xs text-gray-500">Type: {item.media_type}</p>
                    {item.sub_category && <p className="text-xs text-gray-500">Channel: {item.sub_category}</p>}
                    {item.created_at && <p className="text-xs text-gray-500">Date: {new Date(item.created_at).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{item.views_count || 0} views</span>
                    <Download className="w-4 h-4 text-gray-400 ml-2" />
                    <span className="text-xs text-gray-500">{item.downloads_count || 0} downloads</span>
                  </div>
                  {selectedMedia === item.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gray-50 p-3 rounded-lg mb-3 text-sm"
                    >
                      {item.drive_link && <p className="text-gray-700 truncate">{item.drive_link}</p>}
                    </motion.div>
                  )}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedMedia(selectedMedia === item.id ? null : item.id)}
                      className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => item.drive_link && handleViewMedia(item.id, item.drive_link)}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPage;
