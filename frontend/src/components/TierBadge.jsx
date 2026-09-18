import React from 'react';
import { Award, Sparkles, Clock, CheckCircle, ShieldAlert, Star } from 'lucide-react';

export const TierBadge = ({ tier, status }) => {
  if (tier === 'Platinum') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-100 border border-purple-400 shadow-md shadow-purple-900/20">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        ⭐ Platinum Tier (Top 5%)
      </span>
    );
  }
  if (tier === 'Gold') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 border border-amber-300 shadow-md shadow-amber-500/20">
        <Award className="w-3.5 h-3.5 text-slate-950" />
        🥇 Gold Tier (Top 15%)
      </span>
    );
  }
  if (tier === 'Silver') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-sm">
        <CheckCircle className="w-3.5 h-3.5 text-slate-700" />
        🥈 Silver Tier (Journal Archive)
      </span>
    );
  }
  if (tier === 'Bronze') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-900/10 text-amber-900 border border-amber-700/30">
        <Star className="w-3.5 h-3.5 text-amber-700" />
        🥉 Bronze Tier
      </span>
    );
  }

  if (status === 'Needs Revision') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        ⚠️ Needs Revision
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <Clock className="w-3.5 h-3.5 text-slate-400" />
      Under Peer Review
    </span>
  );
};
