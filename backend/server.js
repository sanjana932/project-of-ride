import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import fareRoutes from "./routes/fareRoutes.js";

dotenv.config();

// Database
 connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/fare", fareRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "🚖 SmartRide AI Backend Running Successfully..."
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});