import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Newspaper, Trash2, Filter, Calendar, Link as LinkIcon, Upload, Image, FileText, X, Eye } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { deleteArticle, type MediaArticle } from '@/services/mediaArticleService';

const ArticlePage = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [articles, setArticles] = useState<MediaArticle[]>([]);
  const [allArticles, setAllArticles] = useState<MediaArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [csrPartners, setCSRPartners] = useState<Array<{id: string; name: string; has_toll: boolean}>>([]);
  const [selectedCsrPartner, setSelectedCsrPartner] = useState('');
  const [hasToll, setHasToll] = useState(false);
  const [tolls, setTolls] = useState<Array<{id: string; toll_name: string}>>([]);
  const [selectedToll, setSelectedToll] = useState('');
  const [projects, setProjects] = useState<Array<{id: string; name: string; project_code: string}>>([]);
  const [selectedProject, setSelectedProject] = useState('');
  
  // Filter states
  const [filterCsrPartner, setFilterCsrPartner] = useState('');
  const [filterHasToll, setFilterHasToll] = useState(false);
  const [filterTolls, setFilterTolls] = useState<Array<{id: string; toll_name: string}>>([]);
  const [filterToll, setFilterToll] = useState('');
  const [filterProjects, setFilterProjects] = useState<Array<{id: string; name: string; project_code: string}>>([]);
  const [filterProject, setFilterProject] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedArticleUrl, setSelectedArticleUrl] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<'url' | 'image' | 'pdf'>('url');
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'link' | 'file'>('link');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Channel states
  const [selectedChannel, setSelectedChannel] = useState('');
  const [customChannel, setCustomChannel] = useState('');
  const channelOptions = [
    'Times of India',
    'Hindustan Times', 
    'The Hindu',
    'Indian Express',
    'Economic Times',
    'Dainik Bhaskar',
    'Amar Ujala',
    'Navbharat Times',
    'Zee News',
    'NDTV',
    'Aaj Tak',
    'ABP News',
    'News18',
    'Republic TV',
    'India Today',
    'Other'
  ];
  
  const [formData, setFormData] = useState({
    title: '',
    publication_date: '',
    article_url: '',
    media_type: 'newspaper_cutting',
    description: '',
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all articles where is_article is TRUE
        const { data: articlesData, error: articlesError } = await supabase
          .from('media_articles')
          .select(`
            *,
            projects:project_id(id, name, project_code, csr_partner_id, toll_id),
            csr_partners:csr_parter_id(id, name),
            tolls:toll_id(id, toll_name)
          `)
          .eq('is_article', true)
          .order('created_at', { ascending: false });
        
        if (!articlesError && articlesData) {
          setArticles(articlesData as any);
          setAllArticles(articlesData as any);
        }
        
        // Fetch CSR Partners
        const { data: partnersData, error: partnersError } = await supabase
          .from('csr_partners')
          .select('id, name, has_toll')
          .eq('is_active', true)
          .order('name');
        
        if (!partnersError && partnersData) {
          setCSRPartners(partnersData);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle CSR Partner selection for form
  useEffect(() => {
    if (selectedCsrPartner) {
      const partner = csrPartners.find(p => p.id === selectedCsrPartner);
      const partnerHasToll = partner?.has_toll || false;
      setHasToll(partnerHasToll);
      
      fetchProjectsForPartner(selectedCsrPartner);
      
      if (partnerHasToll) {
        fetchTollsForPartner(selectedCsrPartner);
      } else {
        setTolls([]);
        setSelectedToll('');
      }
    } else {
      setHasToll(false);
      setProjects([]);
      setTolls([]);
      setSelectedToll('');
      setSelectedProject('');
    }
  }, [selectedCsrPartner, csrPartners]);

  // Handle CSR Partner selection for filter
  useEffect(() => {
    if (filterCsrPartner) {
      const partner = csrPartners.find(p => p.id === filterCsrPartner);
      const partnerHasToll = partner?.has_toll || false;
      setFilterHasToll(partnerHasToll);
      
      fetchProjectsForFilter(filterCsrPartner);
      
      if (partnerHasToll) {
        fetchTollsForFilter(filterCsrPartner);
      } else {
        setFilterTolls([]);
        setFilterToll('');
      }
    } else {
      setFilterHasToll(false);
      setFilterProjects([]);
      setFilterTolls([]);
      setFilterToll('');
      setFilterProject('');
      setArticles(allArticles);
    }
  }, [filterCsrPartner, csrPartners, allArticles]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allArticles];

    if (filterCsrPartner) {
      filtered = filtered.filter((article: any) => 
        article.projects?.csr_partner_id === filterCsrPartner
      );
    }

    if (filterToll) {
      filtered = filtered.filter((article: any) => 
        article.toll_id === filterToll
      );
    }

    if (filterProject) {
      filtered = filtered.filter((article: any) => 
        article.project_id === filterProject
      );
    }

    setArticles(filtered);
  }, [filterCsrPartner, filterToll, filterProject, allArticles]);

  // Fetch projects for selected CSR Partner (form)
  const fetchProjectsForPartner = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, project_code')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true)
        .order('name');
      
      if (!error && data) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  // Fetch tolls for selected CSR Partner (form)
  const fetchTollsForPartner = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true)
        .order('toll_name');
      
      if (!error && data) {
        setTolls(data);
      }
    } catch (error) {
      console.error('Error fetching tolls:', error);
      setTolls([]);
    }
  };

  // Fetch projects for filter
  const fetchProjectsForFilter = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, project_code')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true)
        .order('name');
      
      if (!error && data) {
        setFilterProjects(data);
      }
    } catch (error) {
      console.error('Error fetching filter projects:', error);
      setFilterProjects([]);
    }
  };

  // Fetch tolls for filter
  const fetchTollsForFilter = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true)
        .order('toll_name');
      
      if (!error && data) {
        setFilterTolls(data);
      }
    } catch (error) {
      console.error('Error fetching filter tolls:', error);
      setFilterTolls([]);
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload an image (JPG, PNG, GIF, WebP) or PDF file');
        return;
      }
      
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Upload file to Supabase storage
  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('article-files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCsrPartner || !selectedProject) {
      alert('Please select CSR Partner and Project');
      return;
    }

    if (hasToll && !selectedToll) {
      alert('Please select Toll for this CSR Partner');
      return;
    }

    // Validate that either a file or a link is provided
    if (uploadType === 'file' && !selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      let fileUrl = formData.article_url;
      let fileType = 'newspaper_cutting';
      
      // Upload file if selected
      if (uploadType === 'file' && selectedFile) {
        const uploadedUrl = await uploadFileToStorage(selectedFile);
        if (!uploadedUrl) {
          throw new Error('Failed to upload file');
        }
        fileUrl = uploadedUrl;
        fileType = selectedFile.type.startsWith('image/') ? 'photo' : 'pdf';
      }

      const { error } = await supabase
        .from('media_articles')
        .insert([{
          media_code: `ART-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          publication_date: formData.publication_date,
          article_url: fileUrl,
          file_url: uploadType === 'file' ? fileUrl : null,
          media_type: fileType,
          file_format: selectedFile?.type || null,
          file_name: selectedFile?.name || null,
          file_size_mb: selectedFile ? parseFloat((selectedFile.size / (1024 * 1024)).toFixed(2)) : null,
          category: 'News Article',
          news_channel: selectedChannel === 'Other' ? customChannel : selectedChannel,
          is_public: true,
          is_article: true,
          views_count: 0,
          project_id: selectedProject,
          csr_parter_id: selectedCsrPartner,
          toll_id: hasToll ? selectedToll : null,
        }])
        .select();

      if (error) throw error;

      // Reset form
      setFormData({
        title: '',
        publication_date: '',
        article_url: '',
        media_type: 'newspaper_cutting',
        description: '',
      });
      setSelectedCsrPartner('');
      setSelectedToll('');
      setSelectedProject('');
      setHasToll(false);
      setSelectedChannel('');
      setCustomChannel('');
      clearSelectedFile();
      setUploadType('link');

      // Refresh articles
      const { data: articlesData } = await supabase
        .from('media_articles')
        .select(`
          *,
          projects:project_id(id, name, project_code, csr_partner_id, toll_id),
          csr_partners:csr_parter_id(id, name),
          tolls:toll_id(id, toll_name)
        `)
        .eq('is_article', true)
        .order('created_at', { ascending: false });
      
      if (articlesData) {
        setArticles(articlesData as any);
        setAllArticles(articlesData as any);
      }

      alert('Article added successfully!');
    } catch (err) {
      console.error('Error adding article:', err);
      alert('Failed to add article');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete article
  const handleDeleteArticle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id);
        setArticles(articles.filter(article => article.id !== id));
        alert('Article deleted successfully!');
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('Failed to delete article');
      }
    }
  };

  // Helper to check if URL is an image
  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('article-files');
  };

  // Helper to check if URL is a PDF
  const isPdfUrl = (url: string) => {
    return /\.pdf$/i.test(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Article</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Article</span>
        </motion.button>
      </div>

      {/* Upload Form */}
      <div ref={formRef} className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add News Article</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CSR Partner */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">CSR Partner *</label>
              <select
                value={selectedCsrPartner}
                onChange={(e) => setSelectedCsrPartner(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select CSR Partner</option>
                {csrPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>{partner.name}</option>
                ))}
              </select>
            </div>

            {/* Toll - Conditional */}
            {hasToll && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Toll *</label>
                <select
                  value={selectedToll}
                  onChange={(e) => setSelectedToll(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select Toll</option>
                  {tolls.map((toll) => (
                    <option key={toll.id} value={toll.id}>{toll.toll_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Project */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                disabled={!selectedCsrPartner}
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name} ({project.project_code})</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                placeholder="Article Heading" 
              />
            </div>

            {/* Channel / News Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channel / News Source</label>
              <select
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value);
                  if (e.target.value !== 'Other') {
                    setCustomChannel('');
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Channel</option>
                {channelOptions.map((channel) => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>

            {/* Custom Channel Input - Show when "Other" is selected */}
            {selectedChannel === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Channel Name *</label>
                <input 
                  type="text" 
                  value={customChannel}
                  onChange={(e) => setCustomChannel(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="Enter channel name" 
                />
              </div>
            )}

            {/* Publication Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publication Date *</label>
              <input 
                type="date" 
                name="publication_date"
                value={formData.publication_date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>

            {/* Upload Type Toggle */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Source</label>
              <div className="flex space-x-4">
                <label className={`flex items-center space-x-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${uploadType === 'link' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="uploadType"
                    value="link"
                    checked={uploadType === 'link'}
                    onChange={() => {
                      setUploadType('link');
                      clearSelectedFile();
                    }}
                    className="sr-only"
                  />
                  <LinkIcon className="w-4 h-4" />
                  <span>External Link</span>
                </label>
                <label className={`flex items-center space-x-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${uploadType === 'file' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="uploadType"
                    value="file"
                    checked={uploadType === 'file'}
                    onChange={() => {
                      setUploadType('file');
                      setFormData(prev => ({ ...prev, article_url: '' }));
                    }}
                    className="sr-only"
                  />
                  <Upload className="w-4 h-4" />
                  <span>Upload File (Image/PDF)</span>
                </label>
              </div>
            </div>

            {/* Article URL - Show only if link type */}
            {uploadType === 'link' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Article Link</label>
                <input 
                  type="url" 
                  name="article_url"
                  value={formData.article_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="https://..." 
                />
              </div>
            )}

            {/* File Upload - Show only if file type */}
            {uploadType === 'file' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image or PDF *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                  {!selectedFile ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="article-file-upload"
                      />
                      <label htmlFor="article-file-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <Upload className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500 mt-1">JPG, PNG, GIF, WebP or PDF (max 50MB)</p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                        ) : (
                          <div className="w-20 h-20 bg-red-50 rounded-lg flex items-center justify-center">
                            <FileText className="w-10 h-10 text-red-500" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Article Description"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              disabled={isUploading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg font-medium transition-colors shadow-lg flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Article</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter Articles</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter CSR Partner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CSR Partner</label>
            <select
              value={filterCsrPartner}
              onChange={(e) => setFilterCsrPartner(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Partners</option>
              {csrPartners.map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Toll - Conditional */}
          {filterHasToll && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Toll</label>
              <select
                value={filterToll}
                onChange={(e) => setFilterToll(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Tolls</option>
                {filterTolls.map((toll) => (
                  <option key={toll.id} value={toll.id}>{toll.toll_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filter Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={!filterCsrPartner}
            >
              <option value="">All Projects</option>
              {filterProjects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Media Articles</h3>
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-emerald-600">{articles.length}</span> {articles.length === 1 ? 'article' : 'articles'}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-2xl">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="text-gray-600 mt-4">Loading articles...</p>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No articles found</p>
            <p className="text-gray-500 text-sm mt-2">Add your first article above or adjust your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article: any, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Thumbnail/Preview */}
                    {article.file_url && isImageUrl(article.file_url) ? (
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 cursor-pointer" onClick={() => {
                        setSelectedArticleUrl(article.file_url || article.article_url);
                        setSelectedFileType('image');
                        setShowModal(true);
                      }}>
                        <img 
                          src={article.file_url} 
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                        />
                      </div>
                    ) : article.file_url && isPdfUrl(article.file_url) ? (
                      <div className="w-24 h-24 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-10 h-10 text-red-500" />
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 rounded-xl shrink-0">
                        <Newspaper className="w-8 h-8 text-emerald-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h4>
                      
                      {article.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">CSR Partner</p>
                          <p className="text-sm font-medium text-gray-900">
                            {article.csr_partners?.name || 'N/A'}
                          </p>
                        </div>
                        {article.tolls && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Toll</p>
                            <p className="text-sm font-medium text-gray-900">
                              {article.tolls.toll_name}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Project</p>
                          <p className="text-sm font-medium text-gray-900">
                            {article.projects?.name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Channel</p>
                          <p className="text-sm font-medium text-gray-900">
                            {article.news_channel || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Publication Date</p>
                          <div className="flex items-center space-x-1 text-sm font-medium text-gray-900">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {article.publication_date 
                                ? new Date(article.publication_date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 flex-wrap gap-2">
                        {/* View Image Button */}
                        {article.file_url && isImageUrl(article.file_url) && (
                          <button
                            onClick={() => {
                              setSelectedArticleUrl(article.file_url);
                              setSelectedFileType('image');
                              setShowModal(true);
                            }}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                          >
                            <Image className="w-4 h-4" />
                            <span>View Image</span>
                          </button>
                        )}
                        
                        {/* View PDF Button */}
                        {article.file_url && isPdfUrl(article.file_url) && (
                          <button
                            onClick={() => {
                              setSelectedArticleUrl(article.file_url);
                              setSelectedFileType('pdf');
                              setShowModal(true);
                            }}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View PDF</span>
                          </button>
                        )}
                        
                        {/* External Link Button */}
                        {article.article_url && !article.file_url && (
                          <button
                            onClick={() => {
                              setSelectedArticleUrl(article.article_url);
                              setSelectedFileType('url');
                              setShowModal(true);
                            }}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span>View Article</span>
                          </button>
                        )}
                        
                        {/* Open in New Tab */}
                        {(article.file_url || article.article_url) && (
                          <a
                            href={article.file_url || article.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Open in Tab</span>
                          </a>
                        )}
                        
                        <button 
                          onClick={() => handleDeleteArticle(article.id)}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Article View Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-[95vw] h-[92vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedFileType === 'image' ? 'Image Viewer' : selectedFileType === 'pdf' ? 'PDF Viewer' : 'Article Viewer'}
              </h3>
              <div className="flex items-center space-x-2">
                <a
                  href={selectedArticleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm font-medium transition-colors"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedArticleUrl('');
                    setSelectedFileType('url');
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
              {selectedFileType === 'image' ? (
                <img
                  src={selectedArticleUrl}
                  alt="Article"
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedFileType === 'pdf' ? (
                <iframe
                  src={selectedArticleUrl}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                />
              ) : (
                <iframe
                  src={selectedArticleUrl}
                  className="w-full h-full border-0 bg-white"
                  title="Article Viewer"
                  allow="fullscreen"
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ArticlePage;
