import React, { useState } from 'react';
import { Briefcase, ThumbsUp, Globe, Video, DollarSign, MessageSquare, CheckCircle, X, Sparkles, Building2, TrendingUp, Award, ExternalLink } from 'lucide-react';
import { TierBadge } from '../components/TierBadge';

export const InvestorDashboard = ({ user, articles = [], investorReviews = [], onSubmitReview }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [decision, setDecision] = useState('Interested to Invest');
  const [pledgeAmount, setPledgeAmount] = useState('50,000');
  const [currency, setCurrency] = useState('USD');
  const [dealType, setDealType] = useState('Seed Equity Round');
  const [benefit, setBenefit] = useState('High National Economic & Industrial Impact');
  const [comments, setComments] = useState('');

  // Articles eligible for pitch presentation (Published & Platinum/Gold tier or presentation applicants)
  const pitchableArticles = articles.filter(
    a => a.tier === 'Platinum' || a.tier === 'Gold' || a.presentation_fee_paid || a.status === 'Presentation Scheduled'
  );

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const formattedComments = `[Funding Pledge: ${currency} ${pledgeAmount} • Structure: ${dealType}]\n${comments}`;
    onSubmitReview({
      article_id: selectedArticle.id,
      decision,
      benefit_for_country: benefit,
      comments: formattedComments
    });
    setSelectedArticle(null);
    setComments('');
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0A192F] text-amber-400 border border-amber-400/40 flex items-center justify-center font-black shadow-md">
            <Briefcase className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
                Venture Capital & Investor Portal
              </h1>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                DEAL FLOW
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Lahore Leads University ORIC Innovation Showcase & Student Startup Commercialization Hub.
            </p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#005A9C]" />
          <span>{user?.organization || 'Apex Tech Capital'} ({user?.full_name})</span>
        </div>
      </div>

      {/* Quick Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0A192F] to-[#0F2C59] text-white p-5 rounded-2xl border border-slate-700 shadow-md">
          <div className="flex justify-between items-center text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>Shortlisted Pitch Decks</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black mt-2">{pitchableArticles.length}</div>
          <p className="text-[11px] text-slate-300 mt-1">Top student innovations evaluated & awarded Platinum/Gold.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-emerald-600 text-xs font-bold uppercase tracking-wider">
            <span>My Pledges & Reviews</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {investorReviews.filter(r => r.investor_name === user?.full_name || r.investor_id === user?.id).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct term sheets & funding evaluations submitted.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-blue-600 text-xs font-bold uppercase tracking-wider">
            <span>Incubation Acceleration</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">HEC / ORIC</div>
          <p className="text-[11px] text-slate-500 mt-1">Leads University fast-tracks IP & commercialization grants.</p>
        </div>
      </div>

      {/* Pitched Research Projects */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-[#0A192F] flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-500" /> Nominated Research Projects for Investor Funding
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Showing {pitchableArticles.length} Project{pitchableArticles.length === 1 ? '' : 's'}
          </span>
        </div>

        {pitchableArticles.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-2">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No projects currently nominated for presentation</h3>
            <p className="text-xs text-slate-500">Once students receive Platinum or Gold tiers, their projects will appear here for evaluation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pitchableArticles.map((article) => {
              const existingReview = investorReviews.find(
                r => r.article_id === article.id && (r.investor_name === user?.full_name || r.investor_id === user?.id)
              );

              return (
                <div
                  key={article.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <TierBadge tier={article.tier} />
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        Author: <strong>{article.student_name}</strong>
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#0A192F] leading-snug">{article.title}</h3>
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {article.category || 'Science & Technology'}
                      </span>
                      {article.journal_title && (
                        <span>• {article.journal_title}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed font-normal">
                      {article.abstract}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    {existingReview ? (
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-emerald-900 font-bold">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> Decision: {existingReview.decision}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono font-bold">{existingReview.created_at}</span>
                        </div>
                        <p className="text-slate-800 text-[11px] whitespace-pre-line font-medium bg-white/70 p-2.5 rounded-xl border border-emerald-200">
                          {existingReview.comments}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="w-full py-3 bg-[#0A192F] hover:bg-[#002B49] text-amber-400 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-md"
                      >
                        <DollarSign className="w-4 h-4 text-amber-400" /> Evaluate & Pledge Seed Investment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evaluate & Pledge Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-4 text-slate-900 my-8">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-900 flex items-center justify-center font-black text-sm border border-amber-400">
                VC
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Commercial Term Sheet & Review</span>
                <h3 className="text-xl font-black text-[#0A192F] leading-tight">Pledge Capital & Pitch Evaluation</h3>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div className="text-slate-500 text-[10px] font-bold uppercase">Selected Project:</div>
              <div className="font-bold text-[#0A192F] line-clamp-1">{selectedArticle.title}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">Author: <strong>{selectedArticle.student_name}</strong> • Tier: <span className="font-bold text-amber-700">{selectedArticle.tier}</span></div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] text-slate-700 block mb-1 font-bold">Investment Decision *</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                >
                  <option value="Interested to Invest">💰 Interested to Invest (Pledge Seed Funding)</option>
                  <option value="Mentorship & Incubation">🚀 Mentorship & Incubation Acceleration</option>
                  <option value="Request Private Pitch Meeting">📅 Request 1-on-1 Pitch Meeting with Student</option>
                  <option value="Passed">❌ Passed / Not in Fund Mandate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-700 block mb-1 font-bold">Funding Pledge Amount</label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="USD">$ USD</option>
                      <option value="PKR">PKR</option>
                    </select>
                    <input
                      type="text"
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(e.target.value)}
                      placeholder="e.g. 50,000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 block mb-1 font-bold">Deal Structure</label>
                  <select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Seed Equity Round">Seed Equity Round</option>
                    <option value="Non-Dilutive Research Grant">Non-Dilutive Grant</option>
                    <option value="Convertible SAFE Note">SAFE Note</option>
                    <option value="Commercial Pilot Deployment">Commercial Pilot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-700 block mb-1 font-bold">National / Industrial Socio-Economic Impact</label>
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  placeholder="e.g. High Impact Renewable Energy for National Grid"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-700 block mb-1 font-bold">Investor Notes & Funding Terms Feedback *</label>
                <textarea
                  rows="3"
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide technical feedback, market positioning advice, and next steps for the student author..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed font-normal"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A192F] hover:bg-[#002B49] text-amber-400 font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  Submit Official Term Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
