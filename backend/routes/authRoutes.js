import express from "express";

import {
  registerUser,
  loginUser,
  getAllDrivers,
  getDriverById,
  markDriverLeft,
  assignDriverStand,
} from "../controllers/authController.js";

import {
  validateRegister,
  validateLogin,
} from "../middleware/validate.js";

const router = express.Router();

// ===============================
// Register
// ===============================
router.post(
  "/register",
  validateRegister,
  registerUser
);

// ===============================
// Login
// ===============================
router.post(
  "/login",
  validateLogin,
  loginUser
);

// ===============================
// Get All Drivers
// ===============================
router.get(
  "/drivers",
  getAllDrivers
);

// ===============================
// Get Single Driver
// ===============================
router.get(
  "/drivers/:id",
  getDriverById
);

// ===============================
// Mark Driver as Left
// ===============================
router.put(
  "/drivers/:id/left",
  markDriverLeft
);

// ===============================
// Assign Driver to Stand
// ===============================
router.put(
  "/drivers/:id/assign-stand",
  assignDriverStand
);

export default router;