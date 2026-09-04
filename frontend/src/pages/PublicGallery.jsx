import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { TierBadge } from '../components/TierBadge';

export const PublicGallery = ({ gallery = [], articles = [], investorReviews = [], conferences = [], onNavigateToLogin }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalPaper, setActiveModalPaper] = useState(null);

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
    <div className="space-y-20 py-4 pb-24 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-8 sm:p-12 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '4s' }} /> 
            <span>Official University Innovation & Global Venture Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Bridging Academic Research <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              With Venture Capital.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl">
            UniVenture Hub empowers university student researchers, academic review committees, and international venture capital funds to commercialize breakthrough technology.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => onNavigateToLogin('student')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold rounded-2xl text-sm transition-all transform hover:-translate-y-0.5 shadow-xl shadow-blue-600/30 flex items-center gap-2.5"
            >
              <GraduationCap className="w-5 h-5" /> Submit Research Paper <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateToLogin('attendee')}
              className="px-7 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-2xl text-sm transition-all flex items-center gap-2 shadow-lg"
            >
              <Calendar className="w-4 h-4 text-blue-400" /> Book Conference Ticket & Seat
            </button>
          </div>
        </div>

        {/* Dynamic Key Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14 pt-10 border-t border-slate-800/80 relative z-10">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">500+</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Peer-Reviewed Papers</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-blue-400 tracking-tight">PKR 25M+</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Venture Pledges</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-purple-400 tracking-tight">98.5%</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Plagiarism Accuracy</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">50+</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">VC Angel Partners</div>
          </div>
        </div>
      </section>

      {/* University & VC Partner Ecosystem Bar */}
      <section className="bg-slate-900/50 rounded-2xl border border-slate-800/80 p-6">
        <div className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Trusted By Premier Universities & Venture Capital Funds
        </div>
        <div className="flex flex-wrap items-center justify-around gap-8 opacity-75 grayscale hover:grayscale-0 transition duration-300">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
            <Building2 className="w-5 h-5 text-blue-400" /> NUST Innovation Lab
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
            <Globe className="w-5 h-5 text-purple-400" /> LUMS Entrepreneurship Center
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
            <Zap className="w-5 h-5 text-amber-400" /> Apex Tech Capital
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> HEC Research Council
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
            <Award className="w-5 h-5 text-cyan-400" /> BioHealth VC Syndicate
          </div>
        </div>
      </section>

      {/* SECTION 1: PUBLISHED STUDENT RESEARCH PAPERS SHOWCASE */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-2">
              <FileText className="w-3.5 h-3.5" /> Peer-Reviewed Student Publications
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Published Student Papers
            </h2>
            <p className="text-sm text-slate-400 mt-1">Research papers authored by university students, approved by academic committee with paid publication fees.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publishedArticles.map((art) => (
            <div
              key={art.id}
              className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800/90 hover:border-blue-500/40 transition flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    {art.category}
                  </span>
                  <TierBadge tier={art.tier || 'Platinum'} />
                </div>
                <h3 className="text-xl font-bold text-white leading-snug">{art.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  "{art.abstract}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs">
                <span className="text-slate-400">Student Author: <strong className="text-white">{art.student_name}</strong></span>
                <button
                  onClick={() => setActiveModalPaper(art)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  Read Paper <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: FEATURED VENTURE FUNDED SHOWCASE (3-CARD GRID) */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 mb-2">
              <Award className="w-3.5 h-3.5" /> Venture Capital Backed Innovations
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Featured Funded Innovations
            </h2>
            <p className="text-sm text-slate-400 mt-1">Top-tier research projects awarded funding pledges by attending venture capital investors.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            {['All', 'Platinum', 'Gold', 'Funded'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All Innovations' : cat === 'Funded' ? '💰 Seed Funded' : `${cat} Tier`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGallery.map((item) => {
            const article = articles.find(a => a.id === item.featured_article_id);
            return (
              <div
                key={item.id}
                className="group bg-slate-900/70 rounded-3xl overflow-hidden border border-slate-800/90 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="h-60 overflow-hidden relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-lg flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Seed Funding Pledged
                      </span>
                      {article && <TierBadge tier={article.tier} />}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                      {article ? article.category : 'Advanced Innovation'}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium block">Venture Capital Partner:</span>
                    <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                      <span>{item.investor_name}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModalPaper(article || { title: item.title, abstract: item.description, student_name: 'Lead Student Researcher', category: 'Technology', tier: 'Platinum' })}
                    className="w-full py-3 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 group-hover:bg-blue-600"
                  >
                    Explore Innovation <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: LIVE CONFERENCE SHOWCASE WITH 1-4 PRESENTING STUDENTS & ATTENDING INVESTORS */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden space-y-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Summit Banner Image & Main Info Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Official Conference & Live Pitch Summit
              </span>

              {conf.status === 'Live Now' ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black text-rose-300 bg-rose-500/20 border border-rose-500/40 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> 🔴 Live Stream Broadcasting
                </span>
              ) : conf.status === 'Completed' ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Completed Summit
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/30">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Upcoming Innovation Summit
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {conf.title}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {conf.description}
            </p>

            {/* Schedule Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Event Date</div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> {conf.event_date || 'Sept 15, 2026'}
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Time Duration</div>
                <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> {conf.event_time || '10:00 AM - 04:00 PM'}
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Venue / Hall</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-1 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {conf.venue}
                </div>
              </div>
            </div>
          </div>

          {/* Banner Photo & Live Stream Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group">
              <img
                src={conf.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                alt={conf.title}
                className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs">
                <span className="px-3 py-1 bg-slate-900/90 text-white rounded-lg border border-slate-700 font-mono font-bold">
                  Summit Main Stage
                </span>
                {conf.stream_link && (
                  <a
                    href={conf.stream_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-lg"
                  >
                    <Globe className="w-3 h-3" /> Join Virtual Stream
                  </a>
                )}
              </div>
            </div>

            {/* Ticket Options Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">🎟️ Physical Onsite Pass</span>
                <span className="text-base font-black text-emerald-400">PKR / USD {conf.onsite_ticket_price || '50.00'}</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">🎟️ Online HD Stream Pass</span>
                <span className="text-base font-black text-blue-400">PKR / USD {conf.online_ticket_price || '20.00'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1 TO 4 PRESENTING STUDENTS LIST */}
        <div className="bg-slate-950/90 p-6 rounded-2xl border border-slate-800 space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4 text-blue-400" /> Scheduled Presenting Students & Research Pitch Topics (1 - 4 Teams Lineup):
          </div>
          <p className="text-sm font-semibold text-white leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800 font-sans">
            {conf.presenting_students || 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)'}
          </p>
        </div>

        {/* ATTENDING INVESTORS SHOWCASE */}
        <div className="bg-slate-950/90 p-6 rounded-2xl border border-slate-800 space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-amber-400" /> Attending Venture Capitalists & Business Investors Panel:
          </div>
          <p className="text-sm font-semibold text-slate-200 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800 font-sans">
            {conf.attending_investors || 'John Malik (Apex Tech Capital), Dr. Sarah Vance (BioHealth VC)'}
          </p>
        </div>

        <div className="pt-2 relative z-10 flex flex-wrap gap-4 items-center">
          <button
            onClick={() => onNavigateToLogin('attendee')}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-sm transition shadow-xl shadow-emerald-600/30 flex items-center gap-2.5"
          >
            <Ticket className="w-5 h-5" /> Book Conference Pass & Reserve Seat <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* SECTION 4: CERTIFIED INVESTOR TESTIMONIALS */}
      <section className="bg-slate-900/60 rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-2">
            <Briefcase className="w-3.5 h-3.5" /> Certified Investor Testimonials
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Industry & Economic Endorsements
          </h2>
          <p className="text-xs text-slate-400 mt-1">Official evaluations and funding commitments submitted by registered venture capitalists.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {investorReviews.map((rev) => (
            <div key={rev.id} className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800/90 flex flex-col justify-between space-y-4 shadow-md">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    {rev.decision}
                  </span>
                  <span className="text-[11px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                    {rev.benefit_for_country}
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">{rev.article_title}</h4>
                
                <p className="text-xs text-slate-300 italic bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  "{rev.comments}"
                </p>
              </div>

              <div className="text-xs text-slate-400 pt-3 border-t border-slate-800/80 flex justify-between items-center">
                <span>Investor: <strong className="text-amber-400">{rev.investor_name}</strong></span>
                <span className="text-slate-500">{rev.created_at}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Research Paper Detail Modal */}
      {activeModalPaper && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalPaper(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {activeModalPaper.category || 'Research Paper'}
                </span>
                <TierBadge tier={activeModalPaper.tier || 'Platinum'} />
              </div>
              <h3 className="text-2xl font-bold text-white">{activeModalPaper.title}</h3>
              <p className="text-xs text-slate-400">Author: <strong className="text-slate-200">{activeModalPaper.student_name}</strong></p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Abstract & Executive Summary</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{activeModalPaper.abstract}</p>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Academic Article Content:</h4>
                <div className="max-h-64 overflow-y-auto text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-900/90 p-4 rounded-xl border border-slate-800 leading-relaxed">
                  {activeModalPaper.full_text || activeModalPaper.abstract}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Plagiarism Check Score</span>
                <span className="text-base font-bold text-emerald-400">{activeModalPaper.plagiarism_score || 4}% (Verified Clean)</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Academic Tier Awarded</span>
                <span className="text-base font-bold text-blue-400">{activeModalPaper.tier || 'Gold Tier'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => setActiveModalPaper(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Close Viewer
              </button>

              <button
                onClick={() => {
                  setActiveModalPaper(null);
                  onNavigateToLogin('student');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30"
              >
                Submit Similar Research Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
