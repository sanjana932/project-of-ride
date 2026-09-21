
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/Home.css";

import { calculateFare } from "../services/fareService";

import Map from "../components/Map";


// ==========================================
// GOOGLE CUSTOM PLACE SEARCH
// ==========================================

function PlaceSearch({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  activeInput,
  setActiveInput,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const [placesLibrary, setPlacesLibrary] =
    useState(null);

  const sessionTokenRef = useRef(null);

  // ==========================================
  // LOAD GOOGLE PLACES LIBRARY
  // ==========================================

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        if (!window.google?.maps) {
          console.error(
            "❌ Google Maps API not loaded."
          );
          return;
        }

        const places =
          await window.google.maps.importLibrary(
            "places"
          );

        setPlacesLibrary(places);

        sessionTokenRef.current =
          new places.AutocompleteSessionToken();

        console.log(
          "✅ Google Places Data API Loaded"
        );

      } catch (error) {
        console.error(
          "❌ Google Places Library Error:",
          error
        );
      }
    };

    loadPlaces();
  }, []);


  // ==========================================
  // SEARCH GOOGLE PLACES
  // ==========================================

  const searchPlaces = async (text) => {

    if (!text.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!placesLibrary) {
      return;
    }

    try {

      const request = {
        input: text,

        includedRegionCodes: ["in"],

        language: "en-IN",

        sessionToken:
          sessionTokenRef.current,

        // Gorakhpur ke around results ko
        // preference milegi, lekin India ke
        // dusre places bhi search ho sakte hain.
        locationBias: {
          radius: 50000,
          center: {
            lat: 26.7606,
            lng: 83.3732,
          },
        },
      };


      const {
        suggestions: result,
      } =
        await placesLibrary
          .AutocompleteSuggestion
          .fetchAutocompleteSuggestions(
            request
          );


      const placeSuggestions =
        result.filter(
          (item) =>
            item.placePrediction
        );


      setSuggestions(
        placeSuggestions
      );

      setShowSuggestions(true);

    } catch (error) {

      console.error(
        "❌ Google Suggestions Error:",
        error
      );

      setSuggestions([]);
    }
  };


  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {

    const text =
      event.target.value;

    onChange(text);

    onPlaceSelect(null);

    setActiveInput(
      activeInput
    );

    searchPlaces(text);
  };


  // ==========================================
  // SELECT PLACE
  // ==========================================

  const handleSelect =
    async (suggestion) => {

      try {

        const prediction =
          suggestion.placePrediction;

        if (!prediction) {
          return;
        }

        const place =
          prediction.toPlace();


        await place.fetchFields({
          fields: [
            "displayName",
            "formattedAddress",
            "location",
          ],
        });


        if (!place.location) {

          alert(
            "Location coordinates not available."
          );

          return;
        }


        const selectedPlace = {

          lat:
            place.location.lat(),

          lon:
            place.location.lng(),

          displayName:
            place.displayName || "",

          formattedAddress:
            place.formattedAddress || "",

        };


        console.log(
          "✅ Selected Google Place:",
          selectedPlace
        );


        onChange(
          place.formattedAddress ||
            place.displayName ||
            ""
        );


        onPlaceSelect(
          selectedPlace
        );


        setSuggestions([]);
        setShowSuggestions(false);


        // New search session
        sessionTokenRef.current =
          new placesLibrary.AutocompleteSessionToken();

      } catch (error) {

        console.error(
          "❌ Place Selection Error:",
          error
        );

      }
    };


  return (

    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >

      {/* ==================================
          NORMAL INPUT
          ================================== */}

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onFocus={() => {

          setActiveInput(
            activeInput
          );

          if (value.trim()) {
            searchPlaces(value);
          }

        }}
        onChange={handleChange}
        autoComplete="off"
      />


      {/* ==================================
          GOOGLE STYLE SUGGESTIONS
          ================================== */}

      {showSuggestions &&
        suggestions.length > 0 && (

          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginTop: "4px",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 9999,
              overflow: "hidden",
            }}
          >

            {suggestions
              .slice(0, 5)
              .map(
                (
                  suggestion,
                  index
                ) => {

                  const prediction =
                    suggestion.placePrediction;

                  return (

                    <div
                      key={
                        prediction?.placeId ||
                        index
                      }
                      onMouseDown={(
                        event
                      ) => {
                        event.preventDefault();

                        handleSelect(
                          suggestion
                        );
                      }}
                      style={{
                        padding:
                          "12px 14px",
                        cursor: "pointer",
                        borderBottom:
                          "1px solid #eee",
                        background:
                          "#fff",
                      }}
                      onMouseEnter={(
                        event
                      ) => {
                        event.currentTarget.style.background =
                          "#f5f5f5";
                      }}
                      onMouseLeave={(
                        event
                      ) => {
                        event.currentTarget.style.background =
                          "#fff";
                      }}
                    >

                      <div
                        style={{
                          fontWeight: "600",
                          fontSize:
                            "14px",
                        }}
                      >
                        📍{" "}
                        {prediction
                          ?.mainText
                          ?.text ||
                          ""}
                      </div>

                      <div
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#666",
                          marginTop:
                            "3px",
                        }}
                      >
                        {prediction
                          ?.secondaryText
                          ?.text ||
                          ""}
                      </div>

                    </div>

                  );
                }
              )}

          </div>

        )}

    </div>
  );
}


