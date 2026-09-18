import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  Award,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  TrendingUp,
  Star,
  ExternalLink,
  X,
  Filter,
  Globe,
  Building2,
  Zap,
  Check,
  Clock,
  UserCheck,
  Ticket,
  User,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { TierBadge } from '../components/TierBadge';
import { ManuscriptModal } from '../components/ManuscriptModal';

export const PublicGallery = ({ user, gallery = [], articles = [], investorReviews = [], conferences = [], onNavigateToLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramArticleId } = useParams();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalPaper, setActiveModalPaper] = useState(null);

  // Sync activeModalPaper with URL parameter (e.g. /article/1 or /paper/1)
  useEffect(() => {
    if (paramArticleId) {
      const found = articles.find(a => String(a.id) === String(paramArticleId));
      if (found) {
        setActiveModalPaper(found);
      }
    } else if (location.pathname === '/' || location.pathname === '/showcase' || location.pathname === '/gallery') {
      setActiveModalPaper(null);
    }
  }, [paramArticleId, articles, location.pathname]);

  const handleOpenPaper = (art) => {
    setActiveModalPaper(art);
    if (art?.id) {
      navigate(`/article/${art.id}`);
    }
  };

  const handleClosePaper = () => {
    setActiveModalPaper(null);
    if (location.pathname.startsWith('/article/') || location.pathname.startsWith('/paper/')) {
      navigate('/showcase');
    }
  };

  const conf = conferences[0] || {
    title: 'National Innovation & Research Conference 2026',
    description: 'Annual gathering of university innovators, academic review committees, and venture capital investors.',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    event_date: '2026-09-15',
    event_time: '10:00 AM - 04:00 PM',
    venue: 'University Main Auditorium & HD Virtual Stream',
    presenting_students: 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography), Ali Ahmed (Nanomedicine), Ali Ahmed (Agri Drones)',
    attending_investors: 'John Malik (Apex Tech Capital), Dr. Sarah Vance (BioHealth VC), Hamza Qureshi (FinTech Angels)'
  };

  // Published Student Research Papers
  const publishedArticles = articles.filter(a => a.is_published || a.published || a.status === 'Published' || a.status === 'Approved');

  // Filter gallery items by category / tier
  const filteredGallery = gallery.filter(item => {
    if (selectedCategory === 'All') return true;
    const article = articles.find(a => a.id === item.featured_article_id);
    if (selectedCategory === 'Platinum') return article?.tier === 'Platinum';
    if (selectedCategory === 'Gold') return article?.tier === 'Gold';
    if (selectedCategory === 'Funded') return item.investor_name;
    return true;
  });

  return (
    <div className="space-y-14 font-sans pb-16">
      {/* ========================================================================= */}
      {/* HERO SECTION — PURE WHITE / NAVY UNIVERSITY AESTHETIC                     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 md:p-14 shadow-lg shadow-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-70" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-50 rounded-full blur-3xl pointer-events-none -mb-20 opacity-70" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#0A192F]/5 text-[#0A192F] border border-[#0A192F]/15">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Official University Innovation & Venture Showcase</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0A192F] tracking-tight leading-[1.1]">
            Bridging Academic <br />
            <span className="text-[#005A9C]">Research With Venture Capital.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
            Empowering student researchers, academic review committees, and national & global venture capital funds to commercialize breakthrough scientific technology.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                if (user && user.role === 'student') navigate('/student/submit');
                else onNavigateToLogin ? onNavigateToLogin('student') : navigate('/login');
              }}
              className="px-7 py-3.5 bg-[#0A192F] hover:bg-[#003d66] text-white font-extrabold rounded-2xl text-xs transition shadow-md flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Submit Research Paper</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/conferences')}
              className="px-7 py-3.5 bg-white hover:bg-slate-50 text-[#0A192F] font-bold rounded-2xl text-xs transition border border-slate-300 shadow-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Explore Conferences & Book Seats</span>
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0A192F]">500+</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peer-Reviewed Papers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">PKR 25M+</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Venture Pledges</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600">98.5%</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plagiarism Accuracy</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-purple-600">50+</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">VC Angel Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Accreditations Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          Trusted by Premier Universities, ORIC Incubation Centers & Venture Funds
        </span>
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-2">🏛️ Lahore Leads University ORIC Directorate</span>
          <span className="flex items-center gap-2">🌐 HEC Recognized & Chartered</span>
          <span className="flex items-center gap-2">💼 Apex Tech Capital</span>
          <span className="flex items-center gap-2">🧬 BioHealth VC Fund</span>
          <span className="flex items-center gap-2">🏦 FinTech Angel Syndicate</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: PUBLISHED STUDENT ARTICLES (PEER-REVIEWED & TIERED)            */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> Academic Publications
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              Published Student Research Papers
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Peer-reviewed academic research papers awarded official tiers by university review committees.
            </p>
          </div>

          <button
            onClick={() => navigate('/journals')}
            className="text-xs font-bold text-[#005A9C] hover:text-[#0A192F] flex items-center gap-1"
          >
            Browse All University Journals <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleOpenPaper(article)}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                    {article.category}
                  </span>
                  <TierBadge tier={article.tier || 'Gold'} />
                </div>

                <h3 className="font-black text-lg text-[#0A192F] group-hover:text-blue-700 transition leading-snug line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  "{article.abstract}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">{article.student_name || 'Student Researcher'}</div>
                  <div className="text-[11px] text-slate-400">Published: {article.created_at || '2026-09-01'}</div>
                </div>

                <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition flex items-center gap-1">
                  Read Paper <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: VENTURE CAPITAL PLEDGES & STARTUP SHOWCASE                     */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <DollarSign className="w-4 h-4" /> Venture Investments
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              Investor Reviews & Commercialization Pledges
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live feedback, seed pledges, and evaluation scores from participating venture capital partners.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {investorReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> {rev.decision || 'Interested to Invest'}
                </span>
                <span className="text-[11px] font-bold text-slate-400 font-mono">{rev.created_at || '2026-08-30'}</span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#0A192F] line-clamp-1">{rev.article_title}</h4>
                <div className="text-xs text-blue-700 font-semibold mt-0.5">{rev.investor_name}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 italic leading-relaxed">
                "{rev.comments}"
              </div>

              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 pt-1">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>Economic Impact: <strong>{rev.benefit_for_country || 'National Innovation'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: CALL TO ACTION BANNER (WHITE / LIGHT BLUE)                     */}
      {/* ========================================================================= */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0A192F] to-[#004B7A] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Call for Submissions 2026</span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Have a Breakthrough Scientific Project?
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Submit your research manuscript to our university editorial board. Get peer-reviewed, assigned an ISSN volume, and pitch live to venture capitalists.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={() => {
              if (user && user.role === 'student') navigate('/student/submit');
              else onNavigateToLogin ? onNavigateToLogin('student') : navigate('/login');
            }}
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#0A192F] font-black rounded-xl text-xs transition shadow-md"
          >
            Submit Paper Now
          </button>
          <button
            onClick={() => navigate('/journals')}
            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/20"
          >
            Explore Journals
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ARTICLE READER MODAL WITH ACADEMIC PAYWALL & READER PASS                  */}
      {/* ========================================================================= */}
      <ManuscriptModal
        isOpen={Boolean(activeModalPaper)}
        onClose={handleClosePaper}
        article={activeModalPaper}
        user={user}
        onOpenAuth={onNavigateToLogin}
      />
    </div>
  );
};