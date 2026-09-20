import { useState } from "react";
import {
  geocodeLocation,
  getDistanceInKm,
  calculateTravelTime,
} from "../utils/geoService";

function FareCalculator() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("Auto");

  const [fare, setFare] = useState(null);
  const [distance, setDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // AI FARE CALCULATION
  // ==========================================

  const handleCalculateFare = async () => {
    if (!pickup.trim() || !destination.trim()) {
      alert("Please enter pickup and destination.");
      return;
    }

    try {
      setLoading(true);
      setFare(null);

      // ==========================================
      // 1. GEOCODE PICKUP
      // ==========================================

      const pickupData = await geocodeLocation(pickup);

      if (!pickupData) {
        alert("Pickup location not found. Please check the name.");
        return;
      }

      // ==========================================
      // 2. GEOCODE DESTINATION
      // ==========================================

      const destinationData =
        await geocodeLocation(destination);

      if (!destinationData) {
        alert(
          "Destination location not found. Please check the name."
        );
        return;
      }

      // ==========================================
      // 3. CALCULATE DISTANCE
      // ==========================================

      const calculatedDistance = getDistanceInKm(
        pickupData.lat,
        pickupData.lon,
        destinationData.lat,
        destinationData.lon
      );

      // ==========================================
      // 4. CALCULATE TRAVEL TIME
      // ==========================================

      const calculatedTime =
        calculateTravelTime(calculatedDistance);

      // ==========================================
      // 5. DETECT CITY
      // ==========================================

      const detectedCity =
        pickupData.city ||
        destinationData.city ||
        "Gorakhpur";

      setDistance(calculatedDistance);
      setTravelTime(calculatedTime);
      setCity(detectedCity);

      // ==========================================
      // 6. SEND DATA TO FLASK AI MODEL
      // ==========================================

      const response = await fetch(
        "http://localhost:5001/predict",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            pickup: pickup,
            destination: destination,
            vehicle_type: vehicle,
            distance: calculatedDistance,
          }),
        }
      );

      // ==========================================
      // 7. CHECK API RESPONSE
      // ==========================================

      if (!response.ok) {
        throw new Error(
          `AI Server Error: ${response.status}`
        );
      }

      const result = await response.json();

      console.log("🤖 AI Fare Response:", result);

      // ==========================================
      // 8. SET AI PREDICTED FARE
      // ==========================================

      if (result.success) {
        setFare(result.predicted_fare);
      } else {
        alert(
          result.error ||
            "AI could not calculate the fare."
        );
      }

    } catch (error) {
      console.error(
        "AI Fare Calculation Error:",
        error
      );

      alert(
        "Unable to connect with SmartRide AI service. Make sure Flask is running on port 5001."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fare-calculator">

      <h2>💰 Smart Fare Calculator</h2>

      {/* ======================================
          PICKUP
      ====================================== */}

      <input
        type="text"
        placeholder="📍 Pickup Location"
        value={pickup}
        onChange={(e) =>
          setPickup(e.target.value)
        }
      />

      {/* ======================================
          DESTINATION
      ====================================== */}

      <input
        type="text"
        placeholder="📍 Destination"
        value={destination}
        onChange={(e) =>
          setDestination(e.target.value)
        }
      />

      {/* ======================================
          VEHICLE
      ====================================== */}

      <select
        value={vehicle}
        onChange={(e) =>
          setVehicle(e.target.value)
        }
      >
        <option value="Auto">
          🚖 Auto
        </option>

        <option value="E-Rickshaw">
          🛺 E-Rickshaw
        </option>

        <option value="Bike">
          🏍 Bike
        </option>

        <option value="Taxi">
          🚕 Taxi
        </option>

        <option value="Bus">
          🚌 Bus
        </option>
      </select>

      {/* ======================================
          CALCULATE BUTTON
      ====================================== */}

      <button
        onClick={handleCalculateFare}
        disabled={loading}
      >
        {loading
          ? "🤖 AI Calculating..."
          : "💰 Calculate Fare"}
      </button>

      {/* ======================================
          RESULT
      ====================================== */}

      {fare !== null && (
        <div className="fare-result">

          <h3>
            🤖 SmartRide AI Fare Result
          </h3>

          <p>
            📍 City:{" "}
            <strong>{city}</strong>
          </p>

          <p>
            📍 Pickup:{" "}
            <strong>{pickup}</strong>
          </p>

          <p>
            📍 Destination:{" "}
            <strong>{destination}</strong>
          </p>

          <p>
            🚗 Vehicle:{" "}
            <strong>{vehicle}</strong>
          </p>

          <p>
            📏 Distance:{" "}
            <strong>
              {Number(distance).toFixed(2)} km
            </strong>
          </p>

          <p>
            ⏱️ Estimated Time:{" "}
            <strong>{travelTime}</strong>
          </p>

          <p>
            💰 AI Estimated Fare:{" "}
            <strong>
              ₹{Number(fare).toFixed(2)}
            </strong>
          </p>

          <p>
            🤖 Fare predicted using{" "}
            <strong>Random Forest ML</strong>
          </p>

        </div>
      )}

    </div>
  );
}

export default FareCalculator;