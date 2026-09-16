import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Dummy Dataset for SmartRide Fare Prediction
# Features: [distance_km, vehicle_type_code]
# Vehicle Codes: Bike=1, E-Rickshaw=2, Auto=3, Taxi=4, Bus=5

X = np.array([
    [1.5, 1], [3.0, 1], [5.5, 1], [10.0, 1],  # Bike
    [1.0, 2], [2.5, 2], [4.0, 2], [6.0, 2],   # E-Rickshaw
    [2.0, 3], [5.0, 3], [8.0, 3], [12.0, 3],  # Auto
    [3.0, 4], [7.0, 4], [15.0, 4], [25.0, 4], # Taxi
    [5.0, 5], [10.0, 5], [20.0, 5], [30.0, 5] # Bus
])

# Target Fares (INR)
y = np.array([
    25, 40, 60, 95,      # Bike Fares
    20, 35, 50, 70,      # E-Rickshaw Fares
    40, 75, 110, 160,    # Auto Fares
    80, 160, 320, 500,   # Taxi Fares
    30, 50, 80, 110      # Bus Fares
])

# Train Random Forest ML Model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# Save Model to fare_model.pkl
joblib.dump(model, 'fare_model.pkl')
print("🎉 Model trained successfully and saved as 'fare_model.pkl'!")