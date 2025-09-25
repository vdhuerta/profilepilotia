
import React from 'react';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
}

const NeumorphicCard: React.FC<NeumorphicCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-100 rounded-2xl p-6 md:p-8 shadow-[8px_8px_16px_#c5c5c5,_-8px_-8px_16px_#ffffff] ${className}`}>
      {children}
    </div>
  );
};

export default NeumorphicCard;
