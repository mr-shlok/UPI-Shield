# 🛡️ UPI Shield: AI-Powered UPI Fraud Detection

<div align="center">

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue)
<br>
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)

**Secure, Real-time, and Intelligent Transaction Monitoring for the UPI Network.**

</div>

---

## 📖 Overview

**UPI Shield** is a state-of-the-art fraud detection platform designed to protect users and businesses from malicious transactions across the Unified Payments Interface (UPI) network. 

By uniting a heavily optimized **React + Framer Motion** frontend with a robust **Flask + Firebase Auth/Firestore** backend, UPI Shield analyzes over 20+ live transaction parameters—including device trust, location bounding, and recipient IP blacklists—to instantly neutralize threats before funds leave the user's account.

---

## ✨ Core Features

* 🚀 **Real-Time Fraud Engine:** Proprietary backend models that analyze transaction velocity, time-of-day anomalies, and recipient VPAs instantly.
* 📈 **Advanced Analytics Dashboard:** A stunning, fully animated dashboard featuring interactive caching flow monitors, live 24h transaction velocity telemetry, and merchant trust distribution charts.
* 🔐 **Enterprise-Grade Account Security:** Native integration with Firebase authentication, offering interactive app preferences, Two-Factor Authentication tracking, and live session monitoring.
* ⚡ **Instant Processing:** Zero-latency UI updates utilizing dynamic React state syncing with Firestore persistence.
* 🤖 **AI Chat Agent:** Native intelligent support agent capable of resolving user transaction disputes and answering security queries.

---

## 🏗️ Technology Stack

### Frontend Architecture
* **Framework**: React 19 + TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Animations**: Framer Motion
* **Data Visualization**: Recharts & Bespoke CSS Telemetry
* **Icons**: React Icons (`react-icons/fi`)

### Backend Architecture
* **Framework**: Python / Flask
* **Database**: Firebase Firestore (NoSQL)
* **Auth**: Firebase Admin SDK
* **Cross-Origin**: Flask-CORS
* **Machine Learning**: Custom Sklearn/Pandas pipeline models

---

## 🚀 Getting Started

Follow these steps to run UPI Shield locally on your machine.

### Prerequisites
* Node.js (v18+)
* Python (v3.8+)
* A valid Firebase Project with Firestore and Authentication enabled (for production mode)

### 1. Frontend Setup
```bash
# Navigate to the frontend directory
cd ./frontend

# Install node dependencies
npm install

# Start the Vite development server
npm run dev
```
> The frontend will be accessible at `http://localhost:5173`.

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd ./backend

# Create and activate a Virtual Environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install python dependencies dependencies
pip install -r requirements.txt
```

#### Choose Your Backend Mode:
UPI Shield supports two backend execution modes:
* **Production / Live Firebase Mode (Recommended)**: Utilizes real Firestore databases. Requires your `firebase-credentials.json` secret key inside the backend folder.
  ```bash
  python app_firebase.py
  ```
* **Local Mock Mode**: Ideal for UI development without hitting API rate limits.
  ```bash
  python app_new.py
  ```

---

## 🗄️ Project Structure

```text
UPI-Shield/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Modals, Charts)
│   │   ├── pages/            # View-level components (UserDashboard.tsx)
│   │   ├── services/         # API & Firebase configurations
│   ├── package.json
│   └── tailwind.config.js
│
└── backend/                  # Flask Application
    ├── models/               # ML Models and training scripts
    ├── app_firebase.py       # Production server entrypoint
    ├── app_new.py            # Local mock server entrypoint
    ├── test_transactions.py  # E2E Firebase integration tests
    └── requirements.txt
```

---

## 🛡️ Security & Privacy Architecture

UPI Shield takes data privacy seriously. The frontend utilizes hardened input validations and sanitization. The backend enforces structured data definitions before any data hits Firestore. 
* **Session Management**: Bulletproof JWT handling mapped to Firebase.
* **Component Stability**: Heavily tested layout animations preventing React render-tree crashes (`layoutId` collision protections).
* **Data Sandboxing**: Strict Firebase rules ensuring users can only read/write their own transaction scopes.

---

## 🤝 Contributing & Support

We welcome contributions to UPI Shield! Please follow the conventional commit standard and ensure UI components pass ESLint checks before opening a pull request.
* **Linting**: `npm run lint` (Frontend)
* **Testing AI Models**: `python test_fraud_risk.py` (Backend)

For enterprise inquiries or support, please contact the development team at `security@upishield.com`.

---
*Built with ❤️ by the UPI Shield Team.*
