import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// ===============================
// Register User
// ===============================
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      city,
      vehicle,
      standName,
    } = req.body;

    // Required basic fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, Password and Role are required",
      });
    }

    // Validate role
    if (!["driver", "standOwner"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Driver specific validation
    if (role === "driver") {
      if (!phone || !city || !vehicle) {
        return res.status(400).json({
          success: false,
          message: "Phone, City and Vehicle are required for Driver",
        });
      }

      const validVehicles = [
        "Auto",
        "E-Rickshaw",
        "Bike",
        "Taxi",
        "Bus",
      ];

      if (!validVehicles.includes(vehicle)) {
        return res.status(400).json({
          success: false,
          message: "Invalid vehicle type",
        });
      }
    }

    // Stand Owner specific validation
    if (role === "standOwner") {
      if (!phone || !city || !standName) {
        return res.status(400).json({
          success: false,
          message:
            "Phone, City and Stand Name are required for Stand Owner",
        });
      }
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
      role,
      city: city || "",
      vehicle: role === "driver" ? vehicle : "Auto",
      standName: standName || "",
      assignedStand: "",
      status: "active",
      joinedDate: new Date(),
      leftDate: null,
    });

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        vehicle: user.vehicle,
        standName: user.standName,
        assignedStand: user.assignedStand,
        status: user.status,
        joinedDate: user.joinedDate,
        leftDate: user.leftDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Login User
// ===============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // Generate JWT
    const token = generateToken(
      user._id,
      user.role
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        vehicle: user.vehicle,
        standName: user.standName,
        assignedStand: user.assignedStand,
        status: user.status,
        joinedDate: user.joinedDate,
        leftDate: user.leftDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get All Drivers
// ===============================
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({
      role: "driver",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get Single Driver Details
// ===============================
export const getDriverById = async (req, res) => {
  try {
    const driver = await User.findOne({
      _id: req.params.id,
      role: "driver",
    }).select("-password");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Mark Driver as Left
// ===============================
export const markDriverLeft = async (req, res) => {
  try {
    const driver = await User.findOne({
      _id: req.params.id,
      role: "driver",
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    driver.status = "left";
    driver.leftDate = new Date();

    await driver.save();

    res.status(200).json({
      success: true,
      message: "Driver marked as Left",
      driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Assign Driver to Stand
// ===============================
export const assignDriverStand = async (req, res) => {
  try {
    const { standName } = req.body;

    if (!standName) {
      return res.status(400).json({
        success: false,
        message: "Stand name is required",
      });
    }

    const driver = await User.findOne({
      _id: req.params.id,
      role: "driver",
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    driver.assignedStand = standName;
    driver.status = "active";
    driver.leftDate = null;

    await driver.save();

    res.status(200).json({
      success: true,
      message: "Driver assigned to stand successfully",
      driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};