import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../atoms/Input';
import { sanitizeInput } from '../../lib/security';

interface SearchCardProps {
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  /**
   * Initial value for the search input
   */
  initialValue?: string;
  /**
   * Callback when the search is submitted
   */
  onSubmit?: (value: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Test ID for the input field
   */
  inputTestId?: string;
  /**
   * Test ID for the submit button
   */
  submitTestId?: string;
}

/**
 * SearchCard Molecule Component
 *
 * A search input card combining Input and Button atoms.
 * This is a MOLECULE because it:
 * - Combines 2 atoms (Input + Button)
 * - Has a single functional purpose (search)
 * - Is reusable across contexts
 * - Contains minimal business logic
 *
 * @example
 * ```tsx
 * <SearchCard
 *   placeholder="Enter your search query"
 *   onSubmit={(value) => console.log(value)}
 * />
 * ```
 */
export const SearchCard = memo(function SearchCard({
  placeholder = 'Enter your search query',
  initialValue = '',
  onSubmit,
  className = '',
  inputTestId = 'search-input',
  submitTestId = 'search-submit',
}: SearchCardProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      setError('Please enter a search query');
      return;
    }

    // Validate input length
    if (trimmedValue.length > 200) {
      setError('Search query must be less than 200 characters');
      return;
    }

    // Sanitize input
    const sanitizedValue = sanitizeInput(trimmedValue);
    if (sanitizedValue !== trimmedValue) {
      setError('Search query contains invalid characters');
      return;
    }

    setError('');
    onSubmit?.(sanitizedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`mx-auto max-w-3xl rounded-2xl bg-white shadow-xl p-6 ${className}`}>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            data-testid={inputTestId}
            className="flex-1 bg-slate-50"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            size="lg"
            fullWidth
            variant={error ? 'error' : 'default'}
            aria-label="Search input"
            aria-invalid={!!error}
            aria-describedby={error ? 'search-error' : undefined}
          />
          {error && (
            <div 
              id="search-error" 
              className="mt-2 text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}
        </div>
        <Link
          to="/chat"
          data-testid={submitTestId}
          className="rounded-lg bg-violet-600 text-white px-6 py-3 font-semibold hover:bg-violet-500 min-h-[48px] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2"
          aria-label="Start search"
          onClick={handleSubmit}
        >
          Start
        </Link>
      </div>
    </div>
  );
});

export default SearchCard;
