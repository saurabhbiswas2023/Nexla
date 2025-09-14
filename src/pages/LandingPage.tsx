import { useEffect } from 'react';
import { useChatStore } from '../store/chat';
import { useCanvasStore } from '../store/canvasStore';
import { Footer } from '../components/atoms/Footer';
import { SearchCard } from '../components/molecules/SearchCard';
import { ExampleCard } from '../components/molecules/ExampleCard';
import { HeroSection } from '../components/organisms/HeroSection';

export function LandingPage() {

  // Clear stores on landing page mount - but only reset canvas if needed
  useEffect(() => {
    console.log('🧹 Clearing Zustand stores on landing page');

    // Clear chat store
    useChatStore.getState().clearMessages();
    useChatStore.setState({ input: '', aiThinking: false, highlightId: null });

    // Only reset canvas if we're coming from a completed flow (not dummy state)
    const canvasState = useCanvasStore.getState();
    const hasExistingFlow = canvasState.selectedSource !== 'Dummy Source' || 
                           canvasState.selectedDestination !== 'Dummy Destination' ||
                           canvasState.selectedTransform !== 'Dummy Transform';
    
    if (hasExistingFlow) {
      console.log('🔄 Resetting canvas from existing flow state');
      canvasState.resetToDefaultConfiguration();
    } else {
      console.log('⏭️ Canvas already in default state, skipping reset');
    }

    // Also clear localStorage to ensure fresh start
    localStorage.removeItem('prefillPrompt');

    console.log('✅ Stores cleared efficiently');
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
          enableAutocomplete={true}
          debounceMs={300}
          maxSuggestions={5}
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
