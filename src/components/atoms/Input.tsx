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
      default: 'border-slate-300 focus:ring-blue-300 focus:border-blue-500',
      error: 'border-red-ultra-light focus:ring-red-300 focus:border-red-500',
      success: 'border-green-300 focus:ring-green-300 focus:border-green-500',
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
