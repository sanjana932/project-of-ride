import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    // Check fields
    if (!name || !email || !password || !role) {
      alert("⚠️ Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
          role,
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
            error.response.data.message || "Registration failed"
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
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="driver">🚗 Driver</option>
          <option value="standOwner">🏢 Stand Owner</option>
        </select>

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