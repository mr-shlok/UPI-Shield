"""
Script to initialize Firestore collections with sample data for UPI Shield
"""
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import json
import os

# Initialize Firebase Admin
def initialize_firebase():
    try:
        # Use your existing credentials file
        cred = credentials.Certificate('firebase-credentials.json')
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        print("[SUCCESS] Firebase initialized successfully")
        return firestore.client()
    except Exception as e:
        print(f"[ERROR] Firebase initialization error: {str(e)}")
        return None

def create_sample_data(db):
    """Create sample data in Firestore collections"""
    try:
        print("Creating sample data in Firestore...")
        
        # Create sample user
        sample_user = {
            'uid': 'user_12345',
            'email': 'sample@example.com',
            'display_name': 'Sample User',
            'phone': '+919876543210',
            'role': 'user',
            'is_active': True,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'email_verified': True,
            'phone_verified': True,
            'profile': {
                'avatar_url': '',
                'preferences': {}
            }
        }
        
        db.collection('users').document('user_12345').set(sample_user)
        print("[SUCCESS] Created sample user")
        
        # Create sample transactions
        sample_transactions = [
            {
                'uid': 'user_12345',
                'upi_id': 'sample@upi',
                'amount': 2500.0,
                'recipient_name': 'John Doe',
                'recipient_upi': 'john@paytm',
                'type': 'UPI',
                'timestamp': datetime.now(),
                'status': 'completed',
                'is_fraudulent': False,
                'risk_score': 12,
                'risk_level': 'low',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'uid': 'user_12345',
                'upi_id': 'sample@upi',
                'amount': 5000.0,
                'recipient_name': 'Jane Smith',
                'recipient_upi': 'jane@gpay',
                'type': 'UPI',
                'timestamp': datetime.now(),
                'status': 'completed',
                'is_fraudulent': False,
                'risk_score': 5,
                'risk_level': 'low',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'uid': 'user_12345',
                'upi_id': 'sample@upi',
                'amount': 1200.0,
                'recipient_name': 'Bob Johnson',
                'recipient_upi': 'bob@phonepe',
                'type': 'UPI',
                'timestamp': datetime.now(),
                'status': 'fraud',
                'is_fraudulent': True,
                'risk_score': 95,
                'risk_level': 'high',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
        ]
        
        for i, transaction in enumerate(sample_transactions):
            doc_ref = db.collection('transactions').document(f'txn_00{i+1}')
            doc_ref.set(transaction)
        print("[SUCCESS] Created sample transactions")
        
        # Create sample fraud logs
        sample_fraud_logs = [
            {
                'transaction_id': 'txn_001',
                'user_id': 'user_12345',
                'risk_score': 12,
                'is_fraudulent': False,
                'risk_level': 'low',
                'factors': ['Normal amount', 'Known recipient'],
                'timestamp': firestore.SERVER_TIMESTAMP
            },
            {
                'transaction_id': 'txn_003',
                'user_id': 'user_12345',
                'risk_score': 95,
                'is_fraudulent': True,
                'risk_level': 'high',
                'factors': ['High amount', 'Unknown recipient', 'Odd hours'],
                'timestamp': firestore.SERVER_TIMESTAMP
            }
        ]
        
        for i, fraud_log in enumerate(sample_fraud_logs):
            db.collection('fraud_logs').add(fraud_log)
        print("[SUCCESS] Created sample fraud logs")
        
        # Create sample session
        sample_session = {
            'uid': 'user_12345',
            'created_at': firestore.SERVER_TIMESTAMP,
            'expires_at': datetime.now(),
            'is_active': True
        }
        
        db.collection('sessions').document('session_12345').set(sample_session)
        print("[SUCCESS] Created sample session")
        
        print("\n[SUCCESS] All sample data created successfully!")
        print("\nYou can now view the collections in your Firebase Console:")
        print("- users")
        print("- transactions")
        print("- fraud_logs")
        print("- sessions")
        
    except Exception as e:
        print(f"[ERROR] Error creating sample data: {str(e)}")

def main():
    """Main function to initialize Firestore"""
    print("Initializing Firestore for UPI Shield...")
    
    # Check if credentials file exists
    if not os.path.exists('firebase-credentials.json'):
        print("[ERROR] firebase-credentials.json not found!")
        print("Please ensure you have downloaded your Firebase credentials file.")
        return
    
    # Initialize Firebase
    db = initialize_firebase()
    if not db:
        return
    
    # Create sample data
    create_sample_data(db)
    
    print("\n[SUCCESS] Firestore initialization complete!")
    print("Refresh your Firebase Console to see the new collections.")

if __name__ == "__main__":
    main()