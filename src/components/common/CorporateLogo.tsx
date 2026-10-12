import React, { useState } from 'react';

interface CorporateLogoProps {
  className?: string;
}

export const CorporateLogo: React.FC<CorporateLogoProps> = ({ className = 'h-9 sm:h-10' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Elegant fallback icon mark matching the branding
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          <span className="tracking-tight text-blue-400">C</span>
        </div>
        <span className="font-bold text-slate-900 text-base tracking-tight">COMGICO</span>
      </div>
    );
  }

  return (
    <img
      src="/comgico.png"
      alt="Logo Corporativo"
      className={`${className} object-contain transition-opacity`}
      onError={() => setHasError(true)}
    />
  );
};
