import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Award,
  Sparkles,
  RefreshCw,
  Calendar,
  Send,
  Download,
  Eye,
  Check,
  CreditCard,
  Building2,
  Printer,
  X,
  BookOpen,
  Image as ImageIcon,
  CheckCircle,
  Zap,
  DollarSign,
  MapPin,
  ExternalLink,
  ChevronRight,
  Video,
  Users,
  Trash2,
  Ticket,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { TierBadge } from '../components/TierBadge';
import { ProofViewerModal } from '../components/ProofViewerModal';
import { ManuscriptModal } from '../components/ManuscriptModal';
import { LeadsLogo } from '../components/LeadsLogo';

export const StudentDashboard = ({
  user,
  articles = [],
  journals = [],
  conferences = [],
  tickets = [],
  onArticleSubmit,
  onReviseArticle,
  onPayPublicationFee,
  onApplyConference,
  onDeleteArticle,
  onMarkRead
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [availableJournals, setAvailableJournals] = useState(journals);
  const [selectedJournalId, setSelectedJournalId] = useState('');
  const [availableConferences, setAvailableConferences] = useState(conferences);

  useEffect(() => {
    if (conferences && conferences.length > 0) {
      setAvailableConferences(conferences);
    } else {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/conferences`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setAvailableConferences(data);
        })
        .catch(() => {});
    }
  }, [conferences]);

  useEffect(() => {
    if (journals && journals.length > 0) {
      setAvailableJournals(journals);
      if (!selectedJournalId) setSelectedJournalId(journals[0]?.id || '');
    } else {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/journals`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setAvailableJournals(data);
            if (!selectedJournalId) setSelectedJournalId(data[0].id);
          }
        })
        .catch(err => console.log('Error fetching journals:', err));
    }
  }, [journals]);

  const [showSubmitModal, setShowSubmitModal] = useState(() => location.pathname === '/student/submit');

  useEffect(() => {
    if (location.pathname === '/student/submit') {
      setShowSubmitModal(true);
    }
  }, [location.pathname]);

  const [activeRevisionArticle, setActiveRevisionArticle] = useState(null);
  const [activePubFeeArticle, setActivePubFeeArticle] = useState(null);
  const [activeConfFeeArticle, setActiveConfFeeArticle] = useState(null);
  const [viewPaperArticle, setViewPaperArticle] = useState(null);
  const [viewProofModal, setViewProofModal] = useState(null); // { title, url, type, senderBank, transactionId, senderMobile, studentName, amount }

  // New Article Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Artificial Intelligence & Robotics');
  const [abstract, setAbstract] = useState('');
  const [fullText, setFullText] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [subReceiptPreview, setSubReceiptPreview] = useState('');
  const [subReceiptName, setSubReceiptName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [senderMobile, setSenderMobile] = useState('');
  const [presentingStudentsList, setPresentingStudentsList] = useState('');

  // Conference Passes State
  const [activeStudentSubTab, setActiveStudentSubTab] = useState('manuscripts'); // 'manuscripts' | 'passes'
  const [studentPasses, setStudentPasses] = useState([]);
  const [loadingPasses, setLoadingPasses] = useState(false);
  const [viewingTicketPassModal, setViewingTicketPassModal] = useState(null);

  const fetchStudentPasses = async () => {
    if (!user?.id && !user?.email) return;
    try {
      setLoadingPasses(true);
      const token = localStorage.getItem('univ_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/tickets/my-tickets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setStudentPasses(data);
      }
    } catch (_) {}
    finally {
      setLoadingPasses(false);
    }
  };

  useEffect(() => {
    fetchStudentPasses();
  }, [user]);

  const mergedPasses = (() => {
    const list = [...studentPasses];
    if (Array.isArray(tickets)) {
      tickets.forEach(t => {
        if ((t.user_id === user?.id || t.user_name === user?.full_name || t.user_email === user?.email) && !list.some(p => p.id === t.id)) {
          list.push(t);
        }
      });
    }
    return list;
  })();

  const studentArticles = articles.filter(
    a => a.student_id === user.id || a.student_name === user.full_name
  );

  const resetForms = () => {
    setTitle('');
    setCategory('Artificial Intelligence & Robotics');
    setAbstract('');
    setFullText('');
    setPdfFileName('');
    setSubReceiptPreview('');
    setSubReceiptName('');
    setPayReceiptPreview('');
    setPayReceiptName('');
    setSenderBank('');
    setTransactionId('');
    setSenderMobile('');
    setPresentingStudentsList('');
    setShowSubmitModal(false);
    if (location.pathname === '/student/submit') {
      navigate('/student');
    }
    setActiveRevisionArticle(null);
    setActivePubFeeArticle(null);
    setActiveConfFeeArticle(null);
  };

  // Handle Receipt Upload with instant base64 preview
  const handleFileUpload = (e, setPreview, setName) => {
    const file = e.target.files[0];
    if (file) {
      setName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!subReceiptPreview && !subReceiptName) {
      alert('⚠️ Please upload your Submission Fee Challan payment proof screenshot to proceed!');
      return;
    }

    onArticleSubmit({
      title,
      category,
      abstract,
      full_text: fullText || abstract,
      student_id: user.id,
      student_name: user.full_name,
      journal_id: selectedJournalId ? Number(selectedJournalId) : null,
      pdf_url: pdfFileName || 'research_paper_v1.pdf',
      submission_receipt_url: subReceiptPreview || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      sender_bank: senderBank,
      transaction_id: transactionId,
      sender_mobile: senderMobile
    });

    alert('🎉 Article submitted successfully to Lahore Leads University ORIC! Admin notified via Email & WhatsApp.');
    resetForms();
  };

  const handleRevisionSubmit = (e) => {
    e.preventDefault();
    if (onReviseArticle && activeRevisionArticle) {
      onReviseArticle(activeRevisionArticle.id, {
        title,
        abstract,
        full_text: fullText || abstract,
        pdf_url: pdfFileName || activeRevisionArticle.pdf_url || 'revised_paper_v2.pdf'
      });
      alert('✅ Corrected manuscript re-submitted to Admin for re-evaluation!');
      resetForms();
    }
  };

  const handlePublicationPaymentSubmit = (e) => {
    e.preventDefault();
    if (!payReceiptPreview && !payReceiptName) {
      alert('⚠️ Please upload the Publication Fee challan screenshot proof!');
      return;
    }

    if (onPayPublicationFee && activePubFeeArticle) {
      onPayPublicationFee(activePubFeeArticle.id, {
        receipt_url: payReceiptPreview || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
        publication_receipt_url: payReceiptPreview || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
        sender_bank: senderBank,
        transaction_id: transactionId,
        sender_mobile: senderMobile
      });
      alert('✅ Publication Fee Challan proof submitted! Admin will verify the screenshot and publish your paper live.');
      resetForms();
    }
  };

  const handleConferenceApplySubmit = (e) => {
    e.preventDefault();
    if (!payReceiptPreview && !payReceiptName) {
      alert('⚠️ Please upload the Conference Presentation Fee challan screenshot proof!');
      return;
    }

    if (onApplyConference && activeConfFeeArticle) {
      onApplyConference(activeConfFeeArticle.id, {
        receipt_url: payReceiptPreview || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
        presentation_receipt_url: payReceiptPreview || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
        presenting_students_list: presentingStudentsList || user.full_name,
        sender_bank: senderBank,
        transaction_id: transactionId,
        sender_mobile: senderMobile
      });
      alert('✅ Conference Presentation application and fee receipt submitted!');
      resetForms();
    }
  };

  // Generate Official Bank Challan PDF for Student to Print & Pay
  const handleDownloadChallanPdf = (typeTitle, feeAmount, voucherNo) => {
    const studentName = (user.full_name || 'Student Researcher').replace(/[\(\)\\]/g, ' ');
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>LLU Fee Challan - ${voucherNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 25px; color: #0A192F; }
          .box { border: 2px solid #0A192F; padding: 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #0A192F; padding-bottom: 12px; margin-bottom: 15px; }
          .title { font-size: 16pt; font-weight: bold; }
          .sub { font-size: 10pt; color: #555; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #ccc; font-size: 11pt; }
          .total { font-size: 14pt; font-weight: bold; color: #15803d; border-top: 2px solid #0A192F; margin-top: 15px; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="header">
            <div class="title">LAHORE LEADS UNIVERSITY</div>
            <div class="sub">Office of Research, Innovation & Commercialization (ORIC)</div>
            <div style="font-weight:bold; margin-top:5px;">OFFICIAL BANK CHALLAN VOUCHER</div>
          </div>
          <div class="row"><span>Voucher No:</span><strong>${voucherNo}</strong></div>
          <div class="row"><span>Student Name:</span><strong>${studentName}</strong></div>
          <div class="row"><span>Fee Purpose:</span><strong>${typeTitle}</strong></div>
          <div class="row"><span>Bank Name:</span><strong>Habib Bank Limited (HBL) / Easypaisa / JazzCash</strong></div>
          <div class="row"><span>Account No:</span><strong>0042-79001928-03 (Title: Univ Research Fund)</strong></div>
          <div class="row total"><span>TOTAL PAYABLE:</span><span>${feeAmount}</span></div>
          <p style="font-size:9pt; color:#666; margin-top:15px; text-align:center;">
            Deposit fee in bank or transfer online. Take a screenshot of the paid receipt and upload in your Student Portal.
          </p>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-xl border-2 border-amber-400 shadow-md">
            🎓
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Student Research Portal</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F]">Welcome, {user.full_name}</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Department of Computer Science • Lahore Leads University Research Cell
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForms();
            setShowSubmitModal(true);
          }}
          className="px-6 py-3.5 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-2xl text-xs transition shadow-md flex items-center gap-2 border border-amber-400/40"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Submit New Research Paper</span>
        </button>
      </div>

      {/* Sub-Tabs Navigation: Manuscripts vs Conference Passes */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveStudentSubTab('manuscripts')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeStudentSubTab === 'manuscripts'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Research Manuscripts</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeStudentSubTab === 'manuscripts' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {studentArticles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudentSubTab('passes')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeStudentSubTab === 'passes'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Conference Passes & E-Tickets</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeStudentSubTab === 'passes' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {mergedPasses.length}
            </span>
          </button>
        </div>

        {activeStudentSubTab === 'passes' && (
          <button
            type="button"
            onClick={() => navigate('/conferences')}
            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Book Another Conference Pass</span>
          </button>
        )}
      </div>

      {/* VIEW 1: RESEARCH MANUSCRIPTS */}
      {activeStudentSubTab === 'manuscripts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#0A192F]">My Submitted Manuscripts ({studentArticles.length})</h2>
            <span className="text-xs text-slate-500 font-semibold">Track evaluation lifecycle, reviews & publication</span>
          </div>

          {studentArticles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-black text-[#0A192F]">No Research Manuscripts Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Submit your original academic manuscript to Leads University OJS journals to get evaluated by editorial reviewers and pitch to venture investors.
              </p>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2.5 bg-[#0A192F] text-amber-400 font-bold rounded-xl text-xs transition inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Submit First Article
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {studentArticles.map((article) => {
                const isNeedsRevision = article.status === 'Needs Revision' || article.status?.includes('Needs Revision');
                const isPublished = article.is_published || article.status === 'Published';
                const hasCategoryApproved = !isNeedsRevision && !isPublished && (
                  article.status?.includes('Approved') || 
                  (article.tier && article.tier !== 'None' && !article.tier.includes('None') && !article.tier.includes('Needs Revision'))
                );
                const isPubFeePaidPendingVerification = !isPublished && (article.status?.includes('Pub Fee Paid') || Boolean(article.publication_receipt_url));
                const isConfApplied = article.presentation_fee_paid || Boolean(article.presentation_receipt_url) || article.status === 'Presentation Scheduled';

                return (
                  <div
                    key={article.id}
                    className={`bg-white rounded-3xl p-6 border transition shadow-sm space-y-4 ${
                      isNeedsRevision
                        ? 'border-rose-400 ring-2 ring-rose-400/30 bg-rose-50/20'
                        : hasCategoryApproved && !isPubFeePaidPendingVerification
                        ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-50/10'
                        : isPubFeePaidPendingVerification
                        ? 'border-purple-400 ring-2 ring-purple-400/20 bg-purple-50/10'
                        : isPublished
                        ? 'border-emerald-300 ring-1 ring-emerald-300/30'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Status Banner 1: Mistakes Identified */}
                    {isNeedsRevision && (
                      <div className="p-4 bg-rose-500/10 border-2 border-rose-400 rounded-2xl flex items-start gap-3 text-xs text-rose-950 font-bold">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-black text-sm text-rose-900">
                            ⚠️ ACTION REQUIRED: Editorial Board Identified Mistakes in Manuscript
                          </div>
                          <p className="text-slate-800 font-medium">
                            {article.admin_revision_notes || article.reviewer_notes || 'Please review the reviewer remarks, correct your manuscript, and click Resubmit below.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status Banner 2: Category Approved - Awaiting Publication Fee */}
                    {hasCategoryApproved && !isPubFeePaidPendingVerification && (
                      <div className="p-4 bg-amber-500/10 border-2 border-amber-400 rounded-2xl flex items-start gap-3 text-xs text-amber-950 font-bold">
                        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-black text-sm text-amber-900">
                            🎉 Category & Tier Assigned: {article.tier}! Ready for Live Publication
                          </div>
                          <p className="text-slate-800 font-medium">
                            Your manuscript has been approved by the ORIC Editorial Board. Please deposit the Publication Fee (PKR 3,000) using the official bank challan and upload the receipt slip to get published live.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status Banner 3: Publication Fee Paid - Under Admin Verification */}
                    {isPubFeePaidPendingVerification && (
                      <div className="p-4 bg-purple-500/10 border-2 border-purple-400 rounded-2xl flex items-start gap-3 text-xs text-purple-950 font-bold">
                        <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-black text-sm text-purple-900">
                            ⏳ Publication Fee Paid (PKR 3,000) — Awaiting Admin Live Verification
                          </div>
                          <p className="text-slate-800 font-medium">
                            Your paid challan receipt has been sent to the Editorial Admin. Once verified, your research paper will be published live with an official DOI.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status Banner 4: Published Live */}
                    {isPublished && (
                      <div className="p-4 bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-950 font-bold">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-black text-sm text-emerald-900">
                              🏆 Officially Published Live in {article.journal_title || 'Leads University Research Repository'}
                            </div>
                            <p className="text-slate-800 font-medium">
                              Official DOI: <strong className="font-mono text-emerald-900">{article.doi || `10.5281/leads.2026.${article.id}`}</strong> • Publicly indexed and accessible to readers & venture investors.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-black text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                            {article.category || 'General Science'}
                          </span>
                          <TierBadge tier={article.tier || 'None'} />
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : isPubFeePaidPendingVerification
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : isNeedsRevision
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : hasCategoryApproved
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {article.status}
                          </span>
                        </div>

                        <h3
                          className="text-lg font-black text-[#0A192F] hover:text-blue-900 cursor-pointer transition"
                          onClick={() => setViewPaperArticle(article)}
                        >
                          {article.title}
                        </h3>

                        <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-3">
                          <span>Plagiarism: <strong className={article.plagiarism_score > 15 ? 'text-rose-600' : 'text-emerald-600'}>{article.plagiarism_score || 5}%</strong></span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">DOI: {article.doi || `10.5281/leads.2026.${article.id}`}</span>
                        </div>
                      </div>

                      {/* Proof Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setViewPaperArticle(article)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-slate-300"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>Read Manuscript</span>
                        </button>

                        {article.submission_receipt_url && (
                          <button
                            onClick={() => setViewProofModal({
                              title: 'Submission Fee Proof (PKR 1,500)',
                              url: article.submission_receipt_url,
                              type: 'Submission Fee',
                              senderBank: article.sender_bank || 'HBL Mobile App',
                              transactionId: article.transaction_id || `TRX-${article.id}948`,
                              senderMobile: article.sender_mobile || '0348-2727605',
                              studentName: user.full_name,
                              amount: 'PKR 1,500'
                            })}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-blue-200"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                            <span>Submission Slip (PKR 1.5k)</span>
                          </button>
                        )}

                        {article.publication_receipt_url && (
                          <button
                            onClick={() => setViewProofModal({
                              title: 'Publication Fee Proof (PKR 3,000)',
                              url: article.publication_receipt_url,
                              type: 'Publication Fee',
                              senderBank: article.sender_bank || 'HBL Mobile App',
                              transactionId: article.transaction_id || `TRX-PUB-${article.id}`,
                              senderMobile: article.sender_mobile || '0348-2727605',
                              studentName: user.full_name,
                              amount: 'PKR 3,000'
                            })}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-purple-200"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                            <span>Publication Slip (PKR 3k)</span>
                          </button>
                        )}

                        {article.presentation_receipt_url && (
                          <button
                            onClick={() => setViewProofModal({
                              title: 'Conference Presentation Fee Proof (PKR 2,000)',
                              url: article.presentation_receipt_url,
                              type: 'Conference Presentation Fee',
                              senderBank: article.sender_bank || 'HBL Mobile App',
                              transactionId: article.transaction_id || `TRX-CONF-${article.id}`,
                              senderMobile: article.sender_mobile || '0348-2727605',
                              studentName: user.full_name,
                              amount: 'PKR 2,000'
                            })}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-emerald-200"
                          >
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Conf Slip (PKR 2k)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions Lifecycle Bar */}
                    <div className="border-t border-slate-100 pt-4 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Submitted: {article.created_at || '2026-09-01'}
                        </span>
                        {!article.is_published && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete your submission "${article.title}"?`)) {
                                if (onDeleteArticle) onDeleteArticle(article.id);
                              }
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition flex items-center gap-1 border border-rose-200"
                            title="Delete submission"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Action 1: Resubmit Corrected Manuscript */}
                        {isNeedsRevision && (
                          <button
                            onClick={() => {
                              setActiveRevisionArticle(article);
                              setTitle(article.title);
                              setAbstract(article.abstract);
                              setFullText(article.full_text || article.abstract);
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Resubmit Corrected Paper</span>
                          </button>
                        )}

                        {/* Action 2: Pay Publication Fee Challan */}
                        {hasCategoryApproved && !isPubFeePaidPendingVerification && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadChallanPdf('Publication Fee Voucher', '3000', `CHAL-PUB-${article.id}902`)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                              <span>Print Challan (PKR 3k)</span>
                            </button>
                            <button
                              onClick={() => {
                                resetForms();
                                setActivePubFeeArticle(article);
                              }}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Publication Slip (PKR 3,000)</span>
                            </button>
                          </div>
                        )}

                        {/* Action 3: Pitch to National Investors at Summit */}
                        {isPublished && !isConfApplied && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadChallanPdf('Conference Pitching Voucher', '2000', `CHAL-CONF-${article.id}412`)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                              <span>Pitch Challan (PKR 2k)</span>
                            </button>
                            <button
                              onClick={() => {
                                resetForms();
                                setActiveConfFeeArticle(article);
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Apply to Pitch at National Summit (PKR 2,000)</span>
                            </button>
                          </div>
                        )}

                        {/* Action 4: Presentation Scheduled Confirmed */}
                        {isConfApplied && (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Presentation Scheduled with Venture Investors
                          </span>
                        )}

                        {/* Download Formal Acceptance Letter */}
                        {hasCategoryApproved && (
                          <button
                            onClick={() => {
                              const printWin = window.open('', '_blank');
                              if (!printWin) return;
                              printWin.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <title>ORIC Official Acceptance Letter - ${article.title.slice(0, 30)}</title>
                                  <style>
                                    body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; }
                                    .header { text-align: center; border-bottom: 2px solid #0A192F; padding-bottom: 15px; margin-bottom: 30px; }
                                    .header h1 { font-size: 22px; color: #0A192F; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
                                    .header h2 { font-size: 14px; color: #555; margin: 5px 0 0 0; }
                                    .content { margin: 20px 0; font-size: 14px; }
                                    .meta-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                    .meta-table td { padding: 8px 12px; border: 1px solid #ddd; font-size: 13px; }
                                    .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                                    .sign-box { text-align: center; width: 220px; border-top: 1px solid #111; padding-top: 8px; font-size: 12px; font-weight: bold; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <h1>Lahore Leads University</h1>
                                    <h2>Office of Research, Innovation and Commercialization (ORIC)</h2>
                                    <p style="font-size: 11px; margin: 4px 0 0 0;">HEC Recognized Academic Publishing Directorate</p>
                                  </div>

                                  <div style="text-align: right; font-size: 12px; font-weight: bold; margin-bottom: 20px;">
                                    Date: ${new Date().toLocaleDateString('en-GB')} | Ref: LLU/ORIC/ACC-${article.id}2026
                                  </div>

                                  <div class="content">
                                    <p><strong>To:</strong> ${article.student_name || user.full_name}<br>
                                    <strong>Department:</strong> ${user.organization || 'Faculty of Computer Science & Engineering'}<br>
                                    <strong>Institution:</strong> Lahore Leads University</p>

                                    <h3 style="text-align: center; text-decoration: underline; margin: 25px 0 15px 0;">OFFICIAL ACCEPTANCE & EVALUATION LETTER</h3>

                                    <p>We are pleased to inform you that your academic research manuscript titled <strong>"${article.title}"</strong> has successfully concluded the double-blind peer review process and has been evaluated by the University Editorial Board.</p>

                                    <table class="meta-table">
                                      <tr><td style="width: 35%; font-weight: bold; background: #f9f9f9;">Assigned Quality Category:</td><td><strong>${article.tier || 'Category A'}</strong></td></tr>
                                      <tr><td style="font-weight: bold; background: #f9f9f9;">Target Publication Journal:</td><td>${article.journal_title || 'Leads Journal of Computer & Computing Sciences (LJCCS)'}</td></tr>
                                      <tr><td style="font-weight: bold; background: #f9f9f9;">Verified Plagiarism Index:</td><td>${article.plagiarism_score || 5}% (Within HEC Prescribed Tolerance)</td></tr>
                                      <tr><td style="font-weight: bold; background: #f9f9f9;">Editorial Reviewer Notes:</td><td>${article.reviewer_notes || 'High methodological rigor with significant empirical contribution.'}</td></tr>
                                    </table>

                                    <p>Upon settlement of the final production publication fee, this paper shall be assigned an official DOI and indexed in the open research repository.</p>
                                  </div>

                                  <div class="footer" style="margin-top: 60px;">
                                    <div class="sign-box">
                                      Prof. Dr. M. Arshad<br>
                                      Dean of Research & Dean FoCS<br>
                                      Lahore Leads University
                                    </div>
                                    <div class="sign-box">
                                      Director ORIC<br>
                                      Evaluation & Commercialization Cell<br>
                                      Lahore Leads University
                                    </div>
                                  </div>
                                </body>
                                </html>
                              `);
                              printWin.document.close();
                              printWin.focus();
                              setTimeout(() => printWin.print(), 300);
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-600" />
                            <span>Acceptance Letter</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY CONFERENCE PASSES & E-TICKETS */}
      {activeStudentSubTab === 'passes' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-black text-[#0A192F]">My Booked Conference Passes ({mergedPasses.length})</h2>
              <p className="text-xs text-slate-500 font-semibold">
                View pass verification status, assigned auditorium seats, virtual live stream links, and print official barcode entrance passes.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchStudentPasses}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPasses ? 'animate-spin' : ''}`} />
              <span>Refresh Passes</span>
            </button>
          </div>

          {mergedPasses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-black text-[#0A192F]">No Conference Passes Booked Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Join Lahore Leads University research summits as an onsite auditorium delegate or remote live stream attendee.
              </p>
              <button
                type="button"
                onClick={() => navigate('/conferences')}
                className="px-6 py-2.5 bg-[#0A192F] text-amber-400 font-black rounded-xl text-xs transition inline-flex items-center gap-2 shadow-md"
              >
                <Ticket className="w-4 h-4 text-amber-400" /> Browse & Book Conference Passes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mergedPasses.map((passItem) => {
                const isPending = passItem.payment_status?.toLowerCase().includes('pending');
                const isOnsite = (passItem.ticket_type || 'onsite').toLowerCase() === 'onsite';

                return (
                  <div
                    key={passItem.id || passItem.ticket_code}
                    className={`bg-white rounded-3xl p-6 border transition shadow-sm space-y-4 ${
                      isPending ? 'border-amber-300 bg-amber-50/15' : 'border-emerald-300 ring-1 ring-emerald-300/30'
                    }`}
                  >
                    {/* Status Alert Banner */}
                    {isPending ? (
                      <div className="p-4 bg-amber-500/10 border-2 border-amber-400 rounded-2xl flex items-start gap-3 text-xs text-amber-950 font-bold">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-black text-sm text-amber-900">
                            ⏳ Pass Verification in Progress (Challan Submitted)
                          </div>
                          <p className="text-slate-800 font-medium">
                            Your payment slip and booking reference have been transmitted to ORIC Admin. Once verified, your <strong>{isOnsite ? 'Auditorium Seat Number' : 'Live Stream Link'}</strong> will be activated and official printable pass will be unlocked.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-950 font-bold">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-black text-sm text-emerald-900">
                              🎉 Conference Pass Verified & Activated!
                            </div>
                            <p className="text-slate-800 font-medium">
                              {isOnsite ? (
                                <>Assigned Seat: <strong className="text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded font-mono">{passItem.seat_number || 'Seat Allocated'}</strong> at {passItem.venue || 'Main Auditorium'}</>
                              ) : (
                                <>Live Virtual Stream Link is ready. You can join the session directly on the event date.</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pass Header & Details */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                            isOnsite
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-purple-100 text-purple-900 border-purple-300'
                          }`}>
                            {isOnsite ? '🏛️ Onsite Auditorium Pass' : '🎥 Virtual HD Live Stream Pass'}
                          </span>

                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {isPending ? '⏳ Awaiting Admin Approval' : '✅ Verified & Issued'}
                          </span>

                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border">
                            {passItem.ticket_code || 'PASS-LLU-2026'}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-[#0A192F]">
                          {passItem.conference_title || 'Lahore Leads University National Innovation & Research Summit 2026'}
                        </h3>

                        <div className="text-xs text-slate-600 font-medium flex flex-wrap items-center gap-3">
                          <span>📅 Date: <strong>{passItem.event_date || '2026-09-15'}</strong></span>
                          <span>•</span>
                          <span>⏰ Time: <strong>{passItem.event_time || '10:00 AM - 04:00 PM'}</strong></span>
                          <span>•</span>
                          <span>Fee Deposited: <strong className="text-emerald-700 font-bold">PKR {passItem.amount_paid || (isOnsite ? 50 : 20)}</strong></span>
                        </div>
                      </div>

                      {/* Proof Viewer Button */}
                      {passItem.receipt_url && (
                        <button
                          type="button"
                          onClick={() => setViewProofModal({
                            title: `Conference Pass Payment Proof (${passItem.ticket_code || 'Pass'})`,
                            url: passItem.receipt_url,
                            type: `${isOnsite ? 'Onsite Auditorium' : 'Virtual Live Stream'} Pass Fee`,
                            senderBank: passItem.sender_bank || 'HBL Mobile App',
                            transactionId: passItem.transaction_id || 'TRX-CONF-PASS',
                            senderMobile: passItem.sender_mobile || '0348-2727605',
                            studentName: passItem.user_name || user.full_name,
                            amount: `PKR ${passItem.amount_paid || (isOnsite ? 50 : 20)}`
                          })}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-blue-200 self-start shrink-0"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Deposit Slip</span>
                        </button>
                      )}
                    </div>

                    {/* Pass Allocation Info Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Delegate</span>
                        <strong className="text-slate-900 block text-xs">{passItem.user_name || user.full_name}</strong>
                        <span className="text-[11px] text-slate-500 font-mono">{passItem.user_email || user.email}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          {isOnsite ? 'Allocated Auditorium Seat' : 'Live Stream Access'}
                        </span>
                        {isOnsite ? (
                          <strong className="text-emerald-800 block text-xs font-mono">
                            {isPending ? '⏳ Pending Admin Seat Allocation' : (passItem.seat_number || 'Auditorium Row A - Seat #15')}
                          </strong>
                        ) : (
                          <div>
                            {isPending ? (
                              <span className="text-amber-800 text-xs font-bold">⏳ Pending Admin Link Delivery</span>
                            ) : passItem.stream_link ? (
                              <a
                                href={passItem.stream_link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-700 hover:text-blue-900 font-bold underline text-xs line-clamp-1"
                              >
                                {passItem.stream_link}
                              </a>
                            ) : (
                              <span className="text-emerald-700 font-bold text-xs">Virtual Stream Access Activated</span>
                            )}
                          </div>
                        )}
                        <span className="text-[11px] text-slate-500">{passItem.venue || 'Lahore Leads University'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Reference</span>
                        <strong className="text-slate-900 block text-xs">{passItem.sender_bank || 'HBL Mobile App'}</strong>
                        <span className="font-mono text-[11px] text-slate-600">TID: {passItem.transaction_id || 'TRX-CONF'}</span>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="border-t border-slate-100 pt-3 flex flex-wrap justify-between items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-semibold">
                        Registered on: {passItem.booked_at || new Date().toISOString().split('T')[0]}
                      </span>

                      <div className="flex items-center gap-2">
                        {!isOnsite && !isPending && passItem.stream_link && (
                          <a
                            href={passItem.stream_link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Live Stream</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setViewingTicketPassModal(passItem)}
                          className="px-4 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md border border-amber-400/40"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>View & Print Official E-Pass</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBMIT NEW ARTICLE MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-amber-600 uppercase">ORIC Submissions</span>
              <h2 className="text-2xl font-black text-[#0A192F]">Submit Research Paper to OJS Journal</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose target journal discipline, write abstract, and attach initial Submission Fee Challan proof.
              </p>
            </div>

            {/* Challan Info Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-[#0A192F] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" /> Submission Fee Challan (PKR 1,500)
                </span>
                <button
                  type="button"
                  onClick={() => handleDownloadChallanPdf('Manuscript Submission Fee', 'PKR 1,500', 'CHAL-SUB-9482')}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3 h-3 text-slate-500" /> Print / Download Challan Slip
                </button>
              </div>
              <div className="text-slate-600 text-[11px]">
                HBL Account: <strong className="font-mono text-slate-900">0042-79001928-03</strong> • Title: <strong>Lahore Leads University ORIC</strong> • Easypaisa: <strong>0348-2727605</strong>
              </div>
            </div>

            <form onSubmit={handleInitialSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Select Target University Journal *</label>
                <select
                  value={selectedJournalId}
                  onChange={(e) => {
                    const jId = e.target.value;
                    setSelectedJournalId(jId);
                    const jObj = availableJournals.find(j => j.id == jId);
                    if (jObj) setCategory(jObj.category || jObj.title);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold"
                >
                  {availableJournals.map(j => (
                    <option key={j.id} value={j.id}>
                      [{j.short_code}] {j.title} — ({j.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Paper Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep Neural Networks for Renewable Solar Microgrid Balancing"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Abstract Summary (200-300 words) *</label>
                <textarea
                  rows={4}
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Summarize the core problem, methodology, findings, and technical significance..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Full Manuscript Text / Content</label>
                <textarea
                  rows={6}
                  value={fullText}
                  onChange={(e) => setFullText(e.target.value)}
                  placeholder="Paste complete paper sections (Introduction, Methodology, Experiments, Results, References)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-serif leading-relaxed"
                />
              </div>

              {/* Payment Receipt Upload */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-slate-800 block font-bold">
                  Upload Paid Submission Fee Screenshot (PKR 1,500) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-0.5">Paid Via Bank / App</span>
                    <select
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    >
                      <option value="HBL Mobile App">HBL Mobile App</option>
                      <option value="Meezan Bank">Meezan Bank</option>
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="Physical Branch Challan">Physical Branch Challan</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-0.5">Transaction Ref / TRX ID</span>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center bg-white cursor-pointer transition">
                  <input
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    onChange={(e) => handleFileUpload(e, setSubReceiptPreview, setSubReceiptName)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {subReceiptName ? `✓ Attached: ${subReceiptName}` : 'Click to Upload Challan PDF / Screenshot'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Accepts PDF documents and images (PNG, JPG)
                    </span>
                  </div>
                </div>

                {subReceiptPreview && (
                  <div className="text-center">
                    {subReceiptPreview.startsWith('data:application/pdf') || subReceiptName.toLowerCase().endsWith('.pdf') ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs font-bold text-rose-800">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-rose-200 text-rose-900 rounded-lg text-xs font-black">PDF</span>
                          <span className="truncate max-w-[220px] sm:max-w-xs">{subReceiptName || 'Submission_Fee_Challan.pdf'}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">
                          Attached ✓
                        </span>
                      </div>
                    ) : (
                      <img src={subReceiptPreview} alt="Screenshot" className="h-20 mx-auto rounded-lg border border-slate-300 object-contain" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Submit Manuscript for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESUBMIT REVISED ARTICLE MODAL */}
      {activeRevisionArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setActiveRevisionArticle(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-amber-600 uppercase">Manuscript Correction</span>
              <h2 className="text-2xl font-black text-[#0A192F]">Resubmit Revised Manuscript</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your manuscript text to resolve the mistakes identified by the editorial board.
              </p>
            </div>

            {activeRevisionArticle.admin_revision_notes && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 text-xs space-y-1">
                <strong className="text-amber-900 uppercase font-black text-[11px] block">Admin Correction Feedback:</strong>
                <p className="text-slate-800 font-medium">{activeRevisionArticle.admin_revision_notes}</p>
              </div>
            )}

            <form onSubmit={handleRevisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Paper Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Revised Abstract *</label>
                <textarea
                  rows={4}
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Revised Full Manuscript Text</label>
                <textarea
                  rows={7}
                  value={fullText}
                  onChange={(e) => setFullText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-serif leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveRevisionArticle(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Send Corrected Manuscript to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLICATION FEE MODAL */}
      {activePubFeeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setActivePubFeeArticle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-purple-600 uppercase">Live Publishing Clearance</span>
              <h3 className="text-xl font-black text-[#0A192F]">Pay Publication Fee (PKR 3,000)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Deposit PKR 3,000 to finalize OJS archiving, official DOI assignment, and live public indexing.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <strong className="text-purple-950">Official Publication Challan</strong>
                <button
                  type="button"
                  onClick={() => handleDownloadChallanPdf('Live Journal Publication Fee', 'PKR 3,000', 'CHAL-PUB-8812')}
                  className="px-2.5 py-1 bg-white hover:bg-purple-100 border border-purple-300 rounded-lg text-[11px] font-bold text-purple-900 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download Challan
                </button>
              </div>
              <div className="text-slate-600 text-[11px]">
                HBL Account: <strong className="font-mono text-slate-900">0042-79001928-03</strong> • Title: <strong>Lahore Leads University ORIC</strong>
              </div>
            </div>

            <form onSubmit={handlePublicationPaymentSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5 font-bold">Bank / App</span>
                  <select
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900"
                  >
                    <option value="HBL Mobile App">HBL Mobile App</option>
                    <option value="Meezan Bank">Meezan Bank</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5 font-bold">TRX ID / Ref</span>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="relative border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-4 text-center bg-purple-50/40 cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*,application/pdf,.pdf"
                  onChange={(e) => handleFileUpload(e, setPayReceiptPreview, setPayReceiptName)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-1">
                  <Upload className="w-5 h-5 text-purple-700" />
                  <span className="text-xs font-bold text-slate-800">
                    {payReceiptName ? `✓ Attached: ${payReceiptName}` : 'Upload Paid Challan PDF Slip / Screenshot'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Accepts PDF documents and images (PNG, JPG)
                  </span>
                </div>
              </div>

              {payReceiptPreview && (
                <div className="text-center">
                  {payReceiptPreview.startsWith('data:application/pdf') || payReceiptName.toLowerCase().endsWith('.pdf') ? (
                    <div className="p-3 bg-purple-100 border border-purple-300 rounded-xl flex items-center justify-between text-xs font-bold text-purple-900">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-purple-200 text-purple-950 rounded-lg text-xs font-black">PDF</span>
                        <span className="truncate max-w-[220px] sm:max-w-xs">{payReceiptName || 'Publication_Fee_Challan.pdf'}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">
                        Attached ✓
                      </span>
                    </div>
                  ) : (
                    <img src={payReceiptPreview} alt="Screenshot" className="h-20 mx-auto rounded-lg border border-purple-300 object-contain" />
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActivePubFeeArticle(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Submit Proof for Live Publishing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFERENCE PRESENTATION APPLICATION & FEE MODAL */}
      {activeConfFeeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setActiveConfFeeArticle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase">National Innovation & Research Summit</span>
              <h3 className="text-xl font-black text-[#0A192F]">Apply for Conference Presentation (PKR 2,000)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pitch your published research paper live in the Grand Auditorium to venture capital investors and national industries.
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <strong className="text-emerald-950">Official Conference Presentation Challan</strong>
                <button
                  type="button"
                  onClick={() => handleDownloadChallanPdf('Conference Presentation Slot & Delegate Pass', 'PKR 2,000', 'CHAL-CONF-5590')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg text-[11px] font-bold text-emerald-900 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download Challan
                </button>
              </div>
              <div className="text-slate-600 text-[11px]">
                HBL Account: <strong className="font-mono text-slate-900">0042-79001928-03</strong> • Title: <strong>Lahore Leads University ORIC</strong>
              </div>
            </div>

            <form onSubmit={handleConferenceApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Presenting Student Author(s) Name *</label>
                <input
                  type="text"
                  required
                  value={presentingStudentsList}
                  onChange={(e) => setPresentingStudentsList(e.target.value)}
                  placeholder="e.g. Ali Ahmed, Bazigh Minhas"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5 font-bold">Payment Channel / Bank</span>
                  <select
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900"
                  >
                    <option value="HBL Mobile App">HBL Mobile App</option>
                    <option value="Meezan Bank">Meezan Bank</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5 font-bold">TRX ID / Ref</span>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="relative border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-4 text-center bg-emerald-50/40 cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*,application/pdf,.pdf"
                  onChange={(e) => handleFileUpload(e, setPayReceiptPreview, setPayReceiptName)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-1">
                  <Upload className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-800">
                    {payReceiptName ? `✓ Attached: ${payReceiptName}` : 'Upload Paid Conference Challan PDF Slip / Screenshot'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Accepts PDF documents and image screenshots
                  </span>
                </div>
              </div>

              {payReceiptPreview && (
                <div className="text-center">
                  {payReceiptPreview.startsWith('data:application/pdf') || payReceiptName.toLowerCase().endsWith('.pdf') ? (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-200 text-emerald-950 rounded-lg text-xs font-black">PDF</span>
                        <span className="truncate max-w-[220px] sm:max-w-xs">{payReceiptName || 'Conference_Fee_Challan.pdf'}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-black">
                        Attached ✓
                      </span>
                    </div>
                  ) : (
                    <img src={payReceiptPreview} alt="Screenshot" className="h-20 mx-auto rounded-lg border border-emerald-300 object-contain" />
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveConfFeeArticle(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" /> Submit Conference Pitch Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL CONFERENCE PASS MODAL */}
      {viewingTicketPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-900">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setViewingTicketPassModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pass Content Container */}
            <div className="border-4 border-[#0A192F] rounded-3xl p-6 bg-gradient-to-br from-white via-slate-50 to-amber-50/20 shadow-inner relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#0A192F] pb-4">
                <div className="flex items-center gap-3">
                  <LeadsLogo className="w-12 h-12" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">
                      Lahore Leads University
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#0A192F] leading-tight">
                      Official Conference Delegate Pass
                    </h3>
                  </div>
                </div>

                <span className="font-mono text-xs font-black bg-[#0A192F] text-amber-400 px-3 py-1 rounded-lg">
                  {viewingTicketPassModal.ticket_code || 'PASS-LLU-2026'}
                </span>
              </div>

              {/* Conference Header */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">
                  Event / Summit
                </span>
                <h4 className="text-base sm:text-lg font-black text-[#0A192F]">
                  {viewingTicketPassModal.conference_title || 'Annual Innovation & Research Summit 2026'}
                </h4>
                <div className="text-xs text-slate-600 font-semibold flex flex-wrap items-center gap-3 pt-1">
                  <span>📅 <strong>{viewingTicketPassModal.event_date || '2026-09-15'}</strong></span>
                  <span>•</span>
                  <span>⏰ <strong>{viewingTicketPassModal.event_time || '10:00 AM - 04:00 PM'}</strong></span>
                </div>
              </div>

              {/* Delegate Credentials & Allocation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Delegate Name</span>
                  <strong className="text-slate-900 text-sm block">
                    {viewingTicketPassModal.user_name || user.full_name}
                  </strong>
                  <span className="text-slate-500 font-mono text-[11px] block">
                    {viewingTicketPassModal.user_email || user.email}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pass Category</span>
                  <strong className="text-amber-800 text-sm block">
                    {(viewingTicketPassModal.ticket_type || 'onsite').toLowerCase() === 'onsite'
                      ? '🏛️ Onsite Auditorium Pass'
                      : '🎥 Virtual Live Stream Pass'}
                  </strong>
                  <span className="text-emerald-700 font-bold text-[11px] block">
                    Status: {viewingTicketPassModal.payment_status || 'Verified & Issued'}
                  </span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {(viewingTicketPassModal.ticket_type || 'onsite').toLowerCase() === 'onsite'
                      ? '💺 Assigned Auditorium Seat'
                      : '🎥 Live Stream Access Link'}
                  </span>
                  {(viewingTicketPassModal.ticket_type || 'onsite').toLowerCase() === 'onsite' ? (
                    <div className="text-base font-black text-emerald-800 font-mono mt-0.5">
                      {viewingTicketPassModal.seat_number || 'Auditorium Main Hall - Row A'}
                    </div>
                  ) : (
                    <div className="mt-0.5">
                      {viewingTicketPassModal.stream_link ? (
                        <a
                          href={viewingTicketPassModal.stream_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 font-mono font-bold text-xs underline break-all"
                        >
                          {viewingTicketPassModal.stream_link}
                        </a>
                      ) : (
                        <span className="text-slate-700 font-semibold text-xs">
                          Virtual Stream Access Link will be provided prior to session.
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-[11px] text-slate-500 block mt-1">
                    📍 {viewingTicketPassModal.venue || 'Lahore Leads University Main Campus Grand Auditorium'}
                  </span>
                </div>
              </div>

              {/* Barcode & Security Stamp Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700">
                  <QrCode className="w-10 h-10 text-[#0A192F] p-1 bg-white border border-slate-300 rounded-lg" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Verification Barcode</div>
                    <div>{viewingTicketPassModal.ticket_code || 'LLU-SUMMIT-PASS-2026'}</div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500 font-semibold">
                  <div className="text-emerald-700 font-black uppercase flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official HEC Accredited Pass
                  </div>
                  <div>Directorate of Research, ORIC</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setViewingTicketPassModal(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Official Pass Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROOF INSPECTOR MODAL */}
      <ProofViewerModal
        isOpen={Boolean(viewProofModal)}
        onClose={() => setViewProofModal(null)}
        proofData={viewProofModal}
      />

      {/* MANUSCRIPT PDF MODAL */}
      <ManuscriptModal
        isOpen={Boolean(viewPaperArticle)}
        onClose={() => setViewPaperArticle(null)}
        article={viewPaperArticle}
        user={user}
      />
    </div>
  );
};
