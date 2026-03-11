"""
Debug script to test transaction flow and check Firestore storage
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
TEST_CREDENTIALS = {
    "email": "sample@example.com",
    "password": "TestPass123!",
    "display_name": "Sample User"
}

def test_registration():
    """Test user registration"""
    print("🔧 Testing User Registration...")
    url = f"{BASE_URL}/api/auth/register"
    payload = TEST_CREDENTIALS
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        print(f"Registration Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ Registration successful")
            return response.json()
        else:
            print(f"❌ Registration failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return None

def test_login():
    """Test user login"""
    print("\n🔧 Testing User Login...")
    url = f"{BASE_URL}/api/auth/login"
    payload = {
        "email": TEST_CREDENTIALS["email"],
        "password": TEST_CREDENTIALS["password"]
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        print(f"Login Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Login successful")
            return response.json()
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return None

def test_create_transaction(token):
    """Test creating a transaction"""
    print("\n🔧 Testing Transaction Creation...")
    url = f"{BASE_URL}/api/transactions"
    payload = {
        "upi_id": "debug@upi",
        "amount": 2500.0,
        "recipient_name": "Debug Test",
        "recipient_upi": "recipient@paytm",
        "type": "UPI",
        "timestamp": datetime.now().isoformat(),
        "login_location": "Mumbai, India",
        "device_id": "debug_device_123",
        "session_duration": 300,
        "failed_attempts": 0,
        "merchant_category": "peer-to-peer",
        "location": "India",
        "recent_transactions_count": 1
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        print(f"Transaction Creation Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ Transaction created successfully")
            return response.json()
        else:
            print(f"❌ Transaction creation failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Transaction creation error: {str(e)}")
        return None

def test_get_transactions(token):
    """Test getting transactions"""
    print("\n🔧 Testing Transaction Retrieval...")
    url = f"{BASE_URL}/api/transactions"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Transaction Retrieval Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Retrieved {len(result.get('transactions', []))} transactions")
            return result
        else:
            print(f"❌ Transaction retrieval failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Transaction retrieval error: {str(e)}")
        return None

def main():
    """Main debug function"""
    print("🔍 UPI Shield Transaction Debug Tool")
    print("=" * 50)
    
    # Test 1: Registration
    print("Step 1: User Registration")
    reg_result = test_registration()
    if not reg_result:
        print("⚠️  Registration failed, proceeding with login...")
    
    # Test 2: Login
    print("\nStep 2: User Login")
    login_result = test_login()
    if not login_result:
        print("❌ Cannot proceed without login")
        return
    
    token = login_result.get('session_token')
    if not token:
        print("❌ No session token received")
        return
    
    print(f"Token (first 20 chars): {token[:20]}...")
    
    # Test 3: Create Transaction
    print("\nStep 3: Create Transaction")
    transaction_result = test_create_transaction(token)
    if not transaction_result:
        print("❌ Cannot proceed without transaction")
        return
    
    transaction_id = transaction_result.get('transaction_id')
    print(f"Transaction ID: {transaction_id}")
    
    # Test 4: Get Transactions
    print("\nStep 4: Retrieve Transactions")
    transactions_result = test_get_transactions(token)
    if transactions_result and transactions_result.get('success'):
        transactions = transactions_result.get('transactions', [])
        print(f"Total transactions: {len(transactions)}")
        if transactions:
            latest = transactions[0]
            print(f"Latest transaction: {latest.get('recipient_name', 'N/A')} - ₹{latest.get('amount', 0)}")
    
    print("\n" + "=" * 50)
    print("📋 DEBUG COMPLETE")
    print("Check your Firebase Console for the new transaction in the 'transactions' collection")
    print("If you don't see it, check the backend console for error messages")

if __name__ == "__main__":
    main()