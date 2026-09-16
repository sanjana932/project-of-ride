from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # React & Node.js se requests allow karne ke liye

# Model File Path
MODEL_PATH = 'fare_model.pkl'

# Vehicle Type Ko Numeric Code Me Map Karna (ML Model Input Ke Liye)
VEHICLE_MAP = {
    'Bike': 1,
    'E-Rickshaw': 2,
    'Auto': 3,
    'Taxi': 4,
    'Bus': 5
}

# Pickle Model Load Karein
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("✅ ML Model (fare_model.pkl) Loaded Successfully!")
    except Exception as e:
        print("⚠️ Error loading fare_model.pkl:", e)
else:
    print("⚠️ fare_model.pkl file nahi mili! Backup mathematical formula use hoga.")

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'Online',
        'service': 'SmartRide AI Fare Prediction Microservice'
    })

@app.route('/predict', methods=['POST'])
def predict_fare():
    try:
        data = request.get_json()
        distance = float(data.get('distance', 0))
        vehicle = data.get('vehicle_type', 'Auto')

        # Vehicle code extract karein
        vehicle_code = VEHICLE_MAP.get(vehicle, 3)

        predicted_fare = 0
        method_used = ""

        # Strategy 1: Trained ML Model Se Predict Karein
        if model:
            # Model Input Format: [[distance, vehicle_code]]
            features = np.array([[distance, vehicle_code]])
            predicted_fare = model.predict(features)[0]
            method_used = "Trained ML Model (fare_model.pkl)"
        
        # Strategy 2: Dynamic Backup Formula (Agar .pkl file missing ho)
        else:
            base_rates = {1: 8, 2: 10, 3: 12, 4: 18, 5: 5}
            rate = base_rates.get(vehicle_code, 10)
            predicted_fare = 15 + (distance * rate)  # Base Fare 15 + (Dist * Rate)
            method_used = "Fallback AI Heuristic Engine"

        return jsonify({
            'success': True,
            'predicted_fare': round(float(predicted_fare), 2),
            'distance_km': distance,
            'vehicle': vehicle,
            'engine': method_used
        })

    except Exception as e:
        print("Prediction Error:", str(e))
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Node.js backend port 5000 par hota hai, Flask Port 5001 par chalega
    app.run(host='0.0.0.0', port=5001, debug=True)