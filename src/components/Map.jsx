import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";

// Map ko route ke according automatically zoom karne ke liye
function MapController({ pickup, destination, route }) {
  const map = useMap();

  useEffect(() => {
    if (!pickup || !destination) return;

    if (route && route.length > 0) {
      const bounds = route.map((point) => [point[0], point[1]]);

      map.fitBounds(bounds, {
        padding: [40, 40],
      });
    } else {
      map.fitBounds(
        [
          [pickup.lat, pickup.lon],
          [destination.lat, destination.lon],
        ],
        {
          padding: [50, 50],
        }
      );
    }
  }, [pickup, destination, route, map]);

  return null;
}

function Map({ pickup, destination, route }) {
  // All India starting position
  const indiaCenter = [22.9734, 78.6569];

  return (
    <div className="map-wrapper">
      <MapContainer
        center={indiaCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="india-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          pickup={pickup}
          destination={destination}
          route={route}
        />

        {/* Pickup marker */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lon]}>
            <Popup>
              <strong>📍 Pickup</strong>
              <br />
              {pickup.name}
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lon]}>
            <Popup>
              <strong>📍 Destination</strong>
              <br />
              {destination.name}
            </Popup>
          </Marker>
        )}

        {/* Route */}
        {route && route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              weight: 5,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default Map;