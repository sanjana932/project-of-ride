import Ride from "../models/Ride.js";

// Create Ride
export const createRide = async (req, res) => {
  try {
    const { pickup, destination, vehicle, distance, fare } = req.body;

    const ride = await Ride.create({
      passenger: req.user._id,
      pickup,
      destination,
      vehicle,
      distance,
      fare,
    });

    res.status(201).json({
      success: true,
      message: "Ride Created Successfully",
      ride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Ride History
export const getRideHistory = async (req, res) => {
  try {
    const rides = await Ride.find({
      passenger: req.user._id,
    });

    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};