
import React from 'react';

interface SkillSpaceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SkillSpaceLogo = ({ className = '', size = 'md' }: SkillSpaceLogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-white"
        >
          <path
            d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" className="opacity-80" />
        </svg>
      </div>
      <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        SkillSpace
      </span>
    </div>
  );
};

export default SkillSpaceLogo;
