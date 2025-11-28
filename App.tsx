import React, { useState } from 'react';
import Header from './components/Header';
import RefundForm from './components/RefundForm';
import ResultDisplay from './components/ResultDisplay';
import { RefundRequestForm, RefundDecisionResponse } from './types';
import { evaluateRefundEligibility } from './services/refundService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefundDecisionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRefundSubmit = async (data: RefundRequestForm) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulate backend delay for better UX if the API is too fast
      // await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const response = await evaluateRefundEligibility(data);
      setResult(response);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      // Friendly error mapping
      if (err.message && (err.message.includes('not found') || err.message.includes('Order') || err.message.includes('Product'))) {
        setError(err.message);
      } else {
        setError("We encountered a problem while evaluating this request. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Header />

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {!result ? (
          <>
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Evaluate Refund Request
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Enter the order and product details below to check compliance with our refund policy.
              </p>
            </div>

            {/* Validation/API Error Display */}
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error processing request</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <RefundForm onSubmit={handleRefundSubmit} isLoading={loading} />
          </>
        ) : (
          <ResultDisplay result={result} onClear={handleClear} />
        )}

      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 md:flex md:items-center md:justify-between lg:px-8">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; 2024 Refund Compliance Checker. Internal Use Only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;