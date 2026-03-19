import React, { useState } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate inputs
      if (!upiId || !amount || !recipientName) {
        throw new Error('Please fill in all fields');
      }

      // Validate UPI ID format
      if (!upiId.includes('@')) {
        throw new Error('Please enter a valid UPI ID');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Create transaction data
      const transactionData: any = {
        upi_id: upiId,
        amount: amountNum,
        recipient_name: recipientName,
        recipient_upi: upiId,
        type: 'UPI',
        timestamp: new Date().toISOString(),
        status: 'completed',
        // Add fraud detection parameters
        login_location: 'Mumbai, India',
        device_id: 'device_12345',
        session_duration: 300,
        failed_attempts: 0,
        merchant_category: 'peer-to-peer',
        location: 'India',
        recent_transactions_count: 3
      };

      // Send transaction data to backend
      const response = await api.post('/transactions', transactionData);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'Failed to process payment');
      }

      // Analyze transaction for fraud
      const analysisResponse = await api.post('/transactions/analyze', transactionData);
      const analysisResult = analysisResponse.data;

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Failed to analyze transaction');
      }

      // Add fraud analysis results to transaction data
      transactionData.is_fraudulent = analysisResult.is_fraudulent;
      transactionData.risk_score = analysisResult.risk_score;
      transactionData.risk_level = analysisResult.risk_level;

      // Update transaction with fraud analysis results
      if (result.transaction_id) {
        await api.put(`/transactions/${result.transaction_id}`, {
          is_fraudulent: analysisResult.is_fraudulent,
          risk_score: analysisResult.risk_score,
          risk_level: analysisResult.risk_level
        });
      }

      // Show success message
      setSuccess(true);
      
      // Notify parent component of success
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        // Reset form
        setUpiId('');
        setAmount('');
        setRecipientName('');
        setSuccess(false);
      }, 500);

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-blue-500/30 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Send Money</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Payment Successful!</h4>
              <p className="text-gray-400">Your transaction has been processed.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Enter recipient name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Recipient UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="example@upi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start">
                  <FiAlertCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium text-white transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Send Money'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;