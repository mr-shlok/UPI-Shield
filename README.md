# UPI Shield - AI-Powered UPI Fraud Detection

🛡️ **Protect Your UPI Transactions in Real-Time**

UPI Shield is a comprehensive fraud detection application that uses advanced AI and machine learning to monitor, detect, and prevent fraudulent UPI transactions in real-time.

## 🌟 Features

- **Real-Time Fraud Detection** - Instant alerts for suspicious transactions
- **AI-Powered Analytics** - Advanced behavior analysis and pattern recognition
- **Secure Dashboard** - Beautiful, intuitive interface for monitoring
- **Comprehensive Reports** - Exportable reports for businesses and banks
- **Regulatory Compliance** - Full RBI and NPCI compliance
- **24/7 Monitoring** - Round-the-clock transaction protection

## 🚀 Tech Stack

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Icons** for icon library
- **Vite** for build tooling

### Backend
- **Flask** (Python web framework)
- **Flask-CORS** for cross-origin requests
- RESTful API architecture

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- macOS/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the Flask server (Local Mock Mode):
```bash
python app_new.py
```

For full Firebase integration (requires credentials):
```bash
python app_firebase.py
```

The backend API will be available at `http://localhost:5000`

## 🎨 Design Features

### Homepage Sections

1. **Header/Navigation Bar**
   - Professional logo and branding
   - Responsive navigation menu
   - Login/Signup buttons

2. **Hero Section**
   - Compelling headline with trust-inducing messaging
   - Clear call-to-action buttons
   - Animated security visuals
   - Key statistics and metrics

3. **Features Section**
   - 6 core features with icons and descriptions
   - Hover animations and interactive elements
   - Gradient backgrounds

4. **How It Works**
   - 4-step process visualization
   - Flow diagram
   - Animated transitions

5. **Testimonials**
   - Client reviews and ratings
   - Partner bank logos
   - Trust indicators

6. **Pricing Section**
   - 3 pricing tiers (Starter, Professional, Enterprise)
   - Feature comparison
   - Money-back guarantee

7. **Security & Compliance**
   - Security certifications
   - Compliance badges
   - Trust indicators

8. **Footer**
   - Contact information
   - Quick links
   - Newsletter subscription
   - Social media links

## 🎭 Animations

The app features smooth, professional animations using Framer Motion:
- Fade-in effects
- Slide animations
- Scale transitions
- Floating elements
- Pulse effects
- Hover interactions

## 🔌 API Endpoints

### GET `/api/health`
Health check endpoint

### GET `/api/stats`
Get transaction statistics

### GET `/api/alerts`
Get fraud alerts

### POST `/api/transaction/analyze`
Analyze a transaction for fraud

### GET `/api/dashboard`
Get dashboard data

### POST `/api/contact`
Handle contact form submissions

### POST `/api/subscribe`
Handle newsletter subscriptions

## 🎨 Color Scheme

- **Primary**: Blue shades for trust and security
- **Success**: Green for safe transactions
- **Warning**: Orange/Yellow for alerts
- **Danger**: Red for threats and blocks
- **Neutral**: Gray for backgrounds and text

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🔒 Security Features

- End-to-end encryption
- HTTPS/SSL support
- CORS protection
- Input validation
- Rate limiting ready
- Secure authentication ready

## 🛠️ Development

### Available Scripts

Frontend:
- `npm run dev` - Start development server
- `npm run build` - Build for production

### Initialize Firestore Collections

To initialize Firestore with sample data:

1. Navigate to the backend directory:
```bash
cd backend
```

2. Run the initialization script:
```bash
python init_firestore.py
```

This will create the required collections (`users`, `transactions`, `fraud_logs`, `sessions`) with sample data.

### Test Transaction Endpoints

To test the transaction endpoints:

1. Make sure the backend server is running:
```bash
python app_firebase.py
```

2. In another terminal, run the test script:
```bash
python test_transactions.py
```

This will register a test user, create transactions, and verify the endpoints are working correctly.
- `npm run preview` - Preview production build

Backend:
- `python app_new.py` - Start Flask server in Local Mock Mode (Recommended)
- `python train_fraud_model.py` - Train the fraud detection model locally
- `python debug_transaction.py` - Run an end-to-end test of the mock flow
- `python app.py` - Start standard Flask server

## 📄 License

This project is proprietary software developed for UPI Shield.

## 🤝 Support

For support, email support@upishield.com or call +91 1800-123-4567

## 👥 Team

Built with ❤️ by the UPI Shield Team

---

**© 2025 UPI Shield. All rights reserved.**
