import { memo, useEffect, useRef } from 'react';
import { AutocompleteSuggestion } from '../../lib/autocompleteService';

interface SuggestionDropdownProps {
  suggestions: AutocompleteSuggestion[];
  isVisible: boolean;
  selectedIndex: number;
  onSelect: (suggestion: AutocompleteSuggestion) => void;
  onHover: (index: number) => void;
  className?: string;
  isLoading?: boolean;
}

/**
 * SuggestionDropdown Molecule Component
 *
 * Displays AI-powered autocomplete suggestions in a dropdown format.
 * This is a MOLECULE because it:
 * - Combines multiple atoms (icons, text, loading states)
 * - Has a single functional purpose (display suggestions)
 * - Is reusable across different contexts
 * - Contains presentation logic but minimal business logic
 *
 * @example
 * ```tsx
 * <SuggestionDropdown
 *   suggestions={suggestions}
 *   isVisible={showSuggestions}
 *   selectedIndex={selectedIndex}
 *   onSelect={handleSelect}
 *   onHover={setSelectedIndex}
 * />
 * ```
 */
export const SuggestionDropdown = memo(function SuggestionDropdown({
  suggestions,
  isVisible,
  selectedIndex,
  onSelect,
  onHover,
  className = '',
  isLoading = false,
}: SuggestionDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  if (!isVisible) return null;


  return (
    <div
      ref={dropdownRef}
      className={`
        absolute top-full left-0 right-0 z-50 mt-1
        bg-white border border-gray-300 rounded-lg shadow-lg
        max-h-64 overflow-hidden
        ${className}
      `}
      role="listbox"
      aria-label="Autocomplete suggestions"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-3 text-gray-400">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
          <span className="text-sm">Searching...</span>
        </div>
      )}

      {!isLoading && suggestions.map((suggestion, index) => (
        <div
          key={suggestion.id}
          className={`
            px-4 py-3 cursor-pointer text-sm text-gray-800 border-b border-gray-100 last:border-b-0
            ${index === selectedIndex 
              ? 'bg-blue-50' 
              : 'hover:bg-gray-50'
            }
          `}
          onClick={() => onSelect(suggestion)}
          onMouseEnter={() => onHover(index)}
          role="option"
          aria-selected={index === selectedIndex}
          tabIndex={-1}
        >
          {suggestion.text}
        </div>
      ))}

    </div>
  );
});

export default SuggestionDropdown;
