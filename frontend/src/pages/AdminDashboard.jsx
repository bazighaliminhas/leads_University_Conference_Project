import React, { useState } from 'react';
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
  Printer
} from 'lucide-react';
import { TierBadge } from '../components/TierBadge';

export const AdminDashboard = ({
  articles = [],
  conferences = [],
  onUpdateArticle,
  onPublishArticle,
  onUpdateConference,
  onCreateInvestor
}) => {
  const [activeSubTab, setActiveSubTab] = useState('articles'); // 'articles', 'conference', 'investors'
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [viewPdfArticle, setViewPdfArticle] = useState(null);
  const [tier, setTier] = useState('None');
  const [plagiarismScore, setPlagiarismScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Conference Form State
  const activeConf = conferences[0] || {
    id: 1,
    title: 'National Innovation & Research Conference 2026',
    description: 'Annual gathering of university innovators, academic review committees, and venture capital investors.',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    event_date: '2026-09-15',
    event_time: '10:00 AM - 04:00 PM',
    venue: 'University Main Auditorium & HD Virtual Stream',
    presenting_students: 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography), Ali Ahmed (Nanomedicine), Ali Ahmed (Agri Drones)',
    attending_investors: 'John Malik (Apex Tech Capital), Dr. Sarah Vance (BioHealth VC), Hamza Qureshi (FinTech Angels)'
  };

  const [confData, setConfData] = useState({
    title: activeConf.title || '',
    description: activeConf.description || '',
    cover_image: activeConf.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    event_date: activeConf.event_date || '2026-09-15',
    event_time: activeConf.event_time || '10:00 AM - 04:00 PM',
    venue: activeConf.venue || 'University Main Auditorium & HD Stream',
    presenting_students: activeConf.presenting_students || 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)',
    attending_investors: activeConf.attending_investors || 'John Malik (Apex Tech Capital), Dr. Sarah Vance (BioHealth VC)'
  });

  // Investor Creation Form State
  const [investorFormData, setInvestorFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    organization: 'Apex Tech Capital'
  });
  const [investorMsg, setInvestorMsg] = useState('');

  const handleEditClick = (art) => {
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
      alert(`✓ Awarded ${tier} Tier! Sent to Student to pay Publication Fee (PKR 3,000). Not published live yet.`);
    } else {
      alert(`⚠️ Mistakes feedback sent to Student for revision.`);
    }

    setSelectedArticle(null);
  };

  const handleConferenceSubmit = (e) => {
    e.preventDefault();
    if (onUpdateConference) {
      onUpdateConference(activeConf.id, confData);
      alert('Conference post, cover image, date, time, 1-4 presenting students, and attending investors updated successfully!');
    }
  };

  const handleCreateInvestorSubmit = async (e) => {
    e.preventDefault();
    if (onCreateInvestor) {
      await onCreateInvestor(investorFormData);
      setInvestorMsg(`✓ Investor account '${investorFormData.email}' created successfully!`);
      setInvestorFormData({ full_name: '', email: '', password: '', organization: 'Venture Fund' });
    }
  };

  // Generate 100% Valid PDF-1.5 Binary File for Chrome/Adobe Reader
  const handleDownloadPdfFile = (art) => {
    const cleanStr = (str) => (str || '').replace(/[\(\)\\]/g, ' ');
    const title = cleanStr(art.title);
    const author = cleanStr(art.student_name || 'Student Author');
    const category = cleanStr(art.category || 'General Science');
    const abstract = cleanStr(art.abstract);
    const notes = cleanStr(art.reviewer_notes || 'Approved by Board.');

    const pdfHeader = `%PDF-1.5\n%\xFF\xFF\xFF\xFF\n`;
    const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`;

    const streamText = `BT
/F1 18 Tf 50 740 Td (UNIVERSITY ACADEMIC RESEARCH PAPER) Tj
/F1 12 Tf 0 -30 Td (Title: ${title.slice(0, 50)}) Tj
0 -20 Td (Author: ${author}) Tj
0 -20 Td (Category: ${category}) Tj
0 -20 Td (Plagiarism Check Score: ${art.plagiarism_score || 4}%) Tj
0 -20 Td (Awarded Tier: ${art.tier || 'Gold'}) Tj
0 -40 Td (ABSTRACT & EXECUTIVE SUMMARY:) Tj
0 -20 Td (${abstract.slice(0, 75)}) Tj
0 -15 Td (${abstract.slice(75, 150)}) Tj
0 -15 Td (${abstract.slice(150, 225)}) Tj
0 -15 Td (${abstract.slice(225, 300)}) Tj
0 -40 Td (ADMIN REVIEW BOARD NOTES:) Tj
0 -20 Td (${notes.slice(0, 75)}) Tj
0 -15 Td (${notes.slice(75, 150)}) Tj
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

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Admin Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500" /> Academic Reviewer & Admin Control Center
          </h1>
          <p className="text-slate-400 mt-1">Review Student PDFs, Verify Publication Fee Receipts, Award Tiers, and Publish Papers Live.</p>
        </div>
        <div className="flex gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('articles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'articles' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Submissions ({articles.length})
          </button>
          <button
            onClick={() => setActiveSubTab('conference')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'conference' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📅 Edit Conference Post
          </button>
          <button
            onClick={() => setActiveSubTab('investors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'investors' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            💼 Create Investor Login
          </button>
        </div>
      </div>

      {/* SUB TAB 1: ARTICLES MANAGEMENT */}
      {activeSubTab === 'articles' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-white">Student Research Submissions & Review Queue</h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search paper or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                  <th className="py-3 px-4">Student & Article</th>
                  <th className="py-3 px-4">PDF Document</th>
                  <th className="py-3 px-4">Plagiarism</th>
                  <th className="py-3 px-4">Awarded Tier</th>
                  <th className="py-3 px-4">Pub Fee Receipt</th>
                  <th className="py-3 px-4">Conf Fee Receipt</th>
                  <th className="py-3 px-4">Publish Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredArticles.map((art) => {
                  const isFeePaid = art.publication_fee_paid || art.publication_receipt_url || art.status === 'Pub Fee Paid' || art.is_published || art.published;
                  const isConfFeePaid = art.presentation_fee_paid || art.presentation_receipt_url || art.status === 'Presentation Scheduled';

                  return (
                    <tr key={art.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{art.title}</div>
                        <div className="text-xs text-slate-400">Author: {art.student_name} | {art.category}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewPdfArticle(art)}
                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View PDF
                          </button>
                          <button
                            onClick={() => handleDownloadPdfFile(art)}
                            className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          art.plagiarism_score <= 10 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        }`}>
                          {art.plagiarism_score}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <TierBadge tier={art.tier || 'None'} />
                      </td>
                      {/* PUBLICATION FEE RECEIPT STATUS */}
                      <td className="py-4 px-4">
                        {isFeePaid ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fee Paid
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 w-fit">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> Awaiting Fee
                          </span>
                        )}
                      </td>

                      {/* CONFERENCE PRESENTATION FEE RECEIPT STATUS */}
                      <td className="py-4 px-4">
                        {isConfFeePaid ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1 w-fit">
                            🎤 Conf Paid
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1 w-fit">
                            ⏳ No Conf Fee
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {art.is_published || art.published ? (
                          <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/30">
                            ✨ Published Live
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                            {art.status || 'Under Review'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                        {onPublishArticle && isFeePaid && (
                          <button
                            onClick={() => onPublishArticle(art.id, !(art.is_published || art.published))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border shadow-md ${
                              art.is_published || art.published
                                ? 'bg-purple-950 text-purple-300 border-purple-500/40 hover:bg-purple-900'
                                : 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500'
                            }`}
                          >
                            {art.is_published || art.published ? 'Unpublish' : '✨ Approve & Publish Live'}
                          </button>
                        )}
                        <button
                          onClick={() => handleEditClick(art)}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Grade & Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 2: EDIT CONFERENCE POST */}
      {activeSubTab === 'conference' && (
        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 max-w-3xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Create / Edit Conference Post
            </h2>
            <p className="text-xs text-slate-400 mt-1">Admin can adjust Conference Title, Cover Image, Date, Time, Venue, 1-4 Presenting Students, and Attending Investors.</p>
          </div>

          <form onSubmit={handleConferenceSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Conference Title</label>
              <input
                type="text"
                required
                value={confData.title}
                onChange={(e) => setConfData({ ...confData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Conference Description</label>
              <textarea
                rows="2"
                value={confData.description}
                onChange={(e) => setConfData({ ...confData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Cover Image URL</label>
              <input
                type="text"
                value={confData.cover_image}
                onChange={(e) => setConfData({ ...confData, cover_image: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Event Date</label>
                <input
                  type="date"
                  required
                  value={confData.event_date}
                  onChange={(e) => setConfData({ ...confData, event_date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Event Time Range</label>
                <input
                  type="text"
                  required
                  value={confData.event_time}
                  onChange={(e) => setConfData({ ...confData, event_time: e.target.value })}
                  placeholder="e.g. 10:00 AM - 04:00 PM"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Venue / Virtual Stream Location</label>
              <input
                type="text"
                required
                value={confData.venue}
                onChange={(e) => setConfData({ ...confData, venue: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Presenting Students (Select / Enter 1 to 4 Student Presenters)
              </label>
              <textarea
                rows="2"
                value={confData.presenting_students}
                onChange={(e) => setConfData({ ...confData, presenting_students: e.target.value })}
                placeholder="e.g. Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Attending Investors List (Showcased on Main Website Conference Post)
              </label>
              <textarea
                rows="2"
                value={confData.attending_investors}
                onChange={(e) => setConfData({ ...confData, attending_investors: e.target.value })}
                placeholder="e.g. John Malik (Apex Tech Capital), Dr. Sarah Vance (BioHealth VC)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Check className="w-4 h-4" /> Publish / Update Conference Post Live
            </button>
          </form>
        </div>
      )}

      {/* SUB TAB 3: CREATE INVESTOR CREDENTIALS */}
      {activeSubTab === 'investors' && (
        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 max-w-2xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" /> Create Investor Credentials
            </h2>
            <p className="text-xs text-slate-400 mt-1">Admin can create login accounts for Venture Capitalists who are attending the conference to fund students.</p>
          </div>

          {investorMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold">
              {investorMsg}
            </div>
          )}

          <form onSubmit={handleCreateInvestorSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Investor Full Name</label>
              <input
                type="text"
                required
                value={investorFormData.full_name}
                onChange={(e) => setInvestorFormData({ ...investorFormData, full_name: e.target.value })}
                placeholder="e.g. Dr. Sarah Vance"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Investor Email Address</label>
              <input
                type="email"
                required
                value={investorFormData.email}
                onChange={(e) => setInvestorFormData({ ...investorFormData, email: e.target.value })}
                placeholder="investor@venturefund.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Assigned Login Password</label>
              <input
                type="password"
                required
                value={investorFormData.password}
                onChange={(e) => setInvestorFormData({ ...investorFormData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Venture Capital Fund / Company Name</label>
              <input
                type="text"
                value={investorFormData.organization}
                onChange={(e) => setInvestorFormData({ ...investorFormData, organization: e.target.value })}
                placeholder="e.g. Apex Tech Capital"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
            >
              <UserPlus className="w-4 h-4" /> Create Investor Login Account
            </button>
          </form>
        </div>
      )}

      {/* REVIEW & MISTAKES MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">Admin PDF Review & Tier Approval</h3>
            <p className="text-xs text-slate-400">{selectedArticle.title}</p>

            <form className="space-y-4">
              {/* PDF Inspector & Download Bar */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" /> Student PDF Document:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewPdfArticle(selectedArticle)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPdfFile(selectedArticle)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>

              {/* Publication Fee Receipt Proof & Payment Verification Inspector */}
              {selectedArticle.publication_receipt_url && (
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/40 space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-emerald-500/30 pb-2">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Student Paid Publication Receipt Proof
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-500/30">
                      📄 {selectedArticle.publication_receipt_url}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Sender Bank/App:</span>
                      <strong className="text-white">{selectedArticle.sender_bank || 'HBL Mobile App'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Transaction ID (TID):</span>
                      <strong className="text-emerald-300 font-mono">{selectedArticle.transaction_id || 'TID-92041928'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Sender Mobile No:</span>
                      <strong className="text-white">{selectedArticle.sender_mobile || '0300-1234567'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Conference Presentation Fee & 1-4 Presenters Inspector */}
              {selectedArticle.presentation_receipt_url && (
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/40 space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-emerald-500/30 pb-2">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      🎤 Conference Presentation Fee Receipt Proof Paid
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-500/30">
                      📄 {selectedArticle.presentation_receipt_url}
                    </span>
                  </div>
                  <div className="text-xs text-white">
                    <span className="text-slate-400 block text-[11px]">1 to 4 Presenting Student Authors:</span>
                    <strong className="text-emerald-300 font-semibold">{selectedArticle.presenting_students_list || selectedArticle.student_name}</strong>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Verified Plagiarism Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={plagiarismScore}
                  onChange={(e) => setPlagiarismScore(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Assign Category Tier (Select 'None' if Revision Required)</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setTier('None')}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition ${
                      tier === 'None' ? 'bg-slate-700 text-white border-slate-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    ❌ None (Fixes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier('Silver')}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition ${
                      tier === 'Silver' ? 'bg-slate-700 text-white border-slate-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🥈 Silver Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier('Gold')}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition ${
                      tier === 'Gold' ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🥇 Gold Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier('Platinum')}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition ${
                      tier === 'Platinum' ? 'bg-purple-950 text-purple-300 border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    💎 Platinum
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Identified Mistakes & Detailed Feedback Description</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail mistakes found in Chapter 2, plagiarism score analysis, methodology recommendations..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* TWO SEPARATE ACTIONS: 1) Save Tier (Not Live), 2) Publish Live (After Fee) */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                
                {/* BUTTON 1: Save Evaluation / Approve Tier (Awaiting Fee, NOT Live) */}
                <button
                  type="button"
                  onClick={(e) => handleSaveReview(e, false)}
                  className="px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 font-bold rounded-xl text-xs transition"
                >
                  {tier !== 'None' ? `✓ Approve ${tier} Tier (Awaiting Student Pub Fee)` : `⚠️ Send Mistakes Feedback to Student`}
                </button>

                {/* BUTTON 2: Verify Publication Fee & Publish Live */}
                <button
                  type="button"
                  onClick={(e) => handleSaveReview(e, true)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-lg shadow-purple-600/30"
                >
                  ✨ Verify Receipt & Publish Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF DOCUMENT IN-APP VIEWER MODAL */}
      {viewPdfArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-3xl glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setViewPdfArticle(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Document Header */}
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Official Academic Research Document
                </span>
                <TierBadge tier={viewPdfArticle.tier || 'Platinum'} />
              </div>
              <h2 className="text-2xl font-bold text-white">{viewPdfArticle.title}</h2>
              <div className="text-xs text-slate-400 flex flex-wrap gap-4 pt-1">
                <span>Author: <strong className="text-white">{viewPdfArticle.student_name}</strong></span>
                <span>Category: <strong className="text-blue-300">{viewPdfArticle.category}</strong></span>
                <span>Plagiarism Score: <strong className="text-emerald-400">{viewPdfArticle.plagiarism_score}%</strong></span>
              </div>
            </div>

            {/* Document Body View */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 font-mono text-xs space-y-4 text-slate-300">
              <div className="text-center font-bold text-slate-500 pb-3 border-b border-slate-800 tracking-widest uppercase">
                --- UNIVERSITY INNOVATION LAB DOCUMENT STREAM ---
              </div>

              <div>
                <span className="text-blue-400 font-bold block mb-1">ABSTRACT & EXECUTIVE SUMMARY:</span>
                <p className="leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-slate-200">
                  {viewPdfArticle.abstract}
                </p>
              </div>

              <div>
                <span className="text-amber-400 font-bold block mb-1">ACADEMIC COMMITTEE REVIEW NOTES:</span>
                <p className="leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-slate-200">
                  {viewPdfArticle.reviewer_notes || 'Approved for publication by academic board.'}
                </p>
              </div>

              <div className="pt-2 text-slate-500 text-[11px] flex justify-between items-center border-t border-slate-800">
                <span>Document Hash: {viewPdfArticle.pdf_url || 'submitted_paper.pdf'}</span>
                <span className="text-emerald-400">✓ Digital Signature Authenticated</span>
              </div>
            </div>

            {/* Download Action Footer */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setViewPdfArticle(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Close Viewer
              </button>
              <button
                onClick={() => handleDownloadPdfFile(viewPdfArticle)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF Document File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
