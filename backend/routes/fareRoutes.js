import express from "express";
import { calculateFare } from "../controllers/fareController.js";

const router = express.Router();

// Calculate Fare
router.post("/calculate", calculateFare);

export default router;