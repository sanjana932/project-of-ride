import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";

import "leaflet/dist/leaflet.css";


// ==========================================
// CUSTOM PICKUP ICON
// ==========================================

const pickupIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      background: #16a34a;
      color: white;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    ">
      📍
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});


// ==========================================
// CUSTOM DESTINATION ICON
// ==========================================

const destinationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      background: #dc2626;
      color: white;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    ">
      🎯
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});


// ==========================================
// MAP VIEW CONTROLLER
// ==========================================

function MapViewController({
  pickupLocation,
  destinationLocation,
  routeCoordinates,
}) {
  const map = useMap();

  useEffect(() => {

    if (!pickupLocation || !destinationLocation) {
      return;
    }

    let points = [];

    // If actual route coordinates are available
    if (
      routeCoordinates &&
      routeCoordinates.length > 0
    ) {
      points = routeCoordinates;
    } else {
      // Otherwise use pickup + destination
      points = [
        [
          Number(pickupLocation.lat),
          Number(pickupLocation.lon),
        ],
        [
          Number(destinationLocation.lat),
          Number(destinationLocation.lon),
        ],
      ];
    }

    if (points.length > 0) {

      const bounds = L.latLngBounds(points);

      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      });

    }

  }, [
    map,
    pickupLocation,
    destinationLocation,
    routeCoordinates,
  ]);

  return null;
}


// ==========================================
// MAIN MAP COMPONENT
// ==========================================

function Map({
  pickupLocation,
  destinationLocation,
  routeCoordinates = [],
}) {

  // ========================================
  // VALIDATION
  // ========================================

  if (
    !pickupLocation ||
    !destinationLocation
  ) {
    return (
      <div
        style={{
          width: "100%",
          height: "300px",
          marginTop: "20px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          color: "#555",
          fontSize: "16px",
        }}
      >
        📍 Enter pickup and destination
        to view the map
      </div>
    );
  }


  // ========================================
  // MAP CENTER
  // ========================================

  const center = [
    Number(pickupLocation.lat),
    Number(pickupLocation.lon),
  ];


  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        marginTop: "20px",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}
    >

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >

        {/* =================================
            OPENSTREETMAP
        ================================== */}

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =================================
            PICKUP MARKER
        ================================== */}

        <Marker
          position={[
            Number(pickupLocation.lat),
            Number(pickupLocation.lon),
          ]}
          icon={pickupIcon}
        >

          <Popup>

            <strong>
              📍 Pickup
            </strong>

            <br />

            {pickupLocation.displayName ||
              "Pickup Location"}

          </Popup>

        </Marker>


        {/* =================================
            DESTINATION MARKER
        ================================== */}

        <Marker
          position={[
            Number(destinationLocation.lat),
            Number(destinationLocation.lon),
          ]}
          icon={destinationIcon}
        >

          <Popup>

            <strong>
              🎯 Destination
            </strong>

            <br />

            {destinationLocation.displayName ||
              "Destination Location"}

          </Popup>

        </Marker>


        {/* =================================
            ROUTE LINE
        ================================== */}

        {routeCoordinates &&
          routeCoordinates.length > 0 && (

            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                weight: 5,
              }}
            />

          )}


        {/* =================================
            AUTO FIT MAP
        ================================== */}

        <MapViewController
          pickupLocation={pickupLocation}
          destinationLocation={destinationLocation}
          routeCoordinates={routeCoordinates}
        />

      </MapContainer>

    </div>
  );
}

export default Map;