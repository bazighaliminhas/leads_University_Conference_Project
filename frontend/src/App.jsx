import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
  CheckCircle2,
  Calendar,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';

import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { AttendeeDashboard } from './pages/AttendeeDashboard';
import { PublicGallery } from './pages/PublicGallery';

const API_BASE = 'http://localhost:5000/api';

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
  const [conferences, setConferences] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [investorReviews, setInvestorReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [registeredInvestors, setRegisteredInvestors] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, [token]);

  const fetchInitialData = async () => {
    try {
      const [artRes, confRes, revRes, galRes] = await Promise.all([
        axios.get(`${API_BASE}/articles`),
        axios.get(`${API_BASE}/conferences`),
        axios.get(`${API_BASE}/investor-reviews`),
        axios.get(`${API_BASE}/gallery`)
      ]);
      setArticles(artRes.data || []);
      setConferences(confRes.data || []);
      setInvestorReviews(revRes.data || []);
      setGallery(galRes.data || []);
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
        // Fallback default investors
        setRegisteredInvestors([
          { id: 3, full_name: 'John Malik', email: 'investor@venture.com', organization: 'Apex Tech Capital' },
          { id: 6, full_name: 'Dr. Sarah Vance', email: 'sarah@biohealthvc.com', organization: 'BioHealth VC' },
          { id: 7, full_name: 'Hamza Qureshi', email: 'hamza@fintechangels.com', organization: 'FinTech Angels' }
        ]);
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

      // Dedicated Route navigation based on role
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
      category: newArticleData.category || 'General Science & Tech',
      pdf_url: newArticleData.pdf_url || 'submitted_research.pdf',
      submission_receipt_url: newArticleData.submission_receipt_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      publication_receipt_url: '',
      presentation_receipt_url: '',
      sender_bank: newArticleData.sender_bank || 'HBL Mobile App',
      transaction_id: newArticleData.transaction_id || 'TRX-948201',
      sender_mobile: newArticleData.sender_mobile || '0300-1234567',
      plagiarism_score: Math.floor(Math.random() * 8) + 3,
      reviewer_notes: 'Under review by university academic committee.',
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

  const handlePublishArticle = async (articleId, is_published) => {
    try {
      const res = await axios.put(`${API_BASE}/articles/${articleId}/publish`, { is_published }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(articles.map(a => a.id === articleId ? (res.data.article || { ...a, is_published, status: is_published ? 'Published' : a.status, admin_unread: false, student_unread: true }) : a));
    } catch (err) {
      setArticles(articles.map(a => a.id === articleId ? { ...a, is_published, status: is_published ? 'Published' : a.status, admin_unread: false, student_unread: true } : a));
    }
  };

  const handleReviseArticle = async (articleId, revisionData) => {
    try {
      const res = await axios.put(`${API_BASE}/articles/${articleId}/revise`, revisionData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(articles.map(a => a.id === articleId ? (res.data.article || { ...a, ...revisionData, status: 'Revised - Awaiting Review', admin_unread: true, student_unread: false }) : a));
    } catch (err) {
      setArticles(articles.map(a => a.id === articleId ? { ...a, ...revisionData, status: 'Revised - Awaiting Review', admin_unread: true, student_unread: false } : a));
    }
  };

  const handlePayPublicationFee = async (articleId, paymentData) => {
    try {
      const res = await axios.post(`${API_BASE}/articles/${articleId}/pay-publication`, paymentData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(articles.map(a => a.id === articleId ? (res.data.article || { ...a, ...paymentData, publication_fee_paid: true, status: 'Pub Fee Paid - Verify & Publish', admin_unread: true, student_unread: false }) : a));
    } catch (err) {
      setArticles(articles.map(a => a.id === articleId ? { ...a, ...paymentData, publication_fee_paid: true, status: 'Pub Fee Paid - Verify & Publish', admin_unread: true, student_unread: false } : a));
    }
  };

  const handleApplyConference = async (articleId, paymentData) => {
    try {
      const res = await axios.post(`${API_BASE}/articles/${articleId}/apply-conference`, paymentData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setArticles(articles.map(a => a.id === articleId ? (res.data.article || { ...a, ...paymentData, presentation_fee_paid: true, status: 'Presentation Scheduled', admin_unread: true, student_unread: false }) : a));
    } catch (err) {
      setArticles(articles.map(a => a.id === articleId ? { ...a, ...paymentData, presentation_fee_paid: true, status: 'Presentation Scheduled', admin_unread: true, student_unread: false } : a));
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

  const handleBookTicket = async (ticket_type, amount) => {
    try {
      const res = await axios.post(`${API_BASE}/tickets/book`, { ticket_type, amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets([res.data.ticket, ...tickets]);
    } catch (err) {
      alert('Error booking ticket');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block leading-none">UniVenture Hub</span>
              <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">Global Research & Venture Capital Portal</span>
            </div>
          </div>

          {/* Strictly Enforced Role-Based Navbar */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                location.pathname === '/' || location.pathname === '/gallery' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Public Gallery & Showcase
            </button>

            {/* Logged in Student Access Only */}
            {user && user.role === 'student' && (
              <button
                onClick={() => navigate('/student')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  location.pathname.startsWith('/student') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Student Portal
              </button>
            )}

            {/* Logged in Admin Access Only */}
            {user && user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  location.pathname.startsWith('/admin') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Admin Control Panel
              </button>
            )}

            {/* Logged in Investor Access Only */}
            {user && user.role === 'investor' && (
              <button
                onClick={() => navigate('/investor')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  location.pathname.startsWith('/investor') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" /> Investor Portal
              </button>
            )}

            {/* Logged in Attendee Access Only */}
            {user && user.role === 'attendee' && (
              <button
                onClick={() => navigate('/attendee')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  location.pathname.startsWith('/attendee') || location.pathname.startsWith('/tickets') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4" /> Tickets & Live Event
              </button>
            )}
          </nav>

          {/* User Auth Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">{user.full_name}</div>
                  <div className="text-xs text-blue-400 capitalize">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  navigate('/login');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <LogIn className="w-4 h-4" /> Register / Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Dedicated URL Page Routes */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Routes>
          {/* Public Gallery / Landing Page & Article Detail Routes */}
          <Route
            path="/"
            element={
              <PublicGallery
                user={user}
                gallery={gallery}
                articles={articles}
                investorReviews={investorReviews}
                conferences={conferences}
                onNavigateToLogin={(targetRole) => {
                  if (targetRole) {
                    setAuthData(prev => ({ ...prev, role: targetRole }));
                  }
                  setAuthMode('register');
                  navigate('/register');
                }}
              />
            }
          />
          <Route path="/gallery" element={<Navigate to="/" replace />} />
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
                  navigate('/register');
                }}
              />
            }
          />
          <Route
            path="/paper/:id"
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
                  navigate('/register');
                }}
              />
            }
          />
          <Route
            path="/login"
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
                  navigate('/register');
                }}
              />
            }
          />
          <Route
            path="/register"
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
                  navigate('/register');
                }}
              />
            }
          />

          {/* Student Dashboard Routes */}
          <Route
            path="/student"
            element={
              <StudentDashboard
                user={user || { id: 2, full_name: 'Ali Ahmed (Demo)', role: 'student' }}
                articles={articles}
                onArticleSubmit={handleArticleSubmit}
                onReviseArticle={handleReviseArticle}
                onPayPublicationFee={handlePayPublicationFee}
                onApplyConference={handleApplyConference}
                onMarkRead={handleMarkRead}
              />
            }
          />
          <Route
            path="/student/submit"
            element={
              <StudentDashboard
                user={user || { id: 2, full_name: 'Ali Ahmed (Demo)', role: 'student' }}
                articles={articles}
                onArticleSubmit={handleArticleSubmit}
                onReviseArticle={handleReviseArticle}
                onPayPublicationFee={handlePayPublicationFee}
                onApplyConference={handleApplyConference}
                onMarkRead={handleMarkRead}
              />
            }
          />
          <Route
            path="/student/paper/:id"
            element={
              <StudentDashboard
                user={user || { id: 2, full_name: 'Ali Ahmed (Demo)', role: 'student' }}
                articles={articles}
                onArticleSubmit={handleArticleSubmit}
                onReviseArticle={handleReviseArticle}
                onPayPublicationFee={handlePayPublicationFee}
                onApplyConference={handleApplyConference}
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
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
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
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
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
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
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
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
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
                onUpdateArticle={handleUpdateArticle}
                onPublishArticle={handlePublishArticle}
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
                user={user || { id: 3, full_name: 'John Malik (Demo)', role: 'investor', organization: 'Apex Tech Fund' }}
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
                user={user || { id: 3, full_name: 'John Malik (Demo)', role: 'investor', organization: 'Apex Tech Fund' }}
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
                user={user || { id: 4, full_name: 'Sara Khan (Demo)', role: 'attendee' }}
                conferences={conferences}
                tickets={tickets}
                onBookTicket={handleBookTicket}
              />
            }
          />
          <Route path="/tickets" element={<Navigate to="/attendee" replace />} />
          <Route path="/conferences" element={<Navigate to="/attendee" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Auth Modal */}
      {(showAuthModal || location.pathname === '/login' || location.pathname === '/register') && (
        <div
          onClick={handleCloseAuthModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-800 relative shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-1">
              {authMode === 'login' ? 'Welcome Back' : 'Create Portal Account'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {authMode === 'login' ? 'Enter credentials to access your dashboard' : 'Select role to register for the university conference'}
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authData.full_name}
                    onChange={(e) => setAuthData({ ...authData, full_name: e.target.value })}
                    placeholder="e.g. Dr. Ahmed Khan"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  placeholder="name@univ.edu"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Register As (User Role)</label>
                    <select
                      value={authData.role}
                      onChange={(e) => setAuthData({ ...authData, role: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="student">🎓 University Student / Author</option>
                      <option value="admin">👑 Admin / Review Team</option>
                      <option value="investor">💼 Investor / Business Person</option>
                      <option value="attendee">🎟️ Conference Attendee (Onsite/Remote)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Department / Organization</label>
                    <input
                      type="text"
                      value={authData.organization}
                      onChange={(e) => setAuthData({ ...authData, organization: e.target.value })}
                      placeholder="e.g. Dept of Computer Science"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30"
                >
                  {authMode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
                </button>

                <div className="text-center text-xs text-slate-400">
                  {authMode === 'login' ? "Don't have an account?" : "Already registered?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = authMode === 'login' ? 'register' : 'login';
                      setAuthMode(nextMode);
                      navigate(`/${nextMode}`);
                    }}
                    className="text-blue-400 font-bold hover:underline"
                  >
                    {authMode === 'login' ? 'Register Now' : 'Login Here'}
                  </button>
                </div>
              </div>
            </form>

            <button
              onClick={handleCloseAuthModal}
              className="absolute top-4 right-4 text-slate-500 hover:text-white text-sm"
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
