import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useChatStore } from '../store/chat';
import { useCanvasStore } from '../store/canvasStore';
import { Footer } from '../components/atoms/Footer';

export function LandingPage() {
  const [inputValue, setInputValue] = useState('');

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

  const handleSubmit = () => {
    if (inputValue.trim()) {
      localStorage.setItem('prefillPrompt', inputValue.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header gradient */}
      <div className="bg-gradient-to-b from-violet-700 to-blue-500 text-white pb-24">
        <div className="container-narrow py-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/95 text-blue-600 grid place-items-center font-bold text-xl">
            N
          </div>
          <h1 className="mt-4 text-4xl font-bold">Nexla</h1>
          <p className="mt-2 text-lg text-blue-100">AI‑Powered Orchestration for Your Data Flows</p>
        </div>
      </div>

      {/* Search card */}
      <div className="-mt-14 container-narrow flex-1">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl p-6">
          <div className="flex gap-3">
            <input
              data-testid="landing-input"
              className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3"
              placeholder="e.g., Connect Shopify orders to Snowflake"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Link
              to="/chat"
              data-testid="landing-submit"
              className="rounded-lg bg-violet-600 text-white px-6 py-3 font-semibold hover:bg-violet-500"
              aria-label="Start"
              onClick={handleSubmit}
            >
              Start
            </Link>
          </div>
        </div>

        {/* Examples */}
        <div className="text-center mt-10 text-slate-500 text-sm">OR TRY ONE OF THESE EXAMPLES</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            'Connect Shopify to BigQuery',
            'Sync Salesforce contacts to Mailchimp',
            'Get PostgreSQL users and send to a webhook',
            'Analyze Stripe payments in Google Sheets',
          ].map((label) => (
            <button
              key={label}
              onClick={() => {
                localStorage.setItem('prefillPrompt', label);
                window.location.href = '/chat';
              }}
              className="rounded-xl border bg-white p-4 text-left shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-200 grid place-items-center text-amber-600">
                  ⚡
                </div>
                <div className="text-slate-800">{label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer - Reusable Footer Atom */}
      <Footer className="mt-auto" />
    </div>
  );
}
