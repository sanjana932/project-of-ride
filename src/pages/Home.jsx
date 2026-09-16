import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import { calculateFare } from "../services/fareService";
import { geocodeLocation, getDistanceInKm, calculateTravelTime } from "../utils/geoService";
import Map from "../components/Map";

function Home() {
  const [language, setLanguage] = useState("English");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("Auto");
  const [showFare, setShowFare] = useState(false);
  const [activeInput, setActiveInput] = useState("pickup");
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // New states for real locations & distance
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);

  // Check Fare
  const handleFare = async () => {
    if (!pickup || !destination || !vehicle) {
      alert("Please enter pickup, destination and select vehicle.");
      return;
    }

    try {
      setLoading(true);
      setShowFare(false);

      // 1. Fetch real coordinates from OpenStreetMap
      const pData = await geocodeLocation(pickup);
      const dData = await geocodeLocation(destination);

      if (!pData || !dData) {
        alert("Location not found! Please check city or place names.");
        setLoading(false);
        return;
      }

      setPickupCoords([pData.lat, pData.lon]);
      setDestCoords([dData.lat, dData.lon]);

      // 2. Calculate Distance & Travel Time
      const calculatedDist = getDistanceInKm(pData.lat, pData.lon, dData.lat, dData.lon);
      const estimatedTime = calculateTravelTime(calculatedDist);

      setDistance(calculatedDist);
      setTravelTime(estimatedTime);

      // 3. Backend Fare API Call
      const result = await calculateFare(
        pickup,
        destination,
        vehicle,
        calculatedDist,
        pData.city
      );

      console.log("Fare Result:", result);

      if (result.success) {
        setFare(result.fare);
        setShowFare(true);
        setShowMap(true); // Automatically show map on calculation
      } else {
        alert(result.message || "Fare calculation error");
      }
    } catch (error) {
      console.log(error);
      alert("Unable to calculate fare");
    } finally {
      setLoading(false);
    }
  };

  // Voice Input
  const handleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
      language === "English" ? "en-IN" : "hi-IN";

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onstart = () => {
      console.log("Listening...");
    };

    recognition.onend = () => {
      console.log("Recognition Ended");
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;

      if (activeInput === "pickup") {
        setPickup(text);
      } else {
        setDestination(text);
      }
    };

    recognition.onerror = (event) => {
      console.log("Voice Error:", event.error);
      alert("Voice Error: " + event.error);
    };
  };

  return (
    <div className="home-card">

      <h1>🚖 SmartRide AI</h1>

      <p className="subtitle">
        AI Powered Smart Fare System
      </p>

      {/* Language */}
      <div className="language-box">
        <label>🌐 Language</label>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="English">English</option>
          <option value="हिन्दी">हिन्दी</option>
        </select>
      </div>

      {/* Pickup */}
      <input
        type="text"
        placeholder="📍 Pickup Location"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
        onFocus={() => setActiveInput("pickup")}
      />

      {/* Destination */}
      <input
        type="text"
        placeholder="📍 Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        onFocus={() => setActiveInput("destination")}
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

      {/* Voice */}
      <button
        className="voice-btn"
        onClick={handleVoice}
      >
        🎤 Voice Input ({activeInput === "pickup" ? "Pickup" : "Destination"})
      </button>

      {/* Fare */}
      <button
        className="fare-btn"
        onClick={handleFare}
        disabled={loading}
      >
        {loading ? "Calculating Route & Fare..." : "💰 Check Fare"}
      </button>

      {/* Fare Result */}
      {showFare && (
        <div className="fare-result">
          <h3>💰 Fare Details</h3>

          <p>
            Vehicle: <strong>{vehicle}</strong>
          </p>

          <p>
            Distance: <strong>{distance} km</strong>
          </p>

          <p>
            Estimated Time: <strong>{travelTime}</strong>
          </p>

          <p>
            Estimated Fare: <strong>₹{fare}</strong>
          </p>
        </div>
      )}

      {/* Map Button */}
      <button
        className="map-btn"
        onClick={() => setShowMap(!showMap)}
      >
        🗺️ {showMap ? "Hide Map" : "View Map & Route"}
      </button>

      {/* Dynamic Map Component */}
      {showMap && (
        <div className="map-container">
          <Map
             pickup={
    pickupCoords
      ? {
          name: pickup,
          lat: pickupCoords[0],
          lon: pickupCoords[1],
        }
      : null
  }
  destination={
    destCoords
      ? {
          name: destination,
          lat: destCoords[0],
          lon: destCoords[1],
        }
      : null
  }
/>
          
        </div>
      )}

      {/* Register / Login */}
      <div className="auth-buttons">

        <Link
          to="/register"
          className="register-btn"
        >
          Register
        </Link>

        <Link
          to="/login"
          className="login-btn"
        >
          Login
        </Link>

      </div>

    </div>
  );
}

export default Home;