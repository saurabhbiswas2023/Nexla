import { HTMLAttributes } from 'react';

interface FooterProps extends HTMLAttributes<HTMLElement> {
  /**
   * Additional CSS classes to apply to the footer
   */
  className?: string;
  /**
   * Copyright text to display
   * @default "© 2025 Nexla. All rights reserved."
   */
  copyrightText?: string;
}

/**
 * Footer Atom Component
 *
 * A reusable footer component following Atomic Design principles.
 * This is an ATOM because it:
 * - Has single responsibility (display copyright)
 * - Contains no business logic
 * - Is highly reusable across pages
 * - Has no dependencies on other components
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Footer />
 *
 * // With custom text
 * <Footer copyrightText="© 2025 Custom Company. All rights reserved." />
 *
 * // With additional classes
 * <Footer className="border-t-2" />
 * ```
 */
export function Footer({
  className = '',
  copyrightText = '© 2025 Nexla. All rights reserved.',
  ...props
}: FooterProps) {
  return (
    <footer
      className={`bg-blue-600 dark:bg-slate-800 text-white dark:text-slate-300 py-3 px-4 text-center text-sm min-h-[50px] flex items-center justify-center ${className}`}
      role="contentinfo"
      aria-label="Site footer"
      {...props}
    >
      {copyrightText}
    </footer>
  );
}

export default Footer;
