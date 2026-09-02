import React, { useState } from 'react';
import { Briefcase, ThumbsUp, Globe, Video, DollarSign, MessageSquare, CheckCircle } from 'lucide-react';
import { TierBadge } from '../components/TierBadge';

export const InvestorDashboard = ({ user, articles, investorReviews, onSubmitReview }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [decision, setDecision] = useState('Interested to Invest');
  const [benefit, setBenefit] = useState('High Impact');
  const [comments, setComments] = useState('');

  // Articles eligible for pitch presentation
  const pitchableArticles = articles.filter(a => a.presentation_fee_paid || a.tier === 'Platinum' || a.tier === 'Gold');

  const handleSubmitReview = (e) => {
    e.preventDefault();
    onSubmitReview({
      article_id: selectedArticle.id,
      decision,
      benefit_for_country: benefit,
      comments
    });
    setSelectedArticle(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-amber-500" /> Venture Investor & Enterprise Portal
          </h1>
          <p className="text-slate-400 mt-1">Discover top university research innovations, evaluate live student presentations, and pledge funding.</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl text-xs text-amber-400 font-semibold">
          Organization: {user.organization || 'Venture Fund'}
        </div>
      </div>

      {/* Pitched Research Projects */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-amber-400" /> Live Conference Presentation Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pitchableArticles.map((article) => {
            const existingReview = investorReviews.find(r => r.article_id === article.id && (r.investor_name === user.full_name || r.investor_id === user.id));

            return (
              <div key={article.id} className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 glass-card-hover">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <TierBadge tier={article.tier} />
                    <span className="text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      Author: {article.student_name}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">{article.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {article.abstract}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  {existingReview ? (
                    <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle className="w-4 h-4" /> My Decision: {existingReview.decision}
                      </div>
                      <p className="text-slate-300 italic">"{existingReview.comments}"</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
                    >
                      <DollarSign className="w-4 h-4" /> Evaluate & Submit Investment Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-1">Investor Evaluation Form</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedArticle.title}</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Investment & Commercialization Intent</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Interested to Invest">💰 Interested to Invest & Fund</option>
                  <option value="Under Consideration">🔍 Under Consideration for Mentorship</option>
                  <option value="Passed">❌ Passed / Not Right Fit Currently</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Benefit to Country & Local Industry</label>
                <select
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="High Impact">🌟 High Impact for National Economy</option>
                  <option value="Moderate">⚡ Moderate Commercial Advantage</option>
                  <option value="Low">🌱 Early Phase Research</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Detailed Review & Investor Feedback</label>
                <textarea
                  rows="3"
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share feedback on potential funding size, market scalability, or recommendations..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
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
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl text-sm transition"
                >
                  Submit Official Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
