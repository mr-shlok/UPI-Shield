import React, { useState, useEffect } from 'react';
import { FiActivity, FiAlertTriangle, FiBarChart2, FiShield, FiSettings, FiHelpCircle, FiLogOut, FiSearch, FiBell, FiUser, FiMoon, FiSun, FiMenu, FiX, FiChevronDown, FiCheck, FiEye, FiEyeOff, FiMessageSquare, FiHome, FiCreditCard, FiDollarSign, FiLock, FiMonitor } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import PaymentModal from '../components/PaymentModal';

const UserDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
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

  // Settings & Security functional states
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your UPI Shield AI assistant. I can help you with UPI transactions, fraud prevention, and account security. What would you like to know?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

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

  // Handle send chat message
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const newUserMessage = { role: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setChatInput('');
    setIsChatTyping(true);

    // Mock AI Response
    setTimeout(() => {
      let response = "I'm sorry, I couldn't understand that. Could you please rephrase?";
      const lowerInput = chatInput.toLowerCase();

      if (lowerInput.includes('fraud') || lowerInput.includes('protection') || lowerInput.includes('safe') || lowerInput.includes('secure')) {
        response = "UPI Shield monitors your transactions 24/7 using AI to detect suspicious patterns. We analyze parameters like transaction velocity, device trust, and location consistency to keep your account safe.";
      } else if (lowerInput.includes('transaction') || lowerInput.includes('history')) {
        response = "You can view all your recent transactions in the 'Transactions' tab. If you see any unauthorized activity, please report it immediately through the 'Fraud Alerts' section.";
      } else if (lowerInput.includes('score') || lowerInput.includes('risk')) {
        response = `Your current Fraud Risk Score is ${fraudRiskScore}%. A lower score means a highly secure profile.`;
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        response = "Hello! How can I assist you with your UPI account security today?";
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', text: response }]);
      setIsChatTyping(false);
    }, 1200);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle sidebar item click
  const handleSidebarItemClick = (itemName: string) => {
    setActiveTab(itemName);
    
    // Close sidebar on mobile after clicking
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
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
    { name: 'Dashboard', icon: <FiHome /> },
    { name: 'Transactions', icon: <FiActivity /> },
    { name: 'Fraud Alerts / Reports', icon: <FiAlertTriangle /> },
    { name: 'Fraud Risk Score', icon: <FiBarChart2 /> },
    { name: 'Analytics', icon: <FiBarChart2 /> },
    { name: 'Account Security', icon: <FiShield /> },
    { name: 'Settings', icon: <FiSettings /> },
    { name: 'Help & Support', icon: <FiHelpCircle /> }
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
      change = `+${Number(fraudRiskScore).toFixed(2)}%`;
    }
    
    return [
      { name: 'Total Transactions', value: totalTransactions, change: '', color: 'blue' },
      { name: 'Fraudulent Transactions', value: fraudulentTransactions, change: '', color: 'red' },
      { name: 'Amount at Risk', value: `₹${totalAmount.toLocaleString()}`, change: '', color: 'orange' },
      { name: 'Fraud Risk Score', value: `${Number(fraudRiskScore).toFixed(2)}%`, change: change, color: 'purple' },
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
            <div className="p-4 h-96 overflow-y-auto flex flex-col space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
                      <FiMessageSquare className="text-white" size={16} />
                    </div>
                  )}
                  <div className={`rounded-lg p-3 max-w-[80%] ${msg.role === 'user' ? 'bg-blue-500/20' : 'bg-gray-700/50'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isChatTyping && (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
                    <FiMessageSquare className="text-white" size={16} />
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Ask about your transactions..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                />
                <button 
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-r-lg disabled:opacity-50"
                  onClick={handleSendChatMessage}
                  disabled={isChatTyping || !chatInput.trim()}
                >
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
                {/* Duplicate logo removed for clean sidebar */}
              </div>
              
              <nav className="mt-2 flex-1 px-3 space-y-1">
                {sidebarItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSidebarItemClick(item.name)}
                    className={`flex items-center w-full text-left px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === item.name 
                        ? 'bg-gradient-to-r from-blue-600/90 to-blue-500/90 text-white shadow-lg border border-blue-400/30' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium flex-1 text-left">{item.name}</span>
                    {activeTab === item.name && (
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
            {activeTab === 'Dashboard' && (
              <>
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
            </>
            )}

            {activeTab === 'Transactions' && (
              <div className="mb-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">All Transactions</h1>
                </div>
                <TransactionList />
              </div>
            )}

            {activeTab === 'Fraud Alerts / Reports' && (
              <div className="mb-8">
                <div className="mb-6 flex justify-between items-end">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Fraud Alerts & Reports</h1>
                  <span className="flex items-center text-green-400 text-sm font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    System Secure
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Radar/Scanning Animation */}
                  <div className="col-span-1 lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 flex flex-col items-center justify-center relative overflow-hidden min-h-[350px]">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[400px] h-[400px] border border-blue-500/10 rounded-full absolute my-auto mx-auto animate-[ping_3s_ease-in-out_infinite]" />
                      <div className="w-[300px] h-[300px] border border-blue-500/20 rounded-full absolute my-auto mx-auto animate-[ping_3s_ease-in-out_infinite_0.5s]" />
                      <div className="w-[200px] h-[200px] border border-blue-500/30 rounded-full absolute my-auto mx-auto animate-[ping_3s_ease-in-out_infinite_1s]" />
                      
                      {/* Scanning Line */}
                      <div className="w-[200px] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute my-auto mx-auto top-1/2 left-1/2 origin-left animate-[spin_4s_linear_infinite]" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="bg-gray-900/80 p-5 rounded-full border border-gray-700 backdrop-blur-md mb-6 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                        <FiShield className="text-6xl text-blue-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">AI Engine Actively Scanning</h2>
                      <p className="text-blue-200/60 text-sm max-w-sm text-center">Your transactions are protected by 20+ live parameters including network security, location bounding, and recipient IP trust checks.</p>
                    </div>
                  </div>

                  {/* Threat Log */}
                  <div className="col-span-1 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center"><FiActivity className="mr-2 text-purple-400" /> Live Threat Intelligence</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {[
                        { time: 'Just now', event: 'Verified incoming packet signature', status: 'Safe' },
                        { time: '2 min ago', event: 'Checked global merchant blacklist', status: 'Safe' },
                        { time: '15 min ago', event: 'Analyzed location consistency ping', status: 'Safe' },
                        { time: '1 hr ago', event: 'Device trust certificate renewed', status: 'Safe' },
                        { time: '3 hrs ago', event: 'Blocked suspicious login attempt (IP: 193.18.*)', status: 'Blocked' }
                      ].map((log, i) => (
                        <div key={i} className={`flex items-start bg-gray-900/40 p-3 rounded-lg border ${log.status === 'Blocked' ? 'border-red-500/30 bg-red-500/5' : 'border-gray-700/50'} text-xs transition-colors duration-300 hover:bg-gray-800/80`}>
                           <div className="mt-0.5 mr-3">
                             {log.status === 'Blocked' ? <FiAlertTriangle className="text-red-400 text-sm animate-pulse" /> : <FiCheck className="text-green-400 text-sm" />}
                           </div>
                           <div>
                             <p className="text-gray-200 font-medium">{log.event}</p>
                             <p className="text-gray-500 mt-1">{log.time}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Fraud Risk Score' && (
              <div className="mb-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Fraud Risk Score</h1>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 flex flex-col items-center">
                  <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-[6px] border-green-500 mb-6 relative hover:scale-105 transition-transform duration-300">
                    <span className="text-5xl font-bold text-white">{Number(fraudRiskScore).toFixed(2)}%</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Excellent Security Profile</h2>
                  <p className="text-gray-400 text-center max-w-lg mb-8">This score is calculated based on your recent transactions, network details, and user behavior. A low score indicates a very secure profile. Keep it up!</p>
                  
                  <div className="w-full max-w-2xl bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="text-lg font-bold text-gray-300 mb-4">Risk Factors Analyzed:</h3>
                    <div className="space-y-3 px-4">
                      <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-400">Transaction Velocity</span><span className="text-green-400">Normal</span></div>
                      <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-400">Device Trust</span><span className="text-green-400">Trusted Device</span></div>
                      <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-400">Location Consistency</span><span className="text-green-400">Consistent</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Payment Receiver Trust</span><span className="text-green-400">High Trust</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Analytics' && (
              <div className="mb-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Transaction Analytics</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20 col-span-1 lg:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-4">Weekly Spending Overview</h2>
                    <div className="h-64 flex justify-between gap-4 mt-8 px-4 border-b border-gray-700/50 pb-2">
                        {chartData.map((item, index) => {
                          const maxAmount = Math.max(...chartData.map((d: any) => d.amount || 0), 10000);
                          const amt = (item as any).amount || 0;
                          const heightPct = Math.max(8, (amt / maxAmount) * 100);
                          return (
                            <div key={index} className="flex flex-col items-center flex-1 group h-full justify-end">
                              <span className="text-gray-300 text-xs mb-2 font-medium">₹{amt > 1000 ? (amt/1000).toFixed(1)+'k' : amt}</span>
                              <div className="w-full max-w-[50px] h-[75%] bg-gray-700/30 rounded-t-lg relative overflow-hidden group-hover:bg-gray-700/50 transition-colors">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${heightPct}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                />
                              </div>
                              <div className="text-gray-400 text-sm mt-3 font-bold uppercase tracking-wider">{item.name}</div>
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                    <h2 className="text-xl font-bold text-white mb-4">Spending by Category</h2>
                    <div className="space-y-4">
                      {[
                        { name: 'Peer-to-Peer', amount: 15400, color: 'bg-blue-500' },
                        { name: 'Utilities & Bills', amount: 8250, color: 'bg-indigo-500' },
                        { name: 'Shopping', amount: 5600, color: 'bg-purple-500' },
                        { name: 'Food & Dining', amount: 3200, color: 'bg-pink-500' }
                      ].map((cat, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{cat.name}</span>
                            <span className="text-white font-bold">₹{cat.amount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(cat.amount / 32450) * 100}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`h-2.5 rounded-full ${cat.color}`}
                            ></motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20 col-span-1">
                     <h2 className="text-xl font-bold text-white mb-4">Monthly Cash Flow</h2>
                     <div className="flex justify-between items-end mb-4">
                       <div>
                         <p className="text-gray-400 text-sm">Income</p>
                         <p className="text-green-400 font-bold text-lg">₹1,45,000</p>
                       </div>
                       <div className="text-right">
                         <p className="text-gray-400 text-sm">Expenses</p>
                         <p className="text-red-400 font-bold text-lg">₹93,450</p>
                       </div>
                     </div>
                     <div className="relative w-full h-8 overflow-hidden rounded-full flex gap-1 bg-gray-700/50 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1.5, delay: 0.5 }} className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-l-full relative overflow-hidden">
                           <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                        <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 1.5, delay: 0.5 }} className="bg-gradient-to-r from-red-500 to-red-400 h-full rounded-r-full relative overflow-hidden">
                           <div className="absolute inset-0 bg-white/20 animate-pulse shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]" />
                        </motion.div>
                     </div>
                     <p className="text-center text-xs text-gray-500 mt-4 font-medium uppercase tracking-wider">You saved ~40% of your income this month</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/20 col-span-1">
                     <h2 className="text-xl font-bold text-white mb-4">Merchant Trust Distribution</h2>
                     <div className="space-y-5">
                       {[
                         { label: 'High Trust (Verified)', pct: 85, color: 'bg-green-500' },
                         { label: 'Medium Trust (New)', pct: 12, color: 'bg-yellow-500' },
                         { label: 'Low Trust (Unverified)', pct: 3, color: 'bg-red-500' }
                       ].map((trust, i) => (
                         <div key={i}>
                           <div className="flex justify-between text-sm mb-1">
                             <span className="text-gray-300 font-medium flex items-center">
                               <span className={`w-2 h-2 rounded-full ${trust.color} mr-2 shadow-[0_0_8px_currentColor]`}></span>
                               {trust.label}
                             </span>
                             <span className="text-white font-bold">{trust.pct}%</span>
                           </div>
                           <div className="w-full bg-gray-700/50 rounded-full h-2">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${trust.pct}%` }} transition={{ duration: 1.2, delay: 0.5 + i * 0.1 }} className={`h-2 rounded-full ${trust.color} shadow-[0_0_10px_currentColor]`} />
                           </div>
                         </div>
                       ))}
                     </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/20 col-span-1 lg:col-span-2 overflow-hidden relative">
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                     <div className="flex justify-between items-center mb-6 relative z-10">
                       <h2 className="text-xl font-bold text-white">Live Transaction Velocity (24h)</h2>
                       <span className="flex items-center text-cyan-400 text-xs font-bold bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                         <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
                         LIVE T-SYNC
                       </span>
                     </div>
                     <div className="relative h-40 w-full bg-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden shadow-inner">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between opacity-10">
                          <div className="border-t border-cyan-400 w-full"></div>
                          <div className="border-t border-cyan-400 w-full"></div>
                          <div className="border-t border-cyan-400 w-full"></div>
                          <div className="border-t border-cyan-400 w-full"></div>
                        </div>
                        {/* Animated waveform scatter simulation */}
                        <div className="absolute bottom-0 w-full h-full flex items-end justify-around px-2 pb-0">
                           {[10, 45, 30, 80, 50, 60, 20, 90, 40, 70, 30, 85, 45, 65, 25, 75, 55, 35, 95, 40, 60, 15, 80, 65].map((val, i) => (
                              <motion.div 
                                key={i}
                                initial={{ height: '5%' }}
                                animate={{ height: [`${Math.max(5, val-20)}%`, `${val}%`, `${Math.max(5, val-10)}%`] }}
                                transition={{ duration: 1.5 + (i%3), repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                                className={`w-1.5 rounded-t-sm shadow-[0_0_8px_currentColor] ${val > 80 ? 'bg-orange-400 text-orange-400' : 'bg-cyan-400/80 text-cyan-400'}`}
                              />
                           ))}
                        </div>
                     </div>
                     <div className="flex justify-between text-xs text-gray-500 mt-3 px-1 font-mono">
                       <span>00:00</span>
                       <span>06:00</span>
                       <span>12:00</span>
                       <span>18:00</span>
                       <span>24:00</span>
                     </div>
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'Account Security' && (
              <div className="mb-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Account Security</h1>
                  <p className="text-gray-400 mt-1">Manage your security preferences and active sessions.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 lg:col-span-2 space-y-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 flex items-center justify-between hover:bg-gray-800/80 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><FiShield size={24} /></div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-400">Add an extra layer of security to your account.</p>
                        </div>
                      </div>
                      <div 
                        className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${twoFAEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                        onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${twoFAEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 flex items-center justify-between hover:bg-gray-800/80 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400"><FiAlertTriangle size={24} /></div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Unrecognized Login Alerts</h3>
                          <p className="text-sm text-gray-400">Get notified if anyone logs in from a new device.</p>
                        </div>
                      </div>
                      <div 
                        className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${loginAlerts ? 'bg-green-500' : 'bg-gray-600'}`}
                        onClick={() => setLoginAlerts(!loginAlerts)}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${loginAlerts ? 'translate-x-7' : 'translate-x-0'}`} />
                      </div>
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="col-span-1 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-4">Active Sessions</h2>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 bg-gray-900/50 rounded-xl border border-gray-700">
                        <FiMonitor className="text-blue-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm font-bold text-white">Windows PC - Chrome</p>
                          <p className="text-xs text-green-400">Active Now • Mumbai, India</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-gray-900/50 rounded-xl border border-gray-700 opacity-70">
                        <FiMonitor className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm font-bold text-white">iPhone 13 - Safari</p>
                          <p className="text-xs text-gray-400">Last active 2 days ago</p>
                        </div>
                      </div>
                      <button className="w-full py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30">Sign out all other devices</button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'Settings' && (
              <div className="mb-8 max-w-4xl">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Preferences & Settings</h1>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center"><FiBell className="mr-2 text-purple-400" /> Notifications</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Push Notifications</span>
                          <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${pushNotifications ? 'bg-blue-500' : 'bg-gray-600'}`} onClick={() => setPushNotifications(!pushNotifications)}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Email Updates</span>
                          <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${emailUpdates ? 'bg-blue-500' : 'bg-gray-600'}`} onClick={() => setEmailUpdates(!emailUpdates)}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${emailUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 flex flex-col justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center"><FiSettings className="mr-2 text-blue-400" /> App Preferences</h2>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Display Theme</span>
                            <div className="flex bg-gray-900 rounded-lg p-1">
                               <button onClick={() => setDarkMode(false)} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${!darkMode ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>Light</button>
                               <button onClick={() => setDarkMode(true)} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${darkMode ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>Dark</button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Default Currency</span>
                            <select className="bg-gray-900 border border-gray-700 text-sm text-white rounded-lg px-2 py-1 outline-none">
                              <option>INR (₹)</option>
                              <option>USD ($)</option>
                              <option>EUR (€)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center"><FiLock className="mr-2 text-green-400" /> Privacy & Data</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Profile Visibility</span>
                          <select className="bg-gray-900 border border-gray-700 text-sm text-white rounded-lg px-2 py-1 outline-none">
                            <option>Public (UPI ID Visible)</option>
                            <option>Contacts Only</option>
                            <option>Private</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-300 text-sm block">Analytics Data Sharing</span>
                            <span className="text-gray-500 text-xs mt-0.5 block">Help us improve by sharing anonymous usage data</span>
                          </div>
                          <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${dataSharing ? 'bg-blue-500' : 'bg-gray-600'}`} onClick={() => setDataSharing(!dataSharing)}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${dataSharing ? 'translate-x-6' : 'translate-x-0'}`} />
                          </div>
                        </div>
                        <button className="w-full text-left text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2">Download My Data Archive</button>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center"><FiCreditCard className="mr-2 text-orange-400" /> Payment Limits</h2>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">Daily Transfer Limit</span>
                            <span className="text-white font-bold">₹50,000 / ₹1,00,000</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">Per-Transaction Limit</span>
                            <span className="text-white font-bold">₹25,000</span>
                          </div>
                          <input type="range" min="1000" max="100000" defaultValue="25000" className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <button className="w-full py-2 mt-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600 block text-center">Save New Limits</button>
                      </div>
                    </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'Help & Support' && (
              <div className="mb-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Help & Support</h1>
                  <p className="text-gray-400 mt-1">Find answers or reach out to our fully dedicated support team.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                      {[
                        { q: 'How does UPI Shield detect fraud?', a: 'UPI Shield uses an advanced AI engine running in real-time. It analyzes 20+ parameters including device fingerprinting, transaction velocity, location drops, and receiver trust score to calculate immediate risk.' },
                        { q: 'What should I do if my account is compromised?', a: 'Immediately use the "Account Security" tab to sign out all active sessions and change your PIN. Then contact support using the form on this page.' },
                        { q: 'Are there any limits on transactions?', a: 'Yes, dynamically adjusting limits are applied based on your Fraud Risk Score. Exceptional profiles have standard bank-level UPI maximum limits.' },
                      ].map((faq, idx) => (
                        <div key={idx} className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden transition-all duration-300">
                          <button 
                            onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                            className="w-full px-5 py-4 text-left flex justify-between items-center focus:outline-none"
                          >
                            <span className="font-bold text-gray-200">{faq.q}</span>
                            <FiChevronDown className={`text-blue-400 transition-transform duration-300 ${activeFaq === idx ? 'transform rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {activeFaq === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-700/30 pt-3">
                                  {faq.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                     <h2 className="text-xl font-bold text-white mb-4">Contact Support</h2>
                     <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                        <form onSubmit={(e) => { e.preventDefault(); alert('Support request sent! Our team will contact you shortly.'); }}>
                           <div className="space-y-4">
                              <div>
                                 <label className="block text-sm text-gray-400 mb-1">Issue Topic</label>
                                 <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                                    <option>Report Fraudulent Activity</option>
                                    <option>Transaction Failed / Pending</option>
                                    <option>Account Recovery</option>
                                    <option>General Inquiry</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-sm text-gray-400 mb-1">Description</label>
                                 <textarea rows={4} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Please describe your issue in detail..."></textarea>
                              </div>
                              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg transform hover:-translate-y-1">
                                 Submit Request
                              </button>
                           </div>
                        </form>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;