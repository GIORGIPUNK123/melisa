import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    secondary:
      'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800',
  };

  const sizeStyles = {
    sm: 'h-9 px-3 text-[13px]',
    md: 'h-11 px-4 text-[15px]',
    lg: 'h-12 px-5 text-[16px]',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyles}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className='flex items-center justify-center gap-2'>
          <svg
            className='animate-spin h-4 w-4'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
