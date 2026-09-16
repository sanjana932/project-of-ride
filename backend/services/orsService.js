import axios from "axios";

export const getDistance = async (pickup, destination) => {
  try {
    const apiKey = process.env.ORS_API_KEY;

    if (!apiKey) {
      throw new Error("ORS_API_KEY is missing in .env");
    }

    // Location → Coordinates
    const geocode = async (location) => {
      const response = await axios.get(
        "https://api.openrouteservice.org/geocode/search",
        {
          params: {
            api_key: apiKey,
            text: location,
          },
        }
      );

      if (
        !response.data.features ||
        response.data.features.length === 0
      ) {
        throw new Error(`Location not found: ${location}`);
      }

      return response.data.features[0].geometry.coordinates;
    };

    const pickupCoords = await geocode(pickup);
    const destinationCoords = await geocode(destination);

    console.log("Pickup Coordinates:", pickupCoords);
    console.log("Destination Coordinates:", destinationCoords);

    // Route
    const routeResponse = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          pickupCoords,
          destinationCoords,
        ],
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const segment =
      routeResponse.data.features[0].properties.segments[0];

    return {
      distance: (segment.distance / 1000).toFixed(2),
      duration: (segment.duration / 60).toFixed(0),
    };

  } catch (error) {
    console.log("========== ORS ERROR ==========");
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Message:", error.message);
    console.log("===============================");

    throw new Error(
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message
    );
  }
};