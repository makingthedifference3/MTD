import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Newspaper, Trash2 } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { getAllArticles, createArticle, deleteArticle, type MediaArticle } from '@/services/mediaArticleService';

const ArticlePage = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [articles, setArticles] = useState<MediaArticle[]>([]);
  const [projects, setProjects] = useState<Array<{id: string; name: string; project_code: string}>>([]);
  const [csrPartners, setCSRPartners] = useState<Array<{id: string; name: string; partner_code: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    publication_date: '',
    drive_link: '',
    reporter_name: '',
    media_type: 'newspaper_cutting',
    description: '',
    project_id: '',
    csr_partner_id: '',
  });

  // Fetch articles, projects, and CSR partners from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch articles
        const data = await getAllArticles('published');
        setArticles(data);
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, project_code')
          .order('name');
        
        if (!projectsError && projectsData) {
          setProjects(projectsData);
        }
        
        // Fetch CSR Partners
        const { data: partnersData, error: partnersError } = await supabase
          .from('csr_partners')
          .select('id, name, partner_code')
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
    try {
      interface ArticleData extends Omit<MediaArticle, 'id' | 'created_at' | 'updated_at'> {
        csr_partner_id?: string;
      }
      
      const articleData: ArticleData = {
        media_code: `ART-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        publication_date: formData.publication_date,
        drive_link: formData.drive_link,
        reporter_name: formData.reporter_name,
        media_type: 'newspaper_cutting',
        category: 'News Article',
        is_public: true,
        views_count: 0,
        project_id: formData.project_id || undefined,
      };
      
      // Add CSR partner if selected
      if (formData.csr_partner_id) {
        articleData.csr_partner_id = formData.csr_partner_id;
      }

      await createArticle(articleData as MediaArticle);

      // Reset form
      setFormData({
        title: '',
        publication_date: '',
        drive_link: '',
        reporter_name: '',
        media_type: 'newspaper_cutting',
        description: '',
        project_id: '',
        csr_partner_id: '',
      });

      // Refresh articles
      const data = await getAllArticles('published');
      setArticles(data);

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
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg" 
              placeholder="Article Heading" 
            />
            <input 
              type="date" 
              name="publication_date"
              value={formData.publication_date}
              onChange={handleInputChange}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg" 
              placeholder="Date" 
            />
            <input 
              type="url" 
              name="drive_link"
              value={formData.drive_link}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded-lg" 
              placeholder="Article Link" 
            />
            <input 
              type="text" 
              name="reporter_name"
              value={formData.reporter_name}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded-lg" 
              placeholder="Reporter Name" 
            />
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Project (Optional)</option>
              {projects && projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name} ({project.project_code})</option>
              ))}
            </select>
            <select
              name="csr_partner_id"
              value={formData.csr_partner_id}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select CSR Partner (Optional)</option>
              {csrPartners && csrPartners.map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.name} ({partner.partner_code})</option>
              ))}
            </select>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2"
              placeholder="Article Description"
              rows={3}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Upload
            </button>
          </div>
        </form>
      </div>

      {/* Articles List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">List of Media Articles</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl">
            <p className="text-gray-600">No articles found. Add your first article above.</p>
          </div>
        ) : (
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
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h4>
                    {article.description && (
                      <p className="text-sm text-gray-600 mb-3">{article.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Reporter</p>
                        <p className="font-medium text-gray-900">{article.reporter_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">
                          {article.publication_date 
                            ? new Date(article.publication_date).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">{article.media_type || 'Article'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Views</p>
                        <p className="font-medium text-gray-900">{article.views_count || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {article.drive_link && (
                        <a 
                          href={article.drive_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors"
                        >
                          View More
                        </a>
                      )}
                      <button 
                        onClick={() => handleDeleteArticle(article.id)}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
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

export default ArticlePage;
