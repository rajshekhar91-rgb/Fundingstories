import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className = '', disabled, ...props }) => (
  <button className={`button button-${variant} ${className}`} disabled={isLoading || disabled} {...props}>
    {isLoading ? <><span className="spinner spinner-small" aria-hidden="true" />Generating...</> : children}
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input className={`text-input ${className}`} {...props} />
);
