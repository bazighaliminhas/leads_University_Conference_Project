import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  FileText,
  Download,
  Calendar,
  User,
  Send,
  Eye,
  ChevronRight,
  ExternalLink,
  Award,
  Sparkles,
  Info,
  Layers,
  Search,
  CheckCircle2,
  Share2,
  Bookmark,
  Building2,
  GraduationCap
} from 'lucide-react';
import { ManuscriptModal } from '../components/ManuscriptModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function JournalDetailPage({ user, onOpenAuth }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedArticleModal, setSelectedArticleModal] = useState(null);
  const [activeTab, setActiveTab] = useState('current'); // 'current', 'about', 'call-for-papers'

  useEffect(() => {
    fetchJournalDetail();
  }, [slug]);

  const fetchJournalDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/journals/${slug || 1}`);
      setJournal(res.data);
    } catch (err) {
      console.error('Error fetching journal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeSubmission = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('login');
      else navigate('/login');
    } else {
      navigate('/student/submit', { state: { selectedJournalId: journal?.id } });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Journal Not Found</h2>
        <button
          onClick={() => navigate('/journals')}
          className="px-5 py-2.5 rounded-xl bg-[#0F2C59] text-white text-sm font-bold shadow"
        >
          Back to Journals Directory
        </button>
      </div>
    );
  }

  const keywordsList = (journal.scope_keywords || 'Artificial Intelligence, Machine Learning, Robotics, Computer Vision, Neural Networks, Deep Learning')
    .split(',')
    .map(k => k.trim());

  return (
    <div className="space-y-8 font-sans pb-24">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span onClick={() => navigate('/')} className="hover:text-[#0F2C59] cursor-pointer">Research</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span onClick={() => navigate('/journals')} className="hover:text-[#0F2C59] cursor-pointer">Journals</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-amber-700 font-bold">{journal.short_code}</span>
      </div>

      {/* Top Journal Banner Header */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F2C59] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden border border-blue-950">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Lahore Leads University — Open Journal Systems (OJS)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {journal.title}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base font-light">
              Acronym: <span className="font-bold text-amber-300">{journal.short_code}</span> | ISSN (Print): <span className="font-mono">{journal.issn_print}</span> | ISSN (Online): <span className="font-mono">{journal.issn_online}</span>
            </p>
          </div>

          <button
            onClick={handleMakeSubmission}
            className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xl transition transform hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2 self-start md:self-auto"
          >
            <Send className="w-4 h-4" />
            <span>MAKE A SUBMISSION</span>
          </button>
        </div>
      </div>

      {/* Journal Subnavigation Menu */}
      <div className="bg-white border-y border-slate-200 py-3 px-4 rounded-xl flex items-center justify-between gap-4 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${activeTab === 'current' ? 'bg-[#0F2C59] text-white' : 'text-slate-600 hover:text-[#0F2C59]'}`}
          >
            Current Issue
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${activeTab === 'about' ? 'bg-[#0F2C59] text-white' : 'text-slate-600 hover:text-[#0F2C59]'}`}
          >
            About The Journal
          </button>
          <button
            onClick={() => setActiveTab('call-for-papers')}
            className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${activeTab === 'call-for-papers' ? 'bg-[#0F2C59] text-white' : 'text-slate-600 hover:text-[#0F2C59]'}`}
          >
            Call For Papers
          </button>
        </div>

        <button
          onClick={handleMakeSubmission}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 whitespace-nowrap"
        >
          <span>Submit Manuscript</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Layout: Left Content (2/3) + Right Sidebar (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* About The Journal Box */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-[#0A192F] border-b border-slate-100 pb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0F2C59]" />
              <span>About the Journal</span>
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              {journal.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Chief Editor:</span>
                <span className="text-slate-600">{journal.chief_editor || 'Prof. Dr. M. Arshad (Lahore Leads University)'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Editorial Frequency:</span>
                <span className="text-slate-600">Bi-Annual (Spring / Fall Issues)</span>
              </div>
            </div>
          </div>

          {/* Call for Papers Flyer Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Official Call For Papers</span>
                <h3 className="text-xl font-bold text-[#0A192F]">
                  {journal.call_for_papers_title || `Call for Papers Vol ${journal.current_volume || 1} Issue ${journal.current_issue || 2}`}
                </h3>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 whitespace-nowrap">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Deadline: {journal.call_for_papers_deadline || '2026-11-15'}</span>
              </div>
            </div>

            {/* Flyer Graphic Container */}
            <div className="bg-gradient-to-br from-[#0A192F] via-[#0F2C59] to-[#1E3A8A] rounded-xl p-6 sm:p-8 text-white flex flex-col sm:flex-row gap-6 items-center">
              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">{journal.short_code} JOURNAL &bull; LAHORE LEADS UNIVERSITY</span>
                  <h4 className="text-xl sm:text-2xl font-black text-white">Call for Papers Volume {journal.current_volume || 1}</h4>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-200">Recommended Topics & Scope:</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-200">
                    {keywordsList.slice(0, 8).map((kw, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">{kw}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={handleMakeSubmission}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition"
                >
                  Submit to this Issue
                </button>
              </div>

              <div className="w-36 h-36 rounded-xl bg-white p-2 shadow-md flex-shrink-0 flex flex-col items-center justify-center text-center text-slate-900">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://leads.edu.pk/journals"
                  alt="Submission QR"
                  className="w-24 h-24 object-contain"
                />
                <span className="text-[10px] font-bold text-slate-500 mt-1">Scan to Submit</span>
              </div>
            </div>
          </div>

          {/* Current Issue Articles Section */}
          <div id="current-issue" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Official Publication</span>
                <h2 className="text-2xl font-bold text-[#0A192F]">
                  CURRENT ISSUE
                </h2>
                <p className="text-slate-600 text-sm font-semibold">
                  {journal.current_issue_title || `Vol. ${journal.current_volume || 1} No. ${journal.current_issue || 2} (2026): Fall Issue`}
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                PUBLISHED: 2026-09-01
              </span>
            </div>

            {/* Articles List in Issue */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Articles in this Issue
              </h3>

              {(!journal.articles || journal.articles.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm font-medium">Submissions for this issue are currently undergoing peer review.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {journal.articles.map((art) => (
                    <div key={art.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                      <h4
                        onClick={() => setSelectedArticleModal(art)}
                        className="text-base sm:text-lg font-bold text-[#0A192F] hover:text-amber-700 transition-colors cursor-pointer leading-snug"
                      >
                        {art.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{art.student_name || 'Ali Ahmed, Researcher'}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-slate-500">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Pages: {art.page_numbers || '1-25'}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Views: {art.views_count || 120}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {art.abstract}
                      </p>

                      {/* PDF Download Button */}
                      <div className="pt-1 flex items-center gap-3">
                        <button
                          onClick={() => setSelectedArticleModal(art)}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0F2C59] hover:bg-[#0A192F] text-white text-xs font-bold transition shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF ({art.page_numbers || '1-25'})</span>
                        </button>

                        <button
                          onClick={() => setSelectedArticleModal(art)}
                          className="text-xs font-semibold text-slate-600 hover:text-[#0F2C59] transition"
                        >
                          View Abstract & Citation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Primary Action Button */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
            <button
              onClick={handleMakeSubmission}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>MAKE A SUBMISSION</span>
            </button>
            <p className="text-xs text-slate-500">
              Double-blind peer review with fast-track editorial feedback by Leads University Faculty.
            </p>
          </div>

          {/* Keywords Tag Cloud */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0A192F] uppercase tracking-wider border-b border-slate-100 pb-2">
              KEYWORDS & SCOPE
            </h3>
            <div className="flex flex-wrap gap-2">
              {keywordsList.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 transition cursor-default"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Information Links */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#0A192F] uppercase tracking-wider border-b border-slate-100 pb-2">
              INFORMATION
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); setActiveTab('about'); }} className="hover:text-amber-700 transition flex items-center justify-between">
                  <span>For Readers</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="#submit" onClick={(e) => { e.preventDefault(); handleMakeSubmission(); }} className="hover:text-amber-700 transition flex items-center justify-between">
                  <span>For Authors & Formatting Guidelines</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); setActiveTab('about'); }} className="hover:text-amber-700 transition flex items-center justify-between">
                  <span>For Librarians & Repository Archiving</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* ISSN Details Box */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider">
              JOURNAL METRICS
            </h3>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Print ISSN:</span>
                <span className="font-mono font-bold text-slate-800">{journal.issn_print}</span>
              </div>
              <div className="flex justify-between">
                <span>Online ISSN:</span>
                <span className="font-mono font-bold text-slate-800">{journal.issn_online}</span>
              </div>
              <div className="flex justify-between">
                <span>Publisher:</span>
                <span className="font-bold text-slate-800">Lahore Leads University</span>
              </div>
              <div className="flex justify-between">
                <span>Peer Review:</span>
                <span className="font-bold text-slate-800">Double-Blind</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Detail & Academic Paywall Reader Modal */}
      <ManuscriptModal
        isOpen={Boolean(selectedArticleModal)}
        onClose={() => setSelectedArticleModal(null)}
        article={selectedArticleModal}
        user={user}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
}
