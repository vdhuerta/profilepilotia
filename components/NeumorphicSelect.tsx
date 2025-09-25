
import React from 'react';

type NeumorphicSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const NeumorphicSelect: React.FC<NeumorphicSelectProps> = (props) => {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className={`w-full appearance-none bg-slate-100 rounded-lg py-2 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-[inset_4px_4px_8px_#c5c5c5,_inset_-4px_-4px_8px_#ffffff] ${props.className || ''}`}
      >
        {props.children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.404l2.904-2.856c.436-.446 1.144-.446 1.58 0 .436.446.436 1.167 0 1.613l-3.694 3.63c-.436.446-1.144.446-1.58 0L5.516 9.16c-.436-.446-.436-1.167 0-1.613z"/>
        </svg>
      </div>
    </div>
  );
};

export default NeumorphicSelect;
