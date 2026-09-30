import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Details
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    // User Role
    role: {
      type: String,
      enum: ["driver", "standOwner"],
      required: true,
    },

    // Driver Details
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    vehicle: {
      type: String,
      enum: ["Auto", "E-Rickshaw", "Bike", "Taxi", "Bus"],
      default: "Auto",
    },

    // Stand Details
    standName: {
      type: String,
      default: "",
      trim: true,
    },

    assignedStand: {
      type: String,
      default: "",
      trim: true,
    },

    // Driver Status
    status: {
      type: String,
      enum: ["active", "left", "inactive"],
      default: "active",
    },

    // Driver Joining / Leaving
    joinedDate: {
      type: Date,
      default: Date.now,
    },

    leftDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);