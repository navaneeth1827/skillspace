
import React from 'react';

interface SkillSpaceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SkillSpaceLogo = ({ className = '', size = 'md' }: SkillSpaceLogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-lg',
    md: 'w-8 h-8 text-xl',
    lg: 'w-10 h-10 text-2xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-md bg-primary flex items-center justify-center`}>
        <span className="text-primary-foreground font-bold">S</span>
      </div>
      <span className="font-bold text-xl">SkillSpace</span>
    </div>
  );
};

export default SkillSpaceLogo;
