
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

  // Fare calculation
  const handleCalculateFare = async () => {
    if (!pickup || !destination) {
      alert("Please enter pickup and destination.");
      return;
    }

    try {
      setLoading(true);
      setFare(null);

      // Pickup location
      const pickupData = await geocodeLocation(pickup);

      // Destination location
      const destinationData = await geocodeLocation(destination);

      if (!pickupData) {
        alert("Pickup location not found. Please check the name.");
        return;
      }

      if (!destinationData) {
        alert("Destination location not found. Please check the name.");
        return;
      }

      // Distance
      const calculatedDistance = getDistanceInKm(
        pickupData.lat,
        pickupData.lon,
        destinationData.lat,
        destinationData.lon
      );

      // Travel time
      const calculatedTime =
        calculateTravelTime(calculatedDistance);

      // City
      const detectedCity =
        pickupData.city ||
        destinationData.city ||
        "Gorakhpur";

      setDistance(calculatedDistance);
      setTravelTime(calculatedTime);
      setCity(detectedCity);

      // --------------------------------
      // GORAKHPUR FARE RULES
      // --------------------------------

      let calculatedFare = 0;

      if (detectedCity.toLowerCase().includes("gorakhpur")) {

        if (vehicle === "Auto" || vehicle === "E-Rickshaw") {

          if (calculatedDistance <= 2) {
            calculatedFare = 20;
          } else if (calculatedDistance <= 5) {
            calculatedFare = 20;
          } else if (calculatedDistance <= 8) {
            calculatedFare = 30;
          } else if (calculatedDistance <= 12) {
            calculatedFare = 40;
          } else {
            calculatedFare = 40 + Math.ceil(
              calculatedDistance - 12
            ) * 5;
          }

        } else if (vehicle === "Bike") {

          if (calculatedDistance <= 2) {
            calculatedFare = 20;
          } else if (calculatedDistance <= 5) {
            calculatedFare = 30;
          } else if (calculatedDistance <= 8) {
            calculatedFare = 40;
          } else {
            calculatedFare = 40 + Math.ceil(
              calculatedDistance - 8
            ) * 5;
          }

        } else if (vehicle === "Taxi") {

          if (calculatedDistance <= 2) {
            calculatedFare = 50;
          } else if (calculatedDistance <= 5) {
            calculatedFare = 70;
          } else if (calculatedDistance <= 8) {
            calculatedFare = 100;
          } else {
            calculatedFare = 100 + Math.ceil(
              calculatedDistance - 8
            ) * 10;
          }

        } else if (vehicle === "Bus") {

          if (calculatedDistance <= 5) {
            calculatedFare = 10;
          } else if (calculatedDistance <= 10) {
            calculatedFare = 20;
          } else {
            calculatedFare = 30;
          }
        }

      } else {
        // Other cities
        // Temporary estimated fare
        calculatedFare =
          vehicle === "Taxi"
            ? Math.max(50, Math.ceil(calculatedDistance) * 15)
            : Math.max(20, Math.ceil(calculatedDistance) * 10);
      }

      setFare(calculatedFare);

    } catch (error) {
      console.error("Fare Calculation Error:", error);
      alert("Unable to calculate fare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fare-calculator">

      <h2>💰 Smart Fare Calculator</h2>

      {/* Pickup */}
      <input
        type="text"
        placeholder="📍 Pickup Location"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
      />

      {/* Destination */}
      <input
        type="text"
        placeholder="📍 Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />

      {/* Vehicle */}
      <select
        value={vehicle}
        onChange={(e) => setVehicle(e.target.value)}
      >
        <option value="Auto">🚖 Auto</option>
        <option value="E-Rickshaw">🛺 E-Rickshaw</option>
        <option value="Bike">🏍 Bike</option>
        <option value="Taxi">🚕 Taxi</option>
        <option value="Bus">🚌 Bus</option>
      </select>

      {/* Calculate */}
      <button
        onClick={handleCalculateFare}
        disabled={loading}
      >
        {loading
          ? "Calculating..."
          : "💰 Calculate Fare"}
      </button>

      {/* Result */}
      {fare !== null && (
        <div className="fare-result">

          <h3>✅ Fare Details</h3>

          <p>
            📍 City: <strong>{city}</strong>
          </p>

          <p>
            🚗 Vehicle: <strong>{vehicle}</strong>
          </p>

          <p>
            📏 Distance: <strong>{distance} km</strong>
          </p>

          <p>
            ⏱️ Estimated Time:
            <strong> {travelTime}</strong>
          </p>

          <p>
            💰 Estimated Fare:
            <strong> ₹{fare}</strong>
          </p>

        </div>
      )}

    </div>
  );
}

export default FareCalculator;