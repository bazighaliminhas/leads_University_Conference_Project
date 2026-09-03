import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  DollarSign,
  Award,
  Sparkles,
  RefreshCw,
  Calendar,
  Send,
  Download,
  Eye,
  Check,
  CreditCard,
  Image as ImageIcon,
  FileCheck,
  Building2,
  Printer,
  UserCheck,
  Hash,
  Phone,
  Landmark
} from 'lucide-react';
import { TierBadge } from '../components/TierBadge';

export const StudentDashboard = ({
  user,
  articles = [],
  onArticleSubmit,
  onReviseArticle,
  onPayPublicationFee,
  onApplyConference
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeRevisionId, setActiveRevisionId] = useState(null);
  const [activePubFeeId, setActivePubFeeId] = useState(null);
  const [activeConfFeeId, setActiveConfFeeId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Computer Science & AI');
  const [abstract, setAbstract] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [subReceiptName, setSubReceiptName] = useState('');
  const [pubReceiptName, setPubReceiptName] = useState('');
  const [presReceiptName, setPresReceiptName] = useState('');

  // Extended Payment Details State
  const [senderBank, setSenderBank] = useState('HBL Mobile App');
  const [transactionId, setTransactionId] = useState('TID-9281048201');
  const [senderMobile, setSenderMobile] = useState('0300-1234567');
  const [presentingStudentsList, setPresentingStudentsList] = useState('');

  const studentArticles = articles.filter(
    a => a.student_id === user.id || a.student_name === user.full_name
  );

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFileName(file.name);
    }
  };

  const handleSubReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubReceiptName(file.name);
    }
  };

  const handlePubReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPubReceiptName(file.name);
    }
  };

  const handlePresReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPresReceiptName(file.name);
    }
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    onArticleSubmit({
      title,
      category,
      abstract,
      student_id: user.id,
      student_name: user.full_name,
      pdf_url: pdfFileName || 'submitted_paper.pdf',
      submission_receipt_url: subReceiptName || 'challan_receipt.png',
      plagiarism_score: 4,
      tier: 'None',
      status: 'Submitted - Awaiting Admin Review'
    });
    resetForm();
  };

  const handleRevisionSubmit = (e) => {
    e.preventDefault();
    if (onReviseArticle && activeRevisionId) {
      onReviseArticle(activeRevisionId, {
        title,
        abstract,
        pdf_url: pdfFileName || 'revised_paper_v2.pdf'
      });
      alert('Corrected PDF & Article revised successfully! Sent to Admin for re-evaluation.');
      resetForm();
    }
  };

  const handlePublicationFeeSubmit = (e) => {
    e.preventDefault();
    if (onPayPublicationFee && activePubFeeId) {
      onPayPublicationFee(activePubFeeId, {
        receipt_url: pubReceiptName || 'pub_challan_receipt.png',
        sender_bank: senderBank,
        transaction_id: transactionId,
        sender_mobile: senderMobile
      });
      alert('Publication fee receipt and Bank Payment details submitted successfully! Admin will verify your payment and publish your paper live.');
      resetForm();
    }
  };

  const handleConferenceApplySubmit = (e) => {
    e.preventDefault();
    if (onApplyConference && activeConfFeeId) {
      onApplyConference(activeConfFeeId, {
        receipt_url: presReceiptName || 'pres_challan_receipt.png',
        presenting_students_list: presentingStudentsList || user.full_name,
        sender_bank: senderBank,
        transaction_id: transactionId,
        sender_mobile: senderMobile
      });
      alert('Conference presentation fee receipt and Presenters list (1 to 4 students) submitted! Admin will verify and schedule your presentation.');
      resetForm();
    }
  };

  // Generate Official Bank Challan PDF for Student to Print & Pay
  const handleDownloadChallanPdf = (typeTitle, feeAmount, voucherNo) => {
    const cleanStr = (str) => (str || '').replace(/[\(\)\\]/g, ' ');
    const studentName = cleanStr(user.full_name || 'Student Researcher');

    const pdfHeader = `%PDF-1.5\n%\xFF\xFF\xFF\xFF\n`;
    const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`;

    const streamText = `BT
/F1 18 Tf 50 740 Td (OFFICIAL UNIVERSITY BANK CHALLAN VOUCHER) Tj
/F1 12 Tf 0 -25 Td (Voucher No: ${voucherNo}) Tj
0 -20 Td (Issue Date: 2026-09-02 | Due Date: 2026-09-20) Tj
0 -25 Td (Student Name: ${studentName}) Tj
0 -20 Td (Fee Description: ${cleanStr(typeTitle)}) Tj
0 -30 Td (Bank Name: Habib Bank Limited - HBL Main Branch) Tj
0 -20 Td (Account Title: University Innovation Research Fund) Tj
0 -20 Td (Account Number: 0042-79001928-03) Tj
/F1 16 Tf 0 -35 Td (TOTAL PAYABLE AMOUNT: ${feeAmount}) Tj
/F1 10 Tf 0 -40 Td (Note: Pay at any HBL branch or via HBL Mobile App. Upload screenshot of paid receipt.) Tj
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
    a.download = `University_Bank_Challan_${voucherNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setTitle('');
    setAbstract('');
    setPdfFileName('');
    setSubReceiptName('');
    setPubReceiptName('');
    setPresReceiptName('');
    setSenderBank('HBL Mobile App');
    setTransactionId('TID-9281048201');
    setSenderMobile('0300-1234567');
    setPresentingStudentsList('');
    setShowSubmitModal(false);
    setActiveRevisionId(null);
    setActivePubFeeId(null);
    setActiveConfFeeId(null);
  };

  const getStepStatus = (art) => {
    const isSubmitted = true;
    const isReviewed = art.reviewer_notes || (art.tier && art.tier !== 'None') || art.status === 'Approved' || art.status === 'Needs Revision';
    const isApproved = art.tier && art.tier !== 'None' && art.tier !== 'Pending';
    const isPubFeePaid = art.publication_fee_paid || art.status === 'Pub Fee Paid' || art.status === 'Published';
    const isPublished = (art.status === 'Published' || (art.is_published && art.published)) && art.publication_fee_paid;
    const isConfApplied = art.presentation_fee_paid || art.status === 'Presentation Scheduled';

    return { isSubmitted, isReviewed, isApproved, isPubFeePaid, isPublished, isConfApplied };
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" /> Student Researcher Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Submit Papers, Upload Receipts, Fix Identified Mistakes, and Apply for Conference Presentation.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowSubmitModal(true);
          }}
          className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Submit New Research Article
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">My Submissions & Publication Lifecycle</h2>

        {studentArticles.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 text-slate-400 space-y-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm">You haven't submitted any research papers yet. Click "Submit New Research Article" to start.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {studentArticles.map((article) => {
              const { isSubmitted, isReviewed, isApproved, isPubFeePaid, isPublished, isConfApplied } = getStepStatus(article);

              return (
                <div key={article.id} className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 relative overflow-hidden">
                  {/* Article Title & Department */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                          {article.category}
                        </span>
                        <TierBadge tier={article.tier || 'None'} />
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-snug">{article.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        article.plagiarism_score <= 10 ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' : 'bg-amber-950 text-amber-400 border-amber-500/30'
                      }`}>
                        Plagiarism: {article.plagiarism_score}%
                      </span>
                    </div>
                  </div>

                  {/* MULTI-STEP PROGRESS STEPPER */}
                  <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/90 space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Article Lifecycle Progress:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-[11px] font-semibold">
                      <div className={`p-2.5 rounded-xl border ${isSubmitted ? 'bg-blue-950 text-blue-300 border-blue-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        1. Submitted + Receipt
                      </div>
                      <div className={`p-2.5 rounded-xl border ${isReviewed ? 'bg-blue-950 text-blue-300 border-blue-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        2. Admin Review
                      </div>
                      <div className={`p-2.5 rounded-xl border ${article.status === 'Needs Revision' ? 'bg-amber-950 text-amber-300 border-amber-500/40 shadow-md' : isApproved ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        3. Mistakes / Fixes
                      </div>
                      <div className={`p-2.5 rounded-xl border ${isApproved ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        4. Tier Awarded
                      </div>
                      <div className={`p-2.5 rounded-xl border ${isPubFeePaid ? 'bg-purple-950 text-purple-300 border-purple-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        5. Pub Fee Paid
                      </div>
                      <div className={`p-2.5 rounded-xl border ${isPublished ? 'bg-purple-950 text-purple-300 border-purple-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        6. Published Live
                      </div>
                      <div className={`p-2.5 rounded-xl border ${isConfApplied ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        7. Conf Presentation
                      </div>
                    </div>
                  </div>

                  {/* Abstract Display */}
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 text-xs leading-relaxed text-slate-300">
                    <strong className="text-slate-400 block mb-1">Abstract & Summary:</strong>
                    "{article.abstract}"
                  </div>

                  {/* ADMIN REVIEWER FEEDBACK & IDENTIFIED MISTAKES BOX */}
                  <div className={`p-5 rounded-2xl border space-y-2 transition ${
                    article.status === 'Needs Revision'
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" /> Admin Reviewer Notes & Identified Mistakes:
                      </span>
                      <span className="text-slate-400 font-mono">Status: <strong className="text-amber-300 font-bold">{article.status || 'Under Review'}</strong></span>
                    </div>
                    <p className="text-xs text-slate-200 italic bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                      "{article.reviewer_notes || 'Review in progress by university academic committee.'}"
                    </p>
                    {article.status === 'Needs Revision' && (
                      <div className="text-[11px] text-amber-300 font-semibold pt-1 flex items-center gap-1">
                        ⚠️ Action Required: Admin requested fixes. Click "Re-submit Corrected PDF (Free Revision)" below to upload your corrected file.
                      </div>
                    )}
                  </div>

                  {/* LIFECYCLE ACTION BUTTONS */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
                    <span className="text-xs text-slate-500">Submitted: {article.created_at || 'Recently'}</span>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* 1. Free Re-submission Button for Fixes */}
                      {(!isPublished || article.status === 'Needs Revision' || article.status === 'Revised' || article.status === 'Submitted - Awaiting Admin Review' || article.status === 'Under Review') && (
                        <button
                          onClick={() => {
                            setTitle(article.title);
                            setAbstract(article.abstract);
                            setActiveRevisionId(article.id);
                          }}
                          className="px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Re-submit Corrected PDF (Free Revision)
                        </button>
                      )}

                      {/* 2. Pay Publication Fee Button */}
                      {isApproved && !isPubFeePaid && (
                        <button
                          onClick={() => setActivePubFeeId(article.id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" /> Pay Publication Fee & Upload Proof
                        </button>
                      )}

                      {/* 3. Published Status Badge */}
                      {isPublished && (
                        <span className="text-xs font-bold text-purple-300 bg-purple-950/80 px-4 py-2 rounded-xl border border-purple-500/40 flex items-center gap-1.5">
                          ✨ Officially Published on Main Site
                        </span>
                      )}

                      {/* 4. Apply for Conference Presentation Button */}
                      {!isConfApplied && (
                        <button
                          onClick={() => {
                            setPresentingStudentsList(user.full_name);
                            setActiveConfFeeId(article.id);
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" /> Apply for Conference Presentation (1 to 4 Presenters)
                        </button>
                      )}

                      {isConfApplied && (
                        <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-500/40 flex items-center gap-1.5">
                          🎤 Conference Presentation Scheduled
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

      {/* MODAL 1: NEW ARTICLE SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">Submit Article for Academic Review</h3>

            {/* BANK CHALLAN VOUCHER INFO BOX */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> OFFICIAL UNIVERSITY BANK CHALLAN
                </span>
                <span className="text-[11px] font-mono text-slate-400">Voucher #: <strong>CHAL-SUB-84920</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Bank Name & Branch</span>
                  <span className="text-slate-200 font-semibold">Habib Bank Ltd (HBL Main)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Title</span>
                  <span className="text-slate-200 font-semibold">Univ Research Fund</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Number</span>
                  <span className="text-blue-300 font-mono font-bold">0042-79001928-03</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Review Submission Fee</span>
                  <span className="text-blue-400 font-extrabold text-sm">PKR 1,500</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadChallanPdf('Submission Review Fee', 'PKR 1,500', 'CHAL-SUB-84920')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" /> Download Printable Bank Challan (PDF)
              </button>
            </div>

            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Driven Solar Grid Optimization"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Department Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Computer Science & AI">Computer Science & Artificial Intelligence</option>
                  <option value="Islamic Studies & Theology">Islamic Studies & Theology (اسلاميات)</option>
                  <option value="Pakistan Studies & History">Pakistan Studies & History (مطالعہ پاکستان)</option>
                  <option value="Software Engineering & Security">Software Engineering & Cyber Security</option>
                  <option value="Business Administration & Finance">Business Administration & Finance</option>
                  <option value="Biotechnology & Healthcare">Biotechnology & Medical Sciences</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Abstract & Summary</label>
                <textarea
                  rows="3"
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Describe your research, methodology, and findings..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* PDF FILE UPLOADER */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Upload Research Paper PDF Document</label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-2xl p-4 bg-slate-900/60 transition text-center space-y-2 cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handlePdfFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <Upload className="w-6 h-6 text-blue-400 mx-auto group-hover:scale-110 transition" />
                  <div className="text-xs text-slate-300 font-semibold">
                    {pdfFileName ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <FileCheck className="w-4 h-4 text-emerald-400" /> {pdfFileName} Selected
                      </span>
                    ) : (
                      'Click to Choose PDF File or Drag & Drop'
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">Supports PDF, DOC, DOCX up to 25MB</div>
                </div>
              </div>

              {/* SUBMISSION FEE CHALLAN RECEIPT IMAGE UPLOADER */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Upload Submission Fee Challan Receipt Proof (Image / Screenshot)</label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-purple-500 rounded-2xl p-4 bg-slate-900/60 transition text-center space-y-2 cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSubReceiptFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <ImageIcon className="w-6 h-6 text-purple-400 mx-auto group-hover:scale-110 transition" />
                  <div className="text-xs text-slate-300 font-semibold">
                    {subReceiptName ? (
                      <span className="text-purple-300 font-bold flex items-center justify-center gap-1">
                        <Check className="w-4 h-4 text-purple-400" /> {subReceiptName} Uploaded
                      </span>
                    ) : (
                      'Click to Select Paid Receipt Image / Screenshot'
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">Supports PNG, JPG, JPEG, PDF</div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30"
                >
                  Submit Article & Upload Files
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVISION RE-SUBMISSION MODAL */}
      {activeRevisionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <h3 className="text-xl font-bold text-white mb-1">Re-submit Corrected Paper (Free Revision)</h3>
            <p className="text-xs text-amber-400">Fix identified mistakes mentioned by Admin and upload corrected PDF.</p>

            <form onSubmit={handleRevisionSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Updated Article Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Updated Abstract</label>
                <textarea
                  rows="3"
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* CORRECTED PDF UPLOADER */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Upload Corrected Research Paper PDF</label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-amber-500 rounded-2xl p-4 bg-slate-900/60 transition text-center space-y-2 cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handlePdfFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <Upload className="w-6 h-6 text-amber-400 mx-auto group-hover:scale-110 transition" />
                  <div className="text-xs text-slate-300 font-semibold">
                    {pdfFileName ? (
                      <span className="text-amber-400 font-bold">{pdfFileName} Selected</span>
                    ) : (
                      'Click to Choose Corrected PDF Document'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveRevisionId(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Re-submit Corrected PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PUBLICATION FEE PAYMENT MODAL */}
      {activePubFeeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">Upload Publication Fee Receipt Proof</h3>

            {/* BANK CHALLAN VOUCHER INFO BOX */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> OFFICIAL UNIVERSITY BANK CHALLAN
                </span>
                <span className="text-[11px] font-mono text-slate-400">Voucher #: <strong>CHAL-PUB-92041</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Bank Name & Branch</span>
                  <span className="text-slate-200 font-semibold">Habib Bank Ltd (HBL Main)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Title</span>
                  <span className="text-slate-200 font-semibold">Univ Research Fund</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Number</span>
                  <span className="text-purple-300 font-mono font-bold">0042-79001928-03</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Publication Fee</span>
                  <span className="text-purple-400 font-extrabold text-sm">PKR 3,000</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadChallanPdf('Publication Fee', 'PKR 3,000', 'CHAL-PUB-92041')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-purple-400" /> Download Printable Bank Challan (PDF)
              </button>
            </div>

            <form onSubmit={handlePublicationFeeSubmit} className="space-y-4">
              {/* PAYMENT DETAILS: BANK NAME / APP */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Payment Method / Sender Bank App</label>
                <input
                  type="text"
                  required
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  placeholder="e.g. HBL Mobile App, JazzCash, EasyPaisa, Meezan Bank"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* PAYMENT DETAILS: TRANSACTION ID (TID) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Transaction ID (TID)</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. TID-92041928"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Sender Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={senderMobile}
                    onChange={(e) => setSenderMobile(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* PUBLICATION FEE RECEIPT IMAGE UPLOADER */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Upload Paid Publication Challan Receipt Screenshot</label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-purple-500 rounded-2xl p-4 bg-slate-900/60 transition text-center space-y-2 cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePubReceiptFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <ImageIcon className="w-6 h-6 text-purple-400 mx-auto group-hover:scale-110 transition" />
                  <div className="text-xs text-slate-300 font-semibold">
                    {pubReceiptName ? (
                      <span className="text-purple-300 font-bold">{pubReceiptName} Selected</span>
                    ) : (
                      'Click to Choose Paid Receipt Screenshot'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActivePubFeeId(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-600/30"
                >
                  Submit Receipt & Request Live Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFERENCE PRESENTATION APPLICATION MODAL */}
      {activeConfFeeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">Apply for Conference Presentation</h3>
            <p className="text-xs text-slate-400">Specify 1 to 4 Presenting Student Authors & Upload Presentation Fee Receipt.</p>

            {/* BANK CHALLAN VOUCHER INFO BOX */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> OFFICIAL UNIVERSITY BANK CHALLAN
                </span>
                <span className="text-[11px] font-mono text-slate-400">Voucher #: <strong>CHAL-PRES-77301</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Bank Name & Branch</span>
                  <span className="text-slate-200 font-semibold">Habib Bank Ltd (HBL Main)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Title</span>
                  <span className="text-slate-200 font-semibold">Univ Research Fund</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Number</span>
                  <span className="text-emerald-300 font-mono font-bold">0042-79001928-03</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Presentation Fee</span>
                  <span className="text-emerald-400 font-extrabold text-sm">PKR 2,500</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadChallanPdf('Conference Presentation Fee', 'PKR 2,500', 'CHAL-PRES-77301')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" /> Download Printable Bank Challan (PDF)
              </button>
            </div>

            <form onSubmit={handleConferenceApplySubmit} className="space-y-4">
              {/* PRESENTING STUDENTS (1 TO 4 AUTHORS) */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Presenting Student Names (Enter 1 to 4 Authors Attending Conference)
                </label>
                <textarea
                  rows="2"
                  required
                  value={presentingStudentsList}
                  onChange={(e) => setPresentingStudentsList(e.target.value)}
                  placeholder="e.g. Ali Ahmed (Lead Speaker), Bazigh Minhas (Co-Presenter)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* SENDER BANK / APP */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Payment Method / Sender Bank App</label>
                <input
                  type="text"
                  required
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  placeholder="e.g. HBL Mobile App, JazzCash, EasyPaisa"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* TRANSACTION ID & SENDER MOBILE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Transaction ID (TID)</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. TID-77301928"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Sender Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={senderMobile}
                    onChange={(e) => setSenderMobile(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* PRESENTATION FEE RECEIPT UPLOADER */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Upload Presentation Fee Challan Receipt Screenshot</label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500 rounded-2xl p-4 bg-slate-900/60 transition text-center space-y-2 cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePresReceiptFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <ImageIcon className="w-6 h-6 text-emerald-400 mx-auto group-hover:scale-110 transition" />
                  <div className="text-xs text-slate-300 font-semibold">
                    {presReceiptName ? (
                      <span className="text-emerald-400 font-bold">{presReceiptName} Selected</span>
                    ) : (
                      'Click to Choose Presentation Receipt Screenshot'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveConfFeeId(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/30"
                >
                  Submit Presentation Receipt & Presenters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
