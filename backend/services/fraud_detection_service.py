"""
Fraud Detection Service
Implements AI-based fraud detection using the specified parameters
"""
import re
from datetime import datetime, timezone
from collections import defaultdict
import math
import json
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib

class FraudDetectionService:
    """Service for detecting fraudulent transactions based on multiple parameters with ML capabilities"""
    
    def __init__(self):
        """Initialize fraud detection service with thresholds and patterns"""
        # Transaction-based thresholds
        self.high_amount_threshold = 100000  # ₹100,000
        self.low_amount_threshold = 10        # ₹10
        self.rapid_transaction_threshold = 5  # 5 transactions in 10 minutes
        self.suspicious_merchants = [
            'unknown', 'test', 'demo', 'fake', 'scam', 'fraud'
        ]
        
        # User behavior thresholds
        self.max_failed_attempts = 3
        self.suspicious_session_duration_min = 60  # 1 minute
        self.suspicious_session_duration_max = 7200  # 2 hours
        
        # Payment receiver patterns
        self.blacklisted_vpns = [
            'blacklisted.com', 'suspicious.vpa', 'fake.upi'
        ]
        
        # Network & security patterns
        self.suspicious_ips = [
            '192.168.0.1', '10.0.0.1'  # Example patterns
        ]
        self.suspicious_user_agents = [
            'bot', 'crawler', 'automated'
        ]
        
        # Historical patterns
        self.fraud_history_weight = 0.3
        self.velocity_spike_threshold = 2.0  # 2x normal velocity
        
        # Risk weights for different parameter categories (0-1)
        self.weights = {
            'transaction_amount': 0.15,
            'transaction_type': 0.10,
            'transaction_time': 0.10,
            'transaction_frequency': 0.15,
            'merchant_category': 0.05,
            'cross_border': 0.05,
            'login_location': 0.10,
            'device_fingerprint': 0.05,
            'session_duration': 0.05,
            'failed_attempts': 0.05,
            'kyc_mismatch': 0.10,
            'recipient_vpa': 0.05,
            'recipient_history': 0.03,
            'merchant_trust': 0.02,
            'ip_geolocation': 0.05,
            'vpn_usage': 0.05,
            'device_version': 0.03,
            'two_factor_auth': 0.02,
            'fraud_history': 0.10,
            'transaction_velocity': 0.05,
            'behavioral_patterns': 0.10
        }
        
        # ML model path
        self.model_path = 'models/fraud_detection_model.pkl'
        self.scaler_path = 'models/fraud_scaler.pkl'
        self.label_encoder_path = 'models/fraud_label_encoder.pkl'
        self.training_data_path = 'data/training_data.json'
        self.synthetic_data_path = 'data/synthetic_fraud_data.csv'
        
        # Create directories if they don't exist
        os.makedirs(os.path.dirname(self.model_path) if os.path.dirname(self.model_path) else 'models', exist_ok=True)
        os.makedirs(os.path.dirname(self.training_data_path) if os.path.dirname(self.training_data_path) else 'data', exist_ok=True)
        
        # Initialize ML model
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self._initialize_ml_model()
        
        # Generate synthetic training data if it doesn't exist
        self._generate_synthetic_data()
    
    def _initialize_ml_model(self):
        """Initialize ML model"""
        try:
            # Try to load existing model
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.label_encoder = joblib.load(self.label_encoder_path)
                print("✅ Loaded existing fraud detection model")
            else:
                # Create new model
                self.model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42,
                    class_weight='balanced'
                )
                print("✅ Created new fraud detection model")
        except Exception as e:
            print(f"❌ Error initializing ML model: {e}")
            # Fallback to simple model
            self.model = RandomForestClassifier(n_estimators=50, random_state=42)
    
    def _generate_synthetic_data(self):
        """Generate synthetic training data for fraud detection"""
        if os.path.exists(self.synthetic_data_path):
            return
        
        print("🔄 Generating synthetic fraud detection training data...")
        
        # Generate synthetic data
        np.random.seed(42)
        n_samples = 10000
        
        # Features
        data = {
            'amount': np.random.lognormal(10, 1, n_samples),
            'hour': np.random.randint(0, 24, n_samples),
            'failed_attempts': np.random.poisson(0.5, n_samples),
            'device_count': np.random.poisson(2, n_samples),
            'recent_transaction_count': np.random.poisson(3, n_samples),
            'has_2fa': np.random.binomial(1, 0.8, n_samples),
            'is_weekend': np.random.binomial(1, 0.3, n_samples),
            'transaction_type_upi': np.random.binomial(1, 0.7, n_samples),
            'transaction_type_imps': np.random.binomial(1, 0.2, n_samples),
            'transaction_type_neft': np.random.binomial(1, 0.1, n_samples),
            'location_change': np.random.binomial(1, 0.1, n_samples),
            'vpn_usage': np.random.binomial(1, 0.05, n_samples),
            'new_device': np.random.binomial(1, 0.15, n_samples),
            'session_duration': np.random.exponential(300, n_samples),
            'recipient_changes': np.random.poisson(1, n_samples),
            'merchant_trust_score': np.random.beta(2, 1, n_samples),
            'user_tenure_days': np.random.exponential(365, n_samples),
            'previous_fraud': np.random.binomial(1, 0.02, n_samples),
            'velocity_spike': np.random.binomial(1, 0.1, n_samples)
        }
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Create target variable with realistic fraud patterns
        fraud_probability = (
            0.1 * (df['amount'] > 50000) +  # High amounts
            0.15 * (df['hour'].isin([2, 3, 4, 5])) +  # Late night
            0.1 * (df['failed_attempts'] > 2) +  # Multiple failed attempts
            0.1 * (df['new_device'] == 1) +  # New device
            0.1 * (df['location_change'] == 1) +  # Location change
            0.1 * (df['vpn_usage'] == 1) +  # VPN usage
            0.15 * (df['recent_transaction_count'] > 10) +  # Rapid transactions
            0.1 * (df['recipient_changes'] > 5) +  # Frequent recipient changes
            0.2 * (df['previous_fraud'] == 1) +  # Previous fraud history
            0.1 * (df['velocity_spike'] == 1) +  # Transaction velocity spike
            np.random.normal(0, 0.05, n_samples)  # Random noise
        )
        
        # Ensure probabilities are between 0 and 1
        fraud_probability = np.clip(fraud_probability, 0, 1)
        
        # Generate fraud labels based on probability
        df['is_fraud'] = np.random.binomial(1, fraud_probability)
        
        # Save to CSV
        df.to_csv(self.synthetic_data_path, index=False)
        print(f"✅ Generated {n_samples} synthetic training samples")
    
    def _train_model(self):
        """Train the fraud detection model with synthetic data"""
        try:
            # Load synthetic data
            if not os.path.exists(self.synthetic_data_path):
                self._generate_synthetic_data()
            
            df = pd.read_csv(self.synthetic_data_path)
            
            # Separate features and target
            feature_columns = [col for col in df.columns if col != 'is_fraud']
            X = df[feature_columns]
            y = df['is_fraud']
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, zero_division=0)
            recall = recall_score(y_test, y_pred, zero_division=0)
            f1 = f1_score(y_test, y_pred, zero_division=0)
            
            print(f"📊 Model Performance:")
            print(f"   Accuracy: {accuracy:.4f}")
            print(f"   Precision: {precision:.4f}")
            print(f"   Recall: {recall:.4f}")
            print(f"   F1-Score: {f1:.4f}")
            
            # Save model and preprocessors
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            joblib.dump(self.label_encoder, self.label_encoder_path)
            
            print("✅ Fraud detection model trained and saved")
            return {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1_score': f1
            }
        except Exception as e:
            print(f"❌ Error training model: {e}")
            return {'error': str(e)}
    
    def _initialize_model(self):
        """Initialize ML model with default parameters if not exists"""
        if not os.path.exists(self.model_path):
            print("🔄 Training initial fraud detection model...")
            self._train_model()
        
        # Create empty training data file if not exists
        if not os.path.exists(self.training_data_path):
            with open(self.training_data_path, 'w') as f:
                json.dump([], f)
    
    def _log_transaction_for_training(self, transaction_data, user_data, is_fraud):
        """Log transaction data for future ML training"""
        try:
            # Create a training sample
            training_sample = {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'transaction': transaction_data,
                'user': user_data,
                'is_fraud': is_fraud,
                'features': self._extract_features(transaction_data, user_data)
            }
            
            # Load existing training data
            if os.path.exists(self.training_data_path):
                with open(self.training_data_path, 'r') as f:
                    existing_data = json.load(f)
            else:
                existing_data = []
            
            # Add new training sample
            existing_data.append(training_sample)
            
            # Save updated training data
            with open(self.training_data_path, 'w') as f:
                json.dump(existing_data, f, indent=2)
            
            print(f"✅ Logged transaction for training (Fraud: {is_fraud})")
            return True
        except Exception as e:
            print(f"❌ Error logging transaction for training: {e}")
            return False
    
    def _extract_features(self, transaction_data, user_data):
        """Extract features from transaction and user data for ML"""
        features = {}
        
        # Transaction features
        features['amount'] = transaction_data.get('amount', 0)
        features['hour'] = transaction_data.get('timestamp', datetime.now()).hour
        features['failed_attempts'] = transaction_data.get('failed_attempts', 0)
        features['recent_transaction_count'] = transaction_data.get('recent_transactions_count', 0)
        features['recipient_changes'] = transaction_data.get('recipient_changes', 0)
        features['merchant_trust_score'] = transaction_data.get('merchant_trust_score', 0.8)
        features['location_change'] = 1 if transaction_data.get('location_change', False) else 0
        features['vpn_usage'] = 1 if transaction_data.get('vpn_usage', False) else 0
        features['velocity_spike'] = 1 if transaction_data.get('velocity_spike', False) else 0
        
        # User features
        features['device_count'] = len(user_data.get('known_devices', []))
        features['has_2fa'] = 1 if user_data.get('two_factor_enabled', True) else 0
        features['new_device'] = 1 if transaction_data.get('new_device', False) else 0
        features['session_duration'] = transaction_data.get('session_duration', 300)
        features['is_weekend'] = 1 if transaction_data.get('timestamp', datetime.now()).weekday() >= 5 else 0
        features['user_tenure_days'] = (datetime.now(timezone.utc) - user_data.get('created_at', datetime.now(timezone.utc))).days
        features['previous_fraud'] = 1 if user_data.get('previous_fraud', False) else 0
        
        # Transaction type features (one-hot encoded)
        transaction_type = transaction_data.get('type', 'UPI').upper()
        features['transaction_type_upi'] = 1 if transaction_type == 'UPI' else 0
        features['transaction_type_imps'] = 1 if transaction_type == 'IMPS' else 0
        features['transaction_type_neft'] = 1 if transaction_type == 'NEFT' else 0
        
        return features
    
    def _apply_ml_model(self, transaction_data, user_data, historical_data):
        """Apply ML model to transaction analysis"""
        try:
            # Extract features
            features = self._extract_features(transaction_data, user_data)
            
            # Convert to DataFrame for prediction
            feature_df = pd.DataFrame([features])
            feature_columns = [col for col in feature_df.columns]
            
            # Ensure all expected columns are present
            expected_columns = [
                'amount', 'hour', 'failed_attempts', 'device_count', 'recent_transaction_count',
                'has_2fa', 'is_weekend', 'transaction_type_upi', 'transaction_type_imps',
                'transaction_type_neft', 'location_change', 'vpn_usage', 'new_device',
                'session_duration', 'recipient_changes', 'merchant_trust_score',
                'user_tenure_days', 'previous_fraud', 'velocity_spike'
            ]
            
            # Add missing columns with default values
            for col in expected_columns:
                if col not in feature_df.columns:
                    feature_df[col] = 0
            
            # Reorder columns to match training
            feature_df = feature_df[expected_columns]
            
            # Scale features
            features_scaled = self.scaler.transform(feature_df)
            
            # Make prediction
            fraud_probability = self.model.predict_proba(features_scaled)[0][1]  # Probability of fraud
            is_fraud = self.model.predict(features_scaled)[0]  # Binary prediction
            
            # Get feature importance
            feature_importance = dict(zip(expected_columns, self.model.feature_importances_))
            
            return {
                'success': True,
                'fraud_probability': float(fraud_probability),
                'is_fraud': bool(is_fraud),
                'feature_importance': feature_importance
            }
        except Exception as e:
            print(f"❌ Error applying ML model: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def train_model(self, training_data=None):
        """Train the fraud detection model with new data"""
        if training_data:
            # Add new training data to existing data
            if os.path.exists(self.training_data_path):
                with open(self.training_data_path, 'r') as f:
                    existing_data = json.load(f)
            else:
                existing_data = []
            
            existing_data.extend(training_data)
            
            with open(self.training_data_path, 'w') as f:
                json.dump(existing_data, f, indent=2)
        
        # Train model with all available data
        return self._train_model()
    
    def analyze_transaction(self, transaction_data, user_data, historical_data=None):
        """
        Analyze a transaction for fraud using all specified parameters in real-time
        
        Args:
            transaction_data (dict): Current transaction data
            user_data (dict): User profile and behavior data
            historical_data (dict): User's historical transaction patterns
            
        Returns:
            dict: Analysis results with risk score and factors
        """
        if historical_data is None:
            historical_data = {}
            
        risk_factors = []
        risk_score = 0.0
        
        # Log transaction for training data
        # self._log_transaction_for_training(transaction_data, user_data, False)  # Will be updated after analysis
        
        # 1. Transaction-based Parameters
        transaction_risk = self._analyze_transaction_parameters(transaction_data, user_data, historical_data)
        risk_factors.extend(transaction_risk['factors'])
        risk_score += transaction_risk['score']
        
        # 2. User Behavior Parameters
        user_risk = self._analyze_user_behavior(transaction_data, user_data)
        risk_factors.extend(user_risk['factors'])
        risk_score += user_risk['score']
        
        # 3. Payment Receiver Parameters
        receiver_risk = self._analyze_receiver_parameters(transaction_data)
        risk_factors.extend(receiver_risk['factors'])
        risk_score += receiver_risk['score']
        
        # 4. Network & Security Parameters
        network_risk = self._analyze_network_security(transaction_data, user_data)
        risk_factors.extend(network_risk['factors'])
        risk_score += network_risk['score']
        
        # 5. Historical & Contextual Parameters
        historical_risk = self._analyze_historical_parameters(transaction_data, user_data, historical_data)
        risk_factors.extend(historical_risk['factors'])
        risk_score += historical_risk['score']
        
        # Apply ML model if available
        ml_result = self._apply_ml_model(transaction_data, user_data, historical_data)
        if ml_result['success']:
            # Combine rule-based and ML scores (weighted average)
            ml_score = ml_result['fraud_probability'] * 100  # Convert to 0-100 scale
            risk_score = (risk_score + ml_score) / 2
            risk_factors.append(f"ML Model: {ml_result['fraud_probability']:.2%} fraud probability")
            
            # Add feature importance insights
            if 'feature_importance' in ml_result:
                top_features = sorted(ml_result['feature_importance'].items(), key=lambda x: x[1], reverse=True)[:3]
                for feature, importance in top_features:
                    risk_factors.append(f"ML Top Feature: {feature} (importance: {importance:.3f})")
        
        # Normalize risk score to 0-100 range
        risk_score = min(100, max(0, risk_score))
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = 'high'
        elif risk_score >= 40:
            risk_level = 'medium'
        else:
            risk_level = 'low'
            
        # Determine if fraudulent
        is_fraudulent = risk_score >= 65  # Threshold for flagging as fraud
        
        # Log the result for training
        # self._log_transaction_for_training(transaction_data, user_data, is_fraudulent)
        
        return {
            'success': True,
            'risk_score': round(risk_score, 2),
            'is_fraudulent': is_fraudulent,
            'risk_level': risk_level,
            'factors': risk_factors,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'ml_details': ml_result if ml_result['success'] else None
        }
    
    def _analyze_transaction_parameters(self, transaction_data, user_data, historical_data):
        """Analyze transaction-based parameters"""
        factors = []
        score = 0.0
        weight = self.weights['transaction_amount'] + self.weights['transaction_type'] + \
                 self.weights['transaction_time'] + self.weights['transaction_frequency'] + \
                 self.weights['merchant_category'] + self.weights['cross_border']
        
        amount = transaction_data.get('amount', 0)
        transaction_type = transaction_data.get('type', 'UPI').upper()
        timestamp = transaction_data.get('timestamp', datetime.now(timezone.utc))
        merchant_category = transaction_data.get('merchant_category', '')
        location = transaction_data.get('location', '')
        
        # Transaction Amount
        if amount > self.high_amount_threshold:
            factors.append('Extremely high transaction amount')
            score += self.weights['transaction_amount'] * 0.9
        elif amount < self.low_amount_threshold:
            factors.append('Unusually low transaction amount')
            score += self.weights['transaction_amount'] * 0.4
            
        # Transaction Type
        risky_types = ['IMPS', 'NEFT']  # UPI is generally safer with real-time checks
        if transaction_type in risky_types:
            factors.append(f'Risky transaction type: {transaction_type}')
            score += self.weights['transaction_type'] * 0.6
            
        # Time of Transaction
        hour = timestamp.hour if isinstance(timestamp, datetime) else datetime.now().hour
        if hour >= 22 or hour <= 5:  # Late night hours
            factors.append('Transaction during odd hours')
            score += self.weights['transaction_time'] * 0.7
            
        # Frequency of Transactions
        # This would require checking recent transactions in a real implementation
        # For now, we'll simulate with a parameter
        recent_transactions = transaction_data.get('recent_transactions_count', 0)
        if recent_transactions > self.rapid_transaction_threshold:
            factors.append('Multiple rapid transactions detected')
            score += self.weights['transaction_frequency'] * 0.8
            
        # Merchant Category
        if any(suspicious in merchant_category.lower() for suspicious in self.suspicious_merchants):
            factors.append('Unusual merchant category')
            score += self.weights['merchant_category'] * 0.9
            
        # Cross-border Transactions
        if location and location not in ['India', 'IN']:
            factors.append('Cross-border transaction')
            score += self.weights['cross_border'] * 0.7
            
        return {'factors': factors, 'score': score * weight}
    
    def _analyze_user_behavior(self, transaction_data, user_data):
        """Analyze user behavior parameters"""
        factors = []
        score = 0.0
        weight = self.weights['login_location'] + self.weights['device_fingerprint'] + \
                 self.weights['session_duration'] + self.weights['failed_attempts'] + \
                 self.weights['kyc_mismatch']
        
        login_location = transaction_data.get('login_location', '')
        device_id = transaction_data.get('device_id', '')
        session_duration = transaction_data.get('session_duration', 0)
        failed_attempts = transaction_data.get('failed_attempts', 0)
        kyc_phone = user_data.get('phone', '')
        kyc_email = user_data.get('email', '')
        transaction_phone = transaction_data.get('phone', '')
        transaction_email = transaction_data.get('email', '')
        
        # Login Location/IP Address
        if login_location in self.suspicious_ips:
            factors.append('Login from suspicious location')
            score += self.weights['login_location'] * 0.9
            
        # Device ID / Device Fingerprint
        known_devices = user_data.get('known_devices', [])
        if device_id and device_id not in known_devices:
            factors.append('New device detected')
            score += self.weights['device_fingerprint'] * 0.7
            
        # Session Duration
        if session_duration < self.suspicious_session_duration_min:
            factors.append('Very short session duration')
            score += self.weights['session_duration'] * 0.5
        elif session_duration > self.suspicious_session_duration_max:
            factors.append('Extremely long session duration')
            score += self.weights['session_duration'] * 0.6
            
        # Failed Transaction Attempts
        if failed_attempts >= self.max_failed_attempts:
            factors.append('Multiple failed transaction attempts')
            score += self.weights['failed_attempts'] * 1.0
            
        # Mismatch in KYC Details
        if transaction_phone and kyc_phone and transaction_phone != kyc_phone:
            factors.append('Phone number mismatch with KYC')
            score += self.weights['kyc_mismatch'] * 0.9
        if transaction_email and kyc_email and transaction_email != kyc_email:
            factors.append('Email mismatch with KYC')
            score += self.weights['kyc_mismatch'] * 0.9
            
        return {'factors': factors, 'score': score * weight}
    
    def _analyze_receiver_parameters(self, transaction_data):
        """Analyze payment receiver parameters"""
        factors = []
        score = 0.0
        weight = self.weights['recipient_vpa'] + self.weights['recipient_history'] + \
                 self.weights['merchant_trust']
        
        recipient_vpa = transaction_data.get('recipient_vpa', '')
        recipient_name = transaction_data.get('recipient_name', '')
        merchant_rating = transaction_data.get('merchant_rating', 5.0)
        
        # Recipient VPA (Virtual Payment Address)
        if any(blacklisted in recipient_vpa.lower() for blacklisted in self.blacklisted_vpns):
            factors.append('Unknown or blacklisted VPA')
            score += self.weights['recipient_vpa'] * 1.0
            
        # Recipient Name / Account History
        # In a real implementation, we would check historical data
        # For now, we'll use a placeholder
        frequent_changes = transaction_data.get('frequent_recipient_changes', False)
        if frequent_changes:
            factors.append('Frequent change in recipient names/accounts')
            score += self.weights['recipient_history'] * 0.8
            
        # Merchant Rating / Trustworthiness
        if merchant_rating < 2.0:  # Low trust merchant
            factors.append('Low trust merchant')
            score += self.weights['merchant_trust'] * 0.9
            
        return {'factors': factors, 'score': score * weight}
    
    def _analyze_network_security(self, transaction_data, user_data):
        """Analyze network and security parameters"""
        factors = []
        score = 0.0
        weight = self.weights['ip_geolocation'] + self.weights['vpn_usage'] + \
                 self.weights['device_version'] + self.weights['two_factor_auth']
        
        ip_address = transaction_data.get('ip_address', '')
        user_agent = transaction_data.get('user_agent', '')
        device_os = transaction_data.get('device_os', '')
        app_version = transaction_data.get('app_version', '')
        two_factor_enabled = user_data.get('two_factor_enabled', True)
        previous_location = user_data.get('last_known_location', '')
        current_location = transaction_data.get('location', '')
        
        # IP Geolocation
        if previous_location and current_location and previous_location != current_location:
            # In a real implementation, we would calculate distance and time
            # For now, we'll assume a significant location change is suspicious
            factors.append('Sudden change in user location')
            score += self.weights['ip_geolocation'] * 0.8
            
        # VPN/Proxy Usage
        if any(suspicious in user_agent.lower() for suspicious in self.suspicious_user_agents):
            factors.append('Use of anonymous networks')
            score += self.weights['vpn_usage'] * 0.9
            
        # Device OS & App Version
        # In a real implementation, we would check against known vulnerable versions
        outdated_app = transaction_data.get('outdated_app', False)
        if outdated_app:
            factors.append('Outdated app version')
            score += self.weights['device_version'] * 0.7
            
        # Two-factor Authentication Status
        if not two_factor_enabled:
            factors.append('Account without 2FA')
            score += self.weights['two_factor_auth'] * 1.0
            
        return {'factors': factors, 'score': score * weight}
    
    def _analyze_historical_parameters(self, transaction_data, user_data, historical_data):
        """Analyze historical and contextual parameters"""
        factors = []
        score = 0.0
        weight = self.weights['fraud_history'] + self.weights['transaction_velocity'] + \
                 self.weights['behavioral_patterns']
        
        # Past Fraud Reports
        past_fraud_reports = user_data.get('past_fraud_reports', 0)
        if past_fraud_reports > 0:
            factors.append('User has prior fraud history')
            score += self.weights['fraud_history'] * self.fraud_history_weight * min(1.0, past_fraud_reports / 5.0)
            
        # Transaction Velocity
        current_velocity = transaction_data.get('transaction_velocity', 1.0)
        average_velocity = historical_data.get('average_transaction_velocity', 1.0)
        if average_velocity > 0 and current_velocity / average_velocity > self.velocity_spike_threshold:
            factors.append('Sudden spike in transactions')
            score += self.weights['transaction_velocity'] * 0.9
            
        # Behavioral Patterns
        # Compare current behavior with historical patterns
        behavioral_deviation = transaction_data.get('behavioral_deviation', 0.0)
        if behavioral_deviation > 0.7:  # Significant deviation
            factors.append('Deviation from normal behavior patterns')
            score += self.weights['behavioral_patterns'] * behavioral_deviation
            
        return {'factors': factors, 'score': score * weight}


# Initialize service
fraud_detection_service = FraudDetectionService()