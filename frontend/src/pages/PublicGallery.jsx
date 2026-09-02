import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Award,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  TrendingUp,
  Star,
  ExternalLink
} from 'lucide-react';
import { TierBadge } from '../components/TierBadge';

export const PublicGallery = ({ gallery, articles, investorReviews, onNavigateToLogin }) => {
  return (
    <div className="space-y-16 py-4 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-8 md:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Official University Research & Innovation Ecosystem
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
            Empowering Academic Research <br className="hidden sm:inline" /> & Venture Funding.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            A unified portal connecting university researchers, academic reviewer committees, venture capital investors, and international conference attendees.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => onNavigateToLogin('student')}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition shadow-xl shadow-blue-600/25 flex items-center gap-2"
            >
              Submit Research Paper <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToLogin('attendee')}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-xl text-sm transition"
            >
              Get Conference Ticket
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">500+</div>
            <div className="text-xs text-slate-400 font-medium">Research Articles</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400">PKR 25M+</div>
            <div className="text-xs text-slate-400 font-medium">Venture Pledges</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400">98.5%</div>
            <div className="text-xs text-slate-400 font-medium">Verified Plagiarism Accuracy</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">50+</div>
            <div className="text-xs text-slate-400 font-medium">Industry VC Partners</div>
          </div>
        </div>
      </section>

      {/* Featured Venture Funded Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Award className="w-7 h-7 text-amber-400" /> Featured Funded Innovations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Research papers awarded top Platinum/Gold Tiers and backed by venture capital investors.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gallery.map((item) => {
            const article = articles.find(a => a.id === item.featured_article_id);
            return (
              <div key={item.id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 glass-card-hover flex flex-col justify-between">
                <div>
                  <div className="h-56 overflow-hidden relative">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-300 bg-amber-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/40">
                        🏆 Seed Funding Pledged
                      </span>
                      {article && <TierBadge tier={article.tier} />}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-800/80 bg-slate-900/40 flex justify-between items-center">
                  <div className="text-xs">
                    <span className="text-slate-500 block">Venture Capital Partner:</span>
                    <strong className="text-amber-400 font-bold">{item.investor_name}</strong>
                  </div>
                  <button
                    onClick={() => onNavigateToLogin('login')}
                    className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    Explore Paper <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Published Investor Feedback & Country Impact */}
      <section className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-400" /> Industry & National Economic Endorsements
          </h2>
          <p className="text-xs text-slate-400 mt-1">Official evaluation reviews submitted by registered venture capitalists.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investorReviews.map((rev) => (
            <div key={rev.id} className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  {rev.decision}
                </span>
                <span className="text-xs text-purple-300 font-semibold bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                  {rev.benefit_for_country}
                </span>
              </div>
              <h4 className="font-bold text-white text-base leading-snug">{rev.article_title}</h4>
              <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                "{rev.comments}"
              </p>
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/60 flex justify-between items-center">
                <span>Evaluator: <strong className="text-slate-200">{rev.investor_name}</strong></span>
                <span className="text-slate-500">{rev.created_at}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
