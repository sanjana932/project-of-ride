import pandas as pd
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor


# ============================================================
# SMART RIDE AI - FARE MODEL TRAINING
# ============================================================

# Training Dataset
# ------------------------------------------------------------
# Pickup + Destination route ko bhi ML input diya ja raha hai.
#
# Vehicle:
# Bike
# E-Rickshaw
# Auto
# Taxi
# Bus
#
# Fare = observed/local fare used for training
# ------------------------------------------------------------

data = [
    # --------------------------------------------------------
    # AUTO
    # --------------------------------------------------------
    ["AIIMS Gorakhpur", "Mohaddipur", "Auto", 2.68, 10],
    ["AIIMS Gorakhpur", "Shastri Chowk", "Auto", 5.0, 20],
    ["Mohaddipur", "Shastri Chowk", "Auto", 2.0, 15],
    ["Shastri Chowk", "AIIMS Gorakhpur", "Auto", 5.0, 20],
    ["Mohaddipur", "AIIMS Gorakhpur", "Auto", 2.68, 10],

    # General local examples
    ["Kunraghat", "Shastri Chowk", "Auto", 4.0, 20],
    ["Shastri Chowk", "Kachahari", "Auto", 2.0, 10],
    ["AIIMS Gorakhpur", "Kachahari", "Auto", 5.0, 20],
    ["Gorakhpur Railway Station", "Shastri Chowk", "Auto", 3.0, 20],
    ["Gorakhpur Railway Station", "Kachahari", "Auto", 2.5, 20],

    # --------------------------------------------------------
    # E-RICKSHAW
    # --------------------------------------------------------
    ["AIIMS Gorakhpur", "Mohaddipur", "E-Rickshaw", 2.68, 10],
    ["AIIMS Gorakhpur", "Shastri Chowk", "E-Rickshaw", 5.0, 20],
    ["Mohaddipur", "Shastri Chowk", "E-Rickshaw", 2.0, 15],
    ["Shastri Chowk", "AIIMS Gorakhpur", "E-Rickshaw", 5.0, 20],

    # --------------------------------------------------------
    # BIKE
    # --------------------------------------------------------
    ["AIIMS Gorakhpur", "Mohaddipur", "Bike", 2.68, 20],
    ["AIIMS Gorakhpur", "Shastri Chowk", "Bike", 5.0, 30],
    ["Mohaddipur", "Shastri Chowk", "Bike", 2.0, 20],

    # --------------------------------------------------------
    # TAXI
    # --------------------------------------------------------
    ["AIIMS Gorakhpur", "Mohaddipur", "Taxi", 2.68, 80],
    ["AIIMS Gorakhpur", "Shastri Chowk", "Taxi", 5.0, 120],
    ["Mohaddipur", "Shastri Chowk", "Taxi", 2.0, 70],

    # --------------------------------------------------------
    # BUS
    # --------------------------------------------------------
    ["AIIMS Gorakhpur", "Mohaddipur", "Bus", 2.68, 10],
    ["AIIMS Gorakhpur", "Shastri Chowk", "Bus", 5.0, 15],
    ["Mohaddipur", "Shastri Chowk", "Bus", 2.0, 10],
]


# ============================================================
# DATAFRAME
# ============================================================

df = pd.DataFrame(
    data,
    columns=[
        "pickup",
        "destination",
        "vehicle_type",
        "distance_km",
        "fare"
    ]
)


print("\n================ DATASET ================\n")
print(df)


# ============================================================
# FEATURES AND TARGET
# ============================================================

X = df[
    [
        "pickup",
        "destination",
        "vehicle_type",
        "distance_km"
    ]
]

y = df["fare"]


# ============================================================
# PREPROCESSING
# ============================================================

categorical_features = [
    "pickup",
    "destination",
    "vehicle_type"
]

numeric_features = [
    "distance_km"
]


preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        ),
        (
            "numeric",
            "passthrough",
            numeric_features
        )
    ]
)


# ============================================================
# RANDOM FOREST MODEL
# ============================================================

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)


# ============================================================
# PIPELINE
# ============================================================

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# ============================================================
# TRAIN MODEL
# ============================================================

print("\nTraining SmartRide AI model...\n")

pipeline.fit(X, y)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    pipeline,
    "fare_model.pkl"
)


print("============================================")
print("🎉 SmartRide AI Model Trained Successfully!")
print("📁 Model saved as: fare_model.pkl")
print("============================================")