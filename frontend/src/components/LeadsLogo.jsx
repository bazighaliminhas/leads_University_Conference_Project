import React from 'react';

export const LeadsLogo = ({
  className = '',
  inverted = false,
  size = 'default',
  showSubtitle = false
}) => {
  // Sizing variants
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const isXl = size === 'xl';

  const shieldClass = isSm
    ? 'h-9 w-8'
    : isLg
    ? 'h-14 w-12'
    : isXl
    ? 'h-16 w-14'
    : 'h-12 w-10 sm:h-13 sm:w-11';

  const lahoreClass = isSm
    ? 'text-[10px] tracking-[0.22em]'
    : isLg
    ? 'text-[14px] tracking-[0.26em]'
    : isXl
    ? 'text-[16px] tracking-[0.28em]'
    : 'text-[12px] sm:text-[13px] tracking-[0.24em]';

  const leadsClass = isSm
    ? 'text-[16px] tracking-[0.1em]'
    : isLg
    ? 'text-[26px] tracking-[0.12em]'
    : isXl
    ? 'text-[30px] tracking-[0.14em]'
    : 'text-[22px] sm:text-[24px] tracking-[0.1em]';

  const univClass = isSm
    ? 'text-[10px] tracking-[0.22em]'
    : isLg
    ? 'text-[14px] tracking-[0.26em]'
    : isXl
    ? 'text-[16px] tracking-[0.28em]'
    : 'text-[12px] sm:text-[13px] tracking-[0.24em]';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* 🛡️ Lahore Leads University Official Shield Emblem */}
      <div className={`relative ${shieldClass} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Shield Shell */}
          <path
            d="M50 4L10 16V60C10 88 50 114 50 114C50 114 90 88 90 60V16L50 4Z"
            fill={inverted ? '#071830' : '#142C54'}
            stroke={inverted ? '#FBBF24' : '#C49726'}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Inner Shield Layer */}
          <path
            d="M50 11L16 21V58C16 82 50 105 50 105C50 105 84 82 84 58V21L50 11Z"
            fill={inverted ? '#0A1F42' : '#1A3668'}
          />

          {/* 5 Ascending Golden Leads Bars */}
          {/* Bar 1 */}
          <path d="M24 64L30 50L35 52L29 66H24Z" fill="#FBBF24" />
          {/* Bar 2 */}
          <path d="M34 64L42 42L47 44L39 66H34Z" fill="#F59E0B" />
          {/* Bar 3 */}
          <path d="M44 64L54 34L59 36L49 66H44Z" fill="#FBBF24" />
          {/* Bar 4 */}
          <path d="M54 64L66 26L71 28L59 66H54Z" fill="#F59E0B" />
          {/* Bar 5 */}
          <path d="M64 64L78 18L83 20L69 66H64Z" fill="#FBBF24" />

          {/* Lower Crest Banner with LEADS */}
          <path
            d="M22 72H78V84L50 91L22 84V72Z"
            fill="#112547"
            stroke="#FBBF24"
            strokeWidth="1.2"
          />
          <text
            x="50"
            y="81.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="7"
            fontWeight="900"
            fontFamily="Cinzel, serif"
            letterSpacing="0.6"
          >
            LEADS
          </text>
        </svg>
      </div>

      {/* 🏛️ Official Serif Brand Typography (Identical to leads.edu.pk header) */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-serif font-bold uppercase transition-colors ${
            inverted ? 'text-slate-100' : 'text-[#142C54]'
          } ${lahoreClass}`}
          style={{ fontFamily: '"Cinzel", "Times New Roman", "Georgia", serif' }}
        >
          LAHORE
        </span>

        <span
          className={`font-serif font-black uppercase my-0.5 transition-colors ${
            inverted ? 'text-amber-400' : 'text-[#142C54]'
          } ${leadsClass}`}
          style={{ fontFamily: '"Cinzel", "Times New Roman", "Georgia", serif' }}
        >
          LEADS
        </span>

        <span
          className={`font-serif font-bold uppercase transition-colors ${
            inverted ? 'text-slate-200' : 'text-[#142C54]'
          } ${univClass}`}
          style={{ fontFamily: '"Cinzel", "Times New Roman", "Georgia", serif' }}
        >
          UNIVERSITY
        </span>

        {showSubtitle && (
          <span
            className={`text-[8.5px] font-sans font-black tracking-widest uppercase mt-0.5 ${
              inverted ? 'text-amber-300' : 'text-amber-600'
            }`}
          >
            ORIC Research Portal
          </span>
        )}
      </div>
    </div>
  );
};