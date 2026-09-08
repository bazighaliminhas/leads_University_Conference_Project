import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Edit3,
  Award,
  Sparkles,
  CheckCircle2,
  Search,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Globe,
  Check,
  FileText,
  AlertCircle,
  Eye,
  Download,
  Users,
  X,
  Printer,
  Image as ImageIcon,
  CheckCircle,
  CreditCard,
  Building2,
  ExternalLink,
  ChevronDown,
  Ticket
} from 'lucide-react';
import { TierBadge } from '../components/TierBadge';

export const AdminDashboard = ({
  articles = [],
  conferences = [],
  registeredInvestors = [],
  onUpdateArticle,
  onPublishArticle,
  onUpdateConference,
  onCreateInvestor,
  onMarkRead,
  onNavigateTab
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSubTabFromPath = () => {
    if (location.pathname.includes('/conference')) return 'conference';
    if (location.pathname.includes('/investors')) return 'investors';
    return 'articles';
  };

  const [activeSubTab, setActiveSubTab] = useState(getSubTabFromPath);

  useEffect(() => {
    setActiveSubTab(getSubTabFromPath());
  }, [location.pathname]);

  const switchTab = (tab) => {
    setActiveSubTab(tab);
    if (tab === 'articles') navigate('/admin/articles');
    else if (tab === 'conference') navigate('/admin/conference');
    else if (tab === 'investors') navigate('/admin/investors');
  };

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [viewProofModal, setViewProofModal] = useState(null); // { title, url, type }
  const [tier, setTier] = useState('None');
  const [plagiarismScore, setPlagiarismScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Conference Form State
  const activeConf = conferences[0] || {
    id: 1,
    title: 'National Innovation & Research Conference 2026',
    description: 'Annual summit bringing together university student innovators, academic evaluation boards, and venture capital investors.',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    event_date: '2026-09-15',
    event_time: '10:00 AM - 04:00 PM',
    venue: 'University Main Auditorium & Global HD Live Stream',
    stream_link: 'https://meet.google.com/xyz-demo-stream',
    onsite_ticket_price: 500.00,
    online_ticket_price: 200.00,
    presenting_students: 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)',
    attending_investors: 'John Malik (Apex Tech Capital - investor@venture.com), Dr. Sarah Vance (BioHealth VC - sarah@biohealthvc.com)',
    status: 'Upcoming'
  };

  const [confData, setConfData] = useState({
    title: activeConf?.title || 'National Innovation & Research Conference 2026',
    description: activeConf?.description || 'Annual summit bringing together university student innovators, academic evaluation boards, and venture capital investors.',
    cover_image: activeConf?.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    event_date: activeConf?.event_date || '2026-09-15',
    event_time: activeConf?.event_time || '10:00 AM - 04:00 PM',
    venue: activeConf?.venue || 'University Main Auditorium',
    stream_link: activeConf?.stream_link || 'https://meet.google.com/xyz-demo-stream',
    onsite_ticket_price: activeConf?.onsite_ticket_price || 500.00,
    online_ticket_price: activeConf?.online_ticket_price || 200.00,
    presenting_students: activeConf?.presenting_students || 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)',
    attending_investors: activeConf?.attending_investors || 'John Malik (Apex Tech Capital - investor@venture.com), Dr. Sarah Vance (BioHealth VC - sarah@biohealthvc.com)',
    status: activeConf?.status || 'Upcoming'
  });

  const [conferenceAlertMsg, setConferenceAlertMsg] = useState('');

  // Sync state when conferences prop updates
  useEffect(() => {
    if (conferences && conferences.length > 0) {
      const c = conferences[0];
      setConfData({
        title: c.title || 'National Innovation & Research Conference 2026',
        description: c.description || '',
        cover_image: c.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        event_date: c.event_date || '2026-09-15',
        event_time: c.event_time || '10:00 AM - 04:00 PM',
        venue: c.venue || 'University Main Auditorium',
        stream_link: c.stream_link || 'https://meet.google.com/xyz-demo-stream',
        onsite_ticket_price: c.onsite_ticket_price || 500.00,
        online_ticket_price: c.online_ticket_price || 200.00,
        presenting_students: c.presenting_students || '',
        attending_investors: c.attending_investors || '',
        status: c.status || 'Upcoming'
      });
    }
  }, [conferences]);

  // Investor Creation Form State
  const [investorFormData, setInvestorFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    organization: 'Apex Tech Capital'
  });
  const [investorMsg, setInvestorMsg] = useState('');

  const handleEditClick = (art) => {
    if (art.admin_unread && onMarkRead) {
      onMarkRead(art.id);
    }
    setSelectedArticle(art);
    setTier(art.tier || 'None');
    setPlagiarismScore(art.plagiarism_score || 5);
    setNotes(art.reviewer_notes || '');
  };

  const handleSaveReview = (e, shouldPublish = false) => {
    e.preventDefault();

    let newStatus = 'Under Review';
    if (shouldPublish) {
      newStatus = 'Published';
    } else if (tier !== 'None' && tier !== 'Pending') {
      newStatus = 'Approved - Awaiting Publication Fee';
    } else {
      newStatus = 'Needs Revision';
    }

    onUpdateArticle(selectedArticle.id, {
      tier,
      plagiarism_score: parseInt(plagiarismScore),
      reviewer_notes: notes,
      status: newStatus,
      is_published: shouldPublish,
      published: shouldPublish
    });

    if (shouldPublish) {
      alert(`✨ Article '${selectedArticle.title}' published live to Main Website!`);
    } else if (tier !== 'None' && tier !== 'Pending') {
      alert(`✅ Awarded ${tier} Tier! Sent to Student to pay Publication Fee (PKR 3,000). Not published live yet.`);
    } else {
      alert(`⚠️ Mistakes feedback recorded. Sent to Student for correction & re-submission.`);
    }

    setSelectedArticle(null);
  };

  const handlePublishDirect = (articleId, e) => {
    e?.stopPropagation();
    onPublishArticle(articleId, true);
    alert('✨ Payment verified and article published live to public showcase!');
  };

  const handleConferenceSubmit = (e) => {
    e.preventDefault();
    if (onUpdateConference) {
      onUpdateConference(activeConf?.id || 1, confData);
      setConferenceAlertMsg('✅ Conference post, tickets, and stage lineup updated successfully! Opening live showcase...');
      alert('🎉 Conference post published live to main site! Redirecting to public showcase...');
      if (onNavigateTab) {
        onNavigateTab('gallery');
      }
    }
  };

  const handleCreateInvestorSubmit = async (e) => {
    e.preventDefault();
    if (onCreateInvestor) {
      await onCreateInvestor(investorFormData);
      setInvestorMsg(`✓ Investor account '${investorFormData.email}' provisioned successfully!`);
      setInvestorFormData({ full_name: '', email: '', password: '', organization: 'Apex Tech Capital' });
    }
  };

  // Quick 1-Click Add student to conference schedule (100% Safe, No Screen Freeze)
  const handleQuickAddPresentingArticle = (art) => {
    const studentName = art.presenting_students_list || art.student_name || 'Student Author';
    const formattedEntry = `${studentName} (${art.title})`;

    setConfData(prev => {
      const current = prev.presenting_students || '';
      if (current.includes(art.title)) {
        return prev;
      }
      return {
        ...prev,
        presenting_students: current ? `${current}, ${formattedEntry}` : formattedEntry
      };
    });

    switchTab('conference');
    setConferenceAlertMsg(`🎤 Added '${studentName}' with project '${art.title}' to the Stage Lineup! Scroll down to review and click 'Save & Update Live Conference Post'.`);
    setTimeout(() => setConferenceAlertMsg(''), 8000);
  };

  // Auto-fill investor into conference attending investors list
  const handleSelectInvestorToConference = (e) => {
    const selectedEmail = e.target.value;
    if (!selectedEmail) return;

    const matchedInvestor = registeredInvestors?.find(inv => inv.email === selectedEmail);
    if (matchedInvestor) {
      const formattedEntry = `${matchedInvestor.full_name} (${matchedInvestor.organization || 'Venture Capital'} - ${matchedInvestor.email})`;

      setConfData(prev => {
        const current = prev.attending_investors || '';
        if (current.includes(matchedInvestor.email)) return prev;
        return {
          ...prev,
          attending_investors: current ? `${current}, ${formattedEntry}` : formattedEntry
        };
      });
    }
    e.target.value = ''; // Reset selector
  };

  // Auto-fill presenting student into conference schedule
  const handleSelectPresentingArticle = (e) => {
    const selectedTitle = e.target.value;
    if (!selectedTitle) return;

    const matchedArticle = articles?.find(a => a.title === selectedTitle);
    if (matchedArticle) {
      const studentName = matchedArticle.presenting_students_list || matchedArticle.student_name || 'Student';
      const formattedEntry = `${studentName} (${matchedArticle.title})`;

      setConfData(prev => {
        const current = prev.presenting_students || '';
        if (current.includes(matchedArticle.title)) return prev;
        return {
          ...prev,
          presenting_students: current ? `${current}, ${formattedEntry}` : formattedEntry
        };
      });
    }
    e.target.value = '';
  };

  // Generate 100% Valid PDF Binary File for Viewing/Printing
  const handleDownloadPdfFile = (art) => {
    const title = (art.title || 'Research Paper').replace(/[\(\)\\]/g, ' ');
    const author = (art.student_name || 'Student Author').replace(/[\(\)\\]/g, ' ');
    const category = (art.category || 'General Science').replace(/[\(\)\\]/g, ' ');
    const abstract = (art.abstract || '').replace(/[\(\)\\]/g, ' ');
    const notes = (art.reviewer_notes || 'Under review').replace(/[\(\)\\]/g, ' ');

    const pdfHeader = `%PDF-1.5\n%\xFF\xFF\xFF\xFF\n`;
    const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`;

    const streamText = `BT
/F1 18 Tf 50 740 Td (UNIVERSITY ACADEMIC RESEARCH PAPER) Tj
/F1 12 Tf 0 -30 Td (Title: ${title.slice(0, 50)}) Tj
0 -20 Td (Author: ${author}) Tj
0 -20 Td (Category: ${category}) Tj
0 -20 Td (Plagiarism Score: ${art.plagiarism_score || 4}%) Tj
0 -20 Td (Awarded Tier: ${art.tier || 'None'}) Tj
0 -40 Td (ABSTRACT & EXECUTIVE SUMMARY:) Tj
0 -20 Td (${abstract.slice(0, 75)}) Tj
0 -15 Td (${abstract.slice(75, 150)}) Tj
0 -15 Td (${abstract.slice(150, 225)}) Tj
0 -40 Td (ADMIN REVIEW BOARD NOTES:) Tj
0 -20 Td (${notes.slice(0, 75)}) Tj
ET`;

    const streamLength = streamText.length;
    const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamText}\nendstream\nendobj\n`;
    const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

    const offset1 = pdfHeader.length;
    const offset2 = offset1 + obj1.length;
    const offset3 = offset2 + obj2.length;
    const offset4 = offset3 + obj3.length;
    const offset5 = offset4 + obj4.length;
    const xrefStart = offset5 + obj5.length;

    const pad = (num) => String(num).padStart(10, '0');
    const xref = `xref\n0 6\n0000000000 65535 f \n${pad(offset1)} 00000 n \n${pad(offset2)} 00000 n \n${pad(offset3)} 00000 n \n${pad(offset4)} 00000 n \n${pad(offset5)} 00000 n \n`;
    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    const pdfContent = pdfHeader + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${art.title.replace(/[^a-zA-Z0-9]/g, '_')}_Paper.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter students who paid PKR 5,000 conference presentation pitch fee
  const conferencePitchApplicants = articles.filter(
    (a) => a.presentation_fee_paid || a.presentation_receipt_url || a.status === 'Presentation Scheduled'
  );

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <ShieldCheck className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">University Admin Portal</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Peer Review Management, Mistake Identification, Fee Proof Verification, and Conference Setup.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => switchTab('articles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeSubTab === 'articles'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <FileText className="w-4 h-4" /> Articles & Reviews
            {articles.some(a => a.admin_unread) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => switchTab('conference')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeSubTab === 'conference'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Calendar className="w-4 h-4" /> Conference Management
            {conferencePitchApplicants.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                {conferencePitchApplicants.length}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('investors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeSubTab === 'investors'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Users className="w-4 h-4" /> Provision Investors ({registeredInvestors.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: ARTICLES MANAGEMENT & REVIEW WORKFLOW                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'articles' && (
        <div className="space-y-6">
          {/* SPECIAL NOTIFICATION BANNER: PAID CONFERENCE PITCH APPLICANTS */}
          {conferencePitchApplicants.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-6 rounded-3xl border border-emerald-500/50 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-emerald-500/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Calendar className="w-5 h-5 animate-pulse" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      🎤 Conference Pitch Applicants ({conferencePitchApplicants.length} Fee Paid)
                    </h3>
                    <p className="text-xs text-emerald-300">
                      These students have paid the PKR 5,000 Presentation Fee and are ready to be scheduled on the live stage!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSubTab('conference')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <Calendar className="w-3.5 h-3.5" /> Open Conference Setup
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conferencePitchApplicants.map((app) => (
                  <div key={app.id} className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white line-clamp-1">{app.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                          PKR 5,000 PAID
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Lead Author: <strong>{app.student_name}</strong>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        Presenters: <strong>{app.presenting_students_list || app.student_name}</strong>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Paid via: {app.sender_bank || 'HBL'} | TRX: {app.transaction_id || 'TRX-948201'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      {app.presentation_receipt_url ? (
                        <button
                          onClick={() => setViewProofModal({ title: 'Conference Pitch Payment Proof', url: app.presentation_receipt_url, type: 'Conference' })}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold hover:bg-emerald-900/60 transition flex items-center gap-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> Inspect Proof
                        </button>
                      ) : <span className="text-[10px] text-slate-500">Challan Attached</span>}

                      {confData.presenting_students?.includes(app.title) ? (
                        <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ✓ Added to Stage
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickAddPresentingArticle(app)}
                          className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                        >
                          ➕ Add to Conference Stage
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Submitted Research Papers ({filteredArticles.length})
              </h2>
              <p className="text-xs text-slate-400">
                Starred papers (⭐) require your attention for initial review, revision re-evaluation, or publication verification.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, student, category..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredArticles.map((article) => {
              const isUnreviewed = !article.tier || article.tier === 'None';
              const isResubmitted = article.status?.includes('Revised');
              const isPubFeeAwaiting = article.status === 'Pub Fee Paid - Verify & Publish' || (article.publication_fee_paid && !article.is_published);
              const isConfPitch = article.presentation_fee_paid || article.presentation_receipt_url;
              const showStar = article.admin_unread || isPubFeeAwaiting || isConfPitch;

              return (
                <div
                  key={article.id}
                  className={`glass-card rounded-3xl p-7 border transition-all duration-200 relative overflow-hidden ${showStar
                    ? 'border-amber-500/60 shadow-xl shadow-amber-500/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 ring-1 ring-amber-500/30'
                    : 'border-slate-800'
                    }`}
                >
                  {/* STAR NOTIFICATION BADGE FOR ADMIN */}
                  {showStar && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {isConfPitch
                        ? '⭐ CONFERENCE PITCH FEE PAID (PKR 5,000) — READY TO SCHEDULE'
                        : isPubFeeAwaiting
                          ? '⭐ PUBLICATION FEE PAID — VERIFY PROOF & PUBLISH LIVE'
                          : isResubmitted
                            ? '⭐ STUDENT RE-SUBMITTED REVISED ARTICLE — READY FOR EVALUATION'
                            : '⭐ NEW ARTICLE SUBMISSION — AWAITING REVIEW'}
                    </div>
                  )}

                  {/* Header Badges */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                        {article.category || 'General CS'}
                      </span>
                      <TierBadge tier={article.tier || 'None'} />
                      <span className="text-xs text-slate-400 font-medium">
                        Author: <strong className="text-white">{article.student_name}</strong>
                      </span>
                      {article.is_published ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Published Live
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400">
                          Status: {article.status || 'Under Review'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono">
                        Plagiarism: <strong className={article.plagiarism_score > 15 ? 'text-rose-400' : 'text-emerald-400'}>{article.plagiarism_score || 4}%</strong>
                      </span>
                      <button
                        onClick={() => handleEditClick(article)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Review & Evaluate
                      </button>
                    </div>
                  </div>

                  {/* Article Title */}
                  <h3 className="text-xl font-bold text-white mb-3 hover:text-blue-400 transition">
                    {article.title}
                  </h3>

                  {/* Body Content Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider block">
                        Abstract Preview:
                      </span>
                      <p className="line-clamp-2 italic">"{article.abstract}"</p>
                    </div>

                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider block">
                        Admin Feedback & Mistakes Log:
                      </span>
                      <p className="line-clamp-2 text-amber-200/90 font-mono">
                        "{article.reviewer_notes || 'No review notes provided yet.'}"
                      </p>
                    </div>
                  </div>

                  {/* Footer Bar: Fee Proofs & PDF Link */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap justify-between items-center gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Fee Proofs:</span>

                      {article.submission_receipt_url && (
                        <button
                          onClick={() => setViewProofModal({ title: 'Submission Fee Proof (PKR 1,500)', url: article.submission_receipt_url, type: 'Submission' })}
                          className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 hover:bg-blue-900/60 text-[11px] flex items-center gap-1 font-medium transition"
                        >
                          <ImageIcon className="w-3 h-3 text-blue-400" /> View Submission Proof
                        </button>
                      )}

                      {article.publication_receipt_url && (
                        <button
                          onClick={() => setViewProofModal({ title: 'Publication Fee Proof (PKR 3,000)', url: article.publication_receipt_url, type: 'Publication' })}
                          className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60 text-[11px] flex items-center gap-1 font-medium transition"
                        >
                          <ImageIcon className="w-3 h-3 text-purple-400" /> View Pub Fee Proof
                        </button>
                      )}

                      {article.presentation_receipt_url && (
                        <button
                          onClick={() => setViewProofModal({ title: 'Conference Pitch Proof (PKR 5,000)', url: article.presentation_receipt_url, type: 'Conference' })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 text-[11px] flex items-center gap-1 font-medium transition"
                        >
                          <ImageIcon className="w-3 h-3 text-emerald-400" /> View Conf Fee Proof
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {isConfPitch && (
                        <button
                          onClick={() => handleQuickAddPresentingArticle(article)}
                          className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                        >
                          🎤 Add to Conference
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadPdfFile(article)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-blue-400" /> PDF: {article.pdf_url || 'article.pdf'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: CONFERENCE MANAGEMENT & STAGE SCHEDULE SETUP                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'conference' && (
        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Manage Conference Post, Tickets & Stage Schedule
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Set conference title, date, time, venue, stream link, ticket prices, and select approved student presenters & investor panel.
            </p>
          </div>

          {conferenceAlertMsg && (
            <div className="p-4 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl text-emerald-300 text-xs font-black flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-emerald-950/40 animate-pulse">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{conferenceAlertMsg}</span>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('gallery')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" /> View Live on Main Site
                </button>
              )}
            </div>
          )}

          {/* ACTIVE CONFERENCE PITCH APPLICANTS PICKER */}
          {conferencePitchApplicants.length > 0 && (
            <div className="bg-emerald-950/40 p-5 rounded-2xl border border-emerald-500/40 space-y-3">
              <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Approved Pitch Applicants Ready to Schedule ({conferencePitchApplicants.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {conferencePitchApplicants.map(app => (
                  <div key={app.id} className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-white block line-clamp-1">{app.title}</span>
                      <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">
                        Presenters: {app.presenting_students_list || app.student_name}
                      </span>
                    </div>
                    {confData.presenting_students?.includes(app.title) ? (
                      <div className="w-full py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ✓ In Stage Lineup
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQuickAddPresentingArticle(app)}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition flex items-center justify-center gap-1 shadow"
                      >
                        ➕ Add to Stage Schedule
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleConferenceSubmit} className="space-y-6">
            {/* ROW 1: Title & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-300 font-bold block mb-1.5">Conference Title / Main Heading *</label>
                <input
                  type="text"
                  required
                  value={confData.title}
                  onChange={(e) => setConfData({ ...confData, title: e.target.value })}
                  placeholder="e.g. National Innovation & Research Summit 2026"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">Conference Status *</label>
                <select
                  value={confData.status}
                  onChange={(e) => setConfData({ ...confData, status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="Upcoming">Upcoming Summit</option>
                  <option value="Live Now">🔴 Live Stream Broadcasting</option>
                  <option value="Completed">Completed & Archived</option>
                </select>
              </div>
            </div>

            {/* ROW 2: Cover Image & Stream Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">Cover Image Banner URL *</label>
                <input
                  type="url"
                  required
                  value={confData.cover_image}
                  onChange={(e) => setConfData({ ...confData, cover_image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">HD Virtual Live Stream Link (Meet/Zoom/YouTube) *</label>
                <input
                  type="url"
                  required
                  value={confData.stream_link}
                  onChange={(e) => setConfData({ ...confData, stream_link: e.target.value })}
                  placeholder="https://meet.google.com/xyz-demo-stream"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* ROW 3: Date, Time & Physical Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">Event Date *</label>
                <input
                  type="date"
                  required
                  value={confData.event_date}
                  onChange={(e) => setConfData({ ...confData, event_date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">Event Time Duration *</label>
                <input
                  type="text"
                  required
                  value={confData.event_time}
                  onChange={(e) => setConfData({ ...confData, event_time: e.target.value })}
                  placeholder="10:00 AM - 04:00 PM"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">Physical Auditorium / Venue Location *</label>
                <input
                  type="text"
                  required
                  value={confData.venue}
                  onChange={(e) => setConfData({ ...confData, venue: e.target.value })}
                  placeholder="University Main Auditorium, Hall A"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* ROW 4: TICKET PRICES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
              <div>
                <label className="text-xs text-emerald-400 font-bold block mb-1.5 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" /> Onsite Physical Ticket Price (PKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={confData.onsite_ticket_price}
                  onChange={(e) => setConfData({ ...confData, onsite_ticket_price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Includes auditorium pass, refreshment kit, and investor seat.</span>
              </div>

              <div>
                <label className="text-xs text-blue-400 font-bold block mb-1.5 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" /> Online Virtual HD Stream Ticket Price (PKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={confData.online_ticket_price}
                  onChange={(e) => setConfData({ ...confData, online_ticket_price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Includes encrypted access link for global remote viewers.</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1.5">Conference Overview & Agenda Purpose</label>
              <textarea
                rows="2"
                value={confData.description}
                onChange={(e) => setConfData({ ...confData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white leading-relaxed"
              />
            </div>

            {/* PRESENTING STUDENTS AUTO-LINK SELECTOR */}
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <label className="text-xs text-emerald-400 font-black flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Presenting Students & Stage Lineup (1 to 4 Teams)
                </label>

                {/* Dropdown to pick from approved pitch applicants */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Add from Pitch Applicants:</span>
                  <select
                    onChange={handleSelectPresentingArticle}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Select Approved Pitch Paper --</option>
                    {articles.filter(a => a.presentation_fee_paid || a.is_published).map(art => (
                      <option key={art.id} value={art.title}>
                        {art.presenting_students_list || art.student_name}: {art.title.slice(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                rows="2"
                required
                value={confData.presenting_students}
                onChange={(e) => setConfData({ ...confData, presenting_students: e.target.value })}
                placeholder="e.g. Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white leading-relaxed font-sans"
              />
            </div>

            {/* ATTENDING INVESTORS AUTO-LINK SELECTOR */}
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <label className="text-xs text-purple-400 font-black flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> Attending Venture Capitalists & Business Investors Panel
                </label>

                {/* Dropdown to pick from registered investors -> auto fills name, organization, and username/email */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Select Registered Investor:</span>
                  <select
                    onChange={handleSelectInvestorToConference}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Choose Investor to Auto-Fill --</option>
                    {registeredInvestors.map(inv => (
                      <option key={inv.id || inv.email} value={inv.email}>
                        {inv.full_name} ({inv.organization} - {inv.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                rows="2"
                required
                value={confData.attending_investors}
                onChange={(e) => setConfData({ ...confData, attending_investors: e.target.value })}
                placeholder="e.g. John Malik (Apex Tech Capital - investor@venture.com), Dr. Sarah Vance (BioHealth VC - sarah@biohealthvc.com)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white leading-relaxed font-sans"
              />
              <span className="text-[11px] text-slate-500">
                Selecting an investor from the dropdown above automatically links and pastes their Name, Organization, and Email into the summit post!
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition shadow-xl shadow-blue-600/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save & Update Live Conference Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: PROVISION INVESTOR ACCOUNTS                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'investors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Creation Form */}
          <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" /> Provision Venture Investor Account
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Create official accounts for visiting businessmen and venture capitalists so they can evaluate research and bid.
              </p>
            </div>

            {investorMsg && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> {investorMsg}
              </div>
            )}

            <form onSubmit={handleCreateInvestorSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Investor Full Name *</label>
                <input
                  type="text"
                  required
                  value={investorFormData.full_name}
                  onChange={(e) => setInvestorFormData({ ...investorFormData, full_name: e.target.value })}
                  placeholder="e.g. John Malik"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Organization / Venture Fund *</label>
                <input
                  type="text"
                  required
                  value={investorFormData.organization}
                  onChange={(e) => setInvestorFormData({ ...investorFormData, organization: e.target.value })}
                  placeholder="e.g. Apex Tech Capital"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address (Username) *</label>
                <input
                  type="email"
                  required
                  value={investorFormData.email}
                  onChange={(e) => setInvestorFormData({ ...investorFormData, email: e.target.value })}
                  placeholder="e.g. john@apexcap.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={investorFormData.password}
                  onChange={(e) => setInvestorFormData({ ...investorFormData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Create & Provision Investor Account
              </button>
            </form>
          </div>

          {/* Registered Investors List */}
          <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Registered Investors Directory ({registeredInvestors.length})
            </h3>
            <p className="text-xs text-slate-400">
              These investors are available in the dropdown selector on the Conference Management tab.
            </p>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {registeredInvestors.map((inv) => (
                <div key={inv.id || inv.email} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">{inv.full_name}</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {inv.organization || 'Investor'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Email / Login: <strong>{inv.email}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ACADEMIC PAPER EVALUATION & TIER ASSIGNMENT MODAL                 */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-4xl glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5 max-h-[92vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-slate-800 pb-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {selectedArticle.category}
                </span>
                <TierBadge tier={selectedArticle.tier || 'None'} />
              </div>
              <h3 className="text-2xl font-black text-white">{selectedArticle.title}</h3>
              <div className="text-xs text-slate-400">
                Author: <strong>{selectedArticle.student_name}</strong> | Plagiarism Check: <strong className="text-emerald-400">{selectedArticle.plagiarism_score}%</strong>
              </div>
            </div>

            {/* FULL PAPER VIEWER & ATTACHED PROOFS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paper Content Box */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Full Academic Article Content:
                  </span>
                  <button
                    onClick={() => handleDownloadPdfFile(selectedArticle)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                  >
                    <Download className="w-3 h-3 text-blue-400" /> PDF Download
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedArticle.full_text || selectedArticle.abstract}
                </div>
              </div>

              {/* Fee Proofs Inspector Box */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Uploaded Challan Screenshots & Bank Details:
                </span>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block text-[10px]">1. Submission Fee (PKR 1,500)</span>
                      <span className="text-slate-200 font-mono">{selectedArticle.sender_bank || 'HBL'} - {selectedArticle.transaction_id || 'TRX-948201'}</span>
                    </div>
                    {selectedArticle.submission_receipt_url && (
                      <button
                        onClick={() => setViewProofModal({ title: 'Submission Proof Screenshot', url: selectedArticle.submission_receipt_url, type: 'Submission' })}
                        className="px-2 py-1 rounded bg-blue-900/40 text-blue-300 border border-blue-500/30 text-[11px] font-bold"
                      >
                        Inspect Proof
                      </button>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block text-[10px]">2. Publication Fee (PKR 3,000)</span>
                      <span className="text-slate-200 font-mono">
                        {selectedArticle.publication_fee_paid ? 'Paid & Attached' : 'Not Paid Yet'}
                      </span>
                    </div>
                    {selectedArticle.publication_receipt_url && (
                      <button
                        onClick={() => setViewProofModal({ title: 'Publication Proof Screenshot', url: selectedArticle.publication_receipt_url, type: 'Publication' })}
                        className="px-2 py-1 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30 text-[11px] font-bold"
                      >
                        Inspect Proof
                      </button>
                    )}
                  </div>

                  {selectedArticle.presentation_receipt_url && (
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block text-[10px]">3. Conference Pitch Fee (PKR 5,000)</span>
                        <span className="text-emerald-300 font-mono">Applied with 1-4 Presenters</span>
                      </div>
                      <button
                        onClick={() => setViewProofModal({ title: 'Conference Pitch Proof Screenshot', url: selectedArticle.presentation_receipt_url, type: 'Conference' })}
                        className="px-2 py-1 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold"
                      >
                        Inspect Proof
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* EVALUATION FORM */}
            <form onSubmit={handleSaveReview} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    Assign Quality Category / Tier *
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="None">None / No Category (Requires Student Revision)</option>
                    <option value="Silver">Silver Tier (Qualified for Publication)</option>
                    <option value="Gold">Gold Tier (High Impact Research)</option>
                    <option value="Platinum">Platinum Tier (Outstanding Breakthrough)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    If "None" is chosen, the student is strictly limited to re-submitting fixes.
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">Plagiarism Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={plagiarismScore}
                    onChange={(e) => setPlagiarismScore(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  Mistakes Identified & Improvement Instructions for Student *
                </label>
                <textarea
                  rows="3"
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Highlight specific mistakes in methodology, data citations, formatting, or clarity..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* CASE 1: Student has already paid Publication Fee -> Admin can Verify and Publish Live */}
                  {(selectedArticle.publication_fee_paid || selectedArticle.publication_receipt_url) ? (
                    <>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition border border-slate-700"
                      >
                        Save Notes Only
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSaveReview(e, true)}
                        className="px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs transition shadow-lg shadow-emerald-600/40 flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Verify Publication Proof & Publish Live to Main Site
                      </button>
                    </>
                  ) : tier === 'None' || tier === 'Pending' ? (
                    /* CASE 2: No Tier / Mistakes -> Send feedback for student revision */
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" /> Send Mistakes Feedback to Student (Requires Revision)
                    </button>
                  ) : (
                    /* CASE 3: Tier Awarded (Silver/Gold/Platinum) -> Request Publication Fee from student */
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                      <span className="text-[11px] text-purple-300 font-medium">
                        Student will be notified to pay Publication Fee (PKR 3,000)
                      </span>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-purple-600/40 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Approve {tier} Tier & Request Publication Fee
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROOF SCREENSHOT VIEWER MODAL                                      */}
      {/* ========================================================================= */}
      {viewProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-slate-800 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setViewProofModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-400" /> {viewProofModal.title}
            </h3>

            <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden max-h-[60vh]">
              <img
                src={viewProofModal.url}
                alt="Challan Payment Screenshot"
                className="max-h-[55vh] w-auto rounded-xl object-contain"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewProofModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
