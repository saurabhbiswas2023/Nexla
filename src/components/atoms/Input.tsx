import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', size = 'md', fullWidth = false, className = '', ...props }, ref) => {
    const baseClasses = 'rounded border transition-colors focus:outline-none focus:ring-1';

    const variantClasses = {
      default: 'border-slate-300 dark:border-slate-600 focus:ring-blue-300 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400',
      error: 'border-red-ultra-light dark:border-red-400 focus:ring-red-300 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400',
      success: 'border-green-300 dark:border-green-400 focus:ring-green-300 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs min-h-[32px]',
      md: 'px-3 py-2 text-sm min-h-[44px]',
      lg: 'px-4 py-3 text-base min-h-[48px]',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
