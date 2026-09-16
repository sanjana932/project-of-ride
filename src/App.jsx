import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DriverDashboard from "./pages/DriverDashboard";
import StandOwnerDashboard from "./pages/StandOwnerDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Driver Dashboard */}
      <Route
        path="/driver-dashboard"
        element={
          <ProtectedRoute role="driver">
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      {/* Stand Owner Dashboard */}
      <Route
        path="/stand-owner-dashboard"
        element={
          <ProtectedRoute role="standOwner">
            <StandOwnerDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;