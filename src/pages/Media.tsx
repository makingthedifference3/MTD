import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import {
  getAllArticles,
  getArticleStats,
  deleteArticle,
  createArticle,
} from '@/services/mediaArticleService';
import type { MediaArticle, ArticleStats } from '@/services/mediaArticleService';

interface MediaItem extends MediaArticle {
  newsChannel?: string;
}

const Media = () => {
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
        console.error('Error loading media:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMediaData();
  }, []);

  // Filter media items based on selected filters
  const filteredMedia = mediaItems.filter(item => {
    const matchesType = filterType === 'all' || item.media_type === filterType;
    const matchesChannel = filterNewsChannel === 'all' || item.newsChannel === filterNewsChannel;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesType && matchesChannel && matchesCategory;
  });

  // Calculate statistics from loaded data
  const statsCards = [
    { label: 'Total Files', value: mediaItems.length },
    { label: 'Images', value: mediaItems.filter(m => m.media_type === 'photo').length },
    { label: 'Videos', value: mediaItems.filter(m => m.media_type === 'video').length },
    { label: 'Published', value: stats.published },
  ];

  // Handle media deletion
  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;
    
    try {
      const success = await deleteArticle(id);
      if (success) {
        setMediaItems(mediaItems.filter(item => item.id !== id));
        alert('Media deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media');
    }
  };

  // Handle media upload
  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      alert('User not authenticated');
      return;
    }

    setIsUploading(true);
    try {
      const media_code = `MEDIA_${Date.now()}`;
      const newArticle = await createArticle({
        media_code,
        title: uploadForm.title,
        description: uploadForm.description,
        media_type: uploadForm.media_type,
        category: uploadForm.category || 'General',
        sub_category: uploadForm.news_channel,
        drive_link: uploadForm.drive_link,
        uploaded_by: currentUser.id,
        is_public: false,
        created_by: currentUser.id,
      });

      if (newArticle) {
        const formattedArticle: MediaItem = {
          ...newArticle,
          newsChannel: newArticle.sub_category || 'General',
        };
        setMediaItems([formattedArticle, ...mediaItems]);
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
        alert('Media uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Management</h1>
            <p className="text-gray-600 mt-2">Manage media articles, news coverage and uploads</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg"
            >
              <Upload className="w-5 h-5" />
              <span>UPLOAD MEDIA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Media</h2>
          <form onSubmit={handleUploadMedia} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Media heading"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                <select
                  value={uploadForm.media_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, media_type: e.target.value as 'photo' | 'video' | 'document' | 'pdf' | 'newspaper_cutting' | 'certificate' | 'report' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="pdf">PDF</option>
                  <option value="newspaper_cutting">Newspaper Cutting</option>
                  <option value="certificate">Certificate</option>
                  <option value="report">Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Event, Geo-tagged"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">News Channel</label>
                <input
                  type="text"
                  value={uploadForm.news_channel}
                  onChange={(e) => setUploadForm({ ...uploadForm, news_channel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Zee News, NDTV"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Drive Link</label>
                <input
                  type="url"
                  required
                  value={uploadForm.drive_link}
                  onChange={(e) => setUploadForm({ ...uploadForm, drive_link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Media description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading media...</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
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

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Types</option>
                  <option value="photo">Photos</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                  <option value="pdf">PDFs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">News Channel</label>
                <select
                  value={filterNewsChannel}
                  onChange={(e) => setFilterNewsChannel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Channels</option>
                  <option value="Zee News">Zee News</option>
                  <option value="NDTV">NDTV</option>
                  <option value="India Today">India Today</option>
                  <option value="Aaj Tak">Aaj Tak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Event">Event</option>
                  <option value="Geo-tagged">Geo-tagged</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 font-medium">
                  {filteredMedia.length} items
                </div>
              </div>
            </div>
          </motion.div>

          {/* Media List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">MEDIA ARTICLES</h2>
            {filteredMedia.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No media found matching your filters</p>
              </div>
            ) : (
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
                          <div className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-full font-bold text-sm flex-1 max-w-2xl">
                            {item.media_type.toUpperCase()} {item.category ? `(${item.category})` : ''}
                          </div>
                          {item.newsChannel && (
                            <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                              {item.newsChannel}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-gray-900 font-semibold mb-2">{item.title}</p>
                          {item.drive_link && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                              <LinkIcon className="w-4 h-4" />
                              <a href={item.drive_link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                                View in Drive
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>Date: {new Date(item.created_at || '').toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Views: {item.views_count || 0}</span>
                            <span>•</span>
                            <span>Downloads: {item.downloads_count || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button 
                          onClick={() => setSelectedMedia(selectedMedia === item.id ? null : item.id)}
                          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          VIEW
                        </button>
                        <button 
                          onClick={() => handleDeleteMedia(item.id)}
                          className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          DELETE
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
                            <p className="text-sm font-semibold text-gray-600">Media Type:</p>
                            <p className="text-gray-900 capitalize">{item.media_type}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Category:</p>
                            <p className="text-gray-900">{item.category || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Published:</p>
                            <p className="text-gray-900">{item.is_public ? 'Yes' : 'No'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Created:</p>
                            <p className="text-gray-900">{new Date(item.created_at || '').toLocaleDateString()}</p>
                          </div>
                        </div>
                        {item.description && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Description:</p>
                            <p className="text-gray-700 text-sm">{item.description}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Media;
