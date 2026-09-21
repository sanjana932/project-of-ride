// controllers/fareController.js

import axios from "axios";
import { getDistance } from "../services/orsService.js";

// ==========================================
// CITY-WISE FARE RULES
// ==========================================

const CITY_RULES = {
  gorakhpur: {
    Bike: 10,
    Auto: 10,
    "E-Rickshaw": 10,
    Taxi: 10,
    Bus: 10,
  },
};

// ==========================================
// CALCULATE FARE
// ==========================================

export const calculateFare = async (req, res) => {
  console.log("=================================");
  console.log("=== SmartRide AI Fare API Called ===");
  console.log("BODY:", req.body);

  try {
    const {
      pickup,
      destination,
      vehicle,
      distance: clientDistance,
      city,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!pickup || !destination || !vehicle) {
      return res.status(400).json({
        success: false,
        message: "Pickup, destination, and vehicle are required",
      });
    }

    // ==========================================
    // DISTANCE
    // ==========================================

    let distance = clientDistance;
    let duration = "N/A";

    // Agar frontend se distance nahi aaya
    if (!distance) {
      try {
        const route = await getDistance(pickup, destination);

        distance = route.distance;
        duration = route.duration;

      } catch (orsError) {
        console.error(
          "ORS Distance Fetching Error:",
          orsError.message
        );
      }
    }

    // ==========================================
    // DISTANCE NUMBER
    // ==========================================

    const distNum = Number(distance) || 5;

    // ==========================================
    // CITY NORMALIZATION
    // ==========================================

    const normalizedCity = city
      ? city.toLowerCase().trim()
      : "";

    console.log("🏙️ City:", normalizedCity);
    console.log("🚗 Vehicle:", vehicle);
    console.log("📏 Distance:", distNum, "km");

    // ==========================================
    // FARE CALCULATION
    // ==========================================

    let fare = 0;
    let calculationSource = "";

    // ==========================================
    // GORAKHPUR LOCAL RULE
    // ₹10 per 2 KM SLAB
    // ==========================================

    if (
      CITY_RULES[normalizedCity] &&
      CITY_RULES[normalizedCity][vehicle]
    ) {
      const baseFare =
        CITY_RULES[normalizedCity][vehicle];

      fare =
        Math.max(1, Math.ceil(distNum / 2)) *
        baseFare;

      calculationSource =
        "Gorakhpur 2-KM Slab Rules";

      console.log("💰 Gorakhpur Fare:", fare);
    }

    // ==========================================
    // OTHER CITIES
    // ==========================================

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

      // ==========================================
      // AI MODEL
      // ==========================================

      try {
        const aiResponse = await axios.post(
          "http://localhost:5001/predict",
          {
            distance: distNum,
            vehicle_type: vehicle,
            city: city || "Unknown",
          }
        );

        if (
          aiResponse.data &&
          aiResponse.data.predicted_fare
        ) {
          fare = Math.round(
            aiResponse.data.predicted_fare
          );

          calculationSource =
            "AI ML Model (fare_model.pkl)";
        } else {
          fare = Math.round(
            distNum * defaultRate
          );

          calculationSource =
            "Standard Vehicle Rates";
        }

      } catch (aiError) {
        console.log(
          "Flask AI Service Offline. Using standard rates."
        );

        fare = Math.round(
          distNum * defaultRate
        );

        calculationSource =
          "Standard Vehicle Rates (AI Offline)";
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    console.log("💰 Final Fare:", fare);
    console.log("📌 Source:", calculationSource);
    console.log("=================================");

    return res.status(200).json({
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
    console.error(
      "Fare Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};