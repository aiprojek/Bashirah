
import React from 'react';

interface LogoProps {
  className?: string; // Digunakan untuk mengatur ukuran Icon (misal: w-10 h-10)
  withText?: boolean;
  lightMode?: boolean; // Jika true, dioptimalkan untuk background gelap
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", withText = false, lightMode = false }) => {
  const strokeColor = lightMode ? "stroke-white" : "stroke-[#1e3a34]";
  const accentStroke = "#d4af37"; // Gold/Yellow
  const greenDot = "#1e3a34"; // Dark Green

  return (
    <div className="flex items-center gap-3 select-none">
      {/* 
         WRAPPER IKON: 
         className (ukuran w-xx h-xx) diterapkan di sini, bukan di parent terluar.
         Ini agar teks tidak ikut terkompresi oleh ukuran ikon.
      */}
      <div className={`${className} relative flex-shrink-0`}>
        <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
        >
            {/* Book Outline */}
            <path 
            d="M50 82 C35 88 15 80 15 70 V30 C15 40 35 48 50 42" 
            className={strokeColor}
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            />
            <path 
            d="M50 82 C65 88 85 80 85 70 V30 C85 40 65 48 50 42" 
            className={strokeColor}
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            />
            
            {/* Center Spine */}
            <path 
            d="M50 42 V82" 
            className={strokeColor}
            strokeWidth="4" 
            strokeLinecap="round"
            />

            {/* Decorative Lines - Gold Accent */}
            <path d="M25 50 H40" stroke={accentStroke} strokeWidth="4" strokeLinecap="round" />
            <path d="M25 62 H40" stroke={accentStroke} strokeWidth="4" strokeLinecap="round" />
            
            <path d="M60 50 H75" stroke={accentStroke} strokeWidth="4" strokeLinecap="round" />
            <path d="M60 62 H75" stroke={accentStroke} strokeWidth="4" strokeLinecap="round" />

            {/* --- STAR SYMBOL --- */}
            {/* Yellow Star Polygon */}
            <polygon 
                points="50,10 53,16 59,16 54,20 56,26 50,23 44,26 46,20 41,16 47,16" 
                fill={accentStroke} 
                stroke="none"
            />
            {/* Green Dot Center */}
            <circle cx="50" cy="19" r="1.5" fill={greenDot} />
            {/* Impulse Lines */}
            <path d="M35 19 H 28" stroke={accentStroke} strokeWidth="2" strokeLinecap="round" />
            <path d="M65 19 H 72" stroke={accentStroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* TEXT PART */}
      {withText && (
        <div className="flex flex-col justify-center">
            <h1 className={`text-xl font-bold font-serif tracking-tight leading-none ${lightMode ? 'text-white' : 'text-[#1e3a34]'}`}>
                Bashirah
            </h1>
            <p className={`text-[9px] font-sans tracking-[0.2em] uppercase leading-none mt-1 ${lightMode ? 'text-white/70' : 'text-[#1e3a34]/60'}`}>
                Al-Quran Digital
            </p>
        </div>
      )}
    </div>
  );
};

export default Logo;