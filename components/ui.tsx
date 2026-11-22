import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-[#1D1D1F] text-white hover:bg-[#333336] focus:ring-gray-900 shadow-lg shadow-gray-200",
    secondary: "bg-white text-[#1D1D1F] border border-[#D1D1D6] hover:bg-gray-50 focus:ring-gray-200",
    ghost: "text-[#86868B] hover:text-[#1D1D1F] hover:bg-gray-100/50",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Thinking...
        </span>
      ) : children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input className={`w-full px-4 py-4 bg-white border-none rounded-2xl text-lg text-[#1D1D1F] placeholder-[#86868B] shadow-sm ring-1 ring-black/5 focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all duration-200 ${className}`} {...props} />
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden ${className}`}>
    {children}
  </div>
);
