import React, { useState } from 'react';
import { ShieldCheck, Edit3, Award, Sparkles, CheckCircle2, Search } from 'lucide-react';
import { TierBadge } from '../components/TierBadge';

export const AdminDashboard = ({ articles, onUpdateArticle, onPublishArticle }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [tier, setTier] = useState('Silver');
  const [plagiarismScore, setPlagiarismScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(true);

  const handleEditClick = (art) => {
    setSelectedArticle(art);
    setTier(art.tier !== 'Pending' ? art.tier : 'Silver');
    setPlagiarismScore(art.plagiarism_score || 5);
    setNotes(art.reviewer_notes || '');
    setPaymentVerified(art.payment_verified || true);
  };

  const handleSaveReview = (e, shouldPublish = false) => {
    e.preventDefault();
    onUpdateArticle(selectedArticle.id, {
      tier,
      plagiarism_score: parseInt(plagiarismScore),
      reviewer_notes: notes,
      status: shouldPublish ? 'Published' : 'Reviewed & Revision Sent',
      payment_verified: paymentVerified,
      published: shouldPublish
    });
    setSelectedArticle(null);
  };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500" /> Academic Reviewer & Admin Portal
          </h1>
          <p className="text-slate-400 mt-1">Verify Challan Payment Receipts, Review Plagiarism & Mistakes, and Publish Papers.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400">
            Total Submissions: <strong className="text-white text-sm ml-1">{articles.length}</strong>
          </div>
        </div>
      </div>

      {/* Articles Management Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-white">Student Research Submissions</h2>
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
                <th className="py-3 px-4">Student & Paper</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Challan Receipt</th>
                <th className="py-3 px-4">Plagiarism</th>
                <th className="py-3 px-4">Tier Category</th>
                <th className="py-3 px-4">Publish Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredArticles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-4 px-4">
                    <div className="font-bold text-white">{art.title}</div>
                    <div className="text-xs text-slate-400">Author: {art.student_name}</div>
                    {art.fileName && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-red-400 font-semibold">📄 {art.fileName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([`%PDF-1.5\n% Official University Conference Article PDF Document\nTitle: ${art.title}\nAuthor: ${art.student_name}\nDepartment: ${art.category}\n\nAbstract:\n${art.abstract}`], { type: 'application/pdf' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = art.fileName || 'submitted_paper.pdf';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="text-[11px] bg-red-500/20 text-red-300 hover:bg-red-500/30 px-2.5 py-1 rounded-lg border border-red-500/30 font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          📥 Download PDF File
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-300">{art.category}</td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                      ✓ Paid Receipt Verified
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      art.plagiarism_score <= 10 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    }`}>
                      {art.plagiarism_score}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <TierBadge tier={art.tier} />
                  </td>
                  <td className="py-4 px-4">
                    {art.published ? (
                      <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/30">
                        ✨ Officially Published
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                        {art.status || 'Under Review'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleEditClick(art)}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Review & Publish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Publish Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xl font-bold text-white mb-1">Admin Review & Final Publication</h3>
            <p className="text-xs text-slate-400">{selectedArticle.title}</p>

            <form className="space-y-4">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Payment Challan Status:</span>
                  <span className="text-emerald-400 font-bold">✓ Fee Receipt Verified</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Student Uploaded Document:</span>
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    📄 {selectedArticle.fileName || 'submitted_paper.pdf'}
                  </span>
                </div>
              </div>

              {/* Admin Document PDF Preview / Download Action */}
              <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-500/30 flex justify-between items-center text-xs">
                <span className="text-blue-300">Inspect Full Article Document:</span>
                <button
                  type="button"
                  onClick={() => {
                    const pdfContent = `%PDF-1.5\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >>\nendobj\n4 0 obj\n<< /Length 200 >>\nstream\nBT /F1 12 Tf 50 750 Td (Official University Research Paper) Tj 50 720 Td (Title: ${selectedArticle.title}) Tj 50 690 Td (Author: ${selectedArticle.student_name}) Tj 50 660 Td (Department: ${selectedArticle.category}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000220 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n470\n%%EOF`;
                    const blob = new Blob([pdfContent], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  👁️ Open & Read PDF Document
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Department Category Assessment (Admin Re-assign if needed)</label>
                <select
                  value={selectedArticle.category || 'Computer Science & AI'}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Islamic Studies & Theology">Islamic Studies & Theology (اسلامیات)</option>
                  <option value="Pakistan Studies & History">Pakistan Studies & History (مطالعہ پاکستان)</option>
                  <option value="International Relations & Politics">International Relations & Politics</option>
                  <option value="Computer Science & AI">Computer Science & Artificial Intelligence</option>
                  <option value="Software Engineering & Security">Software Engineering & Cyber Security</option>
                  <option value="Business Administration & Finance">Business Administration & Finance</option>
                  <option value="Biotechnology & Healthcare">Biotechnology & Medical Sciences</option>
                </select>
              </div>

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
                <label className="text-xs text-slate-400 block mb-1">Assign Category Performance Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTier('Silver')}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      tier === 'Silver' ? 'bg-slate-700 text-white border-slate-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🥈 Silver Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier('Gold')}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      tier === 'Gold' ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🥇 Gold Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier('Platinum')}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      tier === 'Platinum' ? 'bg-purple-950 text-purple-300 border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    💎 Platinum Tier
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Reviewer Feedback & Identified Mistakes (Detailed Description Box)</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain mistakes in detail (e.g., Plagiarism is 7%, methodology needs revision in Chapter 2, recommended for Silver Tier)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveReview(e, false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition"
                >
                  Send Mistakes & Review to Student
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveReview(e, true)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-lg shadow-purple-600/30"
                >
                  ✨ Verify Payment & Approve Publication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
