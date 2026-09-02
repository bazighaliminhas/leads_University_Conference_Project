import React, { useState, useEffect } from 'react';
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
  Award
} from 'lucide-react';
import axios from 'axios';

import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { AttendeeDashboard } from './pages/AttendeeDashboard';
import { PublicGallery } from './pages/PublicGallery';

const API_BASE = 'http://localhost:5000/api';

export function App() {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery', 'student', 'admin', 'investor', 'attendee'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Auth Form State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({ full_name: '', email: '', password: '', role: 'student', organization: '' });

  // Domain Data State
  const [articles, setArticles] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [investorReviews, setInvestorReviews] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [artRes, confRes, revRes, galRes] = await Promise.all([
        axios.get(`${API_BASE}/articles`),
        axios.get(`${API_BASE}/conferences`),
        axios.get(`${API_BASE}/investor-reviews`),
        axios.get(`${API_BASE}/gallery`)
      ]);
      setArticles(artRes.data);
      setConferences(confRes.data);
      setInvestorReviews(revRes.data);
      setGallery(galRes.data);
    } catch (err) {
      console.log('Using backend endpoint simulation');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API_BASE}${endpoint}`, authData);

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setShowAuthModal(false);

      // Auto route based on role
      const role = res.data.user.role;
      setActiveTab(role);
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    setActiveTab('gallery');
  };

  // Article Action Handlers
  const handleArticleSubmit = async (newArticleData) => {
    const createdArticle = {
      id: Date.now(),
      student_id: user ? user.id : 2,
      student_name: user ? user.full_name : 'Student Author',
      title: newArticleData.title,
      abstract: newArticleData.abstract,
      category: newArticleData.category || 'Computer Science & AI',
      fileName: newArticleData.fileName || 'research_paper.pdf',
      receiptName: newArticleData.receiptName || 'challan_receipt.png',
      plagiarism_score: Math.floor(Math.random() * 8) + 4,
      reviewer_notes: 'Under review by university academic committee.',
      tier: 'Pending',
      status: 'Under Review',
      payment_verified: true,
      created_at: new Date().toISOString().split('T')[0]
    };

    try {
      await axios.post(`${API_BASE}/articles`, newArticleData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.log('Using active sync article creation');
    }

    setArticles([createdArticle, ...articles]);
  };

  const handleUpdateArticle = async (articleId, updateFields) => {
    try {
      await axios.put(`${API_BASE}/articles/${articleId}/review`, updateFields, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.log('Review update fallback');
    }
    setArticles(articles.map(a => a.id === articleId ? { ...a, ...updateFields } : a));
  };

  const handlePayPresentation = async (articleId) => {
    try {
      const res = await axios.post(`${API_BASE}/articles/${articleId}/pay-presentation`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(articles.map(a => a.id === articleId ? res.data.article : a));
    } catch (err) {
      alert('Error recording presentation payment');
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
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('gallery')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block leading-none">UNIV-CONF PORTAL</span>
              <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">Academic & Enterprise Research Portal</span>
            </div>
          </div>

          {/* Strictly Enforced Role-Based Navbar */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'gallery' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Public Gallery & Showcase
            </button>

            {/* Logged in Student Access Only */}
            {user && user.role === 'student' && (
              <button
                onClick={() => setActiveTab('student')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Student Portal
              </button>
            )}

            {/* Logged in Admin Access Only */}
            {user && user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'admin' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Admin Control Panel
              </button>
            )}

            {/* Logged in Investor Access Only */}
            {user && user.role === 'investor' && (
              <button
                onClick={() => setActiveTab('investor')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'investor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" /> Investor Portal
              </button>
            )}

            {/* Logged in Attendee Access Only */}
            {user && user.role === 'attendee' && (
              <button
                onClick={() => setActiveTab('attendee')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'attendee' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
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
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <LogIn className="w-4 h-4" /> Register / Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {activeTab === 'gallery' && (
          <PublicGallery
            gallery={gallery}
            articles={articles}
            investorReviews={investorReviews}
            onNavigateToLogin={() => setShowAuthModal(true)}
          />
        )}

        {activeTab === 'student' && (
          <StudentDashboard
            user={user || { id: 2, full_name: 'Ali Ahmed (Demo)', role: 'student' }}
            articles={articles}
            onArticleSubmit={handleArticleSubmit}
            onPayPresentation={handlePayPresentation}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            articles={articles}
            onUpdateArticle={handleUpdateArticle}
          />
        )}

        {activeTab === 'investor' && (
          <InvestorDashboard
            user={user || { id: 3, full_name: 'John Malik (Demo)', role: 'investor', organization: 'Apex Tech Fund' }}
            articles={articles}
            investorReviews={investorReviews}
            onSubmitReview={handleSubmitInvestorReview}
          />
        )}

        {activeTab === 'attendee' && (
          <AttendeeDashboard
            user={user || { id: 4, full_name: 'Sara Khan (Demo)', role: 'attendee' }}
            conferences={conferences}
            tickets={tickets}
            onBookTicket={handleBookTicket}
          />
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-800 relative shadow-2xl">
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
                <input
                  type="password"
                  required
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
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
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-blue-400 font-bold hover:underline"
                  >
                    {authMode === 'login' ? 'Register Now' : 'Login Here'}
                  </button>
                </div>
              </div>
            </form>

            <button
              onClick={() => setShowAuthModal(false)}
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
