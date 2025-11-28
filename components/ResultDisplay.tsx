import React from 'react';
import { RefundDecisionResponse } from '../types';

interface ResultDisplayProps {
  result: RefundDecisionResponse;
  onClear: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onClear }) => {
  const { decision, confidence, product_details, reasons } = result;

  // Visual cues based on decision
  const statusConfig = {
    APPROVE: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      iconBg: 'bg-green-100',
      badge: 'bg-green-100 text-green-700',
      label: 'Approved'
    },
    REJECT: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      iconBg: 'bg-red-100',
      badge: 'bg-red-100 text-red-700',
      label: 'Rejected'
    },
    ESCALATE: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      iconBg: 'bg-amber-100',
      badge: 'bg-amber-100 text-amber-700',
      label: 'Escalated'
    }
  }[decision];

  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Evaluation Result</h2>
        <button 
            onClick={onClear}
            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            Start New Request
        </button>
      </div>

      <div className={`rounded-xl border ${statusConfig.border} ${statusConfig.bg} overflow-hidden shadow-sm transition-all duration-500`}>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 border-b border-black/5 pb-6">
            <span className={`inline-flex items-center rounded-md px-4 py-2 text-lg font-bold ring-1 ring-inset ring-black/5 ${statusConfig.badge}`}>
              {statusConfig.label.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600 font-medium">
              AI Confidence Score: <span className="text-gray-900 font-bold">{confidencePct}%</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`text-lg font-semibold ${statusConfig.text} mb-4`}>Product Details</h3>
              <dl className="bg-white/60 rounded-lg p-5 space-y-3 ring-1 ring-black/5 shadow-sm">
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <dt className="text-sm text-gray-600">Product Name</dt>
                  <dd className="text-sm font-medium text-gray-900 text-right">{product_details.product_name}</dd>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <dt className="text-sm text-gray-600">Category</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize text-right">{product_details.category}</dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt className="text-sm font-bold text-gray-700">Refund Amount</dt>
                  <dd className="text-lg font-bold text-gray-900 text-right">
                    Rs {product_details.refund_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </dd>
                </div>
              </dl>
            </div>

            {(decision === 'REJECT' || decision === 'ESCALATE') && reasons && reasons.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold ${statusConfig.text} mb-4`}>
                  {decision === 'REJECT' ? 'Rejection Reasons' : 'Escalation Reasons'}
                </h3>
                <div className="bg-white/60 rounded-lg p-5 ring-1 ring-black/5 shadow-sm h-full">
                  <ul className="list-disc pl-5 space-y-2">
                    {reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {decision === 'APPROVE' && (
              <div className="flex flex-col items-center justify-center p-5 bg-white/60 rounded-lg ring-1 ring-black/5 shadow-sm text-center">
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                 </div>
                 <p className="text-green-800 font-medium">
                   This request meets all policy criteria and is approved for processing.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;