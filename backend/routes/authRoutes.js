import express from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
} from "../middleware/validate.js";
const router = express.Router();

// Register
router.post("/register", validateRegister, registerUser);

// Login
router.post("/login", validateLogin, loginUser);

export default router;