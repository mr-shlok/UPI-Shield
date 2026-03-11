import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                UPI Shield
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                {userData?.display_name || userData?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

          {/* User Info Card */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-blue-500/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">User Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Name</p>
                <p className="text-white text-lg">{userData?.display_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Email</p>
                <p className="text-white text-lg">{userData?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Phone</p>
                <p className="text-white text-lg">{userData?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Role</p>
                <p className="text-white text-lg capitalize">{userData?.role || 'user'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Email Verified</p>
                <p className="text-white text-lg">
                  {userData?.email_verified ? (
                    <span className="text-green-400">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-400">✗ Not Verified</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Account Status</p>
                <p className="text-white text-lg">
                  {userData?.is_active ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-red-400">Inactive</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Safe Transactions</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-red-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Fraud Detected</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200">
                New Transaction
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200">
                View History
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200">
                Security Settings
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200">
                Reports
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
