
import React from 'react';

type NeumorphicInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const NeumorphicInput: React.FC<NeumorphicInputProps> = (props) => {
  return (
    <input
      {...props}
      className={`w-full bg-slate-100 rounded-lg py-2 px-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-[inset_4px_4px_8px_#c5c5c5,_inset_-4px_-4px_8px_#ffffff] ${props.className || ''}`}
    />
  );
};

export default NeumorphicInput;
