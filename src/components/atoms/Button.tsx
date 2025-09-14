import { ComponentProps, memo } from 'react';
import { ChevronUp, MessageCircle } from 'lucide-react';

type Props = ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
  icon?: 'chevron-up' | 'message-circle' | 'none';
  position?: 'static' | 'fixed-bottom-right';
  visible?: boolean;
};

/**
 * Button Atom Component
 *
 * A flexible button component that supports multiple variants including floating action buttons.
 * This is an ATOM because it:
 * - Has single responsibility (clickable action)
 * - Contains no business logic
 * - Is highly reusable
 * - Has no dependencies on other components
 *
 * @example
 * ```tsx
 * // Standard button
 * <Button variant="primary">Click me</Button>
 * 
 * // Floating back-to-top button
 * <Button 
 *   variant="floating" 
 *   position="fixed-bottom-right"
 *   icon="chevron-up"
 *   onClick={scrollToTop}
 * >
 *   Back to Chat
 * </Button>
 * ```
 */
export const Button = memo(function Button({ 
  variant = 'primary', 
  size = 'md',
  full = false, 
  icon = 'none',
  position = 'static',
  visible = true,
  className = '', 
  children,
  onClick,
  ...props 
}: Props) {
  if (!visible) return null;

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] min-w-[44px]';
  
  // Size variants
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-lg',
  } as const;

  // Color variants
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-500 focus:ring-violet-600 active:bg-violet-700',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700',
    floating: 'bg-violet-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-violet-500 focus:ring-violet-600 px-4 py-3 gap-2',
  } as const;

  // Position variants
  const positions = {
    static: '',
    'fixed-bottom-right': 'fixed bottom-6 right-6 z-50',
  } as const;

  // Width handling
  const width = full ? 'w-full' : '';

  // Icon rendering
  const renderIcon = () => {
    if (icon === 'chevron-up') return <ChevronUp size={16} aria-hidden="true" />;
    if (icon === 'message-circle') return <MessageCircle size={20} aria-hidden="true" />;
    return null;
  };

  // Handle click with scroll-to-top for floating variant
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'floating' && position === 'fixed-bottom-right') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onClick?.(e);
  };

  const sizeClass = variant === 'floating' ? '' : sizes[size];
  const finalClassName = `${baseStyles} ${variants[variant]} ${positions[position]} ${sizeClass} ${width} ${className}`.trim();

  return (
    <button 
      className={finalClassName}
      onClick={handleClick}
      aria-label={typeof children === 'string' ? children : undefined}
      {...props}
    >
      {icon === 'message-circle' && renderIcon()}
      {children && <span className={variant === 'floating' ? 'font-medium text-sm' : ''}>{children}</span>}
      {icon === 'chevron-up' && renderIcon()}
    </button>
  );
});
