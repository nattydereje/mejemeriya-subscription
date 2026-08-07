import React from 'react';
import logoImg from '../assets/images/mejemeriya_tv_logo_1786057246033.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = true, className = '' }) => {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Badge with exact Mejemeriya Television red background and typography */}
      <div className={`relative flex items-center justify-center bg-[#CC201F] rounded-xl overflow-hidden shadow-lg shadow-red-900/40 border border-red-500/40 p-1.5 transition-transform hover:scale-105 ${heightClasses[size]}`}>
        {logoImg ? (
          <img
            src={logoImg}
            alt="መጀመርያ TELEVISION Logo"
            className="h-full w-auto object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center px-3 py-1 bg-[#CC201F] text-white">
            <span className="font-black text-lg sm:text-xl tracking-wider uppercase font-serif">
              መጀመርያ
            </span>
            {showSubtitle && (
              <span className="text-[9px] font-bold tracking-[0.25em] text-slate-100 uppercase -mt-0.5">
                TELEVISION
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-white text-base sm:text-lg tracking-tight leading-none">
            መጀመርያ TV
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600/30 text-red-400 border border-red-500/30 uppercase tracking-wider">
            100K BIRR
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight mt-0.5 hidden xs:block">
          Official YouTube Challenge
        </p>
      </div>
    </div>
  );
};
