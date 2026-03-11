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
  FiCheck, FiInfo, FiBarChart, FiEye, FiEyeOff, FiAlertCircle,
  FiSend, FiDatabase, FiClock, FiCreditCard
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for charts and tables
const summaryData = [
  { name: 'Total Transactions', value: 1247, change: '+12%', color: 'blue' },
  { name: 'Fraudulent Transactions', value: 23, change: '-5%', color: 'red' },
  { name: 'Amount at Risk', value: '₹2,34,000', change: '-8%', color: 'orange' },
  { name: 'Fraud Risk Score', value: '76%', change: '-3%', color: 'purple' },
  { name: 'Last Scanned', value: '2 mins ago', change: 'Real-time', color: 'green' }
];

const transactionData = [
  { date: 'Oct 20', transactions: 45, fraud: 2 },
  { date: 'Oct 21', transactions: 52, fraud: 1 },
  { date: 'Oct 22', transactions: 48, fraud: 3 },
  { date: 'Oct 23', transactions: 61, fraud: 0 },
  { date: 'Oct 24', transactions: 55, fraud: 2 },
  { date: 'Oct 25', transactions: 49, fraud: 1 },
  { date: 'Oct 26', transactions: 58, fraud: 4 },
  { date: 'Oct 27', transactions: 53, fraud: 2 }
];

const categoryData = [
  { name: 'Bank Transfers', value: 320 },
  { name: 'Merchant Payments', value: 450 },
  { name: 'Peer-to-Peer', value: 280 },
  { name: 'Bill Payments', value: 190 }
];

const fraudPieData = [
  { name: 'Safe', value: 1180 },
  { name: 'Suspicious', value: 45 },
  { name: 'Fraud', value: 22 }
];

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const recentAlerts = [
  { 
    date: '27 Oct 2025', 
    transactionId: 'TXN38472', 
    receiver: '@upi123', 
    amount: '₹3,000', 
    status: 'Suspicious', 
    riskScore: '87%', 
    action: 'View' 
  },
  { 
    date: '27 Oct 2025', 
    transactionId: 'TXN38471', 
    receiver: '@paytm456', 
    amount: '₹1,200', 
    status: 'Safe', 
    riskScore: '12%', 
    action: 'View' 
  },
  { 
    date: '26 Oct 2025', 
    transactionId: 'TXN38470', 
    receiver: '@gpay789', 
    amount: '₹7,500', 
    status: 'Fraud', 
    riskScore: '95%', 
    action: 'View' 
  },
  { 
    date: '26 Oct 2025', 
    transactionId: 'TXN38469', 
    receiver: '@phonepe123', 
    amount: '₹500', 
    status: 'Safe', 
    riskScore: '5%', 
    action: 'View' 
  }
];

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

// Define chat message type
interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp?: string;
}

