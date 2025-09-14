import { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Size of the toggle button
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ThemeToggle Atom Component
 *
 * A toggle button for switching between light and dark themes.
 * This is an ATOM because it:
 * - Has a single responsibility (theme switching)
 * - Contains no business logic beyond theme state
 * - Is highly reusable
 * - Has minimal interaction logic
 *
 * @example
 * ```tsx
 * <ThemeToggle size="md" className="fixed top-4 right-4" />
 * ```
 */
export const ThemeToggle = memo(function ThemeToggle({
  className = '',
  size = 'md',
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const handleClick = () => {
    toggleTheme();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-white/10 hover:bg-white/20
        dark:bg-black/10 dark:hover:bg-black/20
        backdrop-blur-sm
        border border-white/20 dark:border-black/20
        text-white dark:text-white
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-white/30
        min-h-[44px] min-w-[44px]
        flex items-center justify-center
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon size={iconSizes[size]} className="transition-transform duration-200" />
      ) : (
        <Sun size={iconSizes[size]} className="transition-transform duration-200" />
      )}
    </button>
  );
});

export default ThemeToggle;
