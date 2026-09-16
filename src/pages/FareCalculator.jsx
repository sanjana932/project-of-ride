import { useState } from "react";
import Map from "../components/Map";
import "../styles/FareCalculator.css";

// ===============================
// GORAKHPUR FARE RULE
// Auto & E-Rickshaw
// 0–2 km = ₹10
// 2–4 km = ₹20
// 4–6 km = ₹30
// ===============================

function calculateGorakhpurFare(vehicle, distanceKm) {
  if (vehicle === "Auto" || vehicle === "E-Rickshaw") {
    const slabs = Math.max(1, Math.ceil(distanceKm / 2));

    return slabs * 10;
  }

  return 0;
}


// ===============================
// LOCATION SEARCH
// ===============================

async function getLocation(location) {
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(location)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Location search failed");
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`Location not found: ${location}`);
  }

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
    name: data[0].display_name,
  };
}


// ===============================
// ROUTE SEARCH
// ===============================

async function getRoute(pickup, destination) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${pickup.lon},${pickup.lat};` +
    `${destination.lon},${destination.lat}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Route service failed");
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes.length) {
    throw new Error("Route could not be found");
  }

  const route = data.routes[0];

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,

    coordinates: route.geometry.coordinates.map(
      ([lon, lat]) => [lat, lon]
    ),
  };
}


// ===============================
// FARE CALCULATOR COMPONENT
// ===============================

function FareCalculator() {
  const [pickupInput, setPickupInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  const [vehicle, setVehicle] = useState("Auto");

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);

  const [route, setRoute] = useState([]);

  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const [fare, setFare] = useState(null);

  const [showMap, setShowMap] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // ===============================
  // CHECK FARE
  // ===============================

  const handleCheckFare = async () => {

    if (!pickupInput.trim()) {
      setError("Please enter pickup location.");
      return;
    }

    if (!destinationInput.trim()) {
      setError("Please enter destination.");
      return;
    }

    setLoading(true);
    setError("");
    setFare(null);
    setShowMap(false);

    try {

      // Search pickup
      const pickupLocation = await getLocation(
        `${pickupInput}, India`
      );

      // Search destination
      const destinationLocation = await getLocation(
        `${destinationInput}, India`
      );


      // Get route
      const routeData = await getRoute(
        pickupLocation,
        destinationLocation
      );


      // Save location & route
      setPickup(pickupLocation);
      setDestination(destinationLocation);

      setRoute(routeData.coordinates);

      setDistance(routeData.distanceKm);

      setDuration(routeData.durationMinutes);


      // ===============================
      // CHECK GORAKHPUR
      // ===============================

      const pickupIsGorakhpur =
        pickupLocation.name
          .toLowerCase()
          .includes("gorakhpur");

      const destinationIsGorakhpur =
        destinationLocation.name
          .toLowerCase()
          .includes("gorakhpur");


      if (
        pickupIsGorakhpur &&
        destinationIsGorakhpur
      ) {

        // Calculate slab fare
        const calculatedFare =
          calculateGorakhpurFare(
            vehicle,
            routeData.distanceKm
          );

        setFare(calculatedFare);

      } else {

        setFare(null);

        setError(
          "Gorakhpur fare rules are currently available only when both locations are in Gorakhpur."
        );
      }

    } catch (err) {

      console.error(err);

      setError(
        "Location or route could not be found. Please check the spelling."
      );

    } finally {

      setLoading(false);

    }
  };


  // ===============================
  // VIEW MAP
  // ===============================

  const handleViewMap = () => {

    if (!pickup || !destination) {

      setError(
        "First enter pickup and destination and check fare."
      );

      return;
    }

    setShowMap(true);

    setTimeout(() => {

      document
        .getElementById("route-map")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

    }, 100);
  };


  // ===============================
  // UI
  // ===============================

  return (

    <div className="fare-calculator">

      <h1>SmartRide AI</h1>

      <h2>AI Powered Smart Fare System</h2>


      {/* PICKUP */}

      <div className="input-group">

        <label>📍 Pickup Location</label>

        <input
          type="text"
          value={pickupInput}
          onChange={(e) =>
            setPickupInput(e.target.value)
          }
          placeholder="Enter pickup location"
        />

      </div>


      {/* DESTINATION */}

      <div className="input-group">

        <label>📍 Destination</label>

        <input
          type="text"
          value={destinationInput}
          onChange={(e) =>
            setDestinationInput(e.target.value)
          }
          placeholder="Enter destination"
        />

      </div>


      {/* VEHICLE */}

      <div className="input-group">

        <label>🚕 Select Vehicle</label>

        <select
          value={vehicle}
          onChange={(e) =>
            setVehicle(e.target.value)
          }
        >

          <option>Auto</option>

          <option>E-Rickshaw</option>

        </select>

      </div>


      {/* CHECK FARE BUTTON */}

      <button
        className="check-fare-btn"
        onClick={handleCheckFare}
        disabled={loading}
      >

        {loading
          ? "Finding Route..."
          : "💰 Check Fare"}

      </button>


      {/* ERROR */}

      {error && (

        <div className="error-message">
          {error}
        </div>

      )}


      {/* FARE RESULT */}

      {fare !== null && (

        <div className="fare-result">

          <h3>💰 Estimated Fare</h3>

          <div className="fare-price">
            ₹{fare}
          </div>

          <p>
            🚕 Vehicle: {vehicle}
          </p>

          <p>
            📏 Distance: {distance?.toFixed(2)} km
          </p>

          <p>
            ⏱️ Estimated Time:{" "}
            {Math.round(duration)} minutes
          </p>

          <p className="city-info">
            📍 Gorakhpur Fare Rule Applied
          </p>

        </div>

      )}


      {/* MAP BUTTON */}

      <button
        className="map-button"
        onClick={handleViewMap}
      >

        🗺️ View Map & Route

      </button>


      {/* MAP */}

      {showMap && (

        <div
          id="route-map"
          className="map-section"
        >

          <h3>🗺️ Route Map</h3>

          <p>
            Your entered locations are already
            selected. You can zoom or move the
            map freely.
          </p>

          <Map
            pickup={pickup}
            destination={destination}
            route={route}
          />

        </div>

      )}

    </div>

  );
}

export default FareCalculator;