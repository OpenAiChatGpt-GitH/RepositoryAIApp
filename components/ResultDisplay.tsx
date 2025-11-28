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
    <div className={`mt-8 rounded-xl border ${statusConfig.border} ${statusConfig.bg} overflow-hidden transition-all duration-500 ease-in-out`}>
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-bold ring-1 ring-inset ring-black/5 ${statusConfig.badge}`}>
              {statusConfig.label.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              Confidence Score: {confidencePct}%
            </span>
          </div>
          <button 
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-900 font-medium underline underline-offset-2"
          >
            New Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className={`text-lg font-semibold ${statusConfig.text} mb-4`}>Product Details</h3>
            <dl className="space-y-3">
              <div className="flex justify-between border-b border-black/5 pb-2">
                <dt className="text-sm text-gray-600">Product Name</dt>
                <dd className="text-sm font-medium text-gray-900">{product_details.product_name}</dd>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <dt className="text-sm text-gray-600">Category</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">{product_details.category}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-sm font-bold text-gray-700">Refund Amount</dt>
                <dd className="text-lg font-bold text-gray-900">
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
              <ul className="list-disc pl-5 space-y-2">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;