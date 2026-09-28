import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  Search,
  ExternalLink,
  FileText,
  Presentation,
  Compass,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  Building2,
  GraduationCap,
  Layers,
  ArrowRight,
  Award,
  RefreshCw,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { GeminiNotebookModal } from '../components/GeminiNotebookModal';
import { defaultCategories, defaultResearchSupportResources } from '../data/researchSupportDefaultData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function ResearchSupportPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('univ_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [resources, setResources] = useState(defaultResearchSupportResources);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // AI Assistant Modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTargetTopic, setAiTargetTopic] = useState({
    title: 'Research Proposal & Topic Development Assistant',
    abstract: 'Use Google Gemini AI to analyze your research topic, structure proposal problem statements, identify literature gaps, and discover grounded peer-reviewed citations.',
    category: 'Academic Research & Literature Scoping'
  });

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedType]);

  const fetchResources = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedType !== 'all') params.type = selectedType;

      const res = await axios.get(`${API_BASE}/research-support`, { params });
      if (res.data && res.data.resources) {
        setResources(res.data.resources);
        if (res.data.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories);
        }
        setError('');
      }
    } catch (err) {
      console.warn('Backend research-support endpoint not responding, falling back to cached resources:', err.message);
      // Fallback filtering
      let filtered = [...defaultResearchSupportResources];
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(r => r.category === selectedCategory);
      }
      if (selectedType !== 'all') {
        filtered = filtered.filter(r => r.type === selectedType);
      }
      setResources(filtered);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredResources = resources.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.source?.toLowerCase().includes(q) ||
      item.tags?.toLowerCase().includes(q) ||
      item.category_title?.toLowerCase().includes(q)
    );
  });

  const getTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return {
          label: 'PDF Document / Guide',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: FileText
        };
      case 'slides':
        return {
          label: 'Slide Presentation',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Presentation
        };
      case 'tool':
        return {
          label: 'AI Matcher / Portal',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Sparkles
        };
      case 'metric':
        return {
          label: 'Ranking Metric / Index',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: TrendingUp
        };
      default:
        return {
          label: 'Academic Link',
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: ExternalLink
        };
    }
  };

  // Group by categories if "all" is selected
  const categoryKeys = [
    { id: 'all', title: '🌟 All Support Areas', count: resources.length },
    { id: 'proposal_writing', title: '📝 Proposal Writing', count: resources.filter(r => r.category === 'proposal_writing').length },
    { id: 'topic_selection', title: '🎯 Topic Selection', count: resources.filter(r => r.category === 'topic_selection').length },
    { id: 'journal_finder', title: '🔍 Journal Finders', count: resources.filter(r => r.category === 'journal_finder').length },
    { id: 'ranking_systems', title: '📊 Rankings & Metrics', count: resources.filter(r => r.category === 'ranking_systems').length }
  ];

  const typePills = [
    { id: 'all', label: 'All Types' },
    { id: 'pdf', label: '📄 PDF Guides' },
    { id: 'slides', label: '📊 Slide Decks' },
    { id: 'tool', label: '🤖 AI Matchers & Tools' },
    { id: 'metric', label: '📈 Ranking Systems' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Top Breadcrumb & Hero */}
      <div className="bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F2C59] uppercase tracking-wider">
              <span className="cursor-pointer hover:underline" onClick={() => navigate('/')}>Home</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="cursor-pointer hover:underline" onClick={() => navigate('/journals')}>Research</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-amber-700">Knowledge & Research Support Services (KRSS)</span>
            </div>

            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/research-support')}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0F2C59] hover:bg-[#0A192F] text-white text-xs font-bold shadow-sm transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>⚙️ Manage Support Hub in Admin</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Lahore Leads University & KRSS Research Ecosystem</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A192F] tracking-tight leading-tight">
                Knowledge & Research Support Services
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                A comprehensive academic digital repository designed for faculty, MS/PhD scholars, and student researchers. Access curated slide presentations, annotated sample proposals, AI-powered journal finders, and international ranking metrics.
              </p>

              {/* Live Search Bar */}
              <div className="pt-2 max-w-2xl">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search proposals, slide decks, journal finders, Elsevier, Clarivate, Scopus..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59] focus:border-transparent text-sm text-slate-800 font-medium placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI Assistant Callout Box */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#0F2C59] to-[#0A192F] rounded-3xl p-6 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Assistant</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Drafting a Research Topic or Proposal?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Use our interactive AI Assistant to analyze your problem statement, assess academic novelty, and formulate research hypotheses.
                </p>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Open AI Research Assistant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Category Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categoryKeys.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${
                    active
                      ? 'bg-[#0F2C59] text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cat.title}</span>
                  {cat.count > 0 && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {typePills.map((tp) => {
              const active = selectedType === tp.id;
              return (
                <button
                  key={tp.id}
                  onClick={() => setSelectedType(tp.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    active
                      ? 'bg-amber-600 text-white shadow-sm font-bold'
                      : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300/80'
                  }`}
                >
                  {tp.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Grid / Content */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0F2C59] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading academic research support library...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 space-y-3">
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={fetchResources}
              className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No matching research resources found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search query, selecting "All Support Areas", or changing your resource type filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 bg-[#0F2C59] text-white font-bold text-xs rounded-xl hover:bg-[#0A192F] transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((item) => {
              const badge = getTypeBadge(item.type);
              const BadgeIcon = badge.icon;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0F2C59]/40 p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(15,44,89,0.08)] transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Type Badge & Source */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </div>
                      {item.source && (
                        <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[150px]">
                          {item.source}
                        </span>
                      )}
                    </div>

                    {/* Category Subtitle */}
                    <div className="text-[11px] font-bold text-[#0F2C59] uppercase tracking-wider">
                      {item.category_title || item.category?.replace(/_/g, ' ')}
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#0A192F] group-hover:text-amber-700 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4">
                      {item.description}
                    </p>

                    {/* Tags */}
                    {item.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.split(',').map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            #{t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleCopyLink(item.url, item.id)}
                      title="Copy resource URL"
                      className="p-2 rounded-xl text-slate-400 hover:text-[#0F2C59] hover:bg-slate-100 transition flex items-center gap-1 text-xs font-semibold"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 text-[11px] font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-[11px] text-slate-500">Copy</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#0F2C59] hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 group-hover:shadow-md"
                    >
                      <span>
                        {item.type === 'pdf' ? 'Read Document' : item.type === 'slides' ? 'View Slides' : 'Launch Resource'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Comprehensive Resource Overview Cards */}
        <div className="mt-16 bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-600" />
              <span>ORIC Academic Publishing Guidance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F]">
              Four Pillars of Academic Excellence at Leads
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Our structured pathway helps undergraduate, post-graduate, and faculty scholars progress from initial topic ideation to internationally recognized journal indexing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h4 className="font-bold text-[#0A192F] text-base">Proposal Writing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Utilize standard slide decks, quantitative survey frameworks, and annotated proposals with evaluator grading rubrics.
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h4 className="font-bold text-[#0A192F] text-base">Topic Validation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apply FINER criteria (Feasible, Interesting, Novel, Ethical, Relevant) to ensure strong theoretical contribution.
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h4 className="font-bold text-[#0A192F] text-base">Journal Matching</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Match abstracts with Elsevier, Springer, Clarivate Web of Science, and JANE to find fast-track peer-reviewed outlets.
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-black text-sm">
                4
              </div>
              <h4 className="font-bold text-[#0A192F] text-base">Impact Benchmarking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track SCImago Q1-Q4 rankings, CWTS SNIP field-normalized scores, and Clarivate JCR impact factors for career evaluation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Interactive Modal */}
      {showAiModal && (
        <GeminiNotebookModal
          article={aiTargetTopic}
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </div>
  );
}
