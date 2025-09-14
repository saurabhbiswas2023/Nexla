import { useEffect } from 'react';
import { useChatStore } from '../store/chat';
import { useCanvasStore } from '../store/canvasStore';
import { useProgressStore } from '../store/progressStore';
import { Footer } from '../components/atoms/Footer';
import { SearchCard } from '../components/molecules/SearchCard';
import { ExampleCard } from '../components/molecules/ExampleCard';
import { HeroSection } from '../components/organisms/HeroSection';
import { ThemeToggle } from '../components/atoms/ThemeToggle';
import nexbVideo from '../assets/video/nexb.mp4';

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
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-transparent">
      {/* Full-Screen Video Background - Desktop Only (Both Light & Dark) */}
      <video
        className="hidden lg:block fixed top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={nexbVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay for better text readability - Desktop Only */}
      <div className="hidden lg:block fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 dark:bg-opacity-40 z-10"></div>


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
