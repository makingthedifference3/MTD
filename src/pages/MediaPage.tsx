import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Video, Image as ImageIcon, Eye, Trash2, Download, X, Edit2, FileText } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { supabase } from '@/services/supabaseClient';
import {
  getAllArticles,
  deleteArticle,
  createArticle,
  updateArticle,
  getArticlesByMediaType,
} from '@/services/mediaArticleService';
import type { MediaArticle } from '@/services/mediaArticleService';
import { getAllTolls, type Toll } from '@/services/tollsService';

interface MediaItem extends MediaArticle {
  newsChannel?: string;
}

const MediaPage = () => {
  const { currentUser } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterNewsChannel, setFilterNewsChannel] = useState<string>('all');
  const [filterPartner, setFilterPartner] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterToll, setFilterToll] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [projects, setProjects] = useState<Array<{id: string; name: string; project_code: string; csr_partner_id?: string}>>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [csrPartners, setCSRPartners] = useState<Array<{id: string; name: string; company_name?: string}>>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [tolls, setTolls] = useState<Toll[]>([]);
  
  // Form state for creating/editing media
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [customChannel, setCustomChannel] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    media_type: 'photo' as 'photo' | 'video',
    drive_link: '',
    news_channel: '',
    project_id: '',
    csr_partner_id: '',
    toll_id: '',
  });

  // Load media articles on component mount
  useEffect(() => {
    const loadMediaData = async () => {
      setIsLoading(true);
      setProjectsLoading(true);
      try {
        const [articles, projectsData, tollsData] = await Promise.all([
          getAllArticles(undefined, { isArticle: false }),
          (async () => {
            try {
              const { data, error } = await supabase
                .from('projects')
                .select('id, name, project_code, csr_partner_id')
                .order('name');
              if (error) throw error;
              return data || [];
            } catch (err) {
              console.error('Error fetching projects:', err);
              return [];
            }
          })(),
          getAllTolls(),
        ]);
        
        const filteredArticles = (articles as MediaArticle[]).filter(article => article.is_article === false);
        const formattedArticles: MediaItem[] = filteredArticles.map((article: MediaArticle) => ({
          ...article,
          newsChannel: article.sub_category || 'General',
        }));
        setMediaItems(formattedArticles);
        setProjects(projectsData || []);
        setTolls(tollsData || []);
        console.log('Projects loaded:', projectsData?.length || 0);
        console.log('Tolls loaded:', tollsData?.length || 0);
      } catch (error) {
        console.error('Error loading media articles:', error);
      } finally {
        setIsLoading(false);
        setProjectsLoading(false);
      }
    };
    loadMediaData();
  }, []);

  useEffect(() => {
    const fetchPartners = async () => {
      setPartnersLoading(true);
      try {
        const { data, error } = await supabase
          .from('csr_partners')
          .select('id, name, company_name')
          .order('name');
        if (error) throw error;
        setCSRPartners(data || []);
      } catch (err) {
        console.error('Error fetching CSR partners:', err);
        setCSRPartners([]);
      } finally {
        setPartnersLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    const applyFilters = async () => {
      setIsLoading(true);
      try {
        let filtered = await getAllArticles(undefined, { isArticle: false });

        if (filterType !== 'all') {
          filtered = await getArticlesByMediaType(filterType, { isArticle: false });
        }

        filtered = filtered.filter(article => article.is_article === false);
        filtered = filtered.filter(article => article.is_article !== true);

        if (filterNewsChannel !== 'all') {
          filtered = filtered.filter(item => item.sub_category === filterNewsChannel);
        }

        // Filter by CSR Partner - check direct field, metadata, or via project relationship
        if (filterPartner !== 'all') {
          const partnerProjectIds = projects
            .filter(p => p.csr_partner_id === filterPartner)
            .map(p => p.id);
          
          filtered = filtered.filter(item => {
            const metadata = item.metadata as Record<string, unknown> | undefined;
            const itemPartnerId = item.csr_parter_id || (metadata?.csr_partner_id as string | undefined);
            // Match by direct partner ID or by project belonging to partner
            return itemPartnerId === filterPartner || partnerProjectIds.includes(item.project_id as string);
          });
        }

        // Filter by project
        if (filterProject !== 'all') {
          filtered = filtered.filter(item => item.project_id === filterProject);
        }

        // Filter by toll (using metadata or direct field)
        if (filterToll !== 'all') {
          filtered = filtered.filter(item => {
            const metadata = item.metadata as Record<string, unknown> | undefined;
            const itemTollId = item.toll_id || (metadata?.toll_id as string | undefined);
            return itemTollId === filterToll;
          });
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
  }, [filterType, filterNewsChannel, filterToll, filterPartner, filterProject, projects]);

  // Reset project and toll when partner changes
  useEffect(() => {
    setFilterProject('all');
    setFilterToll('all');
  }, [filterPartner]);

  // Handle upload form submission
  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.title || !uploadForm.drive_link || !uploadForm.project_id) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      interface MediaData extends Omit<MediaArticle, 'id' | 'created_at' | 'updated_at'> {
        csr_parter_id?: string;
        toll_id?: string;
        is_article?: boolean;
        metadata?: Record<string, unknown>;
      }
      
      const metadataPayload: Record<string, unknown> = {};
      if (uploadForm.toll_id) metadataPayload.toll_id = uploadForm.toll_id;
      if (uploadForm.csr_partner_id) metadataPayload.csr_partner_id = uploadForm.csr_partner_id;

      const mediaData: MediaData = {
        media_code: `MEDIA-${Date.now()}`,
        title: uploadForm.title,
        description: uploadForm.description,
        media_type: uploadForm.media_type,
        sub_category: uploadForm.news_channel === 'Other' ? customChannel : uploadForm.news_channel,
        drive_link: uploadForm.drive_link,
        is_public: true,
        project_id: uploadForm.project_id as unknown as string,
        uploaded_by: currentUser?.id as unknown as string,
        created_by: currentUser?.id as unknown as string,
        csr_parter_id: uploadForm.csr_partner_id || undefined,
        toll_id: uploadForm.toll_id || undefined,
        is_article: false,
        metadata: Object.keys(metadataPayload).length > 0 ? metadataPayload : undefined,
      };
      
      if (editingMediaId) {
        // Update existing media
        await updateArticle(editingMediaId, mediaData as Partial<MediaArticle>);
        setEditingMediaId(null);
      } else {
        // Create new media
        await createArticle(mediaData as MediaArticle);
      }

      // Reset form and reload data
      resetUploadForm();
      setShowUploadForm(false);
      
      const articles = await getAllArticles(undefined, { isArticle: false });
      const filteredArticles = (articles as MediaArticle[]).filter(article => article.is_article === false);
      const formattedArticles: MediaItem[] = filteredArticles.map(article => ({
        ...article,
        newsChannel: article.sub_category || 'General',
      }));
      setMediaItems(formattedArticles);
      
      alert(editingMediaId ? 'Media updated successfully!' : 'Media uploaded successfully!');
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset upload form
  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      media_type: 'photo',
      drive_link: '',
      news_channel: '',
      project_id: '',
      csr_partner_id: '',
      toll_id: '',
    });
    setCustomChannel('');
    setEditingMediaId(null);
  };

  // Handle edit media - opens the update modal
  const handleEditMedia = (item: MediaItem) => {
    const metadata = item.metadata as Record<string, unknown> | undefined;
    const existingPartnerId = item.csr_parter_id || (metadata?.csr_partner_id as string | undefined) || '';
    const existingTollId = item.toll_id || (metadata?.toll_id as string | undefined) || '';
    
    // Check if the channel is a custom one (not in predefined list)
    const predefinedChannels = ['News Channel', 'Social Media', 'Internal Updates', 'Client Reports', 'General'];
    const channelValue = item.sub_category || '';
    const isCustomChannel = channelValue && !predefinedChannels.includes(channelValue);
    
    setUploadForm({
      title: item.title || '',
      description: item.description || '',
      media_type: (item.media_type === 'photo' || item.media_type === 'video') ? item.media_type : 'photo',
      drive_link: item.drive_link || '',
      news_channel: isCustomChannel ? 'Other' : channelValue,
      project_id: item.project_id || '',
      csr_partner_id: existingPartnerId,
      toll_id: existingTollId,
    });
    if (isCustomChannel) {
      setCustomChannel(channelValue);
    }
    setEditingMediaId(item.id);
    setShowUpdateModal(true);
    setShowDetailModal(false);
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

  // Handle opening detail modal
  const handleOpenDetailModal = (item: MediaItem) => {
    setSelectedMedia(item);
    setShowDetailModal(true);
  };

  // Get embed URL for Google Drive
  const getEmbedUrl = (driveLink: string): string => {
    // Handle Google Drive links
    if (driveLink.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = '';
      
      // Format: https://drive.google.com/file/d/FILE_ID/view
      const fileMatch = driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch) {
        fileId = fileMatch[1];
      }
      
      // Format: https://drive.google.com/open?id=FILE_ID
      const openMatch = driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (openMatch) {
        fileId = openMatch[1];
      }
      
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    // Return original link if not a Google Drive link
    return driveLink;
  };

  const mediaTypeOptions = ['photo', 'video'];
  const channelOptions = ['News Channel', 'Social Media', 'Internal Updates', 'Client Reports', 'General', 'Other'];
  
  // Get unique channels from media items (includes custom channels entered via "Other")
  const allUniqueChannels = useMemo(() => {
    const predefinedChannels = ['News Channel', 'Social Media', 'Internal Updates', 'Client Reports', 'General'];
    const customChannelsFromData = mediaItems
      .map(item => item.sub_category || item.newsChannel)
      .filter(channel => channel && !predefinedChannels.includes(channel));
    const uniqueCustomChannels = [...new Set(customChannelsFromData)];
    return [...predefinedChannels, ...uniqueCustomChannels.sort()];
  }, [mediaItems]);
  
  const availableFilterTolls = filterPartner === 'all' ? [] : tolls.filter(toll => toll.csr_partner_id === filterPartner);
  const availableFilterProjects = filterPartner === 'all' ? projects : projects.filter(project => project.csr_partner_id === filterPartner);
  const uploadFormTolls = uploadForm.csr_partner_id ? tolls.filter(toll => toll.csr_partner_id === uploadForm.csr_partner_id) : [];
  const uploadProjectsForPartner = useMemo(() => {
    if (!uploadForm.csr_partner_id) return [];
    return projects.filter(project => project.csr_partner_id === uploadForm.csr_partner_id);
  }, [uploadForm.csr_partner_id, projects]);

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

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
            <select
              value={filterNewsChannel}
              onChange={(e) => setFilterNewsChannel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Channels</option>
              {allUniqueChannels.map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CSR Partner</label>
            <select
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Partners</option>
              {partnersLoading ? (
                <option disabled>Loading partners...</option>
              ) : csrPartners.length > 0 ? (
                csrPartners.map(partner => (
                  <option key={partner.id} value={partner.id}>{partner.name}{partner.company_name ? ` (${partner.company_name})` : ''}</option>
                ))
              ) : (
                <option disabled>No partners available</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            {filterPartner === 'all' ? (
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Projects</option>
                {projectsLoading ? (
                  <option disabled>Loading projects...</option>
                ) : projects.length > 0 ? (
                  projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name} ({project.project_code})</option>
                  ))
                ) : (
                  <option disabled>No projects available</option>
                )}
              </select>
            ) : availableFilterProjects.length === 0 ? (
              <select
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              >
                <option>No projects for this partner</option>
              </select>
            ) : (
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Projects</option>
                {availableFilterProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.name} ({project.project_code})</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Toll</label>
            {filterPartner === 'all' || availableFilterTolls.length === 0 ? (
              <select
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              >
                <option>No tolls available</option>
              </select>
            ) : (
              <select
                value={filterToll}
                onChange={(e) => setFilterToll(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Tolls</option>
                {availableFilterTolls.map(toll => (
                  <option key={toll.id} value={toll.id}>{toll.toll_name || toll.poc_name}</option>
                ))}
              </select>
            )}
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingMediaId ? 'Edit Media' : 'Upload New Media'}
          </h3>
          <form onSubmit={handleUploadMedia} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Title *</label>
                <input
                  type="text"
                  placeholder="Media Title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                <select
                  value={uploadForm.media_type}
                  onChange={(e) => setUploadForm({...uploadForm, media_type: e.target.value as 'photo' | 'video'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {mediaTypeOptions.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                <select
                  value={uploadForm.news_channel}
                  onChange={(e) => {
                    setUploadForm({...uploadForm, news_channel: e.target.value});
                    if (e.target.value !== 'Other') {
                      setCustomChannel('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Channel</option>
                  {channelOptions.map(channel => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
                {uploadForm.news_channel === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom channel name"
                    value={customChannel}
                    onChange={(e) => setCustomChannel(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drive Link *</label>
                <input
                  type="text"
                  placeholder="Drive Link"
                  value={uploadForm.drive_link}
                  onChange={(e) => setUploadForm({...uploadForm, drive_link: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CSR Partner (Optional)</label>
                <select
                  value={uploadForm.csr_partner_id}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, csr_partner_id: e.target.value, toll_id: '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select CSR Partner</option>
                  {partnersLoading ? (
                    <option disabled>Loading partners...</option>
                  ) : csrPartners.length > 0 ? (
                    csrPartners.map(partner => (
                      <option key={partner.id} value={partner.id}>{partner.name}{partner.company_name ? ` (${partner.company_name})` : ''}</option>
                    ))
                  ) : (
                    <option disabled>No partners available</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                <select
                  value={uploadForm.project_id}
                  onChange={(e) => setUploadForm({...uploadForm, project_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  disabled={projectsLoading}
                >
                  <option value="">Select Project</option>
                  {projectsLoading ? (
                    <option disabled>Loading projects...</option>
                  ) : uploadForm.csr_partner_id ? (
                    uploadProjectsForPartner.length > 0 ? (
                      uploadProjectsForPartner.map(project => (
                        <option key={project.id} value={project.id}>{project.name} ({project.project_code})</option>
                      ))
                    ) : (
                      <option disabled>No projects found for selected partner</option>
                    )
                  ) : projects.length > 0 ? (
                    projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name} ({project.project_code})</option>
                    ))
                  ) : (
                    <option disabled>No projects available</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Toll (Optional)</label>
                {uploadForm.csr_partner_id ? (
                  uploadFormTolls.length > 0 ? (
                    <select
                      value={uploadForm.toll_id}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, toll_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Toll</option>
                      {uploadFormTolls.map(toll => (
                        <option key={toll.id} value={toll.id}>{toll.toll_name || toll.poc_name}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                    >
                      <option>No tolls for selected partner</option>
                    </select>
                  )
                ) : (
                  <select
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                  >
                    <option>Select CSR partner to load tolls</option>
                  </select>
                )}
              </div>
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
                onClick={() => {
                  setShowUploadForm(false);
                  resetUploadForm();
                }}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Saving...' : (editingMediaId ? 'Update' : 'Upload')}
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
                {/* Iframe preview for drive link */}
                <div className="bg-gray-100 h-48 overflow-hidden">
                  {item.drive_link ? (
                    <iframe
                      src={getEmbedUrl(item.drive_link)}
                      className="w-full h-full border-0"
                      title={item.title}
                      loading="lazy"
                      allowFullScreen
                      scrolling="no"
                      style={{ border: 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                      {item.media_type === 'video' ? (
                        <Video className="w-16 h-16 text-emerald-600" />
                      ) : item.media_type === 'document' || item.media_type === 'pdf' ? (
                        <FileText className="w-16 h-16 text-emerald-600" />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-emerald-600" />
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-1 truncate">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="space-y-1 mb-3 text-xs text-gray-500">
                    <p>Type: {item.media_type}</p>
                    {item.sub_category && <p>Channel: {item.sub_category}</p>}
                    {item.created_at && <p>Date: {new Date(item.created_at).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex items-center space-x-3 mb-3 text-xs text-gray-500">
                    <span className="flex items-center space-x-1"><Eye className="w-3 h-3" /><span>{item.views_count || 0}</span></span>
                    <span className="flex items-center space-x-1"><Download className="w-3 h-3" /><span>{item.downloads_count || 0}</span></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenDetailModal(item)}
                      className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleEditMedia(item)}
                      className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 text-sm font-medium transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
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

      {/* Detail Modal with Large Preview */}
      <AnimatePresence>
        {showDetailModal && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">{selectedMedia.title}</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 bg-gray-100">
                {selectedMedia.drive_link ? (
                  <iframe
                    src={getEmbedUrl(selectedMedia.drive_link)}
                    title={selectedMedia.title}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No drive link available
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => { setShowUpdateModal(false); resetUploadForm(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">Update Media</h3>
                <button
                  onClick={() => { setShowUpdateModal(false); resetUploadForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!uploadForm.title || !uploadForm.drive_link || !uploadForm.project_id) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    setIsUploading(true);
                    try {
                      interface MediaData extends Omit<MediaArticle, 'id' | 'created_at' | 'updated_at'> {
                        csr_parter_id?: string;
                        toll_id?: string;
                        is_article?: boolean;
                        metadata?: Record<string, unknown>;
                      }
                      const metadataPayload: Record<string, unknown> = {};
                      if (uploadForm.toll_id) metadataPayload.toll_id = uploadForm.toll_id;
                      if (uploadForm.csr_partner_id) metadataPayload.csr_partner_id = uploadForm.csr_partner_id;
                      const mediaData: MediaData = {
                        media_code: `MEDIA-${Date.now()}`,
                        title: uploadForm.title,
                        description: uploadForm.description,
                        media_type: uploadForm.media_type,
                        sub_category: uploadForm.news_channel,
                        drive_link: uploadForm.drive_link,
                        is_public: true,
                        project_id: uploadForm.project_id as unknown as string,
                        uploaded_by: currentUser?.id as unknown as string,
                        created_by: currentUser?.id as unknown as string,
                        csr_parter_id: uploadForm.csr_partner_id || undefined,
                        toll_id: uploadForm.toll_id || undefined,
                        is_article: false,
                        metadata: Object.keys(metadataPayload).length > 0 ? metadataPayload : undefined,
                      };
                      if (editingMediaId) {
                        await updateArticle(editingMediaId, mediaData as Partial<MediaArticle>);
                      }
                      resetUploadForm();
                      setShowUpdateModal(false);
                      const articles = await getAllArticles(undefined, { isArticle: false });
                      const filteredArticles = (articles as MediaArticle[]).filter(article => article.is_article === false);
                      const formattedArticles: MediaItem[] = filteredArticles.map(article => ({
                        ...article,
                        newsChannel: article.sub_category || 'General',
                      }));
                      setMediaItems(formattedArticles);
                      alert('Media updated successfully!');
                    } catch (error) {
                      console.error('Error updating media:', error);
                      alert('Failed to update media. Please try again.');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Media Title *</label>
                      <input
                        type="text"
                        placeholder="Media Title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                      <select
                        value={uploadForm.media_type}
                        onChange={(e) => setUploadForm({...uploadForm, media_type: e.target.value as 'photo' | 'video'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        {mediaTypeOptions.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                      <select
                        value={uploadForm.news_channel}
                        onChange={(e) => {
                          setUploadForm({...uploadForm, news_channel: e.target.value});
                          if (e.target.value !== 'Other') {
                            setCustomChannel('');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Channel</option>
                        {channelOptions.map(channel => (
                          <option key={channel} value={channel}>{channel}</option>
                        ))}
                      </select>
                      {uploadForm.news_channel === 'Other' && (
                        <input
                          type="text"
                          placeholder="Enter custom channel name"
                          value={customChannel}
                          onChange={(e) => setCustomChannel(e.target.value)}
                          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Drive Link *</label>
                      <input
                        type="text"
                        placeholder="Drive Link"
                        value={uploadForm.drive_link}
                        onChange={(e) => setUploadForm({...uploadForm, drive_link: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CSR Partner (Optional)</label>
                      <select
                        value={uploadForm.csr_partner_id}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, csr_partner_id: e.target.value, toll_id: '' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select CSR Partner</option>
                        {csrPartners.map(partner => (
                          <option key={partner.id} value={partner.id}>{partner.name}{partner.company_name ? ` (${partner.company_name})` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                      <select
                        value={uploadForm.project_id}
                        onChange={(e) => setUploadForm({...uploadForm, project_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Project</option>
                        {uploadForm.csr_partner_id ? (
                          uploadProjectsForPartner.length > 0 ? (
                            uploadProjectsForPartner.map(project => (
                              <option key={project.id} value={project.id}>{project.name} ({project.project_code})</option>
                            ))
                          ) : (
                            <option disabled>No projects found for selected partner</option>
                          )
                        ) : projects.length > 0 ? (
                          projects.map(project => (
                            <option key={project.id} value={project.id}>{project.name} ({project.project_code})</option>
                          ))
                        ) : (
                          <option disabled>No projects available</option>
                        )}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Toll (Optional)</label>
                      {uploadForm.csr_partner_id ? (
                        uploadFormTolls.length > 0 ? (
                          <select
                            value={uploadForm.toll_id}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, toll_id: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">Select Toll</option>
                            {uploadFormTolls.map(toll => (
                              <option key={toll.id} value={toll.id}>{toll.toll_name || toll.poc_name}</option>
                            ))}
                          </select>
                        ) : (
                          <select
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                          >
                            <option>No tolls for selected partner</option>
                          </select>
                        )
                      ) : (
                        <select
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                        >
                          <option>Select CSR partner to load tolls</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      placeholder="Description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowUpdateModal(false); resetUploadForm(); }}
                      className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isUploading ? 'Saving...' : 'Update'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaPage;
