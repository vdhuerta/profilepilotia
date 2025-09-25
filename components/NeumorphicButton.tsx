
import React from 'react';

interface NeumorphicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      className={`px-6 py-2 bg-slate-100 rounded-lg text-slate-700 font-semibold
                 shadow-[5px_5px_10px_#c5c5c5,_-5px_-5px_10px_#ffffff]
                 active:shadow-[inset_4px_4px_8px_#c5c5c5,_inset_-4px_-4px_8px_#ffffff]
                 transition-all duration-150 ease-in-out
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[inset_4px_4px_8px_#c5c5c5,_inset_-4px_-4px_8px_#ffffff]
                 ${className}`}
    >
      {children}
    </button>
  );
};

export default NeumorphicButton;
