from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)


# ============================================================
# MODEL PATH
# ============================================================

MODEL_PATH = "fare_model.pkl"

model = None


# ============================================================
# LOAD TRAINED ML MODEL
# ============================================================

if os.path.exists(MODEL_PATH):

    try:
        model = joblib.load(MODEL_PATH)

        print("============================================")
        print("✅ SmartRide AI Model Loaded Successfully!")
        print("============================================")

    except Exception as e:

        print("❌ Error loading fare_model.pkl:")
        print(e)

else:

    print("⚠️ fare_model.pkl not found!")


# ============================================================
# HOME ROUTE
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": "Online",
        "service": "SmartRide AI Fare Prediction API",
        "model_loaded": model is not None
    })


# ============================================================
# FARE PREDICTION
# ============================================================

@app.route("/predict", methods=["POST"])
def predict_fare():

    try:

        data = request.get_json()

        # ----------------------------------------------------
        # GET DATA FROM REACT
        # ----------------------------------------------------

        pickup = data.get("pickup", "").strip()
        destination = data.get("destination", "").strip()
        vehicle = data.get("vehicle_type", "Auto").strip()

        distance = float(
            data.get("distance", 0)
        )


        # ----------------------------------------------------
        # VALIDATION
        # ----------------------------------------------------

        if not pickup:

            return jsonify({
                "success": False,
                "error": "Pickup location is required"
            }), 400


        if not destination:

            return jsonify({
                "success": False,
                "error": "Destination is required"
            }), 400


        if distance <= 0:

            return jsonify({
                "success": False,
                "error": "Distance must be greater than 0"
            }), 400


        # ----------------------------------------------------
        # CHECK MODEL
        # ----------------------------------------------------

        if model is None:

            return jsonify({
                "success": False,
                "error": "ML model is not loaded"
            }), 500


        # ----------------------------------------------------
        # CREATE INPUT DATAFRAME
        # ----------------------------------------------------

        input_data = pd.DataFrame([
            {
                "pickup": pickup,
                "destination": destination,
                "vehicle_type": vehicle,
                "distance_km": distance
            }
        ])


        print("\n============================================")
        print("🚕 NEW FARE PREDICTION")
        print("============================================")
        print("Pickup      :", pickup)
        print("Destination :", destination)
        print("Vehicle     :", vehicle)
        print("Distance    :", distance, "km")


        # ----------------------------------------------------
        # ML PREDICTION
        # ----------------------------------------------------

        predicted_fare = model.predict(input_data)[0]


        # ----------------------------------------------------
        # ROUND FARE
        # ----------------------------------------------------

        predicted_fare = round(
            float(predicted_fare),
            2
        )


        print("Predicted Fare:", predicted_fare)
        print("============================================")


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "pickup": pickup,

            "destination": destination,

            "vehicle": vehicle,

            "distance_km": distance,

            "predicted_fare": predicted_fare,

            "currency": "INR",

            "engine": "Random Forest ML Model"

        })


    except Exception as e:

        print("\n❌ Prediction Error:")
        print(str(e))

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# RUN FLASK SERVER
# ============================================================

if __name__ == "__main__":

    print("============================================")
    print("🚀 SmartRide AI Service Starting...")
    print("📡 Port: 5001")
    print("============================================")

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )