import { useState } from "react";
import { Link } from "react-router-dom";

import "../styles/Home.css";

import { calculateFare } from "../services/fareService";

import { getRouteData } from "../utils/geoService";

import Map from "../components/Map";

function Home() {
  const [language, setLanguage] = useState("English");

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const [vehicle, setVehicle] = useState("Auto");

  const [activeInput, setActiveInput] = useState("pickup");

  const [fare, setFare] = useState(null);
  const [distance, setDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);

  const [loading, setLoading] = useState(false);

  const [showFare, setShowFare] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [pickupLocation, setPickupLocation] =
    useState(null);

  const [destinationLocation, setDestinationLocation] =
    useState(null);

  const [routeCoordinates, setRouteCoordinates] =
    useState([]);


  // ==========================================
  // CHECK FARE
  // ==========================================

  const handleFare = async () => {
    if (
      !pickup.trim() ||
      !destination.trim() ||
      !vehicle
    ) {
      alert(
        "Please enter pickup, destination and select vehicle."
      );
      return;
    }

    try {
      setLoading(true);
      setShowFare(false);
      setShowMap(false);

      setPickupLocation(null);
      setDestinationLocation(null);
      setRouteCoordinates([]);

      console.log(
        "================================"
      );

      console.log(
        "🚗 Getting route..."
      );

      console.log(
        "Pickup:",
        pickup
      );

      console.log(
        "Destination:",
        destination
      );


      // ==========================================
      // GET ROAD ROUTE
      // ==========================================

      const routeData =
        await getRouteData(
          pickup,
          destination
        );


      if (!routeData) {
        alert(
          "Route not found. Please check pickup and destination."
        );
        return;
      }


      console.log(
        "🚗 Route Data:",
        routeData
      );


      // ==========================================
      // DEBUG DESTINATION
      // ==========================================

      console.log(
        "📍 PICKUP COORDINATES:",
        routeData.pickup
      );

      console.log(
        "🎯 DESTINATION COORDINATES:",
        routeData.destination
      );

      console.log(
        "🎯 DESTINATION NAME:",
        routeData.destination?.displayName
      );


      console.log(
        "✅ Road route coordinates:",
        routeData.routeCoordinates?.length
      );


      // ==========================================
      // SET PICKUP LOCATION
      // ==========================================

      setPickupLocation({
        lat: Number(
          routeData.pickup.lat
        ),

        lon: Number(
          routeData.pickup.lon
        ),

        displayName:
          routeData.pickup.displayName ||
          pickup,
      });


      // ==========================================
      // SET DESTINATION LOCATION
      // ==========================================

      setDestinationLocation({
        lat: Number(
          routeData.destination.lat
        ),

        lon: Number(
          routeData.destination.lon
        ),

        displayName:
          routeData.destination.displayName ||
          destination,
      });


      // ==========================================
      // SET ROUTE DATA
      // ==========================================

      setDistance(
        Number(
          routeData.distanceKm
        )
      );

      setTravelTime(
        routeData.travelTime
      );

      setRouteCoordinates(
        routeData.routeCoordinates || []
      );


      // ==========================================
      // CALCULATE FARE
      // ==========================================

      const result =
        await calculateFare(
          pickup,
          destination,
          vehicle,
          Number(routeData.distanceKm),
          routeData.pickup.city
        );


      console.log(
        "💰 Fare Result:",
        result
      );


      if (result.success) {
        setFare(result.fare);

        setShowFare(true);

        setShowMap(true);
      } else {
        alert(
          result.message ||
            "Fare calculation error"
        );
      }

    } catch (error) {

      console.error(
        "❌ Fare Calculation Error:",
        error
      );

      alert(
        "Unable to calculate fare. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // VOICE INPUT
  // ==========================================

  const handleVoice = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      alert(
        "Speech Recognition is not supported in this browser."
      );

      return;
    }


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      language === "English"
        ? "en-IN"
        : "hi-IN";


    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    recognition.start();


    recognition.onstart = () => {

      console.log(
        "🎤 Listening..."
      );

    };


    recognition.onresult = (event) => {

      const text =
        event.results[0][0].transcript;


      console.log(
        "🎤 Voice Input:",
        text
      );


      if (
        activeInput === "pickup"
      ) {

        setPickup(text);

      } else {

        setDestination(text);

      }

    };


    recognition.onend = () => {

      console.log(
        "🎤 Recognition Ended"
      );

    };


    recognition.onerror = (event) => {

      console.error(
        "🎤 Voice Error:",
        event.error
      );

      alert(
        "Voice Error: " +
          event.error
      );

    };

  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="home-card">

      <h1>
        🚖 SmartRide AI
      </h1>


      <p className="subtitle">
        AI Powered Smart Fare System
      </p>


      {/* LANGUAGE */}

      <div className="language-box">

        <label>
          🌐 Language
        </label>


        <select
          value={language}
          onChange={(e) =>
            setLanguage(
              e.target.value
            )
          }
        >

          <option value="English">
            English
          </option>

          <option value="हिन्दी">
            हिन्दी
          </option>

        </select>

      </div>


      {/* PICKUP */}

      <input
        type="text"
        placeholder="📍 Pickup Location"
        value={pickup}
        onChange={(e) => {
          setPickup(
            e.target.value
          );

          setShowMap(false);
        }}
        onFocus={() =>
          setActiveInput(
            "pickup"
          )
        }
      />


      {/* DESTINATION */}

      <input
        type="text"
        placeholder="🎯 Destination"
        value={destination}
        onChange={(e) => {
          setDestination(
            e.target.value
          );

          setShowMap(false);
        }}
        onFocus={() =>
          setActiveInput(
            "destination"
          )
        }
      />


      {/* VEHICLE */}

      <select
        value={vehicle}
        onChange={(e) =>
          setVehicle(
            e.target.value
          )
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


      {/* VOICE */}

      <button
        className="voice-btn"
        onClick={handleVoice}
      >

        🎤 Voice Input (
        {activeInput === "pickup"
          ? "Pickup"
          : "Destination"}
        )

      </button>


      {/* FARE BUTTON */}

      <button
        className="fare-btn"
        onClick={handleFare}
        disabled={loading}
      >

        {loading
          ? "Calculating Route & Fare..."
          : "💰 Check Fare"}

      </button>


      {/* FARE RESULT */}

      {showFare && (

        <div className="fare-result">

          <h3>
            💰 Fare Details
          </h3>


          <p>
            📍 Pickup:{" "}
            <strong>
              {pickup}
            </strong>
          </p>


          <p>
            🎯 Destination:{" "}
            <strong>
              {destination}
            </strong>
          </p>


          <p>
            🚗 Vehicle:{" "}
            <strong>
              {vehicle}
            </strong>
          </p>


          <p>
            📏 Distance:{" "}
            <strong>
              {Number(distance).toFixed(2)}
              {" km"}
            </strong>
          </p>


          <p>
            ⏱️ Estimated Time:{" "}
            <strong>
              {travelTime}
            </strong>
          </p>


          <p>
            💰 Estimated Fare:{" "}
            <strong>
              ₹{fare}
            </strong>
          </p>

        </div>

      )}


      {/* MAP BUTTON */}

      <button
        className="map-btn"
        onClick={() => {

          if (
            !pickupLocation ||
            !destinationLocation
          ) {

            alert(
              "Please calculate fare first."
            );

            return;
          }


          setShowMap(
            !showMap
          );

        }}
      >

        🗺️{" "}

        {showMap
          ? "Hide Map"
          : "View Map & Route"}

      </button>


      {/* MAP */}

      {showMap &&
        pickupLocation &&
        destinationLocation && (

          <div className="map-container">

            <Map
              pickupLocation={
                pickupLocation
              }

              destinationLocation={
                destinationLocation
              }

              routeCoordinates={
                routeCoordinates
              }
            />

          </div>

        )}


      {/* LOGIN / REGISTER */}

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


// ==========================================
// IMPORTANT
// ==========================================

export default Home;