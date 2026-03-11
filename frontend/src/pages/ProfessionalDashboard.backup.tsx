import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  FiHome, FiActivity, FiAlertTriangle, FiBarChart2, 
  FiShield, FiSettings, FiHelpCircle, FiLogOut, 
  FiSearch, FiBell, FiUser, FiMoon, FiSun, FiMenu, 
  FiX, FiChevronDown, FiMessageSquare, FiMapPin,
  FiCheck, FiInfo, FiBarChart, FiEye, FiEyeOff
} from 'react-icons/fi';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import logo from '../assets/logo.svg';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import PaymentModal from '../components/PaymentModal';

// Define mock data for initial loading state
const initialSummaryData = [
  { name: 'Total Transactions', value: 'Loading...', change: '', color: 'blue' },
  { name: 'Fraudulent Transactions', value: 'Loading...', change: '', color: 'red' },
  { name: 'Amount at Risk', value: 'Loading...', change: '', color: 'orange' },
  { name: 'Fraud Risk Score', value: 'Loading...', change: '', color: 'purple' },
  { name: 'Last Scanned', value: 'Loading...', change: '', color: 'green' }
];

const initialTransactionData = [
  { date: 'Today', transactions: 0, fraud: 0 }
];

const categoryData = [
  { name: 'Bank Transfers', value: 320 },
  { name: 'Merchant Payments', value: 450 },
  { name: 'Peer-to-Peer', value: 280 },
  { name: 'Bill Payments', value: 190 }
];

const initialFraudPieData = [
  { name: 'Safe', value: 0 },
  { name: 'Suspicious', value: 0 },
  { name: 'Fraud', value: 0 }
];

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const activityLog = [
  { time: '10:45 PM', action: 'Password changed', type: 'security' },
  { time: '09:30 PM', action: 'Fraud detected in TXN#38472', type: 'fraud' },
  { time: '08:15 PM', action: 'New login from Chrome (Mumbai)', type: 'login' },
  { time: '07:20 PM', action: 'Transaction approved', type: 'transaction' }
];

const fraudTips = [
  "⚠️ Avoid sharing OTPs with anyone.",
  "✅ This transaction pattern looks safe.",
  "🔒 Always verify recipient details before sending money.",
  "📱 Enable biometric authentication for extra security."
];

const fraudDetectionParameters = [
  {
    name: "Transaction-based",
    parameters: [
      "Extremely high/low amounts",
      "UPI, IMPS, NEFT, QR types",
      "Odd hours (late night)",
      "Multiple rapid transactions",
      "Unusual merchant categories",
      "Cross-border transactions"
    ]
  },
  {
    name: "User Behavior",
    parameters: [
      "Login from new locations",
      "New/multiple devices",
      "Short/long sessions",
      "Multiple failed attempts",
      "KYC details mismatch"
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
];

const sidebarItems = [
  { name: 'Dashboard', icon: <FiHome />, active: true },
  { name: 'Transactions', icon: <FiActivity /> },
  { name: 'Fraud Alerts / Reports', icon: <FiAlertTriangle /> },
  { name: 'Fraud Risk Score', icon: <FiBarChart2 /> },
  { name: 'Analytics', icon: <FiBarChart2 /> },
  { name: 'AI Chat / Virtual Assistant', icon: <FiMessageSquare /> },
  { name: 'Account Security', icon: <FiShield /> },
  { name: 'Settings', icon: <FiSettings /> },
  { name: 'Help & Support', icon: <FiHelpCircle /> },
  { name: 'Logout', icon: <FiLogOut /> }
];

const ProfessionalDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [showBalance, setShowBalance] = useState(false);
  
  // Transaction state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState('');
  
  // For interactive background effects
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { damping: 25, stiffness: 400 });
  const smoothY = useSpring(cursorY, { damping: 25, stiffness: 400 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fetch user transactions on component mount
  useEffect(() => {
    fetchUserTransactions();
  }, []);

  // Fetch user transactions from backend
  const fetchUserTransactions = async () => {
    try {
      setLoadingTransactions(true);
      setTransactionError('');
      
      const response = await api.get('/transactions');
      
      if (response.data.success) {
        setTransactions(response.data.transactions || []);
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

  // Calculate summary data based on actual transactions
  const calculateSummaryData = () => {
    if (loadingTransactions) {
      return initialSummaryData;
    }
    
    const totalTransactions = transactions.length;
    const fraudulentTransactions = transactions.filter(t => t.is_fraudulent).length;
    const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const protectedAmount = totalAmount - (fraudulentTransactions * 1000); // Simplified calculation
    
    return [
      { name: 'Total Transactions', value: totalTransactions, change: '', color: 'blue' },
      { name: 'Fraudulent Transactions', value: fraudulentTransactions, change: '', color: 'red' },
      { name: 'Amount at Risk', value: `₹${protectedAmount.toLocaleString()}`, change: '', color: 'orange' },
      { name: 'Fraud Risk Score', value: '76%', change: '-3%', color: 'purple' },
      { name: 'Last Scanned', value: '2 mins ago', change: 'Real-time', color: 'green' }
    ];
  };
  
  // Prepare transaction data for charts
  const prepareTransactionData = () => {
    if (loadingTransactions || transactions.length === 0) {
      return initialTransactionData;
    }
    
    // Group transactions by date (simplified for demo)
    const today = new Date();
    const transactionData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.created_at || t.timestamp);
        return transactionDate.toDateString() === date.toDateString();
      });
      
      const fraudCount = dayTransactions.filter(t => t.is_fraudulent).length;
      
      transactionData.push({
        date: dateString,
        transactions: dayTransactions.length,
        fraud: fraudCount
      });
    }
    
    return transactionData;
  };
  
  // Prepare fraud pie data
  const prepareFraudPieData = () => {
    if (loadingTransactions) {
      return initialFraudPieData;
    }
    
    const safeCount = transactions.filter(t => !t.is_fraudulent && (!t.risk_score || t.risk_score < 50)).length;
    const suspiciousCount = transactions.filter(t => !t.is_fraudulent && t.risk_score >= 50).length;
    const fraudCount = transactions.filter(t => t.is_fraudulent).length;
    
    return [
      { name: 'Safe', value: safeCount },
      { name: 'Suspicious', value: suspiciousCount },
      { name: 'Fraud', value: fraudCount }
    ];
  };
  
  // Prepare recent alerts
  const prepareRecentAlerts = () => {
    if (loadingTransactions) {
      return [
        { 
          date: 'Loading...', 
          transactionId: '...', 
          receiver: '...', 
          amount: '...', 
          status: 'Loading', 
          riskScore: '...', 
          action: 'View' 
        }
      ];
    }
    
    // Sort transactions by date (newest first) and take first 4
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp || 0);
      const dateB = new Date(b.created_at || b.timestamp || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    return sortedTransactions.slice(0, 4).map(transaction => ({
      date: new Date(transaction.created_at || transaction.timestamp).toLocaleDateString(),
      transactionId: transaction.transaction_id?.substring(0, 8) || 'Unknown',
      receiver: transaction.recipient_upi || transaction.recipient_name || 'Unknown',
      amount: `₹${transaction.amount?.toLocaleString() || '0'}`,
      status: transaction.is_fraudulent ? 'Fraud' : (transaction.risk_score > 50 ? 'Suspicious' : 'Safe'),
      riskScore: `${transaction.risk_score || 0}%`,
      action: 'View'
    }));
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
        // In a real implementation, you would call the logout function from your auth context
        // Example: logout();
        break;
      case 'Report Fraud':
        // Handle report fraud logic here
        console.log('Report Fraud clicked');
        // In a real implementation, you would open a modal or navigate to the report fraud page
        break;
      case 'Dashboard':
        // Navigate to dashboard
        console.log('Navigating to Dashboard');
        // In a real implementation, you would use react-router-dom to navigate
        // Example: navigate('/dashboard');
        break;
      case 'Transactions':
        // Navigate to transactions
        console.log('Navigating to Transactions');
        // Example: navigate('/transactions');
        break;
      case 'Fraud Alerts / Reports':
        // Navigate to fraud alerts
        console.log('Navigating to Fraud Alerts / Reports');
        // Example: navigate('/fraud-alerts');
        break;
      case 'Fraud Risk Score':
        // Navigate to fraud risk score
        console.log('Navigating to Fraud Risk Score');
        // Example: navigate('/fraud-risk-score');
        break;
      case 'Analytics':
        // Navigate to analytics
        console.log('Navigating to Analytics');
        // Example: navigate('/analytics');
        break;
      case 'AI Chat / Virtual Assistant':
        // Open AI chat
        console.log('Opening AI Chat / Virtual Assistant');
        // Example: openChatModal();
        break;
      case 'Account Security':
        // Navigate to account security
        console.log('Navigating to Account Security');
        // Example: navigate('/account-security');
        break;
      case 'Settings':
        // Navigate to settings
        console.log('Navigating to Settings');
        // Example: navigate('/settings');
        break;
      case 'Help & Support':
        // Navigate to help and support
        console.log('Navigating to Help & Support');
        // Example: navigate('/help-support');
        break;
      default:
        // Handle navigation or other actions
        console.log(`Unknown item clicked: ${itemName}`);
        break;
    }
  };

  // Handle report fraud button click
  const handleReportFraud = () => {
    console.log('Report Fraud button clicked');
    // Add your report fraud logic here
    // For example, open a modal or navigate to the report fraud page
    handleSidebarItemClick('Report Fraud');
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let bgColor = '';
    switch (status.toLowerCase()) {
      case 'safe':
        bgColor = 'bg-green-500/20 text-green-400';
        break;
      case 'suspicious':
        bgColor = 'bg-yellow-500/20 text-yellow-400';
        break;
      case 'fraud':
        bgColor = 'bg-red-500/20 text-red-400';
        break;
      default:
        bgColor = 'bg-gray-500/20 text-gray-400';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };

  // Handle payment submission
  const handlePayment = async () => {
    setPaymentLoading(true);
    setPaymentError('');
    
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
      
      console.log('Transaction processed:', result);
      console.log('Fraud analysis:', analysisResult);
      
      // Update transaction with fraud analysis results
      if (result.transaction_id) {
        await api.put(`/transactions/${result.transaction_id}`, {
          is_fraudulent: analysisResult.is_fraudulent,
          risk_score: analysisResult.risk_score,
          risk_level: analysisResult.risk_level
        });
      }
      
      // Refresh transactions to show the new one
      await fetchUserTransactions();
      
      // Show success message
      setPaymentSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setPayModalOpen(false);
        setPaymentSuccess(false);
        setUpiId('');
        setAmount('');
        setRecipientName('');
      }, 3000);
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Failed to process payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onPaymentSuccess={fetchUserTransactions}
      />
      
      {/* Header / Top Navbar with Home Page Styling */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md shadow-lg z-50 border-b border-blue-900/30 relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Professional Blue UPI Security Banner Background - More Visible */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950" />
          
          {/* Circuit Pattern Overlay */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e40af" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            
            {/* Glowing Lines */}
            <motion.line 
              x1="0" y1="30" x2="100%" y2="30" 
              stroke="url(#lineGradient)" 
              strokeWidth="2"
              animate={{ strokeOpacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.line 
              x1="0" y1="50" x2="100%" y2="50" 
              stroke="url(#lineGradient)" 
              strokeWidth="1"
              animate={{ strokeOpacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
            
            {/* Circuit Nodes */}
            {[15, 35, 55, 75, 95].map((x, i) => (
              <motion.circle
                key={i}
                cx={`${x}%`}
                cy="40"
                r="4"
                fill="#3b82f6"
                animate={{ 
                  opacity: [0.4, 1, 0.4],
                  r: [3, 5, 3],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </svg>

          {/* Shield Icon Pattern - Right Side */}
          <motion.div
            className="absolute right-8 top-1/2 transform -translate-y-1/2"
            animate={{ 
              opacity: [0.15, 0.35, 0.15],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80">
              <defs>
                <linearGradient id="shieldBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e40af" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <path
                d="M40 10 L70 22 L70 45 C70 55 62 68 40 75 C18 68 10 55 10 45 L10 22 Z"
                fill="url(#shieldBgGrad)"
                opacity="0.6"
              />
              <circle cx="40" cy="45" r="12" fill="#fff" opacity="0.3" />
              <text x="40" y="52" fontSize="20" textAnchor="middle" fill="#fff" opacity="0.5">🔒</text>
            </svg>
          </motion.div>

          {/* Lock Icons - Left Side */}
          <motion.div
            className="absolute left-8 top-1/2 transform -translate-y-1/2"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="#3b82f6" opacity="0.4" />
              <rect x="22" y="28" width="16" height="12" rx="2" fill="#60a5fa" opacity="0.6" />
              <path 
                d="M24 28 L24 23 C24 19 26.5 16 30 16 C33.5 16 36 19 36 23 L36 28" 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="3" 
                opacity="0.6"
              />
            </svg>
          </motion.div>

          {/* Hexagonal Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexPattern" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                <path 
                  d="M25 0 L50 14.43 L50 28.87 L25 43.3 L0 28.87 L0 14.43 Z" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="0.5" 
                  opacity="0.15"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexPattern)" />
          </svg>

          {/* Glowing Particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${10 + i * 7}%`,
                top: `${30 + (i % 3) * 15}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.8, 1],
              }}
              transition={{
                duration: 2 + (i * 0.2),
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>

        {/* Decorative gradient line at top - glossy blue */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-500" 
          style={{ boxShadow: '0 2px 10px rgba(59,130,246,0.5)' }} 
        />
        
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: '50%',
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Menu */}
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-2 p-2 rounded-lg hover:bg-gray-700/50 text-gray-300 bg-gray-800/50 backdrop-blur-sm border border-blue-500/30"
              >
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3 relative"
              >
                {/* Stylish Shield Icon */}
                <div className="relative w-12 h-12">
                  {/* Animated glow effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg blur-lg"
                  />
                  
                  {/* Shield SVG */}
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    className="relative z-10"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(59,130,246,0.4))',
                    }}
                  >
                    <defs>
                      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    
                    {/* Shield Shape */}
                    <motion.path
                      d="M24 4 L42 12 L42 24 C42 30 38 38 24 42 C10 38 6 30 6 24 L6 12 Z"
                      fill="url(#shieldGrad)"
                      stroke="#60a5fa"
                      strokeWidth="1.5"
                      animate={{
                        strokeOpacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Lock Icon */}
                    <rect x="19" y="22" width="10" height="8" rx="1.5" fill="#fff" opacity="0.95"/>
                    <path 
                      d="M20 22 L20 19 C20 17 21.5 15.5 24 15.5 C26.5 15.5 28 17 28 19 L28 22" 
                      fill="none" 
                      stroke="#1e40af" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                    <circle cx="24" cy="25.5" r="1.2" fill="#1e40af"/>
                    <line x1="24" y1="26.7" x2="24" y2="28.5" stroke="#1e40af" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">UPI Shield</h1>
                  <p className="text-xs text-blue-300">Secure Your Transactions</p>
                </div>
              </motion.div>
            </div>

            {/* Center - Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <div className="relative w-full rounded-lg bg-gray-700/50 backdrop-blur-sm border border-blue-500/30">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-blue-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search transactions or alerts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-white placeholder-blue-300/70"
                />
              </div>
            </div>

            {/* Right side - Icons and Profile */}
            <div className="flex items-center space-x-4">
              <motion.button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </motion.button>
              

              <motion.button 
                className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiBell size={20} />
              </motion.button>
              
              <div className="relative">
                <motion.button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/50 text-gray-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <FiUser size={16} className="text-white" />
                  </div>
                  <FiChevronDown size={16} />
                </motion.button>
                
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-gray-800/90 backdrop-blur-lg border border-blue-500/30 ring-1 ring-black ring-opacity-5"
                    >
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">Settings</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">Logout</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar Navigation with Home Page Styling */}
        <motion.aside 
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-black/95 backdrop-blur-md border-r border-blue-900/30 transition-transform duration-300 ease-in-out overflow-hidden h-full md:h-screen`}
          initial={false}
          animate={{ x: sidebarOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Sidebar Background Effects */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/50 to-slate-950" />
            
            {/* Circuit Pattern Overlay */}
            <svg 
              className="absolute inset-0 w-full h-full" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="sidebarLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e40af" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* Glowing Lines */}
              <motion.line 
                x1="20" y1="30" x2="80%" y2="30" 
                stroke="url(#sidebarLineGradient)" 
                strokeWidth="1"
                animate={{ strokeOpacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.line 
                x1="20" y1="60" x2="80%" y2="60" 
                stroke="url(#sidebarLineGradient)" 
                strokeWidth="1"
                animate={{ strokeOpacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              />
              
              {/* Circuit Nodes */}
              {[20, 40, 60, 80].map((y, i) => (
                <motion.circle
                  key={i}
                  cx="30"
                  cy={y}
                  r="3"
                  fill="#3b82f6"
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3],
                    r: [2, 4, 2],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </svg>

            {/* Hexagonal Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="sidebarHexPattern" x="0" y="0" width="40" height="34.6" patternUnits="userSpaceOnUse">
                  <path 
                    d="M20 0 L40 11.55 L40 23.09 L20 34.64 L0 23.09 L0 11.55 Z" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="0.3" 
                    opacity="0.1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#sidebarHexPattern)" />
            </svg>
          </div>

          <div className="h-full flex flex-col relative z-10">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              <div className="px-6 mb-6">
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative w-10 h-10">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg blur-md"
                    />
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      className="relative z-10"
                    >
                      <defs>
                        <linearGradient id="sidebarShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M20 3 L35 10 L35 20 C35 28 30 35 20 37 C10 35 5 28 5 20 L5 10 Z"
                        fill="url(#sidebarShieldGrad)"
                        stroke="#60a5fa"
                        strokeWidth="1"
                      />
                      <rect x="16" y="18" width="8" height="6" rx="1" fill="#fff" opacity="0.9"/>
                      <path 
                        d="M17 18 L17 16 C17 15 18 14 20 14 C22 14 23 15 23 16 L23 18" 
                        fill="none" 
                        stroke="#1e40af" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">UPI Shield</h2>
                    <p className="text-xs text-blue-300/80">Dashboard</p>
                  </div>
                </motion.div>
              </div>
              
              <nav className="mt-2 flex-1 px-3 space-y-1">
                {sidebarItems.map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSidebarItemClick(item.name)}
                    className={`flex items-center w-full text-left px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      item.active 
                        ? 'bg-gradient-to-r from-blue-600/90 to-blue-500/90 text-white shadow-lg border border-blue-400/30' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index + 0.3 }}
                    whileHover={{ 
                      x: 8, 
                      backgroundColor: item.active ? 'rgba(37, 99, 235, 0.7)' : 'rgba(30, 41, 59, 0.5)',
                      boxShadow: item.active ? '0 10px 25px rgba(59, 130, 246, 0.4)' : '0 5px 15px rgba(0, 0, 0, 0.2)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium flex-1 text-left">{item.name}</span>
                    {item.active && (
                      <motion.span 
                        className="ml-auto w-2 h-2 bg-blue-300 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                      />
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>
            
            {/* Report Fraud Button with Enhanced Animation */}
            <motion.div 
              className="flex-shrink-0 flex border-t border-blue-900/50 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button 
                onClick={handleReportFraud}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-medium py-3 px-4 rounded-xl transition duration-300 shadow-lg border border-red-500/30 relative overflow-hidden"
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
                  y: -2
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200 }}
              >
                {/* Animated shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <div className="relative z-10 flex items-center justify-center space-x-2">
                  <FiAlertTriangle className="text-lg" />
                  <span>Report Fraud</span>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </motion.aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 pb-8 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Header */}
            <motion.div 
              className="mb-6 relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Dashboard Overview</h1>
            </motion.div>

            {/* Pay Section - Moved to top with enhanced professional design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-4 shadow-2xl bg-gray-800/50 backdrop-blur-lg border border-green-500/20 mb-6 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <motion.h2 
                  className="text-xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Quick Pay
                </motion.h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pay Card with Professional Design */}
                  <motion.div 
                    className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 border border-green-500/30 relative overflow-hidden cursor-pointer h-full"
                    whileHover={{ 
                      y: -5, 
                      boxShadow: '0 15px 30px rgba(16, 185, 129, 0.2)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPayModalOpen(true)}
                  >
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    />
                    
                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                      <div className="relative w-16 h-16 mb-3">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full blur-md"
                        />
                        <div className="relative z-10 w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center">
                          <svg width="40" height="40" viewBox="0 0 32 32" className="text-white">
                            <path
                              d="M16 2 L28 8 L28 16 C28 22 24 28 16 30 C8 28 4 22 4 16 L4 8 Z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="16" cy="16" r="6" fill="currentColor" />
                            <path 
                              d="M13 16 L13 14 C13 13 14 12 16 12 C18 12 19 13 19 14 L19 16" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="1.5" 
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Send Money</h3>
                      <p className="text-gray-400">Pay securely with UPI Shield</p>
                    </div>
                  </motion.div>
                  
                  {/* Balance Card with hidden balance */}
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 border border-blue-500/30 relative overflow-hidden h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">Account Balance</h3>
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <FiBarChart2 className="text-blue-400" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-3xl font-bold text-white">
                        {showBalance ? '₹42,560.75' : '₹******'}
                      </p>
                      <button 
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-blue-400 hover:text-blue-300 mt-1 flex items-center"
                      >
                        {showBalance ? (
                          <>
                            <FiEyeOff className="mr-1" /> Hide
                          </>
                        ) : (
                          <>
                            <FiEye className="mr-1" /> Show
                          </>
                        )}
                      </button>
                      <p className="text-green-400 text-sm mt-1">+₹2,450.00 this month</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs">Transactions</p>
                        <p className="text-white font-bold">142</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs">Protected</p>
                        <p className="text-white font-bold">₹18,240</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Summary Cards with Home Page Styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
              {summaryData.map((item, index) => (
                <motion.div 
                  key={index}
                  className="rounded-2xl p-4 shadow-2xl bg-gray-800/50 backdrop-blur-lg border border-blue-500/20 relative overflow-hidden"
                >
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10">
                    <motion.h2 
                      className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {item.name}
                    </motion.h2>
                    <div className="flex items-center justify-between">
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {item.value}
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        {item.change}
                      </motion.p>
                    </div>
                    <motion.div 
                      className={`p-3 rounded-xl ${
                        item.color === 'blue' ? 'bg-blue-500/20' :
                        item.color === 'red' ? 'bg-red-500/20' :
                        item.color === 'orange' ? 'bg-orange-500/20' :
                        item.color === 'purple' ? 'bg-purple-500/20' :
                        'bg-green-500/20'
                      }`}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      {item.color === 'blue' && <FiActivity className="text-blue-400" size={28} />}
                      {item.color === 'red' && <FiAlertTriangle className="text-red-400" size={28} />}
                      {item.color === 'orange' && <FiBarChart2 className="text-orange-400" size={28} />}
                      {item.color === 'purple' && <FiShield className="text-purple-400" size={28} />}
                      {item.color === 'green' && <FiBarChart2 className="text-green-400" size={28} />}
                    </motion.div>
                  </div>
                  
                  {/* Animated border */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl border border-blue-500/30 pointer-events-none"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(59, 130, 246, 0)',
                        '0 0 0 2px rgba(59, 130, 246, 0.3)',
                        '0 0 0 0 rgba(59, 130, 246, 0)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Charts Section with Home Page Styling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Transactions vs Fraud Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl p-4 shadow-2xl bg-gray-800/50 backdrop-blur-lg border border-blue-500/20 relative overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <motion.h2 
                    className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Transactions vs Fraudulent Activity
                  </motion.h2>
                  <p className="text-gray-400 text-sm mb-6">(Last 30 days)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={transactionData}
                      margin={{
                        top: 20, right: 30, left: 20, bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="transactions" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="fraud" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Transaction Categories Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl p-4 shadow-2xl bg-gray-800/50 backdrop-blur-lg border border-purple-500/20 relative overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <motion.h2 
                    className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    Transaction Categories
                  </motion.h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            color: 'white'
                          }} 
                        />
                        <Legend 
                          wrapperStyle={{ color: '#E2E8F0' }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="#8B5CF6" 
                          name="Transactions" 
                          radius={[4, 4, 0, 0]}
                          animationDuration={1000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Fraud Distribution and Recent Alerts with Home Page Styling */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Fraud Distribution Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl p-4 shadow-2xl bg-gray-800/50 backdrop-blur-lg border border-green-500/20 relative overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <motion.h2 
                    className="text-xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    Safe vs Suspicious Transactions
                  </motion.h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={fraudPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent as number).toFixed(2)}`}
                          animationBegin={200}
                          animationDuration={800}
                        >
                          {fraudPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                            borderColor: 'rgba(34, 197, 94, 0.3)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            color: 'white'
                          }} 
                        />
                        <Legend 
                          wrapperStyle={{ color: '#E2E8F0' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Recent Alerts Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="rounded-2xl p-4 shadow-2xl bg-gray-800/50 backdrop-blur-lg border border-orange-500/20 lg:col-span-2 relative overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <motion.h2 
                    className="text-xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    Recent Alerts & Suspicious Activity
                  </motion.h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Transaction ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Receiver</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">AI Risk Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {recentAlerts.map((alert, index) => (
                          <motion.tr 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.1 + index * 0.1 }}
                            whileHover={{ 
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              x: 5
                            }}
                            className="transition-all duration-200"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{alert.date}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{alert.transactionId}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{alert.receiver}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{alert.amount}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <StatusBadge status={alert.status} />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{alert.riskScore}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <motion.button 
                                className="px-3 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                🔍 View
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Fraud Detection Parameters Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="rounded-2xl p-6 shadow-2xl bg-gray-800/50 backdrop-blur-lg border border-cyan-500/20 mb-8 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <motion.h2 
                  className="text-xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  AI Fraud Detection Parameters
                </motion.h2>
                <p className="text-gray-400 mb-6">Real-time analysis using 20+ fraud detection parameters</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  {fraudDetectionParameters.map((category, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                      whileHover={{ 
                        y: -5, 
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                        borderColor: 'rgba(103, 232, 249, 0.5)'
                      }}
                    >
                      <h3 className="font-bold text-cyan-400 mb-2 flex items-center">
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
            </motion.div>

            {/* Activity Log Section - Moved to the end as requested */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="rounded-2xl p-6 shadow-2xl bg-gray-800/50 backdrop-blur-lg border border-blue-500/20 relative overflow-hidden"
            >
              <div className="relative z-10">
                <motion.h2 
                  className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  Activity Log
                </motion.h2>
                <ul className="space-y-3">
                  {activityLog.map((log, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.7 + index * 0.1 }}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{log.time}</p>
                        <p className="text-sm text-gray-400">{log.action}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* User Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
              className="rounded-2xl p-6 shadow-2xl bg-gray-800/50 backdrop-blur-lg border border-blue-500/20 relative overflow-hidden"
            >
              <div className="relative z-10">
                <TransactionList />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;