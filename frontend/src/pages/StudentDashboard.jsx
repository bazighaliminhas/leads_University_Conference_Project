import React, { useState } from 'react';
import { PlusCircle, FileText, CheckCircle2, ShieldAlert, Award, AlertCircle, Upload, Send } from 'lucide-react';
import { TierBadge } from '../components/TierBadge';
import { PaymentModal } from '../components/PaymentModal';

export const StudentDashboard = ({ user, articles, onArticleSubmit, onPayPresentation }) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [payType, setPayType] = useState('submission'); // 'submission' or 'presentation'
  const [revisionNotes, setRevisionNotes] = useState('');
  const [activeRevisionId, setActiveRevisionId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    category: 'Computer Science & AI',
    fileName: '',
    receiptName: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, fileName: file.name });
    }
  };

  const handleInitialSubmitClick = (e) => {
    e.preventDefault();
    if (activeRevisionId) {
      // Free Revision Re-submission without extra payment
      onArticleSubmit({
        id: activeRevisionId,
        ...formData,
        status: 'Revised & Sent to Admin'
      });
      setFormData({ title: '', abstract: '', category: 'Computer Science & AI', fileName: '', receiptName: '' });
      setActiveRevisionId(null);
      setShowSubmitModal(false);
    } else {
      setPayType('submission');
      setPayTarget({ title: formData.title || 'New Paper Review Fee', price: 1500 });
    }
  };

  const handlePaymentSuccess = (receiptData) => {
    if (payType === 'submission') {
      onArticleSubmit({
        ...formData,
        receiptName: receiptData.receiptName,
        payment_status: 'Paid & Receipt Uploaded'
      });
      setFormData({ title: '', abstract: '', category: 'Computer Science & AI', fileName: '', receiptName: '' });
      setShowSubmitModal(false);
    } else if (payType === 'presentation') {
      onPayPresentation(payTarget.id, receiptData);
    }
    setPayTarget(null);
  };

  const studentArticles = articles.filter(a =>
    a.student_id === user.id ||
    a.student_name === user.full_name ||
    (user.role === 'student' && (!a.student_id || a.student_name === 'Ali Ahmed'))
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Student Innovation Workspace</h1>
            <p className="text-slate-400 mt-1">Submit PDF articles, view Admin reviewer mistakes feedback, and publish research.</p>
          </div>
          
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <PlusCircle className="w-5 h-5" /> Submit New Article (PDF)
          </button>
        </div>
      </div>

      {/* Submitted Articles List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" /> My Submitted Research Papers
        </h2>

        {studentArticles.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">No articles submitted yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">Click "Submit New Article" to pay submission fee challan and send your PDF paper.</p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition"
            >
              Submit Article
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {studentArticles.map((article) => (
              <div key={article.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                        {article.category}
                      </span>
                      <TierBadge tier={article.tier} />
                      {article.fileName && (
                        <span className="text-xs text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20 flex items-center gap-1">
                          📄 {article.fileName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{article.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1.5 rounded-lg border ${
                      article.plagiarism_score <= 10 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30' : 'bg-amber-950/50 text-amber-400 border-amber-500/30'
                    }`}>
                      Plagiarism: <strong>{article.plagiarism_score}%</strong>
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  {article.abstract}
                </p>

                {/* Admin Feedback & Identified Mistakes Notes */}
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-400">Admin Reviewer Feedback & Mistakes Identified:</span>
                      <span className="text-[11px] text-slate-400 font-mono">Status: {article.status || 'Under Review'}</span>
                    </div>
                    <p className="text-sm text-slate-200 italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                      "{article.reviewer_notes || 'Review in progress by academic committee.'}"
                    </p>
                  </div>
                </div>

                {/* Presentation Slot & Publication Action */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-slate-800/80">
                  <span className="text-xs text-slate-500">Submitted on: {article.created_at}</span>

                  {article.published ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-950/70 px-4 py-2 rounded-xl border border-purple-500/50 shadow-lg shadow-purple-900/20">
                      ✨ Officially Published Article
                    </span>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Free Re-submission Button for Fixes */}
                      {article.reviewer_notes && !article.published && (
                        <button
                          onClick={() => {
                            setActiveRevisionId(article.id);
                            setShowSubmitModal(true);
                          }}
                          className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          🔄 Re-submit Corrected PDF (Free Revision)
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setPayType('presentation');
                          setPayTarget({ id: article.id, title: `Publish & Pitch Fee: ${article.title}`, price: 3000 });
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
                      >
                        💳 Pay Publication Fee (PKR 3,000 Challan) & Submit for Publishing
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Article Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-slate-800 relative">
            <h3 className="text-xl font-bold text-white mb-1">Submit Article for Academic Review</h3>
            <p className="text-xs text-slate-400 mb-6">Review submission fee: PKR 1,500 via Official University Challan Voucher</p>

            <form onSubmit={handleInitialSubmitClick} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Article / Project Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Smart IoT Agriculture System"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">University Department / Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <optgroup label="📚 General & Humanities">
                    <option value="Islamic Studies & Theology">Islamic Studies & Theology (اسلامیات)</option>
                    <option value="Pakistan Studies & History">Pakistan Studies & History (مطالعہ پاکستان)</option>
                    <option value="International Relations & Politics">International Relations & Political Science</option>
                    <option value="Law & Legal Studies">Law & Legal Studies</option>
                    <option value="English Literature & Linguistics">English Literature & Linguistics</option>
                    <option value="Urdu & Regional Languages">Urdu & Oriental Languages</option>
                  </optgroup>
                  <optgroup label="💻 Technology & Engineering">
                    <option value="Computer Science & AI">Computer Science & Artificial Intelligence</option>
                    <option value="Software Engineering & Security">Software Engineering & Cyber Security</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                    <option value="Civil & Environmental Engineering">Civil & Architectural Engineering</option>
                  </optgroup>
                  <optgroup label="💼 Business & Sciences">
                    <option value="Business Administration & Finance">Business Administration & Finance</option>
                    <option value="Economics & Commerce">Economics & Commerce</option>
                    <option value="Biotechnology & Healthcare">Biotechnology & Medical Sciences</option>
                    <option value="Physics & Mathematics">Physics, Chemistry & Mathematics</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Upload Full Research Article (PDF File)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
                {formData.fileName && (
                  <p className="text-xs text-emerald-400 mt-1 font-medium">Selected File: {formData.fileName}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Abstract & Core Innovations Summary</label>
                <textarea
                  required
                  rows="3"
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="Describe your research, methodology, and practical advantages..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition"
                >
                  Proceed to Challan Fee & Upload Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Challan & Receipt Modal */}
      {payTarget && (
        <PaymentModal
          isOpen={!!payTarget}
          onClose={() => setPayTarget(null)}
          title={payTarget.title || 'Official University Fee Voucher'}
          amount={payTarget.price || 1500}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
