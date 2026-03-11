import React, { useState, useEffect } from 'react';
import { FiActivity, FiAlertTriangle, FiBarChart2, FiShield, FiSettings, FiHelpCircle, FiLogOut, FiSearch, FiBell, FiUser, FiMoon, FiSun, FiMenu, FiX, FiChevronDown, FiCheck, FiEye, FiEyeOff, FiMessageSquare, FiHome, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import PaymentModal from '../components/PaymentModal';

const UserDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // New state for chatbot
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState('');
  const [fraudRiskScore, setFraudRiskScore] = useState(0); // New state for fraud risk score
  const [notifications, setNotifications] = useState<any[]>([]); // State for notifications
  const [unreadCount, setUnreadCount] = useState(0); // State for unread notification count
  const [notificationsOpen, setNotificationsOpen] = useState(false); // State for notification dropdown
  const [user, setUser] = useState<any>(null); // State for user data

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    fetchUserTransactions();
    fetchFraudRiskScore(); // Fetch fraud risk score on component mount
    // Load any existing notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter((n: any) => !n.read).length);
    }
  }, []);

  // Fetch user transactions from backend
  const fetchUserTransactions = async () => {
    try {
      setLoadingTransactions(true);
      setTransactionError('');
      
      const response = await api.get('/transactions');
      
      if (response.data.success) {
        const newTransactions = response.data.transactions || [];
        setTransactions(newTransactions);
        
        // Check for new transactions and create notifications
        checkForNewTransactions(newTransactions);
      } else {
        setTransactionError(response.data.error || 'Failed to fetch transactions');
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setTransactionError('Failed to fetch transactions. Please try again later.');
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Check for new transactions and create notifications
  const checkForNewTransactions = (newTransactions: any[]) => {
    // Get previously stored transactions
    const prevTransactions = localStorage.getItem('prevTransactions');
    let prevTransactionIds: string[] = [];
    
    if (prevTransactions) {
      prevTransactionIds = JSON.parse(prevTransactions);
    }
    
    // Find new transactions
    const newTransactionIds = newTransactions.map(t => t.transaction_id);
    const trulyNewTransactions = newTransactions.filter(t => !prevTransactionIds.includes(t.transaction_id));
    
    if (trulyNewTransactions.length > 0) {
      // Create notifications for new transactions
      const newNotifications = trulyNewTransactions.map(transaction => {
        // Determine if this is a debit (user paying) or credit (user receiving)
        const isDebit = transaction.amount > 0; // Assuming positive amounts are what user pays
        return {
          id: Date.now() + Math.random(),
          type: isDebit ? 'debit' : 'credit',
          amount: Math.abs(transaction.amount),
          title: isDebit ? 'Amount Debited' : 'Amount Credited',
          message: `₹${Math.abs(transaction.amount).toLocaleString()} ${isDebit ? 'debited from' : 'credited to'} your account`,
          timestamp: new Date(transaction.created_at),
          read: false
        };
      });
      
      // Update notifications
      const updatedNotifications = [...newNotifications, ...notifications];
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }
    
    // Save current transaction IDs
    localStorage.setItem('prevTransactions', JSON.stringify(newTransactionIds));
  };

  // Fetch user fraud risk score from backend
  const fetchFraudRiskScore = async () => {
    try {
      const response = await api.get('/auth/fraud-risk-score');
      
      if (response.data.success) {
        setFraudRiskScore(response.data.fraud_risk_score || 0);
      }
    } catch (error: any) {
      console.error('Error fetching fraud risk score:', error);
      // Keep default value of 0 if there's an error
    }
  };

  // Mark notification as read
  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle sidebar item click
  const handleSidebarItemClick = (itemName: string) => {
    console.log(`Clicked on: ${itemName}`);
    
    // Close sidebar on mobile after clicking
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    
    // Handle specific actions for certain items
    switch (itemName) {
      case 'Logout':
        // Handle logout logic here
        console.log('Logout clicked');
        break;
      default:
        console.log(`Unknown item clicked: ${itemName}`);
        break;
    }
  };

  // Handle logout from header
  const handleLogout = () => {
    console.log('Logout from header');
    // Clear localStorage
    localStorage.removeItem('session_token');
    localStorage.removeItem('session_id');
    localStorage.removeItem('user');
    localStorage.removeItem('notifications');
    localStorage.removeItem('prevTransactions');
    // Redirect to login page
    window.location.href = '/login';
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <FiHome />, active: true },
    { name: 'Transactions', icon: <FiActivity /> },
    { name: 'Fraud Alerts / Reports', icon: <FiAlertTriangle /> },
    { name: 'Fraud Risk Score', icon: <FiBarChart2 /> },
    { name: 'Analytics', icon: <FiBarChart2 /> },
    { name: 'Account Security', icon: <FiShield /> },
    { name: 'Settings', icon: <FiSettings /> },
    { name: 'Help & Support', icon: <FiHelpCircle /> }
    // Logout removed from sidebar
  ];

  // Calculate summary data based on actual transactions
  const calculateSummaryData = () => {
    if (loadingTransactions) {
      return [
        { name: 'Total Transactions', value: 'Loading...', change: '', color: 'blue' },
        { name: 'Fraudulent Transactions', value: 'Loading...', change: '', color: 'red' },
        { name: 'Amount at Risk', value: 'Loading...', change: '', color: 'orange' },
        { name: 'Fraud Risk Score', value: `${fraudRiskScore}%`, change: '', color: 'purple' },
        { name: 'Last Scanned', value: 'Loading...', change: '', color: 'green' }
      ];
    }
    
    const totalTransactions = transactions.length;
    const fraudulentTransactions = transactions.filter(t => t.is_fraudulent).length;
    const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Determine change indicator based on fraud risk score
    let change = '';
    if (fraudRiskScore > 0) {
      change = `+${fraudRiskScore}%`;
    }
    
    return [
      { name: 'Total Transactions', value: totalTransactions, change: '', color: 'blue' },
      { name: 'Fraudulent Transactions', value: fraudulentTransactions, change: '', color: 'red' },
      { name: 'Amount at Risk', value: `₹${totalAmount.toLocaleString()}`, change: '', color: 'orange' },
      { name: 'Fraud Risk Score', value: `${fraudRiskScore}%`, change: change, color: 'purple' },
      { name: 'Last Scanned', value: '2 mins ago', change: 'Real-time', color: 'green' }
    ];
  };
  
  const summaryData = calculateSummaryData();

  // Prepare chart data
  const prepareChartData = () => {
    if (loadingTransactions || transactions.length === 0) {
      return [{ name: 'No Data', value: 1 }];
    }
    
    // Group transactions by day for the last 7 days
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.created_at);
        return transactionDate.toDateString() === date.toDateString();
      });
      
      data.push({
        name: dateString,
        transactions: dayTransactions.length,
        amount: dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      });
    }
    
    return data;
  };
  
  const chartData = prepareChartData();

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onPaymentSuccess={fetchUserTransactions}
      />
      
      {/* Chatbot Modal */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-end p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-2xl w-full max-w-md border border-blue-500/30 shadow-2xl"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">UPI Shield Assistant</h3>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4 h-96 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
                    <FiMessageSquare className="text-white" size={16} />
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-sm">Hello! I'm your UPI Shield assistant. How can I help you with your transactions today?</p>
                  </div>
                </div>
                <div className="flex items-start justify-end">
                  <div className="bg-blue-500/20 rounded-lg p-3">
                    <p className="text-sm">Can you explain how the fraud detection works?</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
                    <FiMessageSquare className="text-white" size={16} />
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-sm">UPI Shield uses AI to analyze your transactions in real-time, checking for unusual patterns, suspicious recipients, and other risk factors. We protect over 50,000 users daily!</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Ask about your transactions..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-r-lg">
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md shadow-lg z-40 border-b border-blue-900/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-2 p-2 rounded-lg hover:bg-gray-700/50 text-gray-300 bg-gray-800/50 backdrop-blur-sm border border-blue-500/30"
              >
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FiShield className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">UPI Shield</h1>
                  <p className="text-xs text-blue-300">Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-300 transition-all duration-300 transform hover:scale-110"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>

              {/* Notification Bell with Badge */}
              <div className="relative">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-300 relative transition-all duration-300 transform hover:scale-110"
                >
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.button>
                
                {/* Notification Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-400">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer ${
                                !notification.read ? 'bg-gray-700/20' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start">
                                <div className={`p-2 rounded-lg mr-3 ${
                                  notification.type === 'credit' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {notification.type === 'credit' ? (
                                    <FiDollarSign size={16} />
                                  ) : (
                                    <FiCreditCard size={16} />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <h4 className="font-medium text-white">{notification.title}</h4>
                                    <span className="text-xs text-gray-400">
                                      {formatTimestamp(notification.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                                  {!notification.read && (
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/50 text-gray-300 transition-all duration-300 transform hover:scale-105"
              >
                <FiLogOut size={20} />
                <span className="hidden md:inline">Logout</span>
              </button>
              
              <div className="relative">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/50 text-gray-300 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <FiUser size={16} className="text-white" />
                  </div>
                  <FiChevronDown size={16} />
                </motion.button>
                
                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <FiUser size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{user?.display_name || 'User Name'}</h3>
                            <p className="text-sm text-gray-400">{user?.email || 'user@example.com'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700/50 flex items-center">
                          <FiUser className="mr-3" size={16} />
                          Profile
                        </button>
                        <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700/50 flex items-center">
                          <FiSettings className="mr-3" size={16} />
                          Settings
                        </button>
                        <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700/50 flex items-center">
                          <FiShield className="mr-3" size={16} />
                          Security
                        </button>
                      </div>
                      <div className="p-2 border-t border-gray-700">
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 flex items-center"
                        >
                          <FiLogOut className="mr-3" size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-black/95 backdrop-blur-md border-r border-blue-900/30 transition-transform duration-300 ease-in-out overflow-hidden h-full md:h-screen`}>
          <div className="h-full flex flex-col">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              <div className="px-6 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FiShield className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">UPI Shield</h2>
                    <p className="text-xs text-blue-300/80">Dashboard</p>
                  </div>
                </div>
              </div>
              
              <nav className="mt-2 flex-1 px-3 space-y-1">
                {sidebarItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSidebarItemClick(item.name)}
                    className={`flex items-center w-full text-left px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      item.active 
                        ? 'bg-gradient-to-r from-blue-600/90 to-blue-500/90 text-white shadow-lg border border-blue-400/30' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium flex-1 text-left">{item.name}</span>
                    {item.active && (
                      <span className="ml-auto w-2 h-2 bg-blue-300 rounded-full" />
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>
            
            {/* Chatbot Button at bottom of sidebar */}
            <div className="p-4 border-t border-blue-900/30">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setChatOpen(true)}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <FiMessageSquare size={20} />
                <span>Ask Assistant</span>
              </motion.button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
              >
                Dashboard Overview
              </motion.h1>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Pay Now with Animated Logo */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-green-500/30 cursor-pointer hover:from-gray-700/50 hover:to-gray-800/50 transition-all relative overflow-hidden"
                onClick={() => setPayModalOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background elements */}
                <motion.div
                  className="absolute inset-0 opacity-20"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  {/* Animated Payment Logo */}
                  <motion.div
                    className="relative w-20 h-20 mb-4"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-md opacity-70"></div>
                    <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <FiShield className="text-white text-3xl" />
                    </div>
                  </motion.div>
                  
                  <h2 className="text-xl font-bold text-white mb-2">Pay Now</h2>
                  <p className="text-gray-400 text-center">Secure payments with UPI Shield</p>
                </div>
              </motion.div>
              
              {/* Account Balance with Toggle */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-blue-500/30"
              >
                <h2 className="text-xl font-bold text-white mb-2">Account Balance</h2>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-white mr-3">
                    {showBalance ? '₹42,560.75' : '₹******'}
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showBalance ? <FiEyeOff size={24} /> : <FiEye size={24} />}
                  </motion.button>
                </div>
                <p className="text-green-400 text-sm mt-1">+₹2,450.00 this month</p>
              </motion.div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {summaryData.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl p-4 bg-gray-800/50 backdrop-blur-lg border border-blue-500/20"
                >
                  <h3 className="text-gray-400 text-sm mb-1">{item.name}</h3>
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  {item.change && (
                    <p className="text-sm text-gray-400 mt-1">{item.change}</p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Transactions Chart */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20"
              >
                <h2 className="text-xl font-bold text-white mb-4">Weekly Transactions</h2>
                <div className="h-64">
                  <div className="flex items-end h-48 gap-2 mt-8">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className="text-gray-400 text-sm mb-2">{item.name}</div>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.min(100, ((item as any).transactions / 10) * 100)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                        ></motion.div>
                        <div className="text-white text-sm mt-2">{(item as any).transactions || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Amount Chart */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
              >
                <h2 className="text-xl font-bold text-white mb-4">Weekly Amount (₹)</h2>
                <div className="h-64">
                  <div className="flex items-end h-48 gap-2 mt-8">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className="text-gray-400 text-sm mb-2">{item.name}</div>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.min(100, (((item as any).amount || 0) / 5000) * 100)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-500"
                        ></motion.div>
                        <div className="text-white text-sm mt-2">₹{((item as any).amount || 0).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Transactions */}
            <div className="mb-8">
              <TransactionList />
            </div>

            {/* Fraud Detection Parameters */}
            <div className="rounded-2xl p-6 bg-gray-800/50 backdrop-blur-lg border border-purple-500/20 mb-16">
              <h2 className="text-xl font-bold text-white mb-4">AI Fraud Detection Parameters</h2>
              <p className="text-gray-400 mb-6">Real-time analysis using 20+ fraud detection parameters</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    name: "Transaction-based",
                    parameters: [
                      "Extremely high/low amounts",
                      "UPI, IMPS, NEFT, QR types",
                      "Odd hours (late night)",
                      "Multiple rapid transactions"
                    ]
                  },
                  {
                    name: "User Behavior",
                    parameters: [
                      "Login from new locations",
                      "New/multiple devices",
                      "Short/long sessions",
                      "Multiple failed attempts"
                    ]
                  },
                  {
                    name: "Payment Receiver",
                    parameters: [
                      "Unknown/blacklisted VPAs",
                      "Frequent recipient changes",
                      "Low trust merchants"
                    ]
                  },
                  {
                    name: "Network & Security",
                    parameters: [
                      "Sudden location changes",
                      "VPN/proxy usage",
                      "Outdated apps",
                      "Accounts without 2FA"
                    ]
                  },
                  {
                    name: "Historical & Contextual",
                    parameters: [
                      "Prior fraud history",
                      "Transaction velocity spikes",
                      "Behavioral pattern changes"
                    ]
                  }
                ].map((category, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
                  >
                    <h3 className="font-bold text-purple-400 mb-2 flex items-center">
                      <FiShield className="mr-2" />
                      {category.name}
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {category.parameters.map((param, paramIndex) => (
                        <li key={paramIndex} className="flex items-start">
                          <FiCheck className="text-green-400 mr-2 mt-1 flex-shrink-0" size={12} />
                          <span>{param}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-700/50 pt-6 mt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-400 text-sm mb-4 md:mb-0">
                  © {new Date().getFullYear()} UPI Shield. All rights reserved.
                </div>
                <div className="text-gray-400 text-sm mb-4 md:mb-0">
                  Version 1.0.0
                </div>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;