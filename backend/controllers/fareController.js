// controllers/fareController.js
import axios from "axios";
import { getDistance } from "../services/orsService.js";

// City-wise Fare Rates per KM (INR)
const CITY_RULES = {
   gorakhpur: {
    Bike: 10,
    Auto: 10,
    "E-Rickshaw": 10,
    Taxi: 10,
    Bus: 10,
  },
};
export const calculateFare = async (req, res) => {
  console.log("=== SmartRide AI Fare API Called ===");
  console.log("BODY:", req.body);

  try {
    const { pickup, destination, vehicle, distance: clientDistance, city } = req.body;

    if (!pickup || !destination || !vehicle) {
      return res.status(400).json({
        success: false,
        message: "Pickup, destination, and vehicle are required",
      });
    }

    let distance = clientDistance;
    let duration = "N/A";

    // 1. Agar Frontend se Distance nahi aaya, toh ORS Service se calculate karein
    if (!distance) {
      try {
        const route = await getDistance(pickup, destination);
        distance = route.distance;
        duration = route.duration;
      } catch (orsError) {
        console.error("ORS Distance Fetching Error:", orsError.message);
      }
    }

    const distNum = Number(distance) || 5; // Default fallback distance 5km if missing
    const normalizedCity = city ? city.toLowerCase().trim() : "";
    let fare = 0;
    let calculationSource = "City Rules";

    // 2. Step 1: City-Wise Rule Engine Check
   if (CITY_RULES[normalizedCity] && CITY_RULES[normalizedCity][vehicle]) {
  const baseFare = CITY_RULES[normalizedCity][vehicle];

  // Gorakhpur: har 2 km par ₹10
  fare = Math.ceil(distNum / 2) * baseFare;

  calculationSource = "Gorakhpur 2-KM Slab Rules";
}
    // 3. Step 2: Static Vehicle Default Rules Check
    else {
      let defaultRate = 0;
      switch (vehicle) {
        case "Bike":
          defaultRate = 8;
          break;
        case "Auto":
          defaultRate = 12;
          break;
        case "E-Rickshaw":
          defaultRate = 10;
          break;
        case "Taxi":
          defaultRate = 18;
          break;
        case "Bus":
          defaultRate = 5;
          break;
        default:
          defaultRate = 10;
      }

      // 4. Step 3: Call Python Flask ML Model for AI Fare Prediction
      try {
        const aiResponse = await axios.post("http://localhost:5001/predict", {
          distance: distNum,
          vehicle_type: vehicle,
          city: city || "Unknown",
        });

        if (aiResponse.data && aiResponse.data.predicted_fare) {
          fare = Math.round(aiResponse.data.predicted_fare);
          calculationSource = "AI ML Model (fare_model.pkl)";
        } else {
          fare = Math.round(distNum * defaultRate);
          calculationSource = "Standard Vehicle Rates";
        }
      } catch (aiError) {
        console.log("Flask AI Service Offline. Falling back to Standard Rates.");
        fare = Math.round(distNum * defaultRate);
        calculationSource = "Standard Vehicle Rates (AI Offline)";
      }
    }

    // Response Return
    res.status(200).json({
      success: true,
      pickup,
      destination,
      vehicle,
      distance: distNum,
      duration,
      fare,
      calculationSource,
    });

  } catch (error) {
    console.error("Fare Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};