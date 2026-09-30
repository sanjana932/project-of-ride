import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [city, setCity] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [standName, setStandName] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !phone || !password || !role) {
      alert("⚠️ Please fill all required fields");
      return;
    }

    // Driver validation
    if (role === "driver") {
      if (!city || !vehicle) {
        alert("⚠️ Please select City and Vehicle");
        return;
      }
    }

    // Stand Owner validation
    if (role === "standOwner") {
      if (!city || !standName) {
        alert("⚠️ Please enter City and Stand Name");
        return;
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          phone,
          password,
          role,
          city,
          vehicle: role === "driver" ? vehicle : "Auto",
          standName: role === "standOwner" ? standName : "",
        }
      );

      if (response.data.success) {
        alert("✅ Registration Successful!");
        navigate("/login");
      }
    } catch (error) {
      console.error("FULL REGISTRATION ERROR:", error);

      if (error.response) {
        alert(
          `❌ ${error.response.status}\n${
            error.response.data.message ||
            "Registration failed"
          }`
        );
      } else {
        alert(
          "❌ Backend se response nahi aa raha.\nConsole check karo."
        );
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>📝 Register</h1>

        <p>Create your SmartRide AI account</p>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* Password */}
        <div className="password-box">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Role */}
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);

            // Reset role-specific fields
            setVehicle("");
            setStandName("");
          }}
        >
          <option value="">Select Role</option>
          <option value="driver">🚗 Driver</option>
          <option value="standOwner">
            🏢 Stand Owner
          </option>
        </select>

        {/* Driver Fields */}
        {role === "driver" && (
          <>
            {/* City */}
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            {/* Vehicle */}
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            >
              <option value="">Select Vehicle</option>
              <option value="Auto">🚗 Auto</option>
              <option value="E-Rickshaw">
                🛺 E-Rickshaw
              </option>
              <option value="Bike">🏍️ Bike</option>
              <option value="Taxi">🚕 Taxi</option>
              <option value="Bus">🚌 Bus</option>
            </select>
          </>
        )}

        {/* Stand Owner Fields */}
        {role === "standOwner" && (
          <>
            {/* City */}
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            {/* Stand Name */}
            <input
              type="text"
              placeholder="Stand Name"
              value={standName}
              onChange={(e) => setStandName(e.target.value)}
            />
          </>
        )}

        {/* Register Button */}
        <button
          type="button"
          className="register-btn"
          onClick={handleRegister}
        >
          Register
        </button>

        <p>
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

        <Link to="/">
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Register;