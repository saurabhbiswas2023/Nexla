import { memo } from 'react';

interface HeroSectionProps {
  /**
   * The main title text
   */
  title?: string;
  /**
   * The subtitle/description text
   */
  subtitle?: string;
  /**
   * Logo text or component
   */
  logo?: string;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Background gradient classes
   */
  backgroundClassName?: string;
}

/**
 * HeroSection Organism Component
 *
 * A complete hero section with logo, title, and subtitle.
 * This is an ORGANISM because it:
 * - Contains multiple elements with business logic
 * - Represents a complete section of the page
 * - Has context-specific functionality (branding)
 * - Combines multiple visual elements
 *
 * @example
 * ```tsx
 * <HeroSection
 *   title="Nexla"
 *   subtitle="AI‑Powered Orchestration for Your Data Flows"
 *   logo="N"
 * />
 * ```
 */
export const HeroSection = memo(function HeroSection({
  title = 'Nexla',
  subtitle = 'AI‑Powered Orchestration for Your Data Flows',
  logo = 'N',
  className = '',
  backgroundClassName = 'bg-gradient-to-b from-violet-700 to-blue-500',
}: HeroSectionProps) {
  return (
    <div className={`${backgroundClassName} text-white pb-24 ${className}`}>
      <div className="container-narrow py-10 text-center">
        <div 
          className="mx-auto w-14 h-14 rounded-full bg-white/95 text-blue-600 grid place-items-center font-bold text-xl"
          role="img"
          aria-label="Nexla logo"
        >
          {logo}
        </div>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-2 text-lg text-blue-100 sm:text-xl lg:text-2xl max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
    </div>
  );
});

export default HeroSection;
