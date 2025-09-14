import { useEffect } from 'react';
import { useChatStore } from '../store/chat';
import { useCanvasStore } from '../store/canvasStore';
import { useProgressStore } from '../store/progressStore';
import { Footer } from '../components/atoms/Footer';
import { SearchCard } from '../components/molecules/SearchCard';
import { ExampleCard } from '../components/molecules/ExampleCard';
import { HeroSection } from '../components/organisms/HeroSection';
import { ThemeToggle } from '../components/atoms/ThemeToggle';

export function LandingPage() {
  // Reset ALL stores on landing page mount for clean slate
  useEffect(() => {
    // Reset all stores to initial state
    useChatStore.getState().resetStore();
    useCanvasStore.getState().resetStore();
    useProgressStore.getState().resetStore();

    // Also clear localStorage to ensure fresh start
    localStorage.removeItem('prefillPrompt');
    
    // Clear any other potential localStorage items
    localStorage.removeItem('canvas-store');
    localStorage.removeItem('chat-store');
    localStorage.removeItem('progress-store');
  }, []);

  const handleSearchSubmit = (value: string) => {
    localStorage.setItem('prefillPrompt', value);
  };

  const handleExampleClick = (example: string) => {
    localStorage.setItem('prefillPrompt', example);
    window.location.href = '/chat';
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">


      {/* Theme Toggle - Top Right */}
      <ThemeToggle className="fixed top-4 right-4 z-30" size="md" />

      {/* Content over video */}
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Hero Section - Organism */}
        <HeroSection />

        {/* Search Section */}
        <div className="-mt-4 container-narrow flex-1">
          <SearchCard
            placeholder="e.g., Connect Shopify orders to Snowflake"
            onSubmit={handleSearchSubmit}
            inputTestId="landing-input"
            submitTestId="landing-submit"
            enableAutocomplete={true}
            debounceMs={300}
            maxSuggestions={5}
          />

          {/* Examples */}
          <div className="text-center mt-10 text-slate-500 dark:text-slate-400 text-sm">OR TRY ONE OF THESE EXAMPLES</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              'Connect Shopify to BigQuery',
              'Sync Salesforce contacts to Mailchimp',
              'Get PostgreSQL users and send to a webhook',
              'Analyze Stripe payments in Google Sheets',
            ].map((label) => (
            <ExampleCard
              key={label}
              label={label}
              onClick={() => handleExampleClick(label)}
              testId={`example-${label.toLowerCase().replace(/\s+/g, '-')}`}
            />
            ))}
          </div>
        </div>

        {/* Footer - Reusable Footer Atom */}
        <Footer className="mt-auto" />
      </div>
    </div>
  );
}
