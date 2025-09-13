import { ComponentProps } from 'react';

type Props = ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost';
  full?: boolean;
};

export function Button({ variant = 'primary', full, className = '', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] px-4 py-2 text-sm sm:min-h-[40px] sm:px-3 sm:py-1.5 sm:text-xs';
  const variants = {
    primary:
      'bg-violet-600 text-white hover:bg-violet-500 focus:ring-violet-600 active:bg-violet-700',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200',
  } as const;
  const width = full ? 'w-full' : '';
  return <button className={`${base} ${variants[variant]} ${width} ${className}`} {...props} />;
}
