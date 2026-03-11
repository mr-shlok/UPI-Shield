"""
Training script for the fraud detection model
"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.fraud_detection_service import fraud_detection_service

def main():
    print("🚀 Starting fraud detection model training...")
    print("=" * 50)
    
    # Train the model
    result = fraud_detection_service.train_model()
    
    if 'error' in result:
        print(f"❌ Training failed: {result['error']}")
        return
    
    print(f"✅ Training completed successfully!")
    print(f"📊 Model Performance Metrics:")
    print(f"   Accuracy: {result['accuracy']:.4f}")
    print(f"   Precision: {result['precision']:.4f}")
    print(f"   Recall: {result['recall']:.4f}")
    print(f"   F1-Score: {result['f1_score']:.4f}")
    
    print("\n🎉 Fraud detection model is ready for real-time fraud detection!")

if __name__ == "__main__":
    main()