import express from "express";

import {
  passengerDashboard,
  driverDashboard,
  StandOwnerDashboard,
} from "../controllers/dashboardController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";
import { ok } from "assert";

const router = express.Router();

// Passenger
router.get(
  "/passenger",
  protect,
  authorize("passenger"),
  passengerDashboard
);

// Driver
router.get(
  "/driver",
  protect,
  authorize("driver"),
  driverDashboard
);

// Admin
router.get(
  "/stand-Owner",
  protect,
  authorize("standOwner"),
  StandOwnerDashboard
);

export default router;