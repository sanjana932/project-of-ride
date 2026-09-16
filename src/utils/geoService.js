// src/utils/geoService.js

// ===============================
// 1. Location -> Coordinates
// ===============================
export const geocodeLocation = async (placeName) => {
  try {
    if (!placeName || !placeName.trim()) {
      return null;
    }

    const cleanPlace = placeName.trim();

    // --------------------------------
    // Function: Nominatim Search
    // --------------------------------
    const searchLocation = async (query) => {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?format=json` +
        `&addressdetails=1` +
        `&limit=5` +
        `&countrycodes=in` +
        `&q=${encodeURIComponent(query)}`;

      console.log("Searching location:", query);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Nominatim Error: ${res.status}`);
      }

      const data = await res.json();

      return data;
    };

    // --------------------------------
    // STEP 1: Short location search
    // --------------------------------
    let data = await searchLocation(cleanPlace);

    // --------------------------------
    // STEP 2: Gorakhpur context search
    // --------------------------------
    if (!data || data.length === 0) {
      const searchQuery = `${cleanPlace}, Gorakhpur, Uttar Pradesh, India`;

      data = await searchLocation(searchQuery);
    }

    // --------------------------------
    // No result
    // --------------------------------
    if (!data || data.length === 0) {
      console.log("Location not found:", cleanPlace);
      return null;
    }

    // --------------------------------
    // Prefer Gorakhpur result
    // --------------------------------
    const gorakhpurResult =
      data.find((item) =>
        item.display_name
          .toLowerCase()
          .includes("gorakhpur")
      ) || data[0];

    const address = gorakhpurResult.address || {};

    const city =
      address.city ||
      address.town ||
      address.municipality ||
      address.village ||
      address.state_district ||
      "Gorakhpur";

    const lat = parseFloat(gorakhpurResult.lat);
    const lon = parseFloat(gorakhpurResult.lon);

    // --------------------------------
    // Check coordinates
    // --------------------------------
    if (isNaN(lat) || isNaN(lon)) {
      console.log("Invalid coordinates:", gorakhpurResult);
      return null;
    }

    console.log("Location Found:", {
      place: cleanPlace,
      lat,
      lon,
      city,
      displayName: gorakhpurResult.display_name,
    });

    return {
      lat,
      lon,
      city,
      displayName: gorakhpurResult.display_name,
    };
  } catch (err) {
    console.error("Geocoding Error:", err);
    return null;
  }
};


// ===============================
// 2. Distance Calculation
// ===============================
export const getDistanceInKm = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return parseFloat((R * c).toFixed(2));
};


// ===============================
// 3. Travel Time
// ===============================
export const calculateTravelTime = (distanceKm) => {
  const timeInMinutes = Math.round(
    (distanceKm / 25) * 60
  );

  if (timeInMinutes < 60) {
    return `${timeInMinutes} mins`;
  }

  const hrs = Math.floor(timeInMinutes / 60);
  const mins = timeInMinutes % 60;

  return `${hrs} hr ${mins} mins`;
};