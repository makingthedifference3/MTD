import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Newspaper, Trash2, Filter, Calendar, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { getAllArticles, createArticle, deleteArticle, type MediaArticle } from '@/services/mediaArticleService';

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

    try {
      const { data, error } = await supabase
        .from('media_articles')
        .insert([{
          media_code: `ART-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          publication_date: formData.publication_date,
          article_url: formData.article_url,
          media_type: 'newspaper_cutting',
          category: 'News Article',
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

            {/* Article URL */}
            <div>
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
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Article</span>
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
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <Newspaper className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h4>
                      
                      {article.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

                      <div className="flex items-center space-x-3">
                        {article.article_url && (
                          <button
                            onClick={() => {
                              setSelectedArticleUrl(article.article_url);
                              setShowModal(true);
                            }}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span>View Article</span>
                          </button>
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
              <h3 className="text-xl font-semibold text-gray-900">Article Viewer</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedArticleUrl('');
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedArticleUrl}
                className="w-full h-full border-0"
                title="Article Viewer"
                allow="fullscreen"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ArticlePage;
