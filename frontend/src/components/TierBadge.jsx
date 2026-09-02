import React from 'react';
import { Award, ShieldAlert, Sparkles, Clock, CheckCircle } from 'lucide-react';

export const TierBadge = ({ tier }) => {
  if (tier === 'Platinum') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-platinum shadow-lg shadow-purple-900/30">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        Platinum Tier
      </span>
    );
  }
  if (tier === 'Gold') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-gold shadow-lg shadow-amber-900/30">
        <Award className="w-3.5 h-3.5 text-amber-400" />
        Gold Tier
      </span>
    );
  }
  if (tier === 'Silver') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-silver">
        <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
        Silver Tier
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-700">
      <Clock className="w-3.5 h-3.5" />
      Under Review
    </span>
  );
};
