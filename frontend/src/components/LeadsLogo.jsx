import React from 'react';

export const LeadsLogo = ({ className = '', inverted = false, size = 'default' }) => {
  // Height presets for responsive, crisp layout
  const heightClass = size === 'sm' ? 'h-8 sm:h-9' : size === 'lg' ? 'h-14 sm:h-16' : 'h-11 sm:h-12';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* Official Lahore Leads University Logo Asset */}
      <img
        src="/leads-logo.png"
        alt="Lahore Leads University"
        className={`${heightClass} w-auto object-contain transition-transform duration-200 hover:opacity-95 ${inverted ? 'brightness-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)] bg-white/95 px-2.5 py-1 rounded-xl' : 'drop-shadow-xs'
          }`}
        loading="eager"
      />
    </div>
  );
};