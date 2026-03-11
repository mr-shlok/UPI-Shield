import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Transaction {
  transaction_id: string;
  amount: number;
  recipient_name: string;
  recipient_upi: string;
  created_at: string;
  is_fraudulent: boolean;
  risk_score: number;
  risk_level: string;
}

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/transactions');
      
      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      } else {
        setError(response.data.error || 'Failed to fetch transactions');
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      // Handle the specific Firebase index error
      if (err.response && err.response.status === 400 && err.response.data && err.response.data.error && err.response.data.error.includes('index')) {
        setError('Transaction data is being prepared. Please try again in a moment.');
        // Retry after a short delay
        setTimeout(fetchTransactions, 3000);
      } else {
        setError('Failed to fetch transactions. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (isFraudulent: boolean, riskLevel: string) => {
    if (isFraudulent) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Fraud</span>;
    }
    
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">High Risk</span>;
      case 'medium':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">Medium Risk</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Safe</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
        <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
        <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
        <div className="text-red-400 text-center py-8">
          <p>{error}</p>
          <button 
            onClick={fetchTransactions}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
        <button 
          onClick={fetchTransactions}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Refresh
        </button>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No transactions found</p>
          <p className="text-sm mt-2">Your transactions will appear here after you make a payment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div 
              key={transaction.transaction_id} 
              className="flex items-center justify-between p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">₹</span>
                </div>
                <div>
                  <p className="font-medium text-white">{transaction.recipient_name}</p>
                  <p className="text-sm text-gray-400">{transaction.recipient_upi}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-white">₹{transaction.amount.toLocaleString()}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-400">{formatDate(transaction.created_at)}</span>
                  {getStatusBadge(transaction.is_fraudulent, transaction.risk_level)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;