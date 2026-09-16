import express from "express";
import {
  createRide,
  getRideHistory,
} from "../controllers/rideController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createRide);

router.get("/history", protect, getRideHistory);

export default router;