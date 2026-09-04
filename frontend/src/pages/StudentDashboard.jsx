import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { TierBadge } from '../components/TierBadge';

export const StudentDashboard = ({
  user,
  articles = [],
  onArticleSubmit,
  onReviseArticle,
  onPayPublicationFee,
  onApplyConference,
  onMarkRead
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeRevisionArticle, setActiveRevisionArticle] = useState(null);
  const [activePubFeeArticle, setActivePubFeeArticle] = useState(null);
  const [activeConfFeeArticle, setActiveConfFeeArticle] = useState(null);
  const [viewPaperArticle, setViewPaperArticle] = useState(null);
  const [viewProofModal, setViewProofModal] = useState(null); // { title, url, type }

  // New Article Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Computer Science & AI');
  const [abstract, setAbstract] = useState('');
  const [fullText, setFullText] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [subReceiptPreview, setSubReceiptPreview] = useState('');
  const [subReceiptName, setSubReceiptName] = useState('');
  const [senderBank, setSenderBank] = useState('HBL Mobile App');
  const [transactionId, setTransactionId] = useState('TRX-948201');
  const [senderMobile, setSenderMobile] = useState('0300-1234567');
  const [presentingStudentsList, setPresentingStudentsList] = useState('');

  // Payment Form Upload State
  const [payReceiptPreview, setPayReceiptPreview] = useState('');
  const [payReceiptName, setPayReceiptName] = useState('');

  const studentArticles = articles.filter(
    a => a.student_id === user.id || a.student_name === user.full_name
  );

  const resetForms = () => {
    setTitle('');
    setCategory('Computer Science & AI');
    setAbstract('');
    setFullText('');
    setPdfFileName('');
    setSubReceiptPreview('');
    setSubReceiptName('');
    setPayReceiptPreview('');
    setPayReceiptName('');
    setSenderBank('HBL Mobile App');
    setTransactionId(`TRX-${Math.floor(100000 + Math.random() * 900000)}`);
    setSenderMobile('0300-1234567');
    setPresentingStudentsList('');
    setShowSubmitModal(false);
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
      pdf_url: pdfFileName || 'research_paper_v1.pdf',
      submission_receipt_url: subReceiptPreview || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      sender_bank: senderBank,
      transaction_id: transactionId,
      sender_mobile: senderMobile
    });

    alert('✅ Research paper and Submission Fee challan proof submitted successfully! Admin will evaluate your paper.');
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
      alert('✅ Corrected paper re-submitted to Admin for re-evaluation!');
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
        sender_bank: senderBank,
        transaction_id: transactionId,
        sender_mobile: senderMobile
      });
      alert('✅ Publication Fee Challan proof submitted! Admin will verify the screenshot and publish your paper live to the website.');
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
        presenting_students_list: presentingStudentsList || user.full_name,
        sender_bank: senderBank,
        transaction_id: transactionId,
        sender_mobile: senderMobile
      });
      alert('✅ Conference Presentation application and fee receipt submitted! Admin will schedule your live pitch session in front of venture capitalists.');
      resetForms();
    }
  };

  // Generate Official Bank Challan PDF for Student to Print & Pay
  const handleDownloadChallanPdf = (typeTitle, feeAmount, voucherNo) => {
    const studentName = (user.full_name || 'Student Researcher').replace(/[\(\)\\]/g, ' ');
    const pdfHeader = `%PDF-1.5\n%\xFF\xFF\xFF\xFF\n`;
    const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`;

    const streamText = `BT
/F1 18 Tf 50 740 Td (OFFICIAL UNIVERSITY BANK CHALLAN VOUCHER) Tj
/F1 12 Tf 0 -25 Td (Voucher No: ${voucherNo}) Tj
0 -20 Td (Student Name: ${studentName}) Tj
0 -20 Td (Fee Description: ${typeTitle}) Tj
0 -25 Td (Bank: Habib Bank Ltd / UBL / JazzCash / Easypaisa) Tj
0 -20 Td (Account Number: 0042-79001928-03) Tj
/F1 16 Tf 0 -35 Td (TOTAL PAYABLE: ${feeAmount}) Tj
/F1 10 Tf 0 -40 Td (Pay fee and upload the payment proof screenshot in the student portal.) Tj
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
    a.download = `University_Challan_${voucherNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Student Researcher Portal</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Submit Research Papers, Track Peer Reviews, Pay Challans, and Pitch to Investors.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            resetForms();
            setShowSubmitModal(true);
          }}
          className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold rounded-2xl text-xs transition shadow-xl shadow-blue-600/30 flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" /> Create & Submit New Article
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" /> My Research Submissions & Publishing Journey
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Total Articles: <strong>{studentArticles.length}</strong>
          </span>
        </div>

        {studentArticles.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center border border-slate-800 text-slate-400 space-y-4">
            <FileText className="w-14 h-14 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Research Papers Submitted Yet</h3>
            <p className="text-sm max-w-md mx-auto">
              Ready to showcase your breakthrough innovations to peer reviewers and venture capital investors? Click the button above to submit your first paper.
            </p>
            <button
              onClick={() => {
                resetForms();
                setShowSubmitModal(true);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Submit First Article Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {studentArticles.map((article) => {
              const hasTier = article.tier && article.tier !== 'None' && article.tier !== 'Pending';
              const isPublished = article.is_published || article.status === 'Published';
              const isPubFeePaid = article.publication_fee_paid || article.status === 'Pub Fee Paid' || article.status === 'Pub Fee Paid - Verify & Publish' || isPublished;
              const isConfApplied = article.presentation_fee_paid || article.status === 'Presentation Scheduled';
              const hasUnreadUpdate = article.student_unread;

              return (
                <div
                  key={article.id}
                  className={`glass-card rounded-3xl p-8 border transition-all duration-300 relative overflow-hidden ${
                    hasUnreadUpdate
                      ? 'border-amber-500/70 shadow-2xl shadow-amber-500/15 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 ring-1 ring-amber-500/40'
                      : 'border-slate-800 shadow-xl'
                  }`}
                >
                  {/* STAR NOTIFICATION BADGE IF UNREAD ADMIN FEEDBACK */}
                  {hasUnreadUpdate && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black animate-pulse">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      ⭐ NEW UPDATE FROM ADMIN: Feedback / Tier Assigned! Click to Review
                    </div>
                  )}

                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                          {article.category}
                        </span>
                        <TierBadge tier={article.tier || 'None'} />
                        {isPublished && (
                          <span className="text-xs font-bold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-500/40 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Published Live
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-black text-white leading-snug pt-1">{article.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        article.plagiarism_score <= 10 ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' : 'bg-amber-950 text-amber-400 border-amber-500/30'
                      }`}>
                        Plagiarism: {article.plagiarism_score}%
                      </span>
                      <button
                        onClick={() => {
                          if (hasUnreadUpdate && onMarkRead) onMarkRead(article.id);
                          setViewPaperArticle(article);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" /> Read Full Paper
                      </button>
                    </div>
                  </div>

                  {/* Abstract & Content Summary */}
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-1.5">
                    <div className="flex justify-between items-center text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <span>Abstract / Summary:</span>
                      <span>PDF: {article.pdf_url || 'research_paper.pdf'}</span>
                    </div>
                    <p className="line-clamp-2 italic">"{article.abstract}"</p>
                  </div>

                  {/* LIFECYCLE BANNER */}
                  {isPublished ? (
                    <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/40 flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-emerald-300 shadow-lg shadow-emerald-950/40">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        🎉 Published Live by Admin! Your article is now featured on the Main Website Public Showcase.
                      </span>
                      <span className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/50 text-emerald-200">
                        Live Status: Published
                      </span>
                    </div>
                  ) : hasTier ? (
                    <div className="p-4 bg-purple-950/60 rounded-2xl border border-purple-500/40 flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-purple-300 shadow-lg shadow-purple-950/40">
                      <span className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        🎉 Category Approved ({article.tier} Tier)! Re-submission locked. Please pay Publication Fee (PKR 3,000) below to publish live.
                      </span>
                      <span className="bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/50 text-purple-200">
                        {article.tier} Tier
                      </span>
                    </div>
                  ) : null}

                  {/* ADMIN REVIEW & MISTAKES FEEDBACK BOX */}
                  <div className={`p-5 rounded-2xl border space-y-2 transition ${
                    article.status?.includes('Needs Revision') || (!hasTier && article.reviewer_notes)
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : hasTier
                      ? 'bg-purple-950/20 border-purple-500/30'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-2">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" /> Reviewer Comments & Evaluation:
                      </span>
                      <span className="text-slate-300 font-mono text-[11px] bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        Status: <strong className="text-white font-bold">{article.status || 'Under Review'}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 bg-slate-950/90 p-4 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
                      "{article.reviewer_notes || 'Article under active academic evaluation by university committee.'}"
                    </p>

                    {/* Notice if mistakes identified and no tier awarded */}
                    {!hasTier && (
                      <div className="text-[11px] text-amber-300 font-semibold pt-1 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        No Tier awarded yet. You are required to revise the mistakes and click <strong>"Resubmit Revised Article"</strong> below.
                      </div>
                    )}
                  </div>

                  {/* Payment & Receipts Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-500 text-[11px] mr-2">Attached Proofs:</span>

                    {article.submission_receipt_url && (
                      <button
                        onClick={() => setViewProofModal({ title: 'Submission Fee Proof (PKR 1,500)', url: article.submission_receipt_url, type: 'Submission' })}
                        className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 hover:bg-blue-900/60 text-[11px] flex items-center gap-1 font-medium transition"
                      >
                        <ImageIcon className="w-3 h-3 text-blue-400" /> Submission Proof
                      </button>
                    )}

                    {article.publication_receipt_url && (
                      <button
                        onClick={() => setViewProofModal({ title: 'Publication Fee Proof (PKR 3,000)', url: article.publication_receipt_url, type: 'Publication' })}
                        className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60 text-[11px] flex items-center gap-1 font-medium transition"
                      >
                        <ImageIcon className="w-3 h-3 text-purple-400" /> Pub Fee Proof
                      </button>
                    )}

                    {article.presentation_receipt_url && (
                      <button
                        onClick={() => setViewProofModal({ title: 'Conference Presentation Proof (PKR 5,000)', url: article.presentation_receipt_url, type: 'Conference' })}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 text-[11px] flex items-center gap-1 font-medium transition"
                      >
                        <ImageIcon className="w-3 h-3 text-emerald-400" /> Conf Pitch Proof
                      </button>
                    )}
                  </div>

                  {/* STRICT CONDITIONAL LIFECYCLE ACTION BUTTONS */}
                  <div className="pt-5 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
                    <span className="text-xs text-slate-500">Submitted on: {article.created_at || '2026-09-01'}</span>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* CASE 1: NO TIER / PENDING -> ONLY RESUBMIT IS ALLOWED (PUBLISH BUTTON IS HIDDEN) */}
                      {!hasTier && (
                        <button
                          onClick={() => {
                            if (hasUnreadUpdate && onMarkRead) onMarkRead(article.id);
                            setTitle(article.title);
                            setCategory(article.category);
                            setAbstract(article.abstract);
                            setFullText(article.full_text || article.abstract);
                            setActiveRevisionArticle(article);
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-600/30"
                        >
                          <RefreshCw className="w-4 h-4" /> Resubmit Revised Article (Corrected Text & PDF)
                        </button>
                      )}

                      {/* CASE 2: TIER AWARDED (Silver/Gold/Platinum) BUT NOT PUBLISHED -> RESUBMIT GONE, PAY PUBLICATION FEE SHOWN */}
                      {hasTier && !isPublished && !article.publication_receipt_url && (
                        <button
                          onClick={() => {
                            if (hasUnreadUpdate && onMarkRead) onMarkRead(article.id);
                            setSenderBank('HBL Mobile App');
                            setTransactionId(`TRX-${Math.floor(100000 + Math.random() * 900000)}`);
                            setActivePubFeeArticle(article);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition shadow-xl shadow-purple-600/40 flex items-center gap-2 transform hover:-translate-y-0.5 animate-pulse"
                        >
                          <CreditCard className="w-4 h-4" /> Pay Publication Fee (PKR 3,000) & Upload Proof
                        </button>
                      )}

                      {hasTier && !isPublished && article.publication_receipt_url && (
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-300 bg-purple-950/80 px-4 py-2.5 rounded-xl border border-purple-500/40">
                          <CheckCircle className="w-4 h-4 text-purple-400" /> Publication Fee Proof Uploaded — Awaiting Admin Verification & Live Publishing
                        </div>
                      )}

                      {/* CASE 3: PUBLISHED LIVE -> RESUBMIT & PUBLISH ARE GONE, CONFERENCE PRESENTATION BUTTON SHOWN */}
                      {isPublished && !isConfApplied && (
                        <button
                          onClick={() => {
                            if (hasUnreadUpdate && onMarkRead) onMarkRead(article.id);
                            setPresentingStudentsList(user.full_name);
                            setTransactionId(`TRX-${Math.floor(100000 + Math.random() * 900000)}`);
                            setActiveConfFeeArticle(article);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs transition shadow-xl shadow-emerald-600/40 flex items-center gap-2 transform hover:-translate-y-0.5"
                        >
                          <Calendar className="w-4 h-4" /> Apply for Conference Live Pitch Presentation (to Investors)
                        </button>
                      )}

                      {/* CASE 4: CONFERENCE SCHEDULED */}
                      {isPublished && isConfApplied && (
                        <span className="text-xs font-black text-emerald-300 bg-emerald-950/90 px-4 py-2.5 rounded-xl border border-emerald-500/50 flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                          <CheckCircle className="w-4 h-4 text-emerald-400" /> 🎤 Presentation Approved & Scheduled for Summit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW ARTICLE & SUBMISSION FEE CHALLAN PROOF MODAL          */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-2xl font-black text-white">Submit Research Paper for Review</h3>
              <p className="text-xs text-slate-400 mt-1">
                Fill academic paper header, paste full article content, and attach University Challan fee receipt proof.
              </p>
            </div>

            {/* OFFICIAL UNIVERSITY SUBMISSION CHALLAN VOUCHER */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-4 h-4" /> Official University Fee Challan Voucher
                </span>
                <span className="text-xs font-mono text-slate-400">Voucher #: <strong>CHAL-SUB-84920</strong></span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Bank (HBL / UBL)</span>
                  <span className="text-slate-200 font-semibold">0042-79001928-03</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">JazzCash / Easypaisa</span>
                  <span className="text-slate-200 font-semibold">03482727605</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Title</span>
                  <span className="text-slate-200 font-semibold">Univ Research Fund</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Submission Fee</span>
                  <span className="text-emerald-400 font-black text-sm">PKR 1,500</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadChallanPdf('Paper Review & Submission Fee', 'PKR 1,500', 'CHAL-SUB-84920')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center gap-2 border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" /> Download Printable Challan PDF
                </button>
              </div>
            </div>

            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">1. Research Paper Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Driven Solar Grid Optimization for Smart Cities"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">2. Research Domain Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Computer Science & AI">Artificial Intelligence & Data Science</option>
                    <option value="Cybersecurity & Quantum Computing">Cybersecurity & Quantum Computing</option>
                    <option value="Biotechnology & Healthcare">Biotechnology & Medical Sciences</option>
                    <option value="Robotics & AgriTech">Robotics & AgriTech Innovations</option>
                    <option value="Renewable Clean Energy">Renewable Clean Energy & Smart Grids</option>
                    <option value="Islamic Studies & Ethics">Islamic Studies & Ethics</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">3. Research Paper PDF Document</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files[0] && setPdfFileName(e.target.files[0].name)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                  {pdfFileName && <span className="text-[11px] text-blue-400 mt-1 block">Selected: {pdfFileName}</span>}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">4. Abstract Summary *</label>
                <textarea
                  rows="2"
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Provide concise abstract of objective, novelty, and expected outcome..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">
                  5. Full Paper Content / Description (Paste Complete Academic Paper Here) *
                </label>
                <textarea
                  rows="6"
                  required
                  value={fullText}
                  onChange={(e) => setFullText(e.target.value)}
                  placeholder="1. INTRODUCTION & PROBLEM STATEMENT:&#10;Explain background and motivation...&#10;&#10;2. METHODOLOGY & DATASET:&#10;Describe framework, architecture, and mathematical foundation...&#10;&#10;3. EXPERIMENTAL RESULTS & CONCLUSION:&#10;Summarize findings, accuracy, and commercial application..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* PAYMENT PROOF UPLOAD SECTION */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" /> Attach Challan / Bank Payment Proof (Mandatory)
                  </span>
                  <span className="text-[11px] text-slate-400">Fee: <strong>PKR 1,500</strong></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Paid Via Bank / App</label>
                    <select
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="HBL Mobile App">HBL Mobile App</option>
                      <option value="UBL Digital">UBL Digital</option>
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="Bank Branch Cash Challan">Bank Branch Cash Challan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Transaction ID / Ref #</label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. TRX-948201"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Upload Paid Challan / Screenshot Proof (PNG, JPG, PDF)</label>
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-950/60 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, setSubReceiptPreview, setSubReceiptName)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-6 h-6 text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-300">
                        {subReceiptName ? `Uploaded: ${subReceiptName}` : 'Click to Upload Challan Payment Proof Screenshot'}
                      </span>
                      <span className="text-[10px] text-slate-500">Stored in database for Admin review verification</span>
                    </div>
                  </div>

                  {subReceiptPreview && (
                    <div className="mt-3 text-center">
                      <img src={subReceiptPreview} alt="Proof Preview" className="h-24 mx-auto rounded-xl border border-emerald-500/40 object-cover shadow-lg" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-5 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Paper & Challan Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESUBMIT REVISED ARTICLE MODAL (FOR IDENTIFIED MISTAKES)         */}
      {/* ========================================================================= */}
      {activeRevisionArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/40 space-y-5 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setActiveRevisionArticle(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block mb-2">
                ⭐ Revision Mode (Free Re-Submission)
              </span>
              <h3 className="text-2xl font-black text-white">Resubmit Corrected Article</h3>
              <p className="text-xs text-slate-400 mt-1">
                Fix the mistakes highlighted by the Admin below, update your full article text, and re-submit for evaluation.
              </p>
            </div>

            {/* ADMIN FEEDBACK REMINDER */}
            <div className="bg-amber-950/40 p-4 rounded-2xl border border-amber-500/40 text-xs space-y-1 text-slate-200">
              <strong className="text-amber-400 block">Admin Feedback / Mistakes to Fix:</strong>
              <p className="italic">"{activeRevisionArticle.reviewer_notes || 'Please correct methodologies and formatting.'}"</p>
            </div>

            <form onSubmit={handleRevisionSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">Article Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">Updated Abstract</label>
                <textarea
                  rows="2"
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">
                  Corrected Full Article Content (Paste Revised Version)
                </label>
                <textarea
                  rows="8"
                  required
                  value={fullText}
                  onChange={(e) => setFullText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">Upload Revised PDF File (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files[0] && setPdfFileName(e.target.files[0].name)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                />
                {pdfFileName && <span className="text-[11px] text-amber-400 mt-1 block">New File: {pdfFileName}</span>}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveRevisionArticle(null)}
                  className="px-5 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-amber-600/30 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Resubmit Corrected Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PAY PUBLICATION FEE & UPLOAD PROOF MODAL                         */}
      {/* ========================================================================= */}
      {activePubFeeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/40 space-y-5 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setActivePubFeeArticle(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-block mb-2">
                🎉 Congratulations! Tier Awarded: {activePubFeeArticle.tier}
              </span>
              <h3 className="text-2xl font-black text-white">Publication Fee Challan & Verification</h3>
              <p className="text-xs text-slate-400 mt-1">
                Paper: <strong>{activePubFeeArticle.title}</strong>
              </p>
            </div>

            {/* PUBLICATION FEE CHALLAN BOX */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-4 h-4" /> University Publication Challan
                </span>
                <span className="text-xs font-mono text-slate-400">Voucher #: <strong>CHAL-PUB-99210</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">HBL / UBL Account</span>
                  <span className="text-slate-200 font-semibold">0042-79001928-03</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">JazzCash / Easypaisa</span>
                  <span className="text-slate-200 font-semibold">03482727605</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Official Publication Fee</span>
                  <span className="text-purple-400 font-black text-base">PKR 3,000</span>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handleDownloadChallanPdf('Live Web Publication Fee', 'PKR 3,000', 'CHAL-PUB-99210')}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[11px] transition flex items-center gap-1.5 border border-slate-700"
                  >
                    <Printer className="w-3 h-3 text-purple-400" /> Print Challan
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handlePublicationPaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Paid Via Bank / App</label>
                  <select
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="HBL Mobile App">HBL Mobile App</option>
                    <option value="UBL Digital">UBL Digital</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Bank Branch Cash Challan">Bank Branch Cash Challan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Transaction ID / Ref #</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-bold">
                  Upload Publication Challan / Receipt Screenshot (Mandatory)
                </label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-4 text-center bg-slate-900/60 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, setPayReceiptPreview, setPayReceiptName)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-6 h-6 text-purple-400" />
                    <span className="text-xs font-semibold text-slate-300">
                      {payReceiptName ? `Uploaded: ${payReceiptName}` : 'Click to Upload Publication Fee Screenshot'}
                    </span>
                    <span className="text-[10px] text-slate-500">Admin will verify this screenshot before live publishing</span>
                  </div>
                </div>

                {payReceiptPreview && (
                  <div className="mt-3 text-center">
                    <img src={payReceiptPreview} alt="Pub Proof Preview" className="h-24 mx-auto rounded-xl border border-purple-500/40 object-cover shadow-lg" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActivePubFeeArticle(null)}
                  className="px-5 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Proof & Request Publication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: APPLY FOR CONFERENCE LIVE PITCH PRESENTATION                    */}
      {/* ========================================================================= */}
      {activeConfFeeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/40 space-y-5 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setActiveConfFeeArticle(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block mb-2">
                🎤 Investor Pitch Application
              </span>
              <h3 className="text-2xl font-black text-white">Conference Live Presentation</h3>
              <p className="text-xs text-slate-400 mt-1">
                Present your research live on stage and stream to venture capital investors and corporate businessmen.
              </p>
            </div>

            {/* CONFERENCE PRESENTATION FEE CHALLAN BOX */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-4 h-4" /> Presentation & Conference Kit Fee
                </span>
                <span className="text-xs font-mono text-slate-400">Voucher #: <strong>CHAL-CONF-44120</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">HBL / UBL Account</span>
                  <span className="text-slate-200 font-semibold">0042-79001928-03</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">JazzCash / Easypaisa</span>
                  <span className="text-slate-200 font-semibold">03482727605</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Presentation Fee</span>
                  <span className="text-emerald-400 font-black text-base">PKR 5,000</span>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handleDownloadChallanPdf('Conference Live Presentation Fee', 'PKR 5,000', 'CHAL-CONF-44120')}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[11px] transition flex items-center gap-1.5 border border-slate-700"
                  >
                    <Printer className="w-3 h-3 text-emerald-400" /> Print Challan
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleConferenceApplySubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">
                  Presenting Authors / Students (1 to 4 Co-Authors) *
                </label>
                <input
                  type="text"
                  required
                  value={presentingStudentsList}
                  onChange={(e) => setPresentingStudentsList(e.target.value)}
                  placeholder="e.g. Ali Ahmed, Bazigh Minhas, Dr. Fatima Khan"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">These names will appear on the conference schedule post</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Paid Via Bank / App</label>
                  <select
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="HBL Mobile App">HBL Mobile App</option>
                    <option value="UBL Digital">UBL Digital</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Bank Branch Cash Challan">Bank Branch Cash Challan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Transaction ID / Ref #</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-bold">
                  Upload Conference Fee Receipt Screenshot (Mandatory)
                </label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-900/60 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, setPayReceiptPreview, setPayReceiptName)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-300">
                      {payReceiptName ? `Uploaded: ${payReceiptName}` : 'Click to Upload Conference Fee Screenshot'}
                    </span>
                    <span className="text-[10px] text-slate-500">Admin will verify and schedule your slot on the summit post</span>
                  </div>
                </div>

                {payReceiptPreview && (
                  <div className="mt-3 text-center">
                    <img src={payReceiptPreview} alt="Conf Proof Preview" className="h-24 mx-auto rounded-xl border border-emerald-500/40 object-cover shadow-lg" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveConfFeeArticle(null)}
                  className="px-5 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Application & Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: FULL ACADEMIC PAPER VIEWER MODAL                                */}
      {/* ========================================================================= */}
      {viewPaperArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-3xl glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setViewPaperArticle(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {viewPaperArticle.category}
                </span>
                <TierBadge tier={viewPaperArticle.tier || 'None'} />
              </div>
              <h2 className="text-2xl font-black text-white">{viewPaperArticle.title}</h2>
              <div className="text-xs text-slate-400">
                Author: <strong>{viewPaperArticle.student_name}</strong> | Submitted: {viewPaperArticle.created_at}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Abstract:</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{viewPaperArticle.abstract}</p>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Paper Content:</h4>
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                  {viewPaperArticle.full_text || viewPaperArticle.abstract}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewPaperArticle(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: PAYMENT PROOF SCREENSHOT VIEWER MODAL                            */}
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
                alt="Payment Proof"
                className="max-h-[55vh] w-auto rounded-xl object-contain"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewProofModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
