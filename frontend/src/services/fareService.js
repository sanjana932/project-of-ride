import axios from "axios";

const API_URL = "http://localhost:5000/api/fare";

export const calculateFare = async (
  pickup,
  destination,
  vehicle,
  distance,
  city
) => {
  try {
    const response = await axios.post(
      `${API_URL}/calculate`,
      {
        pickup,
        destination,
        vehicle,
        distance,
        city,
      }
    );

    return response.data;
  } catch (error) {
    console.log("Fare API Error:", error);
    console.log("Response:", error.response);

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Fare calculation failed",
    };
  }
};