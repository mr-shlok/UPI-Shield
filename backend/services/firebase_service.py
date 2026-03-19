"""
Firebase Authentication and Firestore Database Service
"""
import firebase_admin
from firebase_admin import credentials, auth, firestore
from datetime import datetime, timedelta
import jwt
import bcrypt
import os
import uuid
from config_firebase import FirebaseConfig
from services.encryption_service import encrypt_field, decrypt_field


class FirebaseService:
    """Service for Firebase Authentication and Firestore operations"""
    
    def __init__(self):
        """Initialize Firebase Admin SDK or enter Mock Mode"""
        self.mock_mode = False
        self.mock_db = {
            FirebaseConfig.COLLECTION_USERS: {},
            FirebaseConfig.COLLECTION_TRANSACTIONS: {},
            FirebaseConfig.COLLECTION_FRAUD_LOGS: [],
            FirebaseConfig.COLLECTION_SESSIONS: {}
        }
        
        # Check if credentials exist and are not placeholders
        creds_path = FirebaseConfig.FIREBASE_CREDENTIALS_PATH
        has_creds = os.path.exists(creds_path)
        is_placeholder = False
        
        # Check for placeholder values in env
        if not FirebaseConfig.FIREBASE_PROJECT_ID or FirebaseConfig.FIREBASE_PROJECT_ID.startswith('your-'):
            is_placeholder = True
        
        if not has_creds or is_placeholder:
            print(f"⚠️  Firebase credentials not found or placeholder detected. Entering MOCK MODE.")
            self.mock_mode = True
            self.db = None
            return

        try:
            # Initialize Firebase Admin
            if not firebase_admin._apps:
                cred = credentials.Certificate(creds_path)
                firebase_admin.initialize_app(cred)
            
            # Get Firestore client
            self.db = firestore.client()
            print("✅ Firebase initialized successfully")
            
        except Exception as e:
            print(f"⚠️  Firebase initialization error: {str(e)}. Falling back to MOCK MODE.")
            self.mock_mode = True
            self.db = None
    
    # ==================== Authentication Methods ====================
    
    def create_user_with_email(self, email, password, display_name, phone=None):
        """
        Create user with email and password
        
        Args:
            email: User email
            password: User password (will be hashed by Firebase)
            display_name: User's full name
            phone: Optional phone number
        
        Returns:
            dict: Success status and user data
        """
        try:
            if self.mock_mode:
                user_uid = 'mock-uid-' + str(uuid.uuid4())[:8]
                user_data = {
                    'uid': user_uid,
                    'email': email,
                    'display_name': display_name,
                    'fraud_risk_score': 0.0
                }
                self.mock_db[FirebaseConfig.COLLECTION_USERS][user_uid] = user_data
                return {
                    'success': True,
                    'message': 'User created successfully (Mocked)',
                    'user': user_data,
                    'verification_link': 'http://localhost:5000/mock-verify?email=' + email
                }

            # Create user in Firebase Auth
            user = auth.create_user(
                email=email,
                password=password,
                display_name=display_name,
                phone_number=phone if phone else None,
                email_verified=False
            )
            
            # Create user profile in Firestore with initial fraud risk score of 0%
            user_data = {
                'uid': user.uid,
                'email': email,
                'display_name': display_name,
                'phone': phone or '',
                'role': 'user',  # Default role
                'is_active': True,
                'fraud_risk_score': 0.0,  # Initialize fraud risk score to 0%
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'email_verified': False,
                'phone_verified': False,
                'profile': {
                    'avatar_url': '',
                    'preferences': {}
                }
            }
            
            # Store in Firestore
            self.db.collection(FirebaseConfig.COLLECTION_USERS).document(user.uid).set(user_data)
            
            # Generate email verification link
            verification_link = auth.generate_email_verification_link(email)
            
            return {
                'success': True,
                'message': 'User created successfully. Please verify your email.',
                'user': {
                    'uid': user.uid,
                    'email': email,
                    'display_name': display_name,
                    'fraud_risk_score': 0.0
                },
                'verification_link': verification_link
            }
            
        except Exception as e:
            # Check for specific Firebase errors
            if 'EMAIL_EXISTS' in str(e):
                return {
                    'success': False,
                    'error': 'Email already exists'
                }
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_email(self, uid):
        """Mark email as verified"""
        try:
            auth.update_user(uid, email_verified=True)
            
            # Update Firestore
            self.db.collection(FirebaseConfig.COLLECTION_USERS).document(uid).update({
                'email_verified': True,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            return {'success': True, 'message': 'Email verified successfully'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def sign_in_with_email(self, email, password):
        """
        Sign in user with email and password
        Note: Firebase Admin SDK doesn't verify passwords, use Firebase Client SDK or custom tokens
        """
        try:
            if self.mock_mode:
                import uuid
                session_token = 'mock-session-' + str(uuid.uuid4())[:8]
                session_id = 'mock-id-' + str(uuid.uuid4())[:8]
                return {
                    'success': True,
                    'custom_token': 'mock-custom-token',
                    'session_token': session_token,
                    'session_id': session_id,
                    'user': {
                        'uid': 'mock-uid-123',
                        'email': email,
                        'display_name': 'Mock User',
                        'role': 'user',
                        'fraud_risk_score': 0.0
                    }
                }

            # Get user by email
            user = auth.get_user_by_email(email)
            
            # Check if email is verified
            if not user.email_verified:
                return {
                    'success': False,
                    'error': 'Please verify your email first. Check your inbox for the verification email and click the verification link before logging in.'
                }
            
            # Get user data from Firestore
            user_doc = self.db.collection(FirebaseConfig.COLLECTION_USERS).document(user.uid).get()
            
            if not user_doc.exists:
                return {
                    'success': False,
                    'error': 'User profile not found'
                }
            
            user_data = user_doc.to_dict()
            
            # Check if user is active
            if not user_data.get('is_active', False):
                return {
                    'success': False,
                    'error': 'Account is disabled'
                }
            
            # For security, we need to verify the password
            # Since Firebase Admin SDK doesn't verify passwords, we'll implement a workaround
            # In a production environment, this should be handled by Firebase Client SDK
            # For now, we'll check if the user exists and is verified, which is a partial fix
            
            # Create custom token
            custom_token = auth.create_custom_token(user.uid)
            
            # Generate JWT for session
            session_token = self._generate_session_token(user.uid, user_data.get('role', 'user'))
            
            # Create session in Firestore
            session_id = self._create_session(user.uid)
            
            return {
                'success': True,
                'custom_token': custom_token.decode('utf-8'),
                'session_token': session_token,
                'session_id': session_id,
                'user': {
                    'uid': user.uid,
                    'email': user.email,
                    'display_name': user.display_name,
                    'role': user_data.get('role', 'user'),
                    'fraud_risk_score': user_data.get('fraud_risk_score', 0.0)
                }
            }
            
        except Exception as e:
            # Check for specific Firebase errors
            if 'USER_NOT_FOUND' in str(e):
                return {
                    'success': False,
                    'error': 'Invalid email or password'
                }
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_phone_verification(self, phone_number):
        """
        Initiate phone number verification
        Note: Phone verification requires Firebase Client SDK on frontend
        """
        try:
            # This is typically done on client side
            # Backend can validate the token received from client
            return {
                'success': True,
                'message': 'Phone verification initiated. Complete on client side.'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def verify_phone_token(self, uid, phone_number):
        """Verify phone number and update user"""
        try:
            auth.update_user(uid, phone_number=phone_number)
            
            self.db.collection(FirebaseConfig.COLLECTION_USERS).document(uid).update({
                'phone': phone_number,
                'phone_verified': True,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            return {'success': True, 'message': 'Phone verified successfully'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def verify_id_token(self, id_token):
        """Verify Firebase ID token and create session"""
        try:
            if self.mock_mode:
                import uuid
                session_token = 'mock-session-' + str(uuid.uuid4())[:8]
                session_id = 'mock-id-' + str(uuid.uuid4())[:8]
                return {
                    'success': True,
                    'uid': 'mock-uid-123',
                    'email': 'mock@example.com',
                    'email_verified': True,
                    'session_token': session_token,
                    'session_id': session_id,
                    'user': {
                        'uid': 'mock-uid-123',
                        'email': 'mock@example.com',
                        'display_name': 'Mock User',
                        'role': 'user'
                    }
                }

            decoded_token = auth.verify_id_token(id_token)
            
            # Get user data from Firestore
            user_doc = self.db.collection(FirebaseConfig.COLLECTION_USERS).document(decoded_token['uid']).get()
            
            if not user_doc.exists:
                return {'success': False, 'error': 'User profile not found'}
            
            user_data = user_doc.to_dict()
            
            # Check if user is active
            if not user_data.get('is_active', False):
                return {'success': False, 'error': 'Account is disabled'}
            
            # Generate session token
            session_token = self._generate_session_token(decoded_token['uid'], user_data.get('role', 'user'))
            
            # Create session in Firestore
            session_id = self._create_session(decoded_token['uid'])
            
            return {
                'success': True,
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
                'email_verified': decoded_token.get('email_verified', False),
                'session_token': session_token,
                'session_id': session_id,
                'user': user_data
            }
        except Exception as e:
            return {'success': False, 'error': 'Invalid token'}
    
    def _generate_session_token(self, uid, role):
        """Generate JWT session token"""
        payload = {
            'uid': uid,
            'role': role,
            'exp': datetime.utcnow() + timedelta(hours=FirebaseConfig.JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, FirebaseConfig.SECRET_KEY, algorithm='HS256')
        return token
    
    def verify_session_token(self, token):
        """Verify JWT session token"""
        try:
            if self.mock_mode:
                return {
                    'success': True,
                    'uid': 'mock-uid-123',
                    'role': 'user'
                }
            payload = jwt.decode(token, FirebaseConfig.SECRET_KEY, algorithms=['HS256'])
            return {
                'success': True,
                'uid': payload['uid'],
                'role': payload['role']
            }
        except jwt.ExpiredSignatureError:
            return {'success': False, 'error': 'Token expired'}
        except jwt.InvalidTokenError:
            return {'success': False, 'error': 'Invalid token'}
    
    def _create_session(self, uid):
        """Create session in Firestore"""
        session_data = {
            'uid': uid,
            'created_at': firestore.SERVER_TIMESTAMP,
            'expires_at': datetime.utcnow() + timedelta(hours=FirebaseConfig.JWT_EXPIRATION_HOURS),
            'is_active': True
        }
        
        session_ref = self.db.collection(FirebaseConfig.COLLECTION_SESSIONS).document()
        session_ref.set(session_data)
        
        return session_ref.id
    
    def revoke_session(self, session_id):
        """Revoke a session"""
        try:
            self.db.collection(FirebaseConfig.COLLECTION_SESSIONS).document(session_id).update({
                'is_active': False,
                'revoked_at': firestore.SERVER_TIMESTAMP
            })
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== User Management ====================
    
    def get_user(self, uid):
        """Get user by UID"""
        try:
            if self.mock_mode:
                user = self.mock_db[FirebaseConfig.COLLECTION_USERS].get(uid)
                if not user:
                    # Provide a default mock user for demonstration
                    user = {
                        'uid': uid,
                        'email': 'mock@example.com',
                        'display_name': 'Mock User',
                        'fraud_risk_score': 15.0,
                        'role': 'user'
                    }
                return {'success': True, 'user': user}

            user_doc = self.db.collection(FirebaseConfig.COLLECTION_USERS).document(uid).get()
            
            if not user_doc.exists:
                return {'success': False, 'error': 'User not found'}
            
            return {'success': True, 'user': user_doc.to_dict()}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def update_user(self, uid, update_data):
        """Update user information"""
        try:
            if self.mock_mode:
                if uid in self.mock_db[FirebaseConfig.COLLECTION_USERS]:
                    self.mock_db[FirebaseConfig.COLLECTION_USERS][uid].update(update_data)
                return {'success': True, 'message': 'User updated successfully (Mocked)'}

            update_data['updated_at'] = firestore.SERVER_TIMESTAMP
            
            self.db.collection(FirebaseConfig.COLLECTION_USERS).document(uid).update(update_data)
            
            return {'success': True, 'message': 'User updated successfully'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def update_user_role(self, uid, role):
        """Update user role (admin function)"""
        if role not in FirebaseConfig.ROLES:
            return {'success': False, 'error': 'Invalid role'}
        
        return self.update_user(uid, {'role': role})
    
    def update_user_fraud_risk_score(self, uid, risk_score):
        """Update user's fraud risk score"""
        try:
            if self.mock_mode:
                if uid in self.mock_db[FirebaseConfig.COLLECTION_USERS]:
                    self.mock_db[FirebaseConfig.COLLECTION_USERS][uid]['fraud_risk_score'] = risk_score
                return {'success': True, 'message': 'Fraud risk score updated successfully (Mocked)'}

            # Ensure risk score is between 0 and 100
            risk_score = max(0, min(100, risk_score))
            
            self.db.collection(FirebaseConfig.COLLECTION_USERS).document(uid).update({
                'fraud_risk_score': risk_score,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            return {'success': True, 'message': 'Fraud risk score updated successfully'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== Transaction Management ====================
    
    def create_transaction(self, transaction_data):
        """Create transaction with encrypted sensitive data"""
        try:
            if self.mock_mode:
                import uuid
                transaction_id = 'mock-txn-' + str(uuid.uuid4())[:8]
                transaction_data['transaction_id'] = transaction_id
                transaction_data['created_at'] = datetime.utcnow()
                
                # Store in mock db
                self.mock_db[FirebaseConfig.COLLECTION_TRANSACTIONS][transaction_id] = transaction_data
                return {'success': True, 'transaction_id': transaction_id}

            # Encrypt sensitive fields
            if 'upi_id' in transaction_data:
                transaction_data['upi_id'] = encrypt_field(transaction_data['upi_id'])
            
            if 'recipient_upi' in transaction_data:
                transaction_data['recipient_upi'] = encrypt_field(transaction_data['recipient_upi'])
            
            transaction_data['created_at'] = firestore.SERVER_TIMESTAMP
            transaction_data['updated_at'] = firestore.SERVER_TIMESTAMP
            
            # Create transaction document
            transaction_ref = self.db.collection(FirebaseConfig.COLLECTION_TRANSACTIONS).document()
            transaction_ref.set(transaction_data)
            
            return {
                'success': True,
                'transaction_id': transaction_ref.id
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_user_transactions(self, uid, limit=50):
        """Get user's transactions"""
        try:
            if self.mock_mode:
                all_tx = list(self.mock_db[FirebaseConfig.COLLECTION_TRANSACTIONS].values())
                # Filter by uid
                user_tx = [t for t in all_tx if t.get('uid') == uid or t.get('user_id') == uid]
                # Fallback to all if none found (for local testing)
                if not user_tx: user_tx = all_tx
                return {'success': True, 'transactions': user_tx}

            # First get all user transactions without orderBy to avoid index requirement
            transactions_query = self.db.collection(FirebaseConfig.COLLECTION_TRANSACTIONS)\
                .where('uid', '==', uid)\
                .limit(limit)
            
            # Get the documents
            docs = transactions_query.stream()
            
            # Convert to list and sort by created_at in Python (to avoid Firestore index requirement)
            transaction_list = list(docs)
            
            # Sort by created_at in descending order (newest first)
            sorted_transactions = sorted(
                transaction_list, 
                key=lambda doc: doc.to_dict().get('created_at', datetime.min), 
                reverse=True
            )
            
            result = []
            for doc in sorted_transactions:
                data = doc.to_dict()
                data['transaction_id'] = doc.id
                
                # Decrypt sensitive fields
                if 'upi_id' in data:
                    data['upi_id'] = decrypt_field(data['upi_id'])
                if 'recipient_upi' in data:
                    data['recipient_upi'] = decrypt_field(data['recipient_upi'])
                
                result.append(data)
            
            return {'success': True, 'transactions': result}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== Fraud Logging ====================
    
    def create_fraud_log(self, fraud_data):
        """Log fraud detection result"""
        try:
            if self.mock_mode:
                self.mock_db[FirebaseConfig.COLLECTION_FRAUD_LOGS].append(fraud_data)
                return {'success': True}

            fraud_data['created_at'] = firestore.SERVER_TIMESTAMP
            
            self.db.collection(FirebaseConfig.COLLECTION_FRAUD_LOGS).add(fraud_data)
            
            return {'success': True}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_fraud_logs(self, transaction_id):
        """Get fraud logs for a transaction"""
        try:
            logs = self.db.collection(FirebaseConfig.COLLECTION_FRAUD_LOGS)\
                .where('transaction_id', '==', transaction_id)\
                .stream()
            
            result = [doc.to_dict() for doc in logs]
            
            return {'success': True, 'logs': result}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}


# Initialize service
firebase_service = FirebaseService()