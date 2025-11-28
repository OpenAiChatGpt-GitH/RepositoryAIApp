import React, { useState } from 'react';
import { RefundReason, RefundRequestForm } from '../types';
import { REFUND_REASONS } from '../constants';

interface RefundFormProps {
  onSubmit: (data: RefundRequestForm) => void;
  isLoading: boolean;
}

const RefundForm: React.FC<RefundFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<RefundRequestForm>({
    orderId: '',
    productId: '',
    reason: '' as RefundReason,
    otherReasonDescription: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RefundRequestForm, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RefundRequestForm, string>> = {};
    let isValid = true;

    if (!formData.orderId.trim()) {
      newErrors.orderId = 'Order ID is required';
      isValid = false;
    }

    if (!formData.productId.trim()) {
      newErrors.productId = 'Product ID is required';
      isValid = false;
    }

    if (!formData.reason) {
      newErrors.reason = 'Please select a reason';
      isValid = false;
    }

    if (formData.reason === RefundReason.OTHER && !formData.otherReasonDescription.trim()) {
      newErrors.otherReasonDescription = 'Please describe your reason';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof RefundRequestForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-8 space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {/* Order ID */}
        <div className="col-span-1">
          <label htmlFor="orderId" className="block text-sm font-medium leading-6 text-gray-900">
            Order ID
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="orderId"
              id="orderId"
              value={formData.orderId}
              onChange={(e) => handleChange('orderId', e.target.value)}
              className={`block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.orderId ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 bg-white`}
              placeholder="e.g., ORD5001"
              disabled={isLoading}
            />
            {errors.orderId && <p className="mt-1 text-sm text-red-600">{errors.orderId}</p>}
          </div>
        </div>

        {/* Product ID */}
        <div className="col-span-1">
          <label htmlFor="productId" className="block text-sm font-medium leading-6 text-gray-900">
            Product ID
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="productId"
              id="productId"
              value={formData.productId}
              onChange={(e) => handleChange('productId', e.target.value)}
              className={`block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.productId ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 bg-white`}
              placeholder="e.g., P1001"
              disabled={isLoading}
            />
            {errors.productId && <p className="mt-1 text-sm text-red-600">{errors.productId}</p>}
          </div>
        </div>

        {/* Reason */}
        <div className="col-span-full">
          <label htmlFor="reason" className="block text-sm font-medium leading-6 text-gray-900">
            Reason for refund
          </label>
          <div className="mt-2">
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value as RefundReason)}
              className={`block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.reason ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'} focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 bg-white`}
              disabled={isLoading}
            >
              <option value="">Select a reason</option>
              {REFUND_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
          </div>
        </div>

        {/* Other Reason Description */}
        {formData.reason === RefundReason.OTHER && (
          <div className="col-span-full">
            <label htmlFor="otherReasonDescription" className="block text-sm font-medium leading-6 text-gray-900">
              Please describe your reason
            </label>
            <div className="mt-2">
              <textarea
                id="otherReasonDescription"
                name="otherReasonDescription"
                rows={3}
                value={formData.otherReasonDescription}
                onChange={(e) => handleChange('otherReasonDescription', e.target.value)}
                className={`block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.otherReasonDescription ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 bg-white`}
                disabled={isLoading}
              />
              {errors.otherReasonDescription && <p className="mt-1 text-sm text-red-600">{errors.otherReasonDescription}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-blue-600 px-3.5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Evaluating Request...
            </span>
          ) : (
            "Evaluate Refund"
          )}
        </button>
      </div>
    </form>
  );
};

export default RefundForm;
