import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // User login nahi hai
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // User ka role
  const userRole = user.role?.toLowerCase();
  const requiredRole = role?.toLowerCase();

  console.log("User:", user);
  console.log("User Role:", userRole);
  console.log("Required Role:", requiredRole);

  // Role match nahi karta
  if (userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Sab sahi hai
  return children;
}

export default ProtectedRoute;