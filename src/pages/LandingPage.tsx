import { useEffect } from 'react';
import { useChatStore } from '../store/chat';
import { useCanvasStore } from '../store/canvasStore';
import { Footer } from '../components/atoms/Footer';
import { SearchCard } from '../components/molecules/SearchCard';
import { ExampleCard } from '../components/molecules/ExampleCard';
import { HeroSection } from '../components/organisms/HeroSection';

export function LandingPage() {

  // Clear all Zustand stores on landing page mount
  useEffect(() => {
    console.log('🧹 Clearing Zustand stores on landing page');

    // Clear chat store
    useChatStore.getState().clearMessages();
    useChatStore.setState({ input: '', aiThinking: false, highlightId: null });

    // Reset canvas store to default configuration
    useCanvasStore.getState().resetToDefaultConfiguration();

    // Also clear localStorage to ensure fresh start
    localStorage.removeItem('prefillPrompt');

    console.log('✅ All stores cleared');
  }, []);

  const handleSearchSubmit = (value: string) => {
    localStorage.setItem('prefillPrompt', value);
  };

  const handleExampleClick = (example: string) => {
    localStorage.setItem('prefillPrompt', example);
    window.location.href = '/chat';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Organism */}
      <HeroSection />

      {/* Search Section */}
      <div className="-mt-14 container-narrow flex-1">
        <SearchCard
          placeholder="e.g., Connect Shopify orders to Snowflake"
          onSubmit={handleSearchSubmit}
          inputTestId="landing-input"
          submitTestId="landing-submit"
        />

        {/* Examples */}
        <div className="text-center mt-10 text-slate-500 text-sm">OR TRY ONE OF THESE EXAMPLES</div>
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
              icon="⚡"
              onClick={() => handleExampleClick(label)}
              testId={`example-${label.toLowerCase().replace(/\s+/g, '-')}`}
            />
          ))}
        </div>
      </div>

      {/* Footer - Reusable Footer Atom */}
      <Footer className="mt-auto" />
    </div>
  );
}
