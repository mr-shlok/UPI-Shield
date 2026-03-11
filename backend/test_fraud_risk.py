"""
Test script to verify fraud risk score endpoints
"""
import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER_EMAIL = "fraudtest@example.com"
TEST_USER_PASSWORD = "TestPass123!"

def register_user():
    """Register a test user"""
    print("Registering test user...")
    url = f"{BASE_URL}/api/auth/register"
    payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "display_name": "Fraud Test User"
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

def get_fraud_risk_score(session_token):
    """Get user's fraud risk score"""
    print("Fetching fraud risk score...")
    url = f"{BASE_URL}/api/auth/fraud-risk-score"
    headers = {
        "Authorization": f"Bearer {session_token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print("✅ Fraud risk score fetched successfully")
            return response.json()
        else:
            print(f"❌ Fetching fraud risk score failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Fetching fraud risk score error: {str(e)}")
        return None

def update_fraud_risk_score(session_token, risk_score):
    """Update user's fraud risk score"""
    print(f"Updating fraud risk score to {risk_score}%...")
    url = f"{BASE_URL}/api/auth/fraud-risk-score"
    payload = {
        "fraud_risk_score": risk_score
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {session_token}"
    }
    
    try:
        response = requests.put(url, headers=headers, data=json.dumps(payload))
        if response.status_code == 200:
            print("✅ Fraud risk score updated successfully")
            return response.json()
        else:
            print(f"❌ Updating fraud risk score failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Updating fraud risk score error: {str(e)}")
        return None

def main():
    """Main test function"""
    print("🧪 Testing UPI Shield Fraud Risk Score Endpoints")
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
    
    # Get initial fraud risk score (should be 0% for new users)
    initial_score = get_fraud_risk_score(session_token)
    if initial_score and initial_score.get('success'):
        score = initial_score.get('fraud_risk_score')
        print(f"Initial Fraud Risk Score: {score}%")
        if score == 0.0:
            print("✅ New user correctly initialized with 0% fraud risk score")
        else:
            print("❌ New user should have 0% fraud risk score")
    
    # Update fraud risk score
    update_result = update_fraud_risk_score(session_token, 25.5)
    if update_result and update_result.get('success'):
        print("✅ Fraud risk score updated successfully")
    else:
        print("❌ Failed to update fraud risk score")
    
    # Get updated fraud risk score
    updated_score = get_fraud_risk_score(session_token)
    if updated_score and updated_score.get('success'):
        score = updated_score.get('fraud_risk_score')
        print(f"Updated Fraud Risk Score: {score}%")
        if score == 25.5:
            print("✅ Fraud risk score correctly updated")
        else:
            print("❌ Fraud risk score not updated correctly")
    
    print("\n🎉 Fraud risk score tests completed!")

if __name__ == "__main__":
    main()