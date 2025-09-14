import { useState, memo, useCallback, useEffect, useRef } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { SuggestionDropdown } from './SuggestionDropdown';
import { sanitizeInput } from '../../lib/security';
import { autocompleteService, AutocompleteSuggestion } from '../../lib/autocompleteService';

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
  /**
   * Enable AI-powered autocomplete
   */
  enableAutocomplete?: boolean;
  /**
   * Debounce delay for autocomplete requests (ms)
   */
  debounceMs?: number;
  /**
   * Maximum number of suggestions to show
   */
  maxSuggestions?: number;
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
  enableAutocomplete = true,
  debounceMs = 300,
  maxSuggestions = 5,
}: SearchCardProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [error, setError] = useState<string>('');
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      // Instead of error, show helpful suggestions (Google-style)
      showHelpfulSuggestions();
      return false;
    }

    // Validate input length
    if (trimmedValue.length > 200) {
      setError('Query must be less than 200 characters');
      return false;
    }

    // Sanitize input
    const sanitizedValue = sanitizeInput(trimmedValue);
    if (sanitizedValue !== trimmedValue) {
      setError('Query contains invalid characters');
      return false;
    }

    setError('');
    onSubmit?.(sanitizedValue);
    return true;
  };

  // Show helpful suggestions when user submits empty query (Google-style)
  const showHelpfulSuggestions = useCallback(() => {
    const helpfulSuggestions = [
      {
        id: 'help-1',
        type: 'flow-pattern' as const,
        text: 'Connect Shopify orders to Snowflake',
        confidence: 0.9,
        category: 'Popular Flow'
      },
      {
        id: 'help-2', 
        type: 'flow-pattern' as const,
        text: 'Sync Salesforce contacts to Mailchimp',
        confidence: 0.85,
        category: 'Popular Flow'
      },
      {
        id: 'help-3',
        type: 'flow-pattern' as const, 
        text: 'Get PostgreSQL users and send to webhook',
        confidence: 0.8,
        category: 'Popular Flow'
      },
      {
        id: 'help-4',
        type: 'flow-pattern' as const,
        text: 'Analyze Stripe payments in Google Sheets', 
        confidence: 0.75,
        category: 'Popular Flow'
      },
      {
        id: 'help-5',
        type: 'flow-pattern' as const,
        text: 'Connect HubSpot deals to BigQuery',
        confidence: 0.7,
        category: 'Popular Flow'
      }
    ];

    setSuggestions(helpfulSuggestions);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    setError(''); // Clear any existing errors
    
    // Ensure input stays focused when showing suggestions
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, []);

  // Debounced autocomplete function
  const debouncedGetSuggestions = useCallback(async (query: string) => {
    if (!enableAutocomplete || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    
    try {
      const newSuggestions = await autocompleteService.getSuggestions({
        query,
        cursorPosition: query.length,
        maxSuggestions,
      });
      
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.warn('Autocomplete error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [enableAutocomplete, maxSuggestions]);

  // Handle input changes with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError('');

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce autocomplete requests
    if (enableAutocomplete) {
      debounceRef.current = setTimeout(() => {
        debouncedGetSuggestions(newValue);
      }, debounceMs);
    }
  }, [debouncedGetSuggestions, enableAutocomplete, debounceMs]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: AutocompleteSuggestion) => {
    setInputValue(suggestion.text);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // Trigger submit with the selected suggestion and navigate (Google-style)
    const sanitizedValue = sanitizeInput(suggestion.text.trim());
    onSubmit?.(sanitizedValue);
    window.location.href = '/chat';
  }, [onSubmit]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim() === '') {
          // Show helpful suggestions instead of error (Google-style)
          showHelpfulSuggestions();
        } else if (handleSubmit()) {
          window.location.href = '/chat';
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          // Select the suggestion and then navigate
          const selectedSuggestion = suggestions[selectedIndex];
          setInputValue(selectedSuggestion.text);
          setShowSuggestions(false);
          setSuggestions([]);
          setSelectedIndex(-1);
          
          // Trigger submit with the selected suggestion
          const sanitizedValue = sanitizeInput(selectedSuggestion.text.trim());
          onSubmit?.(sanitizedValue);
          
          // Navigate to chat page immediately (Google-style behavior)
          window.location.href = '/chat';
        } else {
          // No suggestion selected, just submit current input
          if (handleSubmit()) {
            window.location.href = '/chat';
          }
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
        
      case 'Tab':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
    }
  };

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`mx-auto max-w-3xl rounded-2xl bg-white shadow-xl p-6 relative ${className}`}
    >
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            data-testid={inputTestId}
            className="flex-1 bg-slate-50"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            size="lg"
            fullWidth
            variant={error ? 'error' : 'default'}
            aria-label="Search input with AI autocomplete"
            aria-invalid={!!error}
            aria-describedby={error ? 'search-error' : undefined}
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            role="combobox"
          />
          
          {/* AI-powered suggestion dropdown */}
          <SuggestionDropdown
            suggestions={suggestions}
            isVisible={showSuggestions}
            selectedIndex={selectedIndex}
            onSelect={handleSuggestionSelect}
            onHover={setSelectedIndex}
            isLoading={isLoadingSuggestions}
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
        
        <Button
          variant="primary"
          size="lg"
          data-testid={submitTestId}
          aria-label="Start search"
          onClick={(e) => {
            e.preventDefault();
            if (inputValue.trim() === '') {
              // Show helpful suggestions and focus input when Start is clicked with empty input
              showHelpfulSuggestions();
              if (inputRef.current) {
                inputRef.current.focus();
              }
            } else if (handleSubmit()) {
              window.location.href = '/chat';
            }
          }}
        >
          Start
        </Button>
      </div>
    </div>
  );
});

export default SearchCard;