// ==========================================
// HOME
// ==========================================

function Home() {

  const [language, setLanguage] =
    useState("English");

  const [pickup, setPickup] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [vehicle, setVehicle] =
    useState("Auto");

  const [activeInput, setActiveInput] =
    useState("pickup");

  const [pickupLocation, setPickupLocation] =
    useState(null);

  const [
    destinationLocation,
    setDestinationLocation,
  ] = useState(null);

  const [fare, setFare] =
    useState(null);

  const [distance, setDistance] =
    useState(null);

  const [travelTime, setTravelTime] =
    useState(null);

  const [routeData, setRouteData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [showFare, setShowFare] =
    useState(false);

  const [showMap, setShowMap] =
    useState(false);


  // ==========================================
  // GOOGLE MAPS API LOADER
  // ==========================================

  useEffect(() => {

    const apiKey =
      import.meta.env
        .VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {

      console.error(
        "❌ VITE_GOOGLE_MAPS_API_KEY missing"
      );

      return;
    }


    if (window.google?.maps) {
      return;
    }


    const existingScript =
      document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );


    if (existingScript) {
      return;
    }


    const script =
      document.createElement(
        "script"
      );


    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async`;


    script.async = true;
    script.defer = true;


    script.onload = () => {

      console.log(
        "✅ Google Maps API Loaded"
      );

    };


    script.onerror = () => {

      console.error(
        "❌ Google Maps API failed to load"
      );

    };


    document.head.appendChild(
      script
    );

  }, []);


  // ==========================================
  // PICKUP SELECT
  // ==========================================

  const handlePickupSelect =
    (location) => {

      setPickupLocation(
        location
      );

      setShowMap(false);
      setShowFare(false);
    };


  // ==========================================
  // DESTINATION SELECT
  // ==========================================

  const handleDestinationSelect =
    (location) => {

      setDestinationLocation(
        location
      );

      setShowMap(false);
      setShowFare(false);
    };


  // ==========================================
  // CHECK FARE
  // ==========================================

  const handleFare = async () => {

    if (
      !pickupLocation ||
      !destinationLocation
    ) {

      alert(
        "Please select pickup and destination from Google suggestions."
      );

      return;
    }


    try {

      setLoading(true);

      setShowFare(false);
      setShowMap(false);


      if (!window.google?.maps) {

        alert(
          "Google Maps is still loading."
        );

        return;
      }


      const directionsService =
        new window.google.maps
          .DirectionsService();


      const result =
        await directionsService.route({

          origin: {
            lat:
              Number(
                pickupLocation.lat
              ),
            lng:
              Number(
                pickupLocation.lon
              ),
          },

          destination: {
            lat:
              Number(
                destinationLocation.lat
              ),
            lng:
              Number(
                destinationLocation.lon
              ),
          },

          travelMode:
            window.google.maps
              .TravelMode.DRIVING,

        });


      if (
        !result.routes ||
        !result.routes.length
      ) {

        alert(
          "Road route not found."
        );

        return;
      }


      const leg =
        result.routes[0]
          .legs[0];


      const distanceKm =
        Number(
          leg.distance.value /
            1000
        );


      setDistance(
        distanceKm
      );


      setTravelTime(
        leg.duration.text
      );


      setRouteData(
        result
      );


      // ==================================
      // FARE
      // ==================================

      const fareResult =
        await calculateFare(
          pickup,
          destination,
          vehicle,
          distanceKm,
          "Gorakhpur"
        );


      if (
        fareResult.success
      ) {

        setFare(
          fareResult.fare
        );

        setShowFare(true);
        setShowMap(true);

      } else {

        alert(
          fareResult.message ||
            "Fare calculation failed."
        );

      }

    } catch (error) {

      console.error(
        "❌ Route Error:",
        error
      );

      alert(
        "Unable to find road route. Please try again."
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
        "Speech Recognition is not supported."
      );

      return;
    }


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      language === "English"
        ? "en-IN"
        : "hi-IN";


    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;


    recognition.start();


    recognition.onresult =
      (event) => {

        const text =
          event.results[0][0]
            .transcript;


        if (
          activeInput ===
          "pickup"
        ) {

          setPickup(text);

          setPickupLocation(
            null
          );

        } else {

          setDestination(text);

          setDestinationLocation(
            null
          );
        }

      };


    recognition.onerror =
      (event) => {

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

      <PlaceSearch
        value={pickup}
        onChange={(value) => {

          setPickup(value);

          setPickupLocation(
            null
          );

          setShowMap(false);

        }}
        onPlaceSelect={
          handlePickupSelect
        }
        placeholder="📍 Pickup Location"
        activeInput="pickup"
        setActiveInput={
          setActiveInput
        }
      />


      {/* DESTINATION */}

      <PlaceSearch
        value={destination}
        onChange={(value) => {

          setDestination(
            value
          );

          setDestinationLocation(
            null
          );

          setShowMap(false);

        }}
        onPlaceSelect={
          handleDestinationSelect
        }
        placeholder="🎯 Destination"
        activeInput="destination"
        setActiveInput={
          setActiveInput
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
          ? "Finding Route & Fare..."
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
              {Number(
                distance
              ).toFixed(2)}
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

          if (!routeData) {

            alert(
              "Please calculate the route first."
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

              routeData={
                routeData
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


export default Home;

