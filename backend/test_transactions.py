"""
Test script to verify transaction endpoints and Firestore integration
"""
import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "TestPass123!"

def register_user():
    """Register a test user"""
    print("Registering test user...")
    url = f"{BASE_URL}/api/auth/register"
    payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "display_name": "Test User"
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        if response.status_code == 201:
            print("✅ User registered successfully")
            return response.json()
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return None

def login_user():
    """Login the test user"""
    print("Logging in test user...")
    url = f"{BASE_URL}/api/auth/login"
    payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        if response.status_code == 200:
            print("✅ User logged in successfully")
            return response.json()
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return None

def create_transaction(session_token):
    """Create a test transaction"""
    print("Creating test transaction...")
    url = f"{BASE_URL}/api/transactions"
    payload = {
        "upi_id": "test@upi",
        "amount": 1500.0,
        "recipient_name": "Test Recipient",
        "recipient_upi": "recipient@paytm",
        "type": "UPI",
        "login_location": "Mumbai, India",
        "device_id": "device_test123",
        "session_duration": 300,
        "failed_attempts": 0,
        "merchant_category": "peer-to-peer",
        "location": "India",
        "recent_transactions_count": 2
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {session_token}"
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        if response.status_code == 201:
            print("✅ Transaction created successfully")
            return response.json()
        else:
            print(f"❌ Transaction creation failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Transaction creation error: {str(e)}")
        return None

def get_transactions(session_token):
    """Get user transactions"""
    print("Fetching user transactions...")
    url = f"{BASE_URL}/api/transactions"
    headers = {
        "Authorization": f"Bearer {session_token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print("✅ Transactions fetched successfully")
            return response.json()
        else:
            print(f"❌ Fetching transactions failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Fetching transactions error: {str(e)}")
        return None

def analyze_transaction(session_token, transaction_data):
    """Analyze transaction for fraud"""
    print("Analyzing transaction for fraud...")
    url = f"{BASE_URL}/api/transactions/analyze"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {session_token}"
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(transaction_data))
        if response.status_code == 200:
            print("✅ Transaction analyzed successfully")
            return response.json()
        else:
            print(f"❌ Transaction analysis failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Transaction analysis error: {str(e)}")
        return None

def main():
    """Main test function"""
    print("🧪 Testing UPI Shield Transaction Endpoints")
    print("=" * 50)
    
    # Wait a moment for server to start
    time.sleep(2)
    
    # Register user
    register_result = register_user()
    if not register_result:
        return
    
    # Login user
    login_result = login_user()
    if not login_result:
        return
    
    session_token = login_result.get('session_token')
    if not session_token:
        print("❌ No session token received")
        return
    
    # Create transaction
    transaction_result = create_transaction(session_token)
    if not transaction_result:
        return
    
    transaction_id = transaction_result.get('transaction_id')
    print(f"Transaction ID: {transaction_id}")
    
    # Get transactions
    transactions_result = get_transactions(session_token)
    if transactions_result and transactions_result.get('success'):
        transactions = transactions_result.get('transactions', [])
        print(f"Found {len(transactions)} transactions")
    
    # Analyze transaction
    transaction_data = {
        "amount": 1500.0,
        "recipient_name": "Test Recipient",
        "login_location": "Mumbai, India",
        "device_id": "device_test123",
        "session_duration": 300,
        "failed_attempts": 0,
        "merchant_category": "peer-to-peer",
        "location": "India",
        "recent_transactions_count": 2
    }
    
    analysis_result = analyze_transaction(session_token, transaction_data)
    if analysis_result:
        print(f"Risk Score: {analysis_result.get('risk_score')}")
        print(f"Risk Level: {analysis_result.get('risk_level')}")
        print(f"Is Fraudulent: {analysis_result.get('is_fraudulent')}")
    
    print("\n🎉 All tests completed!")
    print("Check your Firebase Console to see the new data in collections.")

if __name__ == "__main__":
    main()