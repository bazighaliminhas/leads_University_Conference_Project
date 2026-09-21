import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Ticket,
  Image as ImageIcon,
  LogIn,
  LogOut,
  UserPlus,
  Sparkles,
  Layers,
  Calendar,
  Award,
  Eye,
  EyeOff,
  BookOpen,
  Search,
  Building2,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Compass,
  FileText,
  Globe,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { AttendeeDashboard } from './pages/AttendeeDashboard';
import { PublicGallery } from './pages/PublicGallery';
import { ResearchHome } from './pages/ResearchHome';
import { JournalsDirectory } from './pages/JournalsDirectory';
import { JournalDetailPage } from './pages/JournalDetailPage';
import { ConferencesPage } from './pages/ConferencesPage';
import { LeadsLogo } from './components/LeadsLogo';
import { NotificationBell } from './components/NotificationBell';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Persistent User Session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('univ_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('univ_token') || '');

  // Auth Form State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({ full_name: '', email: '', password: '', role: 'student', organization: '' });

  // Domain Data State
  const [articles, setArticles] = useState([]);
  const [journals, setJournals] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [investorReviews, setInvestorReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [registeredInvestors, setRegisteredInvestors] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [token]);

  const fetchInitialData = async () => {
    try {
      const [artRes, confRes, revRes, galRes, jRes] = await Promise.all([
        axios.get(`${API_BASE}/articles`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/conferences`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/investor-reviews`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/gallery`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/journals`).catch(() => ({ data: [] }))
      ]);
      setArticles(artRes.data || []);
      setConferences(confRes.data || []);
      setInvestorReviews(revRes.data || []);
      setGallery(galRes.data || []);
      setJournals(jRes.data || []);
    } catch (err) {
      console.log('Using backend initial dataset');
    }

    if (token) {
      try {
        const invRes = await axios.get(`${API_BASE}/admin/investors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRegisteredInvestors(invRes.data || []);
      } catch (err) {
        setRegisteredInvestors([
          { id: 3, full_name: 'John Malik', email: 'investor@venture.com', organization: 'Apex Tech Capital' },
          { id: 6, full_name: 'Dr. Sarah Vance', email: 'sarah@biohealthvc.com', organization: 'BioHealth VC' },
          { id: 7, full_name: 'Hamza Qureshi', email: 'hamza@fintechangels.com', organization: 'FinTech Angels' }
        ]);
      }

      try {
        const ticketRes = await axios.get(`${API_BASE}/tickets/my-tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(ticketRes.data || []);
      } catch (err) {
        // tickets fallback
      }
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API_BASE}${endpoint}`, authData);

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('univ_token', res.data.token);
      localStorage.setItem('univ_user', JSON.stringify(res.data.user));
      setShowAuthModal(false);

      const role = res.data.user.role;
      navigate(`/${role}`);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed');
    }
  };

  // Sync route with Auth Modal if navigating to /login or /register
  useEffect(() => {
    if (location.pathname === '/login') {
      setAuthMode('login');
      setShowAuthModal(true);
    } else if (location.pathname === '/register') {
      setAuthMode('register');
      setShowAuthModal(true);
    }
  }, [location.pathname]);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    if (location.pathname === '/login' || location.pathname === '/register') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('univ_token');
    localStorage.removeItem('univ_user');
    navigate('/');
  };

  // Article Action Handlers
  const handleArticleSubmit = async (newArticleData) => {
    const createdArticle = {
      id: Date.now(),
      student_id: user ? user.id : 2,
      student_name: user ? user.full_name : 'Student Author',
      title: newArticleData.title,
      abstract: newArticleData.abstract,
      full_text: newArticleData.full_text || newArticleData.abstract,
      category: newArticleData.category || 'Computer Science & AI',
      journal_id: newArticleData.journal_id || null,
      pdf_url: newArticleData.pdf_url || 'submitted_research.pdf',
      submission_receipt_url: newArticleData.submission_receipt_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      publication_receipt_url: '',
      presentation_receipt_url: '',
      sender_bank: newArticleData.sender_bank || 'HBL Mobile App',
      transaction_id: newArticleData.transaction_id || 'TRX-948201',
      sender_mobile: newArticleData.sender_mobile || '0300-1234567',
      plagiarism_score: Math.floor(Math.random() * 6) + 3,
      reviewer_notes: 'Under academic review by Lahore Leads University Editorial Committee.',
      admin_revision_notes: null,
      resubmission_count: 0,
      tier: 'None',
      submission_fee_paid: true,
      publication_fee_paid: false,
      presentation_fee_paid: false,
      is_published: false,
      admin_unread: true,
      student_unread: false,
      status: 'Submitted - Awaiting Review',
      created_at: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await axios.post(`${API_BASE}/articles`, newArticleData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.article) {
        setArticles([res.data.article, ...articles]);
        return;
      }
    } catch (err) {
      console.log('Synchronized locally');
    }

    setArticles([createdArticle, ...articles]);
  };

  const handleUpdateArticle = async (articleId, updateFields) => {
    try {
      const res = await axios.put(`${API_BASE}/articles/${articleId}/review`, updateFields, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(articles.map(a => a.id === articleId ? (res.data.article || { ...a, ...updateFields, admin_unread: false, student_unread: true }) : a));
    } catch (err) {
      setArticles(articles.map(a => a.id === articleId ? { ...a, ...updateFields, admin_unread: false, student_unread: true } : a));
    }
  };

  const handlePublishArticle = async (articleId, publishPayload) => {
    try {
      const is_published = typeof publishPayload === 'object' ? publishPayload.is_published : publishPayload;
      const res = await axios.put(`${API_BASE}/articles/${articleId}/publish`, typeof publishPayload === 'object' ? publishPayload : { is_published }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(articles.map(a => a.id === articleId ? (res.data.article || { ...a, is_published, status: is_published ? 'Published' : a.status, admin_unread: false, student_unread: true }) : a));
    } catch (err) {
      setArticles(articles.map(a => a.id === articleId ? { ...a, is_published: true, status: 'Published', admin_unread: false, student_unread: true } : a));
    }
  };

  const handleReviseArticle = async (articleId, revisionData) => {
    try {
      const res = await axios.post(`${API_BASE}/articles/${articleId}/resubmit`, revisionData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(articles.map(a => a.id === articleId ? (res.data.article || { ...a, ...revisionData, status: 'Resubmitted - Awaiting Review', admin_unread: true, student_unread: false }) : a));
    } catch (err) {
      setArticles(articles.map(a => a.id === articleId ? { ...a, ...revisionData, status: 'Resubmitted - Awaiting Review', admin_unread: true, student_unread: false } : a));
    }
  };

  const handlePayPublicationFee = async (articleId, paymentData) => {
    const pubUrl = paymentData.publication_receipt_url || paymentData.receipt_url;
    try {
      const res = await axios.post(`${API_BASE}/articles/${articleId}/pay-publication`, paymentData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(articles.map(a => a.id === articleId ? (res.data.article || { ...a, ...paymentData, publication_receipt_url: pubUrl, publication_fee_paid: true, status: 'Pub Fee Paid - Verify & Publish', admin_unread: true, student_unread: false }) : a));
    } catch (err) {
      setArticles(articles.map(a => a.id === articleId ? { ...a, ...paymentData, publication_receipt_url: pubUrl, publication_fee_paid: true, status: 'Pub Fee Paid - Verify & Publish', admin_unread: true, student_unread: false } : a));
    }
  };

  const handleApplyConference = async (articleId, paymentData) => {
    const confUrl = paymentData.presentation_receipt_url || paymentData.receipt_url;
    try {
      const res = await axios.post(`${API_BASE}/articles/${articleId}/apply-conference`, paymentData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(articles.map(a => a.id === articleId ? (res.data.article || { ...a, ...paymentData, presentation_receipt_url: confUrl, presentation_fee_paid: true, status: 'Presentation Scheduled', admin_unread: true, student_unread: false }) : a));
    } catch (err) {
      setArticles(articles.map(a => a.id === articleId ? { ...a, ...paymentData, presentation_receipt_url: confUrl, presentation_fee_paid: true, status: 'Presentation Scheduled', admin_unread: true, student_unread: false } : a));
    }
  };

  const handleMarkRead = async (articleId) => {
    try {
      await axios.put(`${API_BASE}/articles/${articleId}/mark-read`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      // ignore
    }
    setArticles(articles.map(a => {
      if (a.id === articleId) {
        if (user?.role === 'admin') return { ...a, admin_unread: false };
        return { ...a, student_unread: false };
      }
      return a;
    }));
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      await axios.delete(`${API_BASE}/articles/${articleId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(prev => prev.filter(a => a.id !== articleId));
    } catch (err) {
      setArticles(prev => prev.filter(a => a.id !== articleId));
    }
  };

  const handleUpdateConference = async (confId, updatedData) => {
    const freshConf = { id: confId, ...updatedData };
    setConferences(prev => {
      if (!prev || prev.length === 0) return [freshConf];
      const index = prev.findIndex(c => c.id == confId);
      if (index === -1) return [freshConf, ...prev];
      return prev.map(c => c.id == confId ? { ...c, ...updatedData } : c);
    });

    try {
      const res = await axios.put(`${API_BASE}/admin/conferences/${confId}`, updatedData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.conference) {
        setConferences(prev => prev.map(c => c.id == confId ? res.data.conference : c));
      }
    } catch (err) {
      console.log('Conference saved to memory state');
    }
  };

  const handleCreateInvestor = async (investorData) => {
    try {
      const res = await axios.post(`${API_BASE}/admin/create-investor`, investorData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.investor) {
        setRegisteredInvestors(prev => [...prev, res.data.investor]);
      }
      return res.data;
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating investor account');
    }
  };

  const handleSubmitInvestorReview = async (reviewData) => {
    try {
      const res = await axios.post(`${API_BASE}/investor-reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestorReviews([res.data.review, ...investorReviews]);
    } catch (err) {
      alert('Error submitting investor review');
    }
  };

  const handleBookTicket = async (ticket_type, amount, paymentProof, confId) => {
    try {
      const payload = {
        conference_id: confId || 1,
        ticket_type: ticket_type || 'onsite',
        amount_paid: amount || (ticket_type === 'onsite' ? 500 : 200),
        receipt_url: paymentProof?.receipt_url || '',
        sender_bank: paymentProof?.sender_bank || 'HBL Mobile App',
        transaction_id: paymentProof?.transaction_id || `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
        sender_mobile: paymentProof?.sender_mobile || '0348-2727605',
        attendee_name: user?.full_name || 'Conference Delegate',
        attendee_email: user?.email || 'delegate@univ.edu'
      };
      const res = await axios.post(`${API_BASE}/tickets`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.ticket) {
        setTickets(prev => [res.data.ticket, ...prev]);
        alert('🎟️ Delegate Pass Booking Submitted! Admin has been notified via WhatsApp & Email to verify payment.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error booking ticket');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      {/* ========================================================================= */}
      {/* TOP ACADEMIC HEADER — LAHORE LEADS UNIVERSITY OFFICIAL BRANDING           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
        {/* Top Institutional Authority Bar */}
        <div className="bg-[#071324] text-white text-[11px] py-2 px-4 sm:px-6 border-b border-amber-500/20 hidden sm:block">
          <div className="max-w-7xl mx-auto flex justify-between items-center font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-200">
                🏛️ <strong className="text-white tracking-wide">LAHORE LEADS UNIVERSITY</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-bold hidden md:inline">
                Office of Research, Innovation & Commercialization (ORIC)
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300 text-[11px]">
              <a
                href="https://leads.edu.pk"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold"
              >
                <span>leads.edu.pk</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <span className="text-slate-600">•</span>
              <span
                className="hover:text-amber-400 cursor-pointer transition-colors font-semibold"
                onClick={() => navigate('/journals')}
              >
                OJS Journals
              </span>
              <span className="text-slate-600">•</span>
              <span
                className="hover:text-amber-400 cursor-pointer transition-colors font-semibold"
                onClick={() => navigate('/conferences')}
              >
                Summits 2026
              </span>
              <button
                onClick={() => {
                  if (user?.role === 'student') navigate('/student/submit');
                  else {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 text-[#071324] font-black px-3.5 py-0.5 rounded-full text-[10px] tracking-wide transition shadow-sm"
              >
                Apply Online
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
          {/* Lahore Leads University Brand Logo */}
          <div
            className="flex items-center cursor-pointer group transition-transform hover:scale-[1.02] shrink-0"
            onClick={() => navigate('/')}
            title="Lahore Leads University — Research & OJS Portal"
          >
            <LeadsLogo size="default" />
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 font-bold text-xs text-slate-700">
            <button
              onClick={() => navigate('/')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                location.pathname === '/'
                  ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-[#0A192F]'
              }`}
            >
              Research Home
            </button>

            <button
              onClick={() => navigate('/journals')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/journal')
                  ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-[#0A192F]'
              }`}
            >
              <span>Leads Journals</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                location.pathname.startsWith('/journal') ? 'bg-amber-400 text-[#0A192F]' : 'bg-slate-200 text-slate-700'
              }`}>
                {journals.length || 6}
              </span>
            </button>

            <button
              onClick={() => navigate('/conferences')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                location.pathname === '/conferences'
                  ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-[#0A192F]'
              }`}
            >
              Conferences & Summits
            </button>

            <button
              onClick={() => navigate('/showcase')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                location.pathname === '/showcase'
                  ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-[#0A192F]'
              }`}
            >
              Showcase & Startups
            </button>
          </nav>

          {/* Right Area: Authenticated Role Portal & User Capsule */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Authenticated Portal Direct Action Button */}
            {user?.role === 'student' && (
              <button
                onClick={() => navigate('/student')}
                className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all text-xs font-black shadow-sm ${
                  location.pathname.startsWith('/student')
                    ? 'bg-[#0F2C59] text-white ring-2 ring-blue-300'
                    : 'bg-blue-50 text-[#0F2C59] hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>My Student Portal</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all text-xs font-black shadow-sm ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-[#0A192F] text-amber-400 ring-2 ring-amber-400'
                    : 'bg-amber-50 text-slate-900 hover:bg-amber-100 border border-amber-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin & Editorial Board</span>
              </button>
            )}

            {user?.role === 'investor' && (
              <button
                onClick={() => navigate('/investor')}
                className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all text-xs font-black shadow-sm ${
                  location.pathname.startsWith('/investor')
                    ? 'bg-emerald-900 text-white ring-2 ring-emerald-400'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>Investor Hub</span>
              </button>
            )}

            {user?.role === 'attendee' && (
              <button
                onClick={() => navigate('/attendee')}
                className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all text-xs font-black shadow-sm ${
                  location.pathname.startsWith('/attendee')
                    ? 'bg-purple-900 text-white ring-2 ring-purple-400'
                    : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-purple-600" />
                <span>My Passes</span>
              </button>
            )}

            {user && <NotificationBell user={user} onNavigate={navigate} />}

            {/* User Profile Pill or Login Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => navigate(`/${user.role}`)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl hover:bg-slate-200/70 transition cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-xs font-mono shadow-sm">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <div className="text-xs font-black text-[#0A192F] max-w-[130px] truncate">
                      {user.full_name}
                    </div>
                    <div className="text-[9.5px] text-amber-700 font-extrabold uppercase tracking-wider">
                      {user.role}
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm border border-amber-400/40"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}

            {/* Mobile Navigation Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#0A192F]" /> : <Menu className="w-5 h-5 text-[#0A192F]" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-200 p-4 space-y-2 shadow-xl animate-fade-in">
            <button
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-800"
            >
              Research Home
            </button>
            <button
              onClick={() => { navigate('/journals'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-800 flex justify-between items-center"
            >
              <span>Leads University Journals</span>
              <span className="bg-slate-200 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full">{journals.length || 6}</span>
            </button>
            <button
              onClick={() => { navigate('/conferences'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-800"
            >
              Conferences & Summits
            </button>
            <button
              onClick={() => { navigate('/showcase'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-800"
            >
              Showcase & Startups
            </button>

            {user?.role === 'student' && (
              <button
                onClick={() => { navigate('/student'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50"
              >
                🎓 My Student Portal
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black text-[#0A192F] bg-amber-50 border border-amber-200"
              >
                👑 Admin & Editorial Board
              </button>
            )}
            {user?.role === 'investor' && (
              <button
                onClick={() => { navigate('/investor'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50"
              >
                💼 Venture Investor Portal
              </button>
            )}
            {user?.role === 'attendee' && (
              <button
                onClick={() => { navigate('/attendee'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-purple-800 bg-purple-50"
              >
                🎟️ Attendee Passes
              </button>
            )}
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT ROUTING WITH LUXURIOUS CONTAINER PADDING                      */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Routes>
          {/* Research Home Page */}
          <Route
            path="/"
            element={
              <ResearchHome
                articles={articles}
                conferences={conferences}
                journals={journals}
              />
            }
          />

          {/* University Journals Directory */}
          <Route
            path="/journals"
            element={
              <JournalsDirectory
                journals={journals}
              />
            }
          />

          {/* Journal OJS Detail Page */}
          <Route
            path="/journal/:slug"
            element={
              <JournalDetailPage
                user={user}
                journals={journals}
                articles={articles}
                onOpenAuth={(mode) => {
                  setAuthMode(mode || 'login');
                  setShowAuthModal(true);
                }}
              />
            }
          />

          {/* University Conferences Portal */}
          <Route
            path="/conferences"
            element={
              <ConferencesPage
                user={user}
                conferences={conferences}
                onOpenAuth={(mode) => {
                  setAuthMode(mode || 'login');
                  setShowAuthModal(true);
                }}
              />
            }
          />

          {/* Public Gallery / Showcase */}
          <Route
            path="/showcase"
            element={
              <PublicGallery
                user={user}
                gallery={gallery}
                articles={articles}
                investorReviews={investorReviews}
                conferences={conferences}
                onNavigateToLogin={(targetRole) => {
                  if (targetRole) setAuthData(prev => ({ ...prev, role: targetRole }));
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
              />
            }
          />
          <Route path="/gallery" element={<Navigate to="/showcase" replace />} />
          <Route
            path="/article/:id"
            element={
              <PublicGallery
                user={user}
                gallery={gallery}
                articles={articles}
                investorReviews={investorReviews}
                conferences={conferences}
                onNavigateToLogin={(targetRole) => {
                  if (targetRole) setAuthData(prev => ({ ...prev, role: targetRole }));
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
              />
            }
          />
          <Route path="/paper/:id" element={<Navigate to="/showcase" replace />} />

          {/* Student Dashboard Routes */}
          <Route
            path="/student"
            element={
              <StudentDashboard
                user={user || { id: null, full_name: '', role: 'guest' }}
                articles={articles}
                journals={journals}
                conferences={conferences}
                tickets={tickets}
                onArticleSubmit={handleArticleSubmit}
                onReviseArticle={handleReviseArticle}
                onPayPublicationFee={handlePayPublicationFee}
                onApplyConference={handleApplyConference}
                onDeleteArticle={handleDeleteArticle}
                onMarkRead={handleMarkRead}
              />
            }
          />
          <Route
            path="/student/submit"
            element={
              <StudentDashboard
                user={user || { id: null, full_name: '', role: 'guest' }}
                articles={articles}
                journals={journals}
                conferences={conferences}
                tickets={tickets}
                onArticleSubmit={handleArticleSubmit}
                onReviseArticle={handleReviseArticle}
                onPayPublicationFee={handlePayPublicationFee}
                onApplyConference={handleApplyConference}
                onDeleteArticle={handleDeleteArticle}
                onMarkRead={handleMarkRead}
              />
            }
          />
          <Route
            path="/student/paper/:id"
            element={
              <StudentDashboard
                user={user || { id: null, full_name: '', role: 'guest' }}
                articles={articles}
                journals={journals}
                conferences={conferences}
                tickets={tickets}
                onArticleSubmit={handleArticleSubmit}
                onReviseArticle={handleReviseArticle}
                onPayPublicationFee={handlePayPublicationFee}
                onApplyConference={handleApplyConference}
                onDeleteArticle={handleDeleteArticle}
                onMarkRead={handleMarkRead}
              />
            }
          />

          {/* Admin Control Panel Routes */}
          <Route
            path="/admin"
            element={
              <AdminDashboard
                articles={articles}
                conferences={conferences}
                registeredInvestors={registeredInvestors}
                journals={journals}
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
                onDeleteArticle={handleDeleteArticle}
                onUpdateConference={handleUpdateConference}
                onCreateInvestor={handleCreateInvestor}
                onMarkRead={handleMarkRead}
                onNavigateTab={(tab) => navigate(tab === 'gallery' ? '/' : `/${tab}`)}
              />
            }
          />
          <Route
            path="/admin/journals"
            element={
              <AdminDashboard
                articles={articles}
                conferences={conferences}
                registeredInvestors={registeredInvestors}
                journals={journals}
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
                onDeleteArticle={handleDeleteArticle}
                onUpdateConference={handleUpdateConference}
                onCreateInvestor={handleCreateInvestor}
                onMarkRead={handleMarkRead}
                onNavigateTab={(tab) => navigate(tab === 'gallery' ? '/' : `/${tab}`)}
              />
            }
          />
          <Route
            path="/admin/articles"
            element={
              <AdminDashboard
                articles={articles}
                conferences={conferences}
                registeredInvestors={registeredInvestors}
                journals={journals}
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
                onDeleteArticle={handleDeleteArticle}
                onUpdateConference={handleUpdateConference}
                onCreateInvestor={handleCreateInvestor}
                onMarkRead={handleMarkRead}
                onNavigateTab={(tab) => navigate(tab === 'gallery' ? '/' : `/${tab}`)}
              />
            }
          />
          <Route
            path="/admin/review/:id"
            element={
              <AdminDashboard
                articles={articles}
                conferences={conferences}
                registeredInvestors={registeredInvestors}
                journals={journals}
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
                onDeleteArticle={handleDeleteArticle}
                onUpdateConference={handleUpdateConference}
                onCreateInvestor={handleCreateInvestor}
                onMarkRead={handleMarkRead}
                onNavigateTab={(tab) => navigate(tab === 'gallery' ? '/' : `/${tab}`)}
              />
            }
          />
          <Route
            path="/admin/conference"
            element={
              <AdminDashboard
                articles={articles}
                conferences={conferences}
                registeredInvestors={registeredInvestors}
                journals={journals}
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
                onDeleteArticle={handleDeleteArticle}
                onUpdateConference={handleUpdateConference}
                onCreateInvestor={handleCreateInvestor}
                onMarkRead={handleMarkRead}
                onNavigateTab={(tab) => navigate(tab === 'gallery' ? '/' : `/${tab}`)}
              />
            }
          />
          <Route
            path="/admin/investors"
            element={
              <AdminDashboard
                articles={articles}
                conferences={conferences}
                registeredInvestors={registeredInvestors}
                journals={journals}
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
                onDeleteArticle={handleDeleteArticle}
                onUpdateConference={handleUpdateConference}
                onCreateInvestor={handleCreateInvestor}
                onMarkRead={handleMarkRead}
                onNavigateTab={(tab) => navigate(tab === 'gallery' ? '/' : `/${tab}`)}
              />
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminDashboard
                articles={articles}
                conferences={conferences}
                registeredInvestors={registeredInvestors}
                journals={journals}
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
                onDeleteArticle={handleDeleteArticle}
                onUpdateConference={handleUpdateConference}
                onCreateInvestor={handleCreateInvestor}
                onMarkRead={handleMarkRead}
                onNavigateTab={(tab) => navigate(tab === 'gallery' ? '/' : `/${tab}`)}
              />
            }
          />

          {/* Catch-all Admin route keeps every admin tab reload-safe (/admin/tickets, /admin/readers, /admin/users, /admin/settings, etc.) */}
          <Route
            path="/admin/*"
            element={
              <AdminDashboard
                articles={articles}
                conferences={conferences}
                registeredInvestors={registeredInvestors}
                journals={journals}
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
                onDeleteArticle={handleDeleteArticle}
                onUpdateConference={handleUpdateConference}
                onCreateInvestor={handleCreateInvestor}
                onMarkRead={handleMarkRead}
                onNavigateTab={(tab) => navigate(tab === 'gallery' ? '/' : `/${tab}`)}
              />
            }
          />

          {/* Investor Portal Route */}
          <Route
            path="/investor"
            element={
              <InvestorDashboard
                user={user || { id: null, full_name: '', role: 'guest' }}
                articles={articles}
                investorReviews={investorReviews}
                onSubmitReview={handleSubmitInvestorReview}
              />
            }
          />
          <Route
            path="/investor/evaluate/:id"
            element={
              <InvestorDashboard
                user={user || { id: null, full_name: '', role: 'guest' }}
                articles={articles}
                investorReviews={investorReviews}
                onSubmitReview={handleSubmitInvestorReview}
              />
            }
          />

          {/* Attendee Portal Routes */}
          <Route
            path="/attendee"
            element={
              <AttendeeDashboard
                user={user || { id: null, full_name: '', role: 'guest' }}
                conferences={conferences}
                tickets={tickets}
                onBookTicket={handleBookTicket}
              />
            }
          />
          <Route path="/tickets" element={<Navigate to="/attendee" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ========================================================================= */}
      {/* 5-COLUMN FOOTER — LAHORE LEADS UNIVERSITY                                  */}
      {/* ========================================================================= */}
      <footer className="bg-[#0A192F] text-white border-t-4 border-amber-400 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Col 1: About Lahore Leads University */}
            <div className="space-y-4">
              <LeadsLogo inverted={true} subtitle={false} size="sm" />
              <p className="text-xs text-slate-300 leading-relaxed">
                Lahore Leads University is an esteemed higher education institution dedicated to high-impact academic research, business incubation, and technological innovation.
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Kamahan Road, Off Ferozepur Road, Lahore</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>+92 42 111 532 371</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>oric@leads.edu.pk</span>
                </div>
              </div>
            </div>

            {/* Col 2: Faculties & Academics */}
            <div className="space-y-4">
              <h4 className="text-sm font-black tracking-wider uppercase text-amber-400 border-b border-white/20 pb-2">
                Faculties & Degrees
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="hover:text-amber-400 cursor-pointer transition">Faculty of Computer Science & IT</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Faculty of Business & Economics</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Faculty of Engineering & Tech</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Faculty of Law & Social Policy</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Faculty of Humanities & Arts</li>
                <li className="hover:text-amber-400 cursor-pointer transition">PhD Research Fellowships</li>
              </ul>
            </div>

            {/* Col 3: Campuses & Facilities */}
            <div className="space-y-4">
              <h4 className="text-sm font-black tracking-wider uppercase text-amber-400 border-b border-white/20 pb-2">
                Campuses & Facilities
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="hover:text-amber-400 cursor-pointer transition">Main Campus (Kamahan Road)</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Westwood City Campus (Thokar)</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Leads Digital Central Library</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Executive Incubation Centre</li>
                <li className="hover:text-amber-400 cursor-pointer transition">High-Performance Computing Lab</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Student Sports Complex</li>
              </ul>
            </div>

            {/* Col 4: ORIC & Publications */}
            <div className="space-y-4">
              <h4 className="text-sm font-black tracking-wider uppercase text-amber-400 border-b border-white/20 pb-2">
                ORIC & Publications
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li onClick={() => navigate('/journals')} className="hover:text-amber-400 cursor-pointer transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-400" /> Leads University Journals
                </li>
                <li onClick={() => navigate('/conferences')} className="hover:text-amber-400 cursor-pointer transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-400" /> National Innovation Summit
                </li>
                <li onClick={() => navigate('/student')} className="hover:text-amber-400 cursor-pointer transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-400" /> Submit Paper (OJS)
                </li>
                <li className="hover:text-amber-400 cursor-pointer transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-400" /> ORIC Commercialization Grants
                </li>
                <li className="hover:text-amber-400 cursor-pointer transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-400" /> Plagiarism & Ethics Committee
                </li>
              </ul>
            </div>

            {/* Col 5: Mobile & Accreditation */}
            <div className="space-y-4">
              <h4 className="text-sm font-black tracking-wider uppercase text-amber-400 border-b border-white/20 pb-2">
                Portals & Mobile
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Access official student, faculty, and peer review dashboards via the Leads Mobile Portal app.
              </p>
              <div className="space-y-2">
                <div className="bg-white/10 hover:bg-white/15 p-2.5 rounded-xl border border-white/20 text-xs font-semibold flex items-center gap-2 cursor-pointer transition">
                  <span className="text-base">📱</span>
                  <div>
                    <div className="text-[10px] text-slate-400">Download on</div>
                    <div className="font-bold text-white">Google Play Store</div>
                  </div>
                </div>
                <div className="bg-white/10 hover:bg-white/15 p-2.5 rounded-xl border border-white/20 text-xs font-semibold flex items-center gap-2 cursor-pointer transition">
                  <span className="text-base">🍏</span>
                  <div>
                    <div className="text-[10px] text-slate-400">Download on</div>
                    <div className="font-bold text-white">Apple App Store</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Accreditation & Copyright Line */}
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-[#0A192F] font-black text-xs">
                LLU
              </div>
              <span>© {new Date().getFullYear()} Lahore Leads University. All Rights Reserved. Chartered by Govt. of Punjab.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://leads.edu.pk" target="_blank" rel="noreferrer" className="hover:text-white cursor-pointer transition">leads.edu.pk</a>
              <span className="hover:text-white cursor-pointer transition">HEC Recognized W Category</span>
              <span className="hover:text-white cursor-pointer transition">OJS 3.4 Powered</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* AUTH MODAL                                                                */}
      {/* ========================================================================= */}
      {showAuthModal && (
        <div
          onClick={handleCloseAuthModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 relative shadow-2xl"
          >
            <h3 className="text-2xl font-black text-[#0A192F] mb-1">
              {authMode === 'login' ? 'Lahore Leads University Portal' : 'Create Research Portal Account'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {authMode === 'login' ? 'Enter credentials to access academic dashboards' : 'Select your role to register for research publishing & conference pitching'}
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-bold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={authData.full_name}
                    onChange={(e) => setAuthData({ ...authData, full_name: e.target.value })}
                    placeholder="e.g. Dr. Ahmed Khan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0A192F]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-700 block mb-1 font-bold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  placeholder="name@leads.edu.pk"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0A192F]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1 font-bold">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 focus:outline-none focus:border-[#0A192F] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-[#0A192F]" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-xs text-slate-700 block mb-1 font-bold">Register As (User Role) *</label>
                    <select
                      value={authData.role}
                      onChange={(e) => setAuthData({ ...authData, role: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0A192F] font-bold"
                    >
                      <option value="student">🎓 Leads University Student / Author</option>
                      <option value="admin">👑 Admin / Review & Editorial Board</option>
                      <option value="investor">💼 Venture Investor / Corporate Partner</option>
                      <option value="attendee">🎟️ Conference Attendee (Onsite/Remote)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 block mb-1 font-bold">Department / Organization</label>
                    <input
                      type="text"
                      value={authData.organization}
                      onChange={(e) => setAuthData({ ...authData, organization: e.target.value })}
                      placeholder="e.g. Dept of Computer Science & IT"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0A192F]"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0A192F] hover:bg-[#0F2C59] text-white font-bold rounded-xl text-xs transition shadow-md"
                >
                  {authMode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
                </button>

                {authMode === 'login' && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">
                      ⚡ Quick 1-Click Role Login
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthData({ ...authData, email: 'student@leads.edu.pk', password: 'password123' });
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[11px] text-left transition border border-blue-200"
                      >
                        🎓 Student Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthData({ ...authData, email: 'admin@leads.edu.pk', password: 'password123' });
                        }}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] text-left transition border border-amber-200"
                      >
                        👑 Admin Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthData({ ...authData, email: 'investor@venture.com', password: 'password123' });
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] text-left transition border border-emerald-200"
                      >
                        💼 Investor Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthData({ ...authData, email: 'attendee@gmail.com', password: 'password123' });
                        }}
                        className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-[11px] text-left transition border border-purple-200"
                      >
                        🎟️ Attendee Demo
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center text-xs text-slate-500 pt-1">
                  {authMode === 'login' ? "Don't have an account?" : "Already registered?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = authMode === 'login' ? 'register' : 'login';
                      setAuthMode(nextMode);
                      navigate(`/${nextMode}`);
                    }}
                    className="text-[#0A192F] font-black hover:underline"
                  >
                    {authMode === 'login' ? 'Register Now' : 'Login Here'}
                  </button>
                </div>
              </div>
            </form>

            <button
              onClick={handleCloseAuthModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm p-1 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