const ProfessionalDashboardFixed: React.FC = () => {
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
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! I'm your AI fraud protection assistant. How can I help you today?", isUser: false, timestamp: new Date().toLocaleTimeString() }
  ]);

  // Add transaction history state
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Fetch transaction history from Firestore
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoadingTransactions(true);
        setTransactionsError(null);
        
        // In a real implementation, this would fetch from your backend API
        // which would then retrieve from Firestore
        // For now, we'll use mock data to demonstrate the UI
        const mockTransactions = [
          {
            id: 'TXN001',
            date: '2025-10-27',
            time: '14:30',
            amount: 2500,
            recipient: '@upi123',
            status: 'completed',
            riskScore: '12%'
          },
          {
            id: 'TXN002',
            date: '2025-10-27',
            time: '10:15',
            amount: 5000,
            recipient: '@paytm456',
            status: 'completed',
            riskScore: '5%'
          },
          {
            id: 'TXN003',
            date: '2025-10-26',
            time: '18:45',
            amount: 1200,
            recipient: '@gpay789',
            status: 'fraud',
            riskScore: '95%'
          }
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTransactionHistory(mockTransactions);
        setLoadingTransactions(false);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        setTransactionsError('Failed to load transaction history. Collections may not exist yet.');
        setLoadingTransactions(false);
        
        // Show mock data even in error case for demonstration
        const mockTransactions = [
          {
            id: 'TXN001',
            date: '2025-10-27',
            time: '14:30',
            amount: 2500,
            recipient: '@upi123',
            status: 'completed',
            riskScore: '12%'
          },
          {
            id: 'TXN002',
            date: '2025-10-27',
            time: '10:15',
            amount: 5000,
            recipient: '@paytm456',
            status: 'completed',
            riskScore: '5%'
          }
        ];
        setTransactionHistory(mockTransactions);
      }
    };

    fetchTransactionHistory();
  }, []);

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
      case 'Report Fraud':
        // Handle report fraud logic here
        console.log('Report Fraud clicked');
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
    handleSidebarItemClick('Report Fraud');
  };

  // Handle payment submission with proper error handling
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
      
      // Get token from localStorage (assuming it's stored there after login)
      const token = localStorage.getItem('session_token') || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Not authenticated. Please log in first.');
      }
      
      console.log('Sending transaction data:', transactionData);
      console.log('Using token:', token.substring(0, 20) + '...');
      
      // Send transaction data to backend
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      
      const result = await response.json();
      console.log('Backend response:', result);
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process payment');
      }
      
      // Analyze transaction for fraud
      const analysisResponse = await fetch('http://localhost:5000/api/transactions/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      
      const analysisResult = await analysisResponse.json();
      console.log('Fraud analysis result:', analysisResult);
      
      if (!analysisResponse.ok) {
        console.warn('Fraud analysis failed:', analysisResult.error || `HTTP ${analysisResponse.status}: ${analysisResponse.statusText}`);
      }
      
      if (analysisResult.success) {
        // Add fraud analysis results to transaction data
        transactionData.is_fraudulent = analysisResult.is_fraudulent;
        transactionData.risk_score = analysisResult.risk_score;
        transactionData.risk_level = analysisResult.risk_level;
        
        // Update transaction with fraud analysis results
        if (result.transaction_id) {
          try {
            const updateResponse = await fetch(`http://localhost:5000/api/transactions/${result.transaction_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                is_fraudulent: analysisResult.is_fraudulent,
                risk_score: analysisResult.risk_score,
                risk_level: analysisResult.risk_level
              })
            });
            
            if (!updateResponse.ok) {
              console.warn('Failed to update transaction with fraud analysis');
            }
          } catch (updateError) {
            console.warn('Error updating transaction with fraud analysis:', updateError);
          }
        }
      }
      
      console.log('Transaction processed successfully:', result);
      
      // Show success message
      setPaymentSuccess(true);
      
      // Add to transaction history for immediate display
      const newTransaction = {
        id: result.transaction_id || `TXN${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        amount: amountNum,
        recipient: upiId,
        status: 'completed',
        riskScore: analysisResult.risk_score ? `${analysisResult.risk_score}%` : '5%'
      };
      
      setTransactionHistory(prev => [newTransaction, ...prev]);
      
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
      setPaymentError(error.message || 'Failed to process payment. Check console for details.');
    } finally {
      setPaymentLoading(false);
    }
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

  // Enhanced AI Chat functions
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    const newUserMessage = {
      id: Date.now(),
      text: chatInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    const userQuery = chatInput;
    setChatInput('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(userQuery);
      const newAiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, newAiMessage]);
    }, 1000);
  };
  
  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // UPI/Transaction related responses
    if (lowerQuery.includes('upi') || lowerQuery.includes('transaction')) {
      if (lowerQuery.includes('secure') || lowerQuery.includes('safe')) {
        return "UPI transactions are secured with multiple layers of protection including MPIN, device binding, and real-time fraud detection. Always use official UPI apps and never share your MPIN or OTP.";
      } else if (lowerQuery.includes('refund') || lowerQuery.includes('reversal')) {
        return "If you've been a victim of fraud, immediately contact your bank's customer care and block your UPI ID. Most banks offer chargeback protection for unauthorized transactions within 120 days.";
      } else if (lowerQuery.includes('limit') || lowerQuery.includes('amount')) {
        return "UPI transaction limits vary by bank, typically ranging from ₹1 lakh to ₹2 lakh per day. You can check your specific limit in your bank's UPI app settings.";
      } else if (lowerQuery.includes('fraud') || lowerQuery.includes('scam')) {
        return "Common UPI frauds include fake payment confirmation screenshots, phishing links, and social engineering. Always verify transactions in your bank app and never trust screenshots alone.";
      } else if (lowerQuery.includes('mpin') || lowerQuery.includes('pin')) {
        return "Your UPI MPIN should be a 4-6 digit number known only to you. Never share it with anyone, including bank officials. If you suspect it's compromised, change it immediately through your UPI app.";
      } else if (lowerQuery.includes('qr') || lowerQuery.includes('code')) {
        return "QR code payments are generally safe when scanned from trusted merchants. Always verify the merchant details before paying. Be cautious of QR codes shared through unknown sources or messages.";
      } else if (lowerQuery.includes('split') || lowerQuery.includes('bill')) {
        return "UPI allows easy bill splitting through apps like Google Pay, PhonePe, and Paytm. Each person pays their share directly, making it convenient for group expenses.";
      } else if (lowerQuery.includes('transaction history') || lowerQuery.includes('past transactions')) {
        return "You can view your transaction history in the 'Transactions' section of your dashboard. All transactions are securely stored in our Firestore database with end-to-end encryption.";
      } else if (lowerQuery.includes('database') || lowerQuery.includes('firestore')) {
        return "All your transaction data is securely stored in Google Firestore with encryption at rest and in transit. Your financial information is never shared with third parties without your explicit consent.";
      } else {
        return "UPI (Unified Payments Interface) is a real-time payment system developed by NPCI that allows instant money transfer between bank accounts using mobile phones. It's secured with MPIN and offers instant settlements 24/7.";
      }
    } else if (lowerQuery.includes('account') || lowerQuery.includes('balance')) {
      return "For account security, always use official banking apps, enable two-factor authentication, and regularly monitor your transaction history. Report any suspicious activity immediately to your bank.";
    } else if (lowerQuery.includes('password') || lowerQuery.includes('login')) {
      return "Use strong, unique passwords for your banking apps. Enable biometric authentication (fingerprint/face ID) when available. Never use public Wi-Fi for banking transactions.";
    } else {
      // Default responses
      const defaultResponses = [
        "I'm your UPI Shield AI assistant. I can help you with UPI transactions, fraud prevention, and account security. What would you like to know?",
        "For fraud protection, always verify the recipient's details before sending money. Enable notifications for all transactions and regularly review your transaction history.",
        "UPI Shield monitors your transactions 24/7 using AI to detect suspicious patterns. You'll be alerted immediately if any fraudulent activity is detected.",
        "Remember: Never share your MPIN, OTP, or UPI PIN with anyone. Bank officials will never ask for these details.",
        "All your transaction data is securely stored in our Firestore database with military-grade encryption. Your privacy is our top priority."
      ];
      return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md shadow-lg z-50 border-b border-blue-900/30">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-3 p-2 rounded-lg hover:bg-gray-700/50 text-gray-300"
              >
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <FiShield className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">UPI Shield</h1>
                  <p className="text-xs text-gray-400">Professional Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-300"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-300">
                <FiBell size={20} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/50 text-gray-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <FiUser size={16} className="text-white" />
                  </div>
                  <FiChevronDown size={16} className="hidden md:block" />
                </button>
                
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-gray-800 border border-gray-700"
                    >
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Settings</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Logout</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <motion.aside 
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-black/95 backdrop-blur-md border-r border-blue-900/30 transition-transform duration-300 ease-in-out overflow-hidden h-full md:h-screen pt-16`}
          initial={false}
          animate={{ x: sidebarOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
              <div className="px-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <FiShield className="text-white" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">UPI Shield</h2>
                    <p className="text-xs text-gray-400">Dashboard</p>
                  </div>
                </div>
              </div>
              
              <nav className="mt-2 flex-1 px-3 space-y-1">
                {[
                  { name: 'Dashboard', icon: <FiHome /> },
                  { name: 'Transactions', icon: <FiActivity /> },
                  { name: 'Fraud Alerts / Reports', icon: <FiAlertTriangle /> },
                  { name: 'Fraud Risk Score', icon: <FiBarChart2 /> },
                  { name: 'Analytics', icon: <FiBarChart /> },
                  { name: 'AI Chat / Virtual Assistant', icon: <FiMessageSquare /> },
                  { name: 'Account Security', icon: <FiShield /> },
                  { name: 'Settings', icon: <FiSettings /> },
                  { name: 'Help & Support', icon: <FiHelpCircle /> },
                  { name: 'Logout', icon: <FiLogOut /> }
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSidebarItemClick(item.name)}
                    className={`flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.name === 'Dashboard' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
            
            {/* Report Fraud Button */}
            <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
              <button 
                onClick={handleReportFraud}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <FiAlertTriangle className="mr-2" />
                Report Fraud
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 pb-8 pt-20 md:pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Dashboard Overview</h1>
              <p className="text-gray-400">Welcome back! Here's your comprehensive fraud protection overview.</p>
            </div>

            {/* Pay Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Pay Card */}
              <div 
                className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white cursor-pointer hover:from-green-700 hover:to-emerald-700 transition-colors"
                onClick={() => setPayModalOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Quick Pay</h3>
                    <p className="text-green-100">Send money securely</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <FiActivity size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm">Tap to send money</p>
                </div>
              </div>
              
              {/* Balance Card */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Account Balance</h3>
                    <p className="text-gray-400">Current balance</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FiBarChart2 className="text-blue-400" size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">
                    {showBalance ? '₹42,560.75' : '₹******'}
                  </p>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-blue-400 hover:text-blue-300 mt-1 flex items-center text-sm"
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
                </div>
              </div>
              
              {/* Fraud Score Card */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Fraud Risk Score</h3>
                    <p className="text-gray-400">Current risk level</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <FiShield className="text-purple-400" size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-purple-400">76%</p>
                  <p className="text-sm text-gray-400">Low risk</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {summaryData.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                >
                  <h3 className="text-sm font-medium text-gray-400">{item.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xl font-bold">{item.value}</p>
                    <span className="text-sm text-green-400">{item.change}</span>
                  </div>
                  <div className="mt-3">
                    <div className={`p-2 rounded-lg ${
                      item.color === 'blue' ? 'bg-blue-500/20' :
                      item.color === 'red' ? 'bg-red-500/20' :
                      item.color === 'orange' ? 'bg-orange-500/20' :
                      item.color === 'purple' ? 'bg-purple-500/20' :
                      'bg-green-500/20'
                    }`}>
                      {item.color === 'blue' && <FiActivity className="text-blue-400" size={24} />}
                      {item.color === 'red' && <FiAlertTriangle className="text-red-400" size={24} />}
                      {item.color === 'orange' && <FiBarChart2 className="text-orange-400" size={24} />}
                      {item.color === 'purple' && <FiShield className="text-purple-400" size={24} />}
                      {item.color === 'green' && <FiBarChart2 className="text-green-400" size={24} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Transactions vs Fraud Chart */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Transactions vs Fraudulent Activity</h2>
                <p className="text-gray-400 text-sm mb-4">(Last 30 days)</p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={transactionData}
                      margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          borderColor: '#374151',
                          borderRadius: '0.5rem',
                          color: 'white'
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="transactions" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="fraud" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transaction Categories Chart */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Transaction Categories</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          borderColor: '#374151',
                          borderRadius: '0.5rem',
                          color: 'white'
                        }} 
                      />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        fill="#8B5CF6" 
                        name="Transactions" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fraud Distribution and Recent Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Fraud Distribution Pie Chart */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Safe vs Suspicious Transactions</h2>
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
                        label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                      >
                        {fraudPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          borderColor: '#374151',
                          borderRadius: '0.5rem',
                          color: 'white'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Alerts Table */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">Recent Alerts & Suspicious Activity</h2>
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
                        <tr key={index} className="hover:bg-gray-700/50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{alert.date}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{alert.transactionId}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{alert.receiver}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{alert.amount}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <StatusBadge status={alert.status} />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{alert.riskScore}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button className="px-3 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <FiDatabase className="mr-2" />
                  Transaction History
                </h2>
                <button className="text-sm text-blue-400 hover:text-blue-300">
                  View All
                </button>
              </div>
              
              {transactionsError && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-yellow-300 text-sm">
                    {transactionsError} Transactions will appear here after processing your first payment.
                  </p>
                </div>
              )}
              
              {loadingTransactions ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {transactionHistory.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date & Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Recipient</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {transactionHistory.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-700/50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">#{transaction.id}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              <div>{transaction.date}</div>
                              <div className="text-xs text-gray-500">{transaction.time}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{transaction.recipient}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">₹{transaction.amount.toLocaleString()}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{transaction.riskScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8">
                      <FiDatabase className="mx-auto text-gray-500" size={48} />
                      <h3 className="mt-4 text-lg font-medium text-gray-300">No transactions yet</h3>
                      <p className="mt-2 text-gray-500">
                        Your transaction history will appear here after you make your first payment.
                      </p>
                      <button 
                        onClick={() => setPayModalOpen(true)}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FiActivity className="mr-2" />
                        Make Your First Payment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fraud Detection Parameters Analysis */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <h2 className="text-xl font-bold mb-4">AI Fraud Detection Parameters</h2>
              <p className="text-gray-400 mb-6">Real-time analysis using 20+ fraud detection parameters</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {fraudDetectionParameters.map((category, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-bold text-blue-400 mb-2 flex items-center">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log Section - Moved to the end as requested */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FiClock className="mr-2" />
                Activity Log
              </h2>
              <ul className="space-y-3">
                {activityLog.map((log, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{log.time}</p>
                      <p className="text-sm text-gray-400">{log.action}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <FiShield className="text-blue-500" size={24} />
                  <span className="text-lg font-bold">UPI Shield</span>
                </div>
                <div className="text-center md:text-center mb-4 md:mb-0">
                  <p className="text-gray-400 text-sm">
                    © 2025 UPI Shield. All rights reserved. Version 1.0.0
                  </p>
                  <div className="flex space-x-4 mt-2 justify-center">
                    <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
                    <span className="text-gray-600">|</span>
                    <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white">
                    <FiHelpCircle size={20} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <FiSettings size={20} />
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Pay Modal */}
      <AnimatePresence>
        {payModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Send Money</h3>
                <button 
                  onClick={() => setPayModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              {paymentSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="text-green-400" size={32} />
                  </div>
                  <h4 className="text-lg font-bold mb-2">Payment Successful!</h4>
                  <p className="text-gray-400">Your transaction has been processed securely.</p>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handlePayment();
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Recipient Name</label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter recipient name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="example@upi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="₹0.00"
                      />
                    </div>
                  </div>
                  
                  {paymentError && (
                    <div className="mt-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
                      {paymentError}
                    </div>
                  )}
                  
                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setPayModalOpen(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                      disabled={paymentLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center"
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Send Money'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced AI Chat Modal */}
      <AnimatePresence>
        {chatMessages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 w-full max-w-md"
          >
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-bold flex items-center">
                  <FiMessageSquare className="mr-2" />
                  AI Assistant
                </h3>
                <button 
                  onClick={() => setChatMessages([chatMessages[0]])}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.isUser 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Ask about UPI security, transactions, or fraud protection..."
                  />
                  <button 
                    type="submit"
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FiSend size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  AI assistant can answer questions about UPI transactions, security, and fraud protection
                </p>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessionalDashboardFixed;